import prisma from '../prisma';

export class SpacedRevisionEngine {
  /**
   * Schedule or update next revision time based on SM-2 spaced repetition logic
   * Quality score: 0 (complete blackout) to 5 (perfect recall)
   */
  static async updateRevisionItem(
    userId: string,
    questionId: string,
    qualityScore: number // 0 to 5
  ) {
    const existing = await prisma.revisionSchedule.findFirst({
      where: { userId, questionId },
    });

    let repetitionLevel = existing ? existing.repetitionLevel : 0;
    let easeFactor = existing ? existing.easeFactor : 2.5;
    let intervalDays = existing ? existing.intervalDays : 1;

    if (qualityScore >= 3) {
      if (repetitionLevel === 0) {
        intervalDays = 1;
      } else if (repetitionLevel === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.min(180, Math.round(intervalDays * easeFactor));
      }
      repetitionLevel += 1;
    } else {
      repetitionLevel = 0;
      intervalDays = 1;
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Determine revision category
    let category: 'DUE_TODAY' | 'DUE_SOON' | 'WEAK' | 'MASTERED' = 'DUE_SOON';
    if (qualityScore < 3) {
      category = 'WEAK';
    } else if (repetitionLevel >= 4) {
      category = 'MASTERED';
    } else if (intervalDays <= 1) {
      category = 'DUE_TODAY';
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    if (existing) {
      return prisma.revisionSchedule.update({
        where: { id: existing.id },
        data: {
          repetitionLevel,
          easeFactor,
          intervalDays,
          category,
          lastReviewedAt: new Date(),
          nextRevisionAt: nextDate,
        },
      });
    }

    return prisma.revisionSchedule.create({
      data: {
        userId,
        questionId,
        repetitionLevel,
        easeFactor,
        intervalDays,
        category,
        lastReviewedAt: new Date(),
        nextRevisionAt: nextDate,
      },
    });
  }

  /**
   * "Start Today's Revision" - Generates customized set of questions due for revision
   */
  static async getTodaysRevisionSet(userId: string, limit = 20) {
    const now = new Date();

    const dueItems = await prisma.revisionSchedule.findMany({
      where: {
        userId,
        nextRevisionAt: { lte: now },
        questionId: { not: null },
      },
      take: limit,
      include: {
        question: {
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
            primaryConcept: true,
            chapter: { include: { subject: true } },
          },
        },
      },
      orderBy: { nextRevisionAt: 'asc' },
    });

    const questions = dueItems
      .map((item) => item.question)
      .filter((q): q is NonNullable<typeof q> => q !== null && q.verificationStatus === 'VERIFIED');

    // If fewer than limit, supplement with unresolved mistakes
    if (questions.length < limit) {
      const extraMistakes = await prisma.studentMistake.findMany({
        where: {
          userId,
          isResolved: false,
          questionId: { notIn: questions.map((q) => q.id) },
        },
        take: limit - questions.length,
        include: {
          question: {
            include: {
              options: { orderBy: { orderIndex: 'asc' } },
              primaryConcept: true,
              chapter: { include: { subject: true } },
            },
          },
        },
      });

      for (const m of extraMistakes) {
        if (m.question && m.question.verificationStatus === 'VERIFIED') {
          questions.push(m.question);
        }
      }
    }

    return questions;
  }

  /**
   * Revision summary counts for Student Dashboard
   */
  static async getRevisionSummary(userId: string) {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const dueToday = await prisma.revisionSchedule.count({
      where: { userId, nextRevisionAt: { lte: now } },
    });

    const dueSoon = await prisma.revisionSchedule.count({
      where: { userId, nextRevisionAt: { gt: now, lte: threeDaysLater } },
    });

    const weak = await prisma.revisionSchedule.count({
      where: { userId, category: 'WEAK' },
    });

    const mastered = await prisma.revisionSchedule.count({
      where: { userId, category: 'MASTERED' },
    });

    return { dueToday, dueSoon, weak, mastered };
  }
}
