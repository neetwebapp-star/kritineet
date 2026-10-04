import prisma from '../prisma';

export type ExposureState =
  | 'UNSEEN'
  | 'SEEN'
  | 'ANSWERED_CORRECT'
  | 'ANSWERED_WRONG'
  | 'MASTERED'
  | 'REVIEW_DUE';

export class QuestionExposureEngine {
  /**
   * Records or updates exposure when student interacts with a question
   */
  static async recordExposure(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    timeSpentSeconds: number = 0
  ) {
    const existing = await prisma.questionExposure.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    const timesAttempted = (existing?.timesAttempted || 0) + 1;
    let state: ExposureState = isCorrect ? 'ANSWERED_CORRECT' : 'ANSWERED_WRONG';

    if (isCorrect && timesAttempted >= 3) {
      state = 'MASTERED';
    }

    // Next review date
    let reviewDays = isCorrect ? 5 * timesAttempted : 1;
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + reviewDays);

    return prisma.questionExposure.upsert({
      where: {
        userId_questionId: { userId, questionId },
      },
      update: {
        state,
        timesAttempted,
        lastAttemptedAt: new Date(),
        nextReviewAt,
      },
      create: {
        userId,
        questionId,
        state,
        timesAttempted: 1,
        lastAttemptedAt: new Date(),
        nextReviewAt,
      },
    });
  }

  /**
   * Retrieves exposure state for a question
   */
  static async getExposureState(userId: string, questionId: string): Promise<ExposureState> {
    const record = await prisma.questionExposure.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });
    return (record?.state as ExposureState) || 'UNSEEN';
  }

  static async rankQuestionsForPractice(userId: string, questionIds: string[]): Promise<string[]> {
    return this.rankQuestionsByExposure(userId, questionIds);
  }

  /**
   * Filters a pool of candidate questions according to adaptive exposure policy:
   * Prioritize UNSEEN > REVIEW_DUE > ANSWERED_WRONG > ANSWERED_CORRECT (skip MASTERED unless requested)
   */
  static async rankQuestionsByExposure(userId: string, questionIds: string[]): Promise<string[]> {
    if (questionIds.length === 0) return [];

    const exposures = await prisma.questionExposure.findMany({
      where: {
        userId,
        questionId: { in: questionIds },
      },
    });

    const exposureMap = new Map<string, { state: string; times: number; nextReview: Date | null }>();
    for (const exp of exposures) {
      exposureMap.set(exp.questionId, {
        state: exp.state,
        times: exp.timesAttempted,
        nextReview: exp.nextReviewAt,
      });
    }

    const now = new Date();

    return [...questionIds].sort((a, b) => {
      const expA = exposureMap.get(a);
      const expB = exposureMap.get(b);

      const scoreA = getPriorityScore(expA, now);
      const scoreB = getPriorityScore(expB, now);

      return scoreB - scoreA; // Highest priority first
    });
  }
}

function getPriorityScore(
  exp: { state: string; times: number; nextReview: Date | null } | undefined,
  now: Date
): number {
  if (!exp) return 100; // UNSEEN is highest priority for new practice
  if (exp.state === 'ANSWERED_WRONG') return 90; // Recent mistake to fix
  if (exp.nextReview && exp.nextReview <= now) return 80; // Review due
  if (exp.state === 'ANSWERED_CORRECT') return 40;
  if (exp.state === 'MASTERED') return 10; // Avoid repeating mastered questions
  return 50;
}
