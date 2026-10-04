import prisma from '../prisma';

export interface RecordMistakeInput {
  userId: string;
  questionId: string;
  selectedOption: string;
  correctOption: string;
  conceptId?: string | null;
  chapterId: string;
}

export class StudentMistakeEngine {
  /**
   * Logs or increments a student mistake record
   */
  static async recordMistake(input: RecordMistakeInput) {
    const existing = await prisma.studentMistake.findUnique({
      where: {
        userId_questionId: {
          userId: input.userId,
          questionId: input.questionId,
        },
      },
    });

    if (existing) {
      return prisma.studentMistake.update({
        where: { id: existing.id },
        data: {
          mistakeCount: existing.mistakeCount + 1,
          selectedOption: input.selectedOption,
          correctOption: input.correctOption,
          lastMistakeAt: new Date(),
          isResolved: false,
        },
      });
    }

    return prisma.studentMistake.create({
      data: {
        userId: input.userId,
        questionId: input.questionId,
        conceptId: input.conceptId,
        chapterId: input.chapterId,
        selectedOption: input.selectedOption,
        correctOption: input.correctOption,
        mistakeCount: 1,
        lastMistakeAt: new Date(),
        isResolved: false,
      },
    });
  }

  /**
   * Mark a mistake as resolved after successful subsequent practice
   */
  static async resolveMistake(userId: string, questionId: string) {
    return prisma.studentMistake.updateMany({
      where: { userId, questionId },
      data: { isResolved: true },
    });
  }

  /**
   * Fetch repeated mistakes (questions where student erred >= 2 times)
   */
  static async getRepeatedMistakes(userId: string) {
    return prisma.studentMistake.findMany({
      where: {
        userId,
        mistakeCount: { gte: 2 },
        isResolved: false,
      },
      include: {
        question: {
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
            primaryConcept: true,
          },
        },
        chapter: {
          include: { subject: true },
        },
      },
      orderBy: { mistakeCount: 'desc' },
    });
  }

  /**
   * Weak chapters analytics based on mistake count and error rate
   */
  static async getWeakChapters(userId: string) {
    const mistakes = await prisma.studentMistake.findMany({
      where: { userId, isResolved: false },
      include: {
        chapter: {
          include: { subject: true },
        },
      },
    });

    const chapterStats = new Map<
      string,
      {
        chapterId: string;
        title: string;
        subjectName: string;
        mistakeCount: number;
        unresolvedCount: number;
      }
    >();

    for (const m of mistakes) {
      const ch = m.chapter;
      if (!chapterStats.has(ch.id)) {
        chapterStats.set(ch.id, {
          chapterId: ch.id,
          title: ch.title,
          subjectName: ch.subject.name,
          mistakeCount: m.mistakeCount,
          unresolvedCount: 1,
        });
      } else {
        const item = chapterStats.get(ch.id)!;
        item.mistakeCount += m.mistakeCount;
        item.unresolvedCount += 1;
      }
    }

    return Array.from(chapterStats.values()).sort((a, b) => b.mistakeCount - a.mistakeCount);
  }
}
