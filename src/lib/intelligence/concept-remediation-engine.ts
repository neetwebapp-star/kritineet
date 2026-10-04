import prisma from '../prisma';
import { ConceptMasteryEngine } from './concept-mastery-engine';

export interface RemediationPackage {
  concept: {
    id: string;
    name: string;
    definition: string | null;
    formula: string | null;
    laws: string | null;
    importantStatements: string | null;
    chapterTitle: string;
    subjectName: string;
  };
  workedExplanation: string;
  drillQuestions: {
    step1_easy: any | null;
    step2_medium: any | null;
    step3_pyq: any | null;
  };
  currentMastery: number;
}

export class ConceptRemediationEngine {
  /**
   * Generates a "Fix My Weakness" remediation package for a struggling concept
   */
  static async getRemediationPackage(userId: string, conceptId: string): Promise<RemediationPackage> {
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        chapter: {
          include: { subject: true },
        },
      },
    });

    if (!concept) {
      throw new Error(`Concept ${conceptId} not found`);
    }

    // Current student mastery
    const masteryRecord = await prisma.studentConceptMastery.findUnique({
      where: {
        userId_conceptId: { userId, conceptId },
      },
    });

    // 1. Step 1: Easy question (NCERT or Fingertips preferred)
    const step1Easy = await prisma.question.findFirst({
      where: {
        primaryConceptId: conceptId,
        difficulty: 'EASY',
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
      },
    });

    // 2. Step 2: Medium question (Fingertips or NCERT preferred)
    const step2Medium = await prisma.question.findFirst({
      where: {
        primaryConceptId: conceptId,
        difficulty: 'MEDIUM',
        id: step1Easy ? { not: step1Easy.id } : undefined,
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
      },
    });

    // 3. Step 3: NEET PYQ Re-test
    let step3Pyq = await prisma.question.findFirst({
      where: {
        primaryConceptId: conceptId,
        sourceType: 'PYQ',
        id: { notIn: [step1Easy?.id, step2Medium?.id].filter(Boolean) as string[] },
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
      },
    });

    // Fallback if no PYQ directly linked to this concept: pick from same chapter
    if (!step3Pyq) {
      step3Pyq = await prisma.question.findFirst({
        where: {
          chapterId: concept.chapterId,
          sourceType: 'PYQ',
          id: { notIn: [step1Easy?.id, step2Medium?.id].filter(Boolean) as string[] },
          verificationStatus: 'VERIFIED',
          publicationStatus: 'PUBLISHED',
        },
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
        },
      });
    }

    const workedExplanation =
      concept.definition
        ? `Official NCERT Concept Framework:\n\n${concept.definition}\n${
            concept.formula ? `\nCore Formula: ${concept.formula}` : ''
          }\n${concept.laws ? `\nGuiding Principle: ${concept.laws}` : ''}`
        : 'Detailed NCERT theoretical principles and solved examples.';

    return {
      concept: {
        id: concept.id,
        name: concept.name,
        definition: concept.definition,
        formula: concept.formula,
        laws: concept.laws,
        importantStatements: concept.importantStatements,
        chapterTitle: concept.chapter.title,
        subjectName: concept.chapter.subject.name,
      },
      workedExplanation,
      drillQuestions: {
        step1_easy: step1Easy,
        step2_medium: step2Medium,
        step3_pyq: step3Pyq,
      },
      currentMastery: masteryRecord?.masteryScore || 0.0,
    };
  }

  /**
   * Submits a step in the remediation queue and updates mastery
   */
  static async submitRemediationStep(
    userId: string,
    conceptId: string,
    questionId: string,
    isCorrect: boolean,
    timeSpentSeconds: number = 45
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    const difficulty = (question?.difficulty as any) || 'MEDIUM';

    // Update mastery with remediation context
    const updated = await ConceptMasteryEngine.updateMastery({
      userId,
      conceptId,
      isCorrect,
      difficulty,
      timeSpentSeconds,
      questionId,
    });

    // If correct, resolve previous mistakes on this question/concept
    if (isCorrect) {
      await prisma.studentMistake.updateMany({
        where: { userId, questionId },
        data: { isResolved: true },
      });
    }

    return updated;
  }
}
