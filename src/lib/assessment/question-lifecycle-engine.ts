import prisma from '../prisma';

export type AssessmentStatus = 'ACTIVE' | 'MONITORED' | 'REVIEW_REQUIRED' | 'TEMPORARILY_SUPPRESSED' | 'RETIRED';

export interface CreateVersionParams {
  questionId: string;
  stem: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer: string;
  explanation?: string;
  sourceReference?: string;
  changeReason: string;
  changedBy: string;
}

export class QuestionLifecycleEngine {
  /**
   * Temporarily suppresses a question from appearing in new tests and practice sessions
   */
  static async suppressQuestion(questionId: string, reason: string, adminUserId: string, permanent: boolean = false) {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error(`Question ${questionId} not found`);

    const targetStatus = permanent ? 'RETIRED' : 'TEMPORARILY_SUPPRESSED';
    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        assessmentStatus: targetStatus,
      },
    });

    // Update assessmentProfile if present
    await prisma.questionAssessmentProfile.updateMany({
      where: { questionId },
      data: { assessmentStatus: targetStatus },
    });

    // Record review entry
    await prisma.questionReview.create({
      data: {
        questionId,
        reviewerId: adminUserId,
        reviewType: 'RETIREMENT',
        previousStatus: question.assessmentStatus,
        newStatus: targetStatus,
        findings: reason,
        decision: targetStatus,
        actionTaken: permanent ? 'Question permanently retired' : 'Question removed from active test selection queues',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: permanent ? 'RETIRE_QUESTION' : 'SUPPRESS_QUESTION',
        entityType: 'Question',
        entityId: questionId,
        newValues: JSON.stringify({ assessmentStatus: targetStatus, reason }),
      },
    });

    return updated;
  }

  static async retireQuestion(questionId: string, reason: string, adminUserId: string) {
    return this.suppressQuestion(questionId, reason, adminUserId, true);
  }

  /**
   * Restores a previously suppressed or monitored question back to ACTIVE status
   */
  static async restoreQuestion(questionId: string, reason: string, adminUserId: string) {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error(`Question ${questionId} not found`);

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        assessmentStatus: 'ACTIVE',
      },
    });

    await prisma.questionAssessmentProfile.updateMany({
      where: { questionId },
      data: { assessmentStatus: 'ACTIVE' },
    });

    await prisma.questionReview.create({
      data: {
        questionId,
        reviewerId: adminUserId,
        reviewType: 'ROUTINE_QUALITY',
        previousStatus: question.assessmentStatus,
        newStatus: 'ACTIVE',
        findings: reason,
        decision: 'RESTORED',
        actionTaken: 'Question restored to active test pools',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'RESTORE_QUESTION',
        entityType: 'Question',
        entityId: questionId,
        newValues: JSON.stringify({ assessmentStatus: 'ACTIVE', reason }),
      },
    });

    return updated;
  }

  /**
   * Creates an immutable QuestionVersion and safely updates the canonical question definition
   */
  static async createQuestionVersion(params: CreateVersionParams) {
    const question = await prisma.question.findUnique({
      where: { id: params.questionId },
      include: { versions: { orderBy: { versionNumber: 'desc' } } },
    });

    if (!question) throw new Error(`Question ${params.questionId} not found`);

    const nextVersion = question.versions.length > 0 ? question.versions[0].versionNumber + 1 : 1;

    // 1. Create immutable QuestionVersion record
    const versionRecord = await prisma.questionVersion.create({
      data: {
        questionId: params.questionId,
        versionNumber: nextVersion,
        stem: params.stem,
        optionsJson: JSON.stringify(params.options),
        correctAnswer: params.correctAnswer,
        explanation: params.explanation || null,
        sourceReference: params.sourceReference || null,
        changeReason: params.changeReason,
        changedBy: params.changedBy,
      },
    });

    // 2. Update canonical question fields
    await prisma.question.update({
      where: { id: params.questionId },
      data: {
        questionText: params.stem,
        correctOption: params.correctAnswer,
        explanation: params.explanation || question.explanation,
      },
    });

    // 3. Update options
    for (const opt of params.options) {
      await prisma.questionOption.upsert({
        where: {
          questionId_label: {
            questionId: params.questionId,
            label: opt.label,
          },
        },
        update: { text: opt.text },
        create: {
          questionId: params.questionId,
          label: opt.label,
          text: opt.text,
        },
      });
    }

    // 4. Record in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: params.changedBy,
        action: 'CREATE_QUESTION_VERSION',
        entityType: 'QuestionVersion',
        entityId: versionRecord.id,
        newValues: JSON.stringify({
          versionNumber: nextVersion,
          changeReason: params.changeReason,
        }),
      },
    });

    return versionRecord;
  }

  /**
   * Controlled Answer Key Review workflow: applies official answer key corrections
   */
  static async reviewAnswerKey(params: {
    questionId: string;
    newCorrectOption: string;
    reason: string;
    reviewerId: string;
    findings: string;
  }) {
    const question = await prisma.question.findUnique({
      where: { id: params.questionId },
      include: { options: true },
    });

    if (!question) throw new Error(`Question ${params.questionId} not found`);

    const validOption = question.options.some((o) => o.label === params.newCorrectOption);
    if (!validOption) {
      throw new Error(`Option ${params.newCorrectOption} does not exist for question ${params.questionId}`);
    }

    const previousOption = question.correctOption;

    // Create a new QuestionVersion recording this correction
    const version = await this.createQuestionVersion({
      questionId: params.questionId,
      stem: question.questionText,
      options: question.options.map((o) => ({ label: o.label, text: o.text })),
      correctAnswer: params.newCorrectOption,
      explanation: question.explanation || undefined,
      changeReason: `Answer key corrected from ${previousOption} to ${params.newCorrectOption}: ${params.reason}`,
      changedBy: params.reviewerId,
    });

    // Record review entry
    const review = await prisma.questionReview.create({
      data: {
        questionId: params.questionId,
        reviewerId: params.reviewerId,
        reviewType: 'ANSWER_KEY_DISPUTE',
        previousStatus: previousOption,
        newStatus: params.newCorrectOption,
        findings: params.findings,
        decision: 'CORRECTED',
        actionTaken: `Answer key changed from ${previousOption} to ${params.newCorrectOption}`,
      },
    });

    return {
      version,
      review,
      previousOption,
      newCorrectOption: params.newCorrectOption,
    };
  }

  /**
   * Helper to ensure question eligibility for active tests
   */
  static buildAssessmentEligibilityFilter() {
    return {
      assessmentStatus: { in: ['ACTIVE', 'MONITORED'] },
      syllabusStatus: { in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'] },
    };
  }
}
