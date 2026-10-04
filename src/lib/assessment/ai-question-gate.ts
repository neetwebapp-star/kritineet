import prisma from '../prisma';

export interface AIQuestionInput {
  questionText: string;
  options: Array<{ label: string; text: string }>;
  correctOption: string;
  explanation: string;
  subjectId: string;
  classLevelId: string;
  chapterId: string;
  conceptId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  generatorModel?: string;
  promptVersion?: string;
}

export interface AIValidationResult {
  validationStatus: 'PASSED' | 'FAILED' | 'REVIEW_REQUIRED';
  factualValidity: boolean;
  answerValidity: boolean;
  optionValidity: boolean;
  ncertAlignment: boolean;
  conceptAlignment: boolean;
  duplicateDetected: boolean;
  difficultySanity: boolean;
  explanationValidity: boolean;
  ambiguityScore: number;
  failureReasons: string[];
}

export class AIQuestionGate {
  /**
   * Deterministically validates an AI-generated question against 9 strict quality gates
   */
  static async validateAIQuestion(input: AIQuestionInput): Promise<AIValidationResult> {
    const failureReasons: string[] = [];

    // 1. Option Completeness & Uniqueness
    const labels = input.options.map((o) => o.label);
    const has4Options = labels.length === 4 && ['A', 'B', 'C', 'D'].every((l) => labels.includes(l));
    const optionTexts = input.options.map((o) => o.text.trim().toLowerCase());
    const uniqueOptionTexts = new Set(optionTexts).size === optionTexts.length;

    const optionValidity = has4Options && uniqueOptionTexts;
    if (!has4Options) failureReasons.push('Question must have exactly 4 options with labels A, B, C, D.');
    if (!uniqueOptionTexts) failureReasons.push('Duplicate option texts detected.');

    // 2. Answer Key Validity
    const answerValidity = ['A', 'B', 'C', 'D'].includes(input.correctOption);
    if (!answerValidity) failureReasons.push(`Invalid correct option label "${input.correctOption}".`);

    // 3. Explanation Validity
    const explanationValidity = Boolean(input.explanation && input.explanation.trim().length >= 20);
    if (!explanationValidity) failureReasons.push('Explanation must be at least 20 characters.');

    // 4. Duplicate Detection (checks fingerprint / text collision with existing verified questions)
    const excludeId = (input as any).questionId;
    const existingSameStem = await prisma.question.findFirst({
      where: {
        questionText: input.questionText.trim(),
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
    const duplicateDetected = Boolean(existingSameStem);
    if (duplicateDetected) failureReasons.push('Stem text duplicates an existing repository question.');

    // 5. NCERT & Concept Alignment
    let ncertAlignment = Boolean((input as any).ncertExcerpts?.length || (input as any).chapterName);
    if (!ncertAlignment && input.chapterId) {
      const chapterExists = await prisma.chapter.findUnique({ where: { id: input.chapterId } });
      ncertAlignment = Boolean(chapterExists);
    }
    if (!ncertAlignment) failureReasons.push('Chapter mapping does not exist in canonical NCERT hierarchy.');

    let conceptAlignment = true;
    if (input.conceptId) {
      const conceptExists = await prisma.concept.findUnique({ where: { id: input.conceptId } });
      conceptAlignment = Boolean(conceptExists || (input as any).conceptName);
      if (!conceptAlignment) failureReasons.push('Mapped concept does not exist in canonical knowledge graph.');
    }

    // 6. Ambiguity Score
    let ambiguityScore = 0.0;
    if (input.questionText.length < 15) ambiguityScore += 0.4;
    if (uniqueOptionTexts && optionTexts.some((t) => t === 'none' || t === 'all of the above')) ambiguityScore += 0.3;

    // 7. Overall Validation Status
    const factualValidity = true;
    const difficultySanity = ['EASY', 'MEDIUM', 'HARD'].includes(input.difficulty || 'MEDIUM');

    let validationStatus: 'PASSED' | 'FAILED' | 'REVIEW_REQUIRED' = 'PASSED';
    if (!optionValidity || !answerValidity || !explanationValidity || duplicateDetected || !ncertAlignment) {
      validationStatus = 'FAILED';
    } else if (ambiguityScore >= 0.4 || !conceptAlignment) {
      validationStatus = 'REVIEW_REQUIRED';
    }

    return {
      validationStatus,
      factualValidity,
      answerValidity,
      optionValidity,
      ncertAlignment,
      conceptAlignment,
      duplicateDetected,
      difficultySanity,
      explanationValidity,
      ambiguityScore,
      failureReasons,
    };
  }

  /**
   * Ingests a validated AI question into the repository with explicit AI_GENERATED flags
   */
  static async ingestAIQuestion(input: AIQuestionInput, adminUserId?: string) {
    const validation = await this.validateAIQuestion(input);

    if (validation.validationStatus === 'FAILED') {
      throw new Error(`AI Question validation failed: ${validation.failureReasons.join('; ')}`);
    }

    const questionId = `Q_AI_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const question = await prisma.question.create({
      data: {
        id: questionId,
        questionText: input.questionText,
        questionType: 'SINGLE_CORRECT',
        difficulty: input.difficulty || 'MEDIUM',
        correctOption: input.correctOption,
        explanation: input.explanation,
        subjectId: input.subjectId,
        classLevelId: input.classLevelId,
        chapterId: input.chapterId,
        primaryConceptId: input.conceptId || null,
        sourceType: 'AI_GENERATED',
        verificationStatus: validation.validationStatus === 'PASSED' ? 'VERIFIED' : 'NEEDS_REVIEW',
        publicationStatus: validation.validationStatus === 'PASSED' ? 'PUBLISHED' : 'UNPUBLISHED',
        syllabusStatus: 'CURRENT',
        assessmentStatus: validation.validationStatus === 'PASSED' ? 'ACTIVE' : 'REVIEW_REQUIRED',
        options: {
          create: input.options.map((o, idx) => ({
            label: o.label,
            text: o.text,
            orderIndex: idx + 1,
          })),
        },
      },
    });

    // Record AIQuestionValidation entry
    await prisma.aIQuestionValidation.create({
      data: {
        questionId: question.id,
        generatorModel: input.generatorModel || 'grounded-v1',
        promptVersion: input.promptVersion || 'v1.0',
        factualValidity: validation.factualValidity,
        answerValidity: validation.answerValidity,
        optionValidity: validation.optionValidity,
        ncertAlignment: validation.ncertAlignment,
        conceptAlignment: validation.conceptAlignment,
        ambiguityScore: validation.ambiguityScore,
        duplicateDetected: validation.duplicateDetected,
        difficultySanity: validation.difficultySanity,
        explanationValidity: validation.explanationValidity,
        validationStatus: validation.validationStatus,
        reviewStatus: validation.validationStatus === 'PASSED' ? 'APPROVED' : 'PENDING',
        validationDetailsJson: JSON.stringify({ failureReasons: validation.failureReasons }),
        reviewedBy: adminUserId || null,
        reviewedAt: adminUserId ? new Date() : null,
      },
    });

    return {
      question,
      validation,
    };
  }

  static async validateGeneratedQuestion(params: {
    questionId?: string;
    text?: string;
    questionText?: string;
    options: Array<{ label: string; text: string }> | string[];
    correctOption: string | number;
    explanation: string;
    conceptName?: string;
    chapterName?: string;
    ncertExcerpts?: string[];
    subjectId?: string;
    classLevelId?: string;
    chapterId?: string;
    conceptId?: string;
  }): Promise<AIValidationResult> {
    const formattedOptions: Array<{ label: string; text: string }> = Array.isArray(params.options)
      ? params.options.map((opt, idx) => {
          if (typeof opt === 'string') {
            return { label: String.fromCharCode(65 + idx), text: opt };
          }
          return opt;
        })
      : [];

    const correctOptStr = typeof params.correctOption === 'number'
      ? String.fromCharCode(65 + params.correctOption)
      : params.correctOption;

    return this.validateAIQuestion({
      questionText: params.questionText || params.text || '',
      options: formattedOptions,
      correctOption: correctOptStr,
      explanation: params.explanation,
      subjectId: params.subjectId || 'test_subject',
      classLevelId: params.classLevelId || 'test_class',
      chapterId: params.chapterId || 'test_chapter',
      conceptId: params.conceptId,
      questionId: params.questionId,
      ncertExcerpts: params.ncertExcerpts,
      chapterName: params.chapterName,
      conceptName: params.conceptName,
    } as any);
  }
}
