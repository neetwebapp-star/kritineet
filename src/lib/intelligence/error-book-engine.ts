import prisma from '../prisma';

export interface ErrorBookFilter {
  category?: 'ALL' | 'REPEATED' | 'SLOW' | 'GUESSED' | 'FLAGGED' | 'LEARNED';
  subjectCode?: string;
  limit?: number;
}

export class ErrorBookEngine {
  static async getStudentMistakes(userId: string) {
    const mistakes = await this.getErrorBook(userId, { category: 'ALL' });
    return { mistakes };
  }

  /**
   * Fetches student's personalized error book items with rich question metadata
   */
  static async getErrorBook(userId: string, filter: ErrorBookFilter = {}) {
    const limit = filter.limit || 50;
    const where: any = { userId };

    if (filter.category === 'REPEATED') {
      where.mistakeCount = { gte: 2 };
      where.isLearned = false;
    } else if (filter.category === 'LEARNED') {
      where.isLearned = true;
    } else if (filter.category === 'GUESSED') {
      where.mistakeType = 'GUESS';
      where.isLearned = false;
    } else if (filter.category === 'SLOW') {
      where.mistakeType = 'TIME_PRESSURE';
      where.isLearned = false;
    } else {
      where.isLearned = false; // Default: unlearned active mistakes
    }

    if (filter.subjectCode && filter.subjectCode !== 'ALL') {
      where.chapter = {
        subject: { code: filter.subjectCode },
      };
    }

    const mistakes = await prisma.studentMistake.findMany({
      where,
      take: limit,
      orderBy: [
        { mistakeCount: 'desc' },
        { lastMistakeAt: 'desc' },
      ],
      include: {
        question: {
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
            figures: true,
            primaryConcept: true,
            chapter: { include: { subject: true } },
          },
        },
      },
    });

    return mistakes.map((m) => {
      let cleanBadge = 'NCERT';
      if (m.question.sourceType === 'PYQ') {
        cleanBadge = `${m.question.examName || 'NEET'} ${m.question.examYear || ''}`.trim();
      } else if (m.question.sourceType === 'FINGERTIPS') {
        cleanBadge = 'MTG Fingertips';
      }

      return {
        id: m.id,
        questionId: m.questionId,
        questionText: m.question.questionText,
        options: m.question.options.map((o) => ({ label: o.label, text: o.text })),
        figures: m.question.figures.map((f) => ({ assetPath: f.assetPath, caption: f.caption })),
        studentAnswer: m.selectedOption,
        correctOption: m.correctOption,
        explanation: m.question.explanation,
        difficulty: m.question.difficulty,
        sourceType: m.question.sourceType,
        sourceBadge: cleanBadge,
        mistakeCount: m.mistakeCount,
        mistakeType: m.mistakeType || 'UNKNOWN',
        confidence: m.confidence,
        evidence: m.evidence,
        lastMistakeAt: m.lastMistakeAt,
        isLearned: m.isLearned,
        learnedAt: m.learnedAt,
        concept: m.question.primaryConcept
          ? {
              id: m.question.primaryConcept.id,
              name: m.question.primaryConcept.name,
              definition: m.question.primaryConcept.definition,
              formula: m.question.primaryConcept.formula,
            }
          : null,
        chapter: {
          title: m.question.chapter?.title,
          subjectName: m.question.chapter?.subject?.name,
        },
      };
    });
  }

  /**
   * Marks a question in the Error Book as learned while preserving historical data
   */
  static async markAsLearned(userId: string, questionId: string) {
    const updated = await prisma.studentMistake.updateMany({
      where: { userId, questionId },
      data: {
        isLearned: true,
        learnedAt: new Date(),
        isResolved: true,
      },
    });

    // Also update QuestionExposure state to MASTERED or ANSWERED_CORRECT
    await prisma.questionExposure.updateMany({
      where: { userId, questionId },
      data: {
        state: 'MASTERED',
      },
    });

    return updated;
  }

  /**
   * Generates a "Retry Mistakes" queue prioritizing repeated and recent errors
   */
  static async getRetryQueue(userId: string, limit = 15) {
    const activeMistakes = await prisma.studentMistake.findMany({
      where: {
        userId,
        isLearned: false,
      },
      take: limit,
      orderBy: [
        { mistakeCount: 'desc' },
        { lastMistakeAt: 'desc' },
      ],
      include: {
        question: {
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
            figures: true,
            primaryConcept: true,
            chapter: { include: { subject: true } },
          },
        },
      },
    });

    return activeMistakes.map((m) => ({
      ...m.question,
      mistakeCount: m.mistakeCount,
      mistakeContext: {
        mistakeCount: m.mistakeCount,
        mistakeType: m.mistakeType,
        lastAnswer: m.selectedOption,
      },
    }));
  }
}
