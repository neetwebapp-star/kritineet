import prisma from '../prisma';

export type ExposureState = 'NEW' | 'SEEN' | 'PRACTICED' | 'MASTERED' | 'OVEREXPOSED';

export interface ContentGap {
  conceptId: string;
  conceptName: string;
  chapterTitle: string;
  subjectCode: string;
  gapType:
    | 'CONCEPT_WITHOUT_PRACTICE'
    | 'CONCEPT_WITHOUT_PYQ'
    | 'CONCEPT_WITHOUT_REMEDIATION'
    | 'CONCEPT_WITH_LOW_QUESTION_DENSITY'
    | 'CONCEPT_WITH_HIGH_ERROR_RATE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
}

export class ExposureAndGapEngine {
  /**
   * Records or updates a student's exposure to a question
   */
  static async recordQuestionExposure(params: {
    userId: string;
    questionId: string;
    isCorrect: boolean;
    mode?: string;
  }) {
    const existing = await prisma.questionExposure.findUnique({
      where: {
        userId_questionId: {
          userId: params.userId,
          questionId: params.questionId,
        },
      },
    });

    const timesAttempted = existing ? existing.timesAttempted + 1 : 1;
    const correctCount = existing ? existing.correctCount + (params.isCorrect ? 1 : 0) : params.isCorrect ? 1 : 0;
    const incorrectCount = existing ? existing.incorrectCount + (!params.isCorrect ? 1 : 0) : !params.isCorrect ? 1 : 0;

    let state: ExposureState = 'SEEN';
    if (timesAttempted >= 4 && correctCount >= 3) {
      state = 'OVEREXPOSED';
    } else if (correctCount >= 2) {
      state = 'MASTERED';
    } else if (timesAttempted >= 2) {
      state = 'PRACTICED';
    }

    const exposure = await prisma.questionExposure.upsert({
      where: {
        userId_questionId: {
          userId: params.userId,
          questionId: params.questionId,
        },
      },
      update: {
        timesAttempted,
        correctCount,
        incorrectCount,
        lastAttemptedAt: new Date(),
        lastMode: params.mode || 'PRACTICE',
        state,
      },
      create: {
        userId: params.userId,
        questionId: params.questionId,
        timesAttempted: 1,
        correctCount: params.isCorrect ? 1 : 0,
        incorrectCount: !params.isCorrect ? 1 : 0,
        firstSeenAt: new Date(),
        lastAttemptedAt: new Date(),
        lastMode: params.mode || 'PRACTICE',
        state: 'SEEN',
      },
    });

    return {
      ...exposure,
      seenCount: exposure.timesAttempted,
    };
  }

  static async recordExposure(userId: string, questionId: string, mode: string = 'PRACTICE', isCorrect: boolean = true) {
    return this.recordQuestionExposure({ userId, questionId, mode, isCorrect });
  }

  /**
   * Scans content knowledge graph across NCERT, PYQs, Fingertips, and attempts to detect gaps
   */
  static async detectContentGaps(
    param?: string | number | { chapterId?: string; limit?: number }
  ): Promise<ContentGap[]> {
    let chapterId: string | undefined;
    let limit: number = 50;

    if (typeof param === 'string') {
      chapterId = param;
    } else if (typeof param === 'number') {
      limit = param;
    } else if (param && typeof param === 'object') {
      chapterId = param.chapterId;
      limit = param.limit || 50;
    }

    const concepts = await prisma.concept.findMany({
      where: chapterId ? { chapterId } : undefined,
      take: limit,
      include: {
        chapter: {
          include: { subject: true },
        },
        primaryQuestions: {
          select: {
            id: true,
            sourceType: true,
          },
        },
        masteries: {
          select: {
            attempts: true,
            accuracy: true,
          },
        },
      },
    });

    const gaps: ContentGap[] = [];

    for (const c of concepts) {
      const questions = c.primaryQuestions;
      const totalQuestions = questions.length;
      const pyqCount = questions.filter((q) => q.sourceType === 'PYQ').length;

      let totalAttempts = 0;
      let totalAccuracy = 0;
      if (c.masteries.length > 0) {
        totalAttempts = c.masteries.reduce((a, m) => a + m.attempts, 0);
        totalAccuracy = Math.round(c.masteries.reduce((a, m) => a + m.accuracy, 0) / c.masteries.length);
      }

      if (totalQuestions === 0) {
        gaps.push({
          conceptId: c.id,
          conceptName: c.name,
          chapterTitle: c.chapter.title,
          subjectCode: c.chapter.subject.code,
          gapType: 'CONCEPT_WITHOUT_PRACTICE',
          severity: 'HIGH',
          details: 'Zero practice questions mapped to this canonical NCERT concept.',
        });
      } else if (pyqCount === 0) {
        gaps.push({
          conceptId: c.id,
          conceptName: c.name,
          chapterTitle: c.chapter.title,
          subjectCode: c.chapter.subject.code,
          gapType: 'CONCEPT_WITHOUT_PYQ',
          severity: 'MEDIUM',
          details: 'No verified NEET/AIPMT PYQ questions mapped to this concept.',
        });
      } else if (totalQuestions < 3) {
        gaps.push({
          conceptId: c.id,
          conceptName: c.name,
          chapterTitle: c.chapter.title,
          subjectCode: c.chapter.subject.code,
          gapType: 'CONCEPT_WITH_LOW_QUESTION_DENSITY',
          severity: 'LOW',
          details: `Only ${totalQuestions} questions available (recommended minimum is 5).`,
        });
      }

      if (totalAttempts >= 10 && totalAccuracy < 45) {
        gaps.push({
          conceptId: c.id,
          conceptName: c.name,
          chapterTitle: c.chapter.title,
          subjectCode: c.chapter.subject.code,
          gapType: 'CONCEPT_WITH_HIGH_ERROR_RATE',
          severity: 'HIGH',
          details: `Cohort accuracy is only ${totalAccuracy}% across ${totalAttempts} student attempts.`,
        });
      }
    }

    return gaps;
  }
}
