import prisma from '../prisma';

export interface ConceptMasteryUpdateInput {
  userId: string;
  conceptId: string;
  isCorrect: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  timeSpentSeconds: number;
  expectedTimeSeconds?: number;
  questionId?: string;
}

export interface ConceptMasteryResult {
  conceptId: string;
  masteryScore: number;       // 0.0 - 100.0
  confidenceScore: number;    // 0.0 - 1.0
  accuracy: number;           // 0.0 - 100.0
  status: 'UNSEEN' | 'LEARNING' | 'WEAK' | 'REVIEW_DUE' | 'MASTERED';
  attempts: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  nextReviewAt: Date;
}

export class ConceptMasteryEngine {
  /**
   * Updates student mastery for a concept following an attempt.
   * Multi-signal algorithm:
   * - Difficulty-weighted adjustments
   * - Recency weighting
   * - Consecutive streaks
   * - Time calibration
   */
  static async updateMastery(input: ConceptMasteryUpdateInput): Promise<ConceptMasteryResult> {
    const { userId, conceptId, isCorrect, difficulty, timeSpentSeconds } = input;
    const expectedTime = input.expectedTimeSeconds || 60;

    // Fetch existing mastery record
    const existing = await prisma.studentConceptMastery.findUnique({
      where: {
        userId_conceptId: { userId, conceptId },
      },
    });

    let currentScore = existing ? existing.masteryScore : 0.0;
    const attempts = (existing ? existing.attempts : 0) + 1;
    const correctAttempts = (existing ? existing.correctAttempts : 0) + (isCorrect ? 1 : 0);
    const incorrectAttempts = (existing ? existing.incorrectAttempts : 0) + (isCorrect ? 0 : 1);
    const accuracy = Number(((correctAttempts / attempts) * 100).toFixed(1));

    let consecutiveCorrect = isCorrect ? (existing ? existing.consecutiveCorrect : 0) + 1 : 0;
    let consecutiveIncorrect = !isCorrect ? (existing ? existing.consecutiveIncorrect : 0) + 1 : 0;

    // 1. Difficulty-weighted delta
    let delta = 0;
    if (isCorrect) {
      switch (difficulty) {
        case 'EASY': delta = 7.0; break;
        case 'MEDIUM': delta = 12.0; break;
        case 'HARD': delta = 18.0; break;
        case 'VERY_HARD': delta = 22.0; break;
        default: delta = 10.0;
      }
      // Speed bonus/penalty (modest: +/- 10% delta)
      if (timeSpentSeconds <= expectedTime * 0.8) {
        delta *= 1.15; // Fast, confident
      } else if (timeSpentSeconds > expectedTime * 2.0) {
        delta *= 0.85; // Struggled / prolonged
      }
      // Streak momentum bonus
      if (consecutiveCorrect >= 2) {
        delta += (consecutiveCorrect * 4.0);
      }
    } else {
      switch (difficulty) {
        case 'EASY': delta = -15.0; break;  // Severe penalty for missing basic concept
        case 'MEDIUM': delta = -9.0; break; // Standard penalty
        case 'HARD': delta = -4.0; break;   // Mild penalty: Hard question failure shouldn't destroy mastery
        case 'VERY_HARD': delta = -2.5; break;
        default: delta = -9.0;
      }
      // Repeated consecutive incorrect penalty
      if (consecutiveIncorrect >= 2) {
        delta -= 6.0 * (consecutiveIncorrect - 1);
      }
    }

    // Apply delta and clamp to [0, 100]
    let newScore = Math.max(0.0, Math.min(100.0, currentScore + delta));

    // For brand-new concepts (first attempt), initialize proportionally
    if (!existing) {
      newScore = isCorrect
        ? (difficulty === 'EASY' ? 30.0 : difficulty === 'MEDIUM' ? 40.0 : 50.0)
        : (difficulty === 'HARD' ? 20.0 : 10.0);
    } else {
      // Recency dynamic: student in a declining trend (consecutive errors) is discounted
      if (!isCorrect && consecutiveIncorrect >= 2) {
        newScore = Math.min(newScore, Math.max(15.0, newScore * 0.70));
      } else if (isCorrect && consecutiveCorrect >= 2) {
        newScore = Math.max(newScore, Math.min(100.0, currentScore + delta + (consecutiveCorrect * 4.0)));
      }
    }

    // Confidence score based on sample size and consistency
    const confidenceScore = Number(Math.min(1.0, 0.2 + (attempts * 0.1) + (consecutiveCorrect * 0.05)).toFixed(2));

    // Dynamic Spaced Interval calculation
    let intervalDays = 1;
    if (isCorrect) {
      if (newScore >= 85) intervalDays = 7 + (consecutiveCorrect * 3);
      else if (newScore >= 65) intervalDays = 3 + consecutiveCorrect;
      else intervalDays = 2;
    } else {
      intervalDays = 1; // Needs immediate review
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    // Determine status
    let status: 'UNSEEN' | 'LEARNING' | 'WEAK' | 'REVIEW_DUE' | 'MASTERED' = 'LEARNING';
    if (newScore >= 85 && attempts >= 3) {
      status = 'MASTERED';
    } else if (newScore < 50 || consecutiveIncorrect >= 2) {
      status = 'WEAK';
    } else if (attempts > 0) {
      status = 'LEARNING';
    }

    const now = new Date();
    const updated = await prisma.studentConceptMastery.upsert({
      where: {
        userId_conceptId: { userId, conceptId },
      },
      update: {
        masteryScore: Number(newScore.toFixed(1)),
        confidenceScore,
        accuracy,
        attempts,
        correctAttempts,
        incorrectAttempts,
        lastAttemptAt: now,
        lastCorrectAt: isCorrect ? now : existing?.lastCorrectAt,
        lastIncorrectAt: !isCorrect ? now : existing?.lastIncorrectAt,
        averageTime: existing
          ? Number(((existing.averageTime * (attempts - 1) + timeSpentSeconds) / attempts).toFixed(1))
          : timeSpentSeconds,
        consecutiveCorrect,
        consecutiveIncorrect,
        status,
        nextReviewAt,
      },
      create: {
        userId,
        conceptId,
        masteryScore: Number(newScore.toFixed(1)),
        confidenceScore,
        accuracy,
        attempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        incorrectAttempts: isCorrect ? 0 : 1,
        lastAttemptAt: now,
        lastCorrectAt: isCorrect ? now : null,
        lastIncorrectAt: !isCorrect ? now : null,
        averageTime: timeSpentSeconds,
        expectedTime,
        consecutiveCorrect: isCorrect ? 1 : 0,
        consecutiveIncorrect: !isCorrect ? 1 : 0,
        status,
        nextReviewAt,
      },
    });

    return {
      conceptId,
      masteryScore: updated.masteryScore,
      confidenceScore: updated.confidenceScore,
      accuracy: updated.accuracy,
      status: updated.status as any,
      attempts: updated.attempts,
      consecutiveCorrect: updated.consecutiveCorrect,
      consecutiveIncorrect: updated.consecutiveIncorrect,
      nextReviewAt: updated.nextReviewAt || nextReviewAt,
    };
  }

  /**
   * Retrieves student's weak concepts (mastery < 60 or consecutiveIncorrect >= 2)
   */
  static async getWeakConcepts(userId: string, limit = 10) {
    return prisma.studentConceptMastery.findMany({
      where: {
        userId,
        OR: [
          { status: 'WEAK' },
          { masteryScore: { lt: 55.0 } },
          { consecutiveIncorrect: { gte: 2 } },
        ],
      },
      take: limit,
      orderBy: [
        { masteryScore: 'asc' },
        { consecutiveIncorrect: 'desc' },
      ],
      include: {
        concept: {
          include: {
            chapter: {
              include: { subject: true },
            },
          },
        },
      },
    });
  }

  /**
   * Computes chapter-level mastery aggregates from concept masteries
   */
  static async getChapterMastery(userId: string, chapterId: string) {
    const concepts = await prisma.concept.findMany({
      where: { chapterId },
      include: {
        masteries: {
          where: { userId },
        },
      },
    });

    if (concepts.length === 0) return { masteryPercentage: 0, conceptsCount: 0, attemptedCount: 0 };

    let totalMastery = 0;
    let attemptedCount = 0;

    for (const c of concepts) {
      if (c.masteries.length > 0) {
        totalMastery += c.masteries[0].masteryScore;
        attemptedCount += 1;
      }
    }

    // Unattempted concepts count as 0 in overall chapter mastery
    const masteryPercentage = Number((totalMastery / concepts.length).toFixed(1));

    return {
      chapterId,
      masteryPercentage,
      conceptsCount: concepts.length,
      attemptedCount,
    };
  }

  static async getSubjectMastery(userId: string, subjectCode: string) {
    const normalizedCode = subjectCode.toUpperCase();
    const codes = normalizedCode.startsWith('BIO')
      ? ['BIOLOGY', 'BIO']
      : normalizedCode.startsWith('PHY')
      ? ['PHYSICS', 'PHY']
      : normalizedCode.startsWith('CHE')
      ? ['CHEMISTRY', 'CHE']
      : [normalizedCode];

    const chapters = await prisma.chapter.findMany({
      where: {
        subject: { code: { in: codes } },
        chapterNumber: { lte: 20 },
        unitId: { not: null },
      },
      include: {
        concepts: {
          include: {
            masteries: {
              where: { userId },
            },
          },
        },
      },
    });

    let totalConcepts = 0;
    let totalScore = 0;
    let attemptedConcepts = 0;

    for (const ch of chapters) {
      for (const c of ch.concepts) {
        totalConcepts += 1;
        if (c.masteries.length > 0) {
          totalScore += c.masteries[0].masteryScore;
          attemptedConcepts += 1;
        }
      }
    }

    const masteryRate = totalConcepts > 0 ? Number((totalScore / totalConcepts).toFixed(1)) : 0.0;

    return {
      subjectCode,
      masteryRate,
      totalConcepts,
      attemptedConcepts,
      chaptersCount: chapters.length,
    };
  }
}
