import prisma from '../prisma';

export interface RemediationStep {
  stepNumber: number;
  stepType: 'NCERT_SECTION' | 'CONCEPT_EXPLANATION' | 'WORKED_EXAMPLE' | 'EASY_PRACTICE' | 'MEDIUM_PRACTICE' | 'REATTEMPT_ORIGINAL';
  title: string;
  description: string;
  targetId?: string;
  isCompleted: boolean;
}

export interface RemediationPackage {
  conceptId: string;
  conceptName: string;
  chapterTitle: string;
  subjectCode: string;
  originalQuestionId: string;
  steps: RemediationStep[];
  currentStep: number;
  isRemediationComplete: boolean;
  masteryPassed: boolean;
}

export class RemediationGenerator {
  /**
   * Generates a 6-step sequential pedagogical remediation package for a repeated mistake
   */
  static async generateRemediation(params: {
    userId: string;
    mistakeId?: string;
    questionId: string;
    conceptId: string;
  }): Promise<RemediationPackage> {
    const [concept, question, userMistake] = await Promise.all([
      prisma.concept.findUnique({
        where: { id: params.conceptId },
        include: { chapter: { include: { subject: true } } },
      }),
      prisma.question.findUnique({
        where: { id: params.questionId },
      }),
      prisma.studentMistake.findFirst({
        where: { userId: params.userId, questionId: params.questionId },
      }),
    ]);

    if (!concept) throw new Error(`Concept ${params.conceptId} not found`);

    const chapterTitle = concept.chapter?.title || 'Target Chapter';
    const subjectCode = concept.chapter?.subject?.code || 'PHYSICS';

    const steps: RemediationStep[] = [
      {
        stepNumber: 1,
        stepType: 'NCERT_SECTION',
        title: `1. NCERT Core Lines: ${concept.name}`,
        description: `Read official NCERT textbook context for ${concept.name} (${chapterTitle})`,
        targetId: concept.id,
        isCompleted: false,
      },
      {
        stepNumber: 2,
        stepType: 'CONCEPT_EXPLANATION',
        title: `2. Concept Breakdown & Misconception Analysis`,
        description: `Clarify theoretical principles and why ${userMistake?.mistakeType || 'CONCEPTUAL'} traps occur`,
        targetId: concept.id,
        isCompleted: false,
      },
      {
        stepNumber: 3,
        stepType: 'WORKED_EXAMPLE',
        title: `3. Step-by-Step Worked Example`,
        description: 'Study verified problem-solving methodology without time pressure',
        isCompleted: false,
      },
      {
        stepNumber: 4,
        stepType: 'EASY_PRACTICE',
        title: `4. Foundational Drill (EASY Difficulty)`,
        description: 'Establish initial cognitive confidence with 2 high-facility questions',
        isCompleted: false,
      },
      {
        stepNumber: 5,
        stepType: 'MEDIUM_PRACTICE',
        title: `5. Standard NEET Drill (MEDIUM Difficulty)`,
        description: 'Solve standard examination level questions on this concept',
        isCompleted: false,
      },
      {
        stepNumber: 6,
        stepType: 'REATTEMPT_ORIGINAL',
        title: `6. Reattempt Original Mistake Question`,
        description: `Correctly solve original question (${params.questionId}) to satisfy Mastery Gate`,
        targetId: params.questionId,
        isCompleted: false,
      },
    ];

    return {
      conceptId: concept.id,
      conceptName: concept.name,
      chapterTitle,
      subjectCode,
      originalQuestionId: params.questionId,
      steps,
      currentStep: 1,
      isRemediationComplete: false,
      masteryPassed: false,
    };
  }

  /**
   * Verifies the Mastery Gate: requires empirical evidence (e.g. successful reattempt + practice)
   * before promoting concept mastery
   */
  static async evaluateMasteryGate(params: {
    userId: string;
    conceptId: string;
    originalQuestionId: string;
    reattemptSuccess: boolean;
    additionalPracticeCount: number;
    additionalPracticeCorrect: number;
  }): Promise<{ passed: boolean; newMastery: number; reason: string }> {
    if (!params.reattemptSuccess) {
      return {
        passed: false,
        newMastery: 35.0,
        reason: 'Mastery Gate failed: Original mistake was not answered correctly on reattempt.',
      };
    }

    if (params.additionalPracticeCount < 2 || params.additionalPracticeCorrect < 1) {
      return {
        passed: false,
        newMastery: 50.0,
        reason: 'Mastery Gate requires at least 2 practice questions with >= 1 correct response.',
      };
    }

    // Passed: update student concept mastery
    const existing = await prisma.studentConceptMastery.findUnique({
      where: {
        userId_conceptId: {
          userId: params.userId,
          conceptId: params.conceptId,
        },
      },
    });

    const previousMastery = existing ? existing.masteryScore : 40.0;
    const newMastery = Math.min(85.0, previousMastery + 25.0);

    await prisma.studentConceptMastery.upsert({
      where: {
        userId_conceptId: {
          userId: params.userId,
          conceptId: params.conceptId,
        },
      },
      create: {
        userId: params.userId,
        conceptId: params.conceptId,
        masteryScore: newMastery,
        attempts: (existing?.attempts || 0) + params.additionalPracticeCount + 1,
        correctAttempts: (existing?.correctAttempts || 0) + params.additionalPracticeCorrect + 1,
        lastAttemptAt: new Date(),
        status: newMastery >= 75 ? 'MASTERED' : 'LEARNING',
      },
      update: {
        masteryScore: newMastery,
        attempts: { increment: params.additionalPracticeCount + 1 },
        correctAttempts: { increment: params.additionalPracticeCorrect + 1 },
        lastAttemptAt: new Date(),
        status: newMastery >= 75 ? 'MASTERED' : 'LEARNING',
      },
    });

    // Mark original student mistake as resolved and learned
    await prisma.studentMistake.updateMany({
      where: {
        userId: params.userId,
        questionId: params.originalQuestionId,
      },
      data: {
        isResolved: true,
        isLearned: true,
        learnedAt: new Date(),
      },
    });

    return {
      passed: true,
      newMastery,
      reason: 'Mastery Gate PASSED: Verified with successful reattempt and solid practice accuracy.',
    };
  }
}
