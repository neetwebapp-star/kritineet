import prisma from '../prisma';

export type ConfidenceLevel = 'INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'HIGH';
export type DifficultyBand = 'EASY' | 'MEDIUM' | 'HARD';
export type DistractorCategory = 'STRONG' | 'WEAK' | 'SUSPICIOUS' | 'AMBIGUOUS' | 'KEY' | 'NORMAL';

export interface PsychometricThresholds {
  insufficientMax: number;
  lowMax: number;
  mediumMax: number;
  highMin: number;
}

export const DEFAULT_THRESHOLDS: PsychometricThresholds = {
  insufficientMax: 9,
  lowMax: 29,
  mediumMax: 99,
  highMin: 100,
};

export const CALCULATION_VERSIONS = {
  difficulty: 'difficulty-v2.0',
  discrimination: 'discrimination-v1.0',
  distractor: 'distractor-v1.0',
  quality: 'quality-v3.0',
};

export interface QuestionMetricsResult {
  questionId: string;
  attemptCount: number;
  uniqueStudentCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyRate: number;
  skipRate: number;
  authoredDifficulty: DifficultyBand;
  estimatedDifficulty: DifficultyBand;
  observedDifficulty: DifficultyBand;
  difficultyConfidence: ConfidenceLevel;
  discriminationIndex: number;
  discriminationConfidence: ConfidenceLevel;
  averageResponseTime: number;
  medianResponseTime: number;
  timePercentiles: { p25: number; p50: number; p75: number; p90: number };
  optionDistribution: Record<string, number>;
  distractorEffectiveness: Record<string, DistractorCategory>;
  ambiguityScore: number;
  qualityScore: number;
  calculationVersion: string;
}

export class PsychometricsEngine {
  /**
   * Resolves sample size confidence based on configurable thresholds
   */
  static getConfidenceLevel(sampleSize: number, thresholds: PsychometricThresholds = DEFAULT_THRESHOLDS): ConfidenceLevel {
    if (sampleSize <= thresholds.insufficientMax) return 'INSUFFICIENT';
    if (sampleSize <= thresholds.lowMax) return 'LOW';
    if (sampleSize <= thresholds.mediumMax) return 'MEDIUM';
    return 'HIGH';
  }

  static evaluateSampleSizeTier(sampleSize: number, thresholds: PsychometricThresholds = DEFAULT_THRESHOLDS): ConfidenceLevel {
    return this.getConfidenceLevel(sampleSize, thresholds);
  }

  static calculateObservedDifficulty(accuracyRate: number, authoredDifficulty: DifficultyBand = 'MEDIUM'): DifficultyBand {
    if (accuracyRate >= 0.70) return 'EASY';
    if (accuracyRate >= 0.35) return 'MEDIUM';
    return 'HARD';
  }

  static calculateDiscrimination(upperCorrect: number, lowerCorrect: number, groupSize: number): number | null {
    if (groupSize <= 0) return null;
    return Math.round(((upperCorrect - lowerCorrect) / groupSize) * 100) / 100;
  }

  static categorizeDistractor(
    optionIndex: number,
    keyIndex: number,
    selectionRate: number,
    sampleSize: number = 100,
    upperSelections: number = 0,
    lowerSelections: number = 0
  ): DistractorCategory {
    if (optionIndex === keyIndex) return 'KEY';
    if (selectionRate >= 0.30) return 'AMBIGUOUS';
    if (sampleSize >= 20 && upperSelections > lowerSelections && upperSelections >= 5) return 'SUSPICIOUS';
    if (sampleSize >= 20 && selectionRate < 0.05) return 'WEAK';
    if (selectionRate >= 0.10) return 'STRONG';
    return 'NORMAL';
  }

  static calculateAmbiguityScore(params: {
    distractorCategories: string[];
    discriminationIndex: number | null;
    totalAttempts: number;
  }): number {
    let score = 0.0;
    if (params.distractorCategories.includes('AMBIGUOUS')) score += 0.4;
    if (params.discriminationIndex !== null && params.discriminationIndex < 0) score += 0.3;
    if (params.distractorCategories.filter(c => c === 'STRONG' || c === 'SUSPICIOUS').length >= 2) score += 0.2;
    return Math.min(1.0, Math.round(score * 100) / 100);
  }

  static async calculateAndPersistProfile(questionId: string) {
    return this.recalculateQuestionMetrics(questionId);
  }

  /**
   * Calculates percentiles (p25, p50, p75, p90) from numerical array
   */
  static calculatePercentiles(values: number[]): { p25: number; p50: number; p75: number; p90: number } {
    if (values.length === 0) return { p25: 0, p50: 0, p75: 0, p90: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const getP = (p: number) => {
      const idx = Math.floor(sorted.length * p);
      return sorted[Math.min(idx, sorted.length - 1)];
    };
    return {
      p25: getP(0.25),
      p50: getP(0.50),
      p75: getP(0.75),
      p90: getP(0.90),
    };
  }

  /**
   * Recalculates empirical psychometric properties for a question using actual student response evidence.
   * Strictly avoids fabricating metrics when sample size is insufficient.
   */
  static async recalculateQuestionMetrics(
    questionId: string,
    thresholds: PsychometricThresholds = DEFAULT_THRESHOLDS
  ): Promise<QuestionMetricsResult> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!question) throw new Error(`Question ${questionId} not found`);

    // Fetch actual student attempts
    const attempts = await prisma.attemptEvent.findMany({
      where: { questionId },
      select: {
        userId: true,
        selectedOption: true,
        isCorrect: true,
        timeSpentSeconds: true,
      },
    });

    const attemptCount = attempts.length;
    const uniqueStudents = new Set(attempts.map((a) => a.userId));
    const uniqueStudentCount = uniqueStudents.size;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const times: number[] = [];
    const optionCounts: Record<string, number> = {};
    const optionCorrectCounts: Record<string, number> = {};
    const optionIncorrectCounts: Record<string, number> = {};

    question.options.forEach((opt) => {
      optionCounts[opt.label] = 0;
      optionCorrectCounts[opt.label] = 0;
      optionIncorrectCounts[opt.label] = 0;
    });

    attempts.forEach((att) => {
      if (att.timeSpentSeconds > 0) times.push(att.timeSpentSeconds);

      if (!att.selectedOption) {
        skippedCount++;
      } else {
        const opt = att.selectedOption;
        optionCounts[opt] = (optionCounts[opt] || 0) + 1;
        if (att.isCorrect) {
          correctCount++;
          optionCorrectCounts[opt] = (optionCorrectCounts[opt] || 0) + 1;
        } else {
          incorrectCount++;
          optionIncorrectCounts[opt] = (optionIncorrectCounts[opt] || 0) + 1;
        }
      }
    });

    const answeredCount = correctCount + incorrectCount;
    const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 1000) / 10 : 0.0;
    const skipRate = attemptCount > 0 ? Math.round((skippedCount / attemptCount) * 1000) / 10 : 0.0;

    const difficultyConfidence = this.getConfidenceLevel(attemptCount, thresholds);

    // Multi-dimensional difficulty determination
    const authoredDifficulty = (question.difficulty as DifficultyBand) || 'MEDIUM';
    let observedDifficulty: DifficultyBand = authoredDifficulty;

    if (difficultyConfidence !== 'INSUFFICIENT') {
      if (accuracyRate >= 70.0) {
        observedDifficulty = 'EASY';
      } else if (accuracyRate < 40.0) {
        observedDifficulty = 'HARD';
      } else {
        observedDifficulty = 'MEDIUM';
      }
    }

    const timePercentiles = this.calculatePercentiles(times);
    const averageResponseTime = times.length > 0 ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10 : 0.0;
    const medianResponseTime = timePercentiles.p50;

    // Discrimination Analysis: Upper Group vs Lower Group
    let discriminationIndex = 0.0;
    let discriminationConfidence: ConfidenceLevel = 'INSUFFICIENT';

    if (uniqueStudentCount >= 6 && attemptCount >= 10) {
      // Fetch total scores / accuracy of these students across the platform to determine Upper vs Lower group
      const studentPerformances = await prisma.user.findMany({
        where: { id: { in: Array.from(uniqueStudents) } },
        select: {
          id: true,
          profile: { select: { accuracyRate: true } },
        },
      });

      const sortedStudents = studentPerformances.sort(
        (a, b) => (b.profile?.accuracyRate ?? 50) - (a.profile?.accuracyRate ?? 50)
      );

      const groupSize = Math.max(1, Math.floor(sortedStudents.length * 0.33));
      const upperIds = new Set(sortedStudents.slice(0, groupSize).map((s) => s.id));
      const lowerIds = new Set(sortedStudents.slice(-groupSize).map((s) => s.id));

      const upperAttempts = attempts.filter((a) => upperIds.has(a.userId));
      const lowerAttempts = attempts.filter((a) => lowerIds.has(a.userId));

      const upperAccuracy = upperAttempts.length > 0
        ? upperAttempts.filter((a) => a.isCorrect).length / upperAttempts.length
        : 0.0;

      const lowerAccuracy = lowerAttempts.length > 0
        ? lowerAttempts.filter((a) => a.isCorrect).length / lowerAttempts.length
        : 0.0;

      discriminationIndex = Math.round((upperAccuracy - lowerAccuracy) * 100) / 100;
      discriminationConfidence = this.getConfidenceLevel(attemptCount, {
        insufficientMax: 19,
        lowMax: 49,
        mediumMax: 99,
        highMin: 100,
      });
    }

    // Distractor Effectiveness Analysis
    const distractorEffectiveness: Record<string, DistractorCategory> = {};
    let highOptionCount = 0;

    for (const opt of question.options) {
      const count = optionCounts[opt.label] || 0;
      const rate = attemptCount > 0 ? count / attemptCount : 0.0;
      const isCorrectKey = opt.label === question.correctOption;

      if (isCorrectKey) {
        distractorEffectiveness[opt.label] = 'KEY';
      } else {
        const incorrectFraction = incorrectCount > 0 ? (optionIncorrectCounts[opt.label] || 0) / incorrectCount : 0.0;

        if (rate >= 0.30) {
          distractorEffectiveness[opt.label] = 'AMBIGUOUS';
          highOptionCount++;
        } else if (incorrectFraction >= 0.25) {
          distractorEffectiveness[opt.label] = 'STRONG';
        } else if (rate <= 0.05 && attemptCount >= 20) {
          distractorEffectiveness[opt.label] = 'WEAK';
        } else {
          distractorEffectiveness[opt.label] = 'NORMAL';
        }
      }

      // Upsert QuestionOptionPerformance record
      await prisma.questionOptionPerformance.upsert({
        where: {
          questionId_optionLabel: {
            questionId,
            optionLabel: opt.label,
          },
        },
        update: {
          selectionCount: count,
          selectionRate: Math.round(rate * 1000) / 10,
          selectedByCorrectResponders: optionCorrectCounts[opt.label] || 0,
          selectedByIncorrectResponders: optionIncorrectCounts[opt.label] || 0,
          distractorCategory: distractorEffectiveness[opt.label],
          calculationVersion: CALCULATION_VERSIONS.distractor,
        },
        create: {
          questionId,
          optionLabel: opt.label,
          selectionCount: count,
          selectionRate: Math.round(rate * 1000) / 10,
          selectedByCorrectResponders: optionCorrectCounts[opt.label] || 0,
          selectedByIncorrectResponders: optionIncorrectCounts[opt.label] || 0,
          distractorCategory: distractorEffectiveness[opt.label],
          calculationVersion: CALCULATION_VERSIONS.distractor,
        },
      });
    }

    // Ambiguity Score (0.0 to 1.0)
    let ambiguityScore = 0.0;
    if (highOptionCount >= 2) ambiguityScore += 0.5;
    if (discriminationIndex < 0 && discriminationConfidence !== 'INSUFFICIENT') ambiguityScore += 0.4;
    ambiguityScore = Math.min(1.0, ambiguityScore);

    // Overall Assessment Quality Score (0.0 to 1.0)
    let qualityScore = 1.0;
    if (discriminationConfidence !== 'INSUFFICIENT' && discriminationIndex < 0.15) qualityScore -= 0.3;
    if (ambiguityScore > 0.4) qualityScore -= 0.3;
    qualityScore = Math.max(0.1, Math.round(qualityScore * 100) / 100);

    const calculationVersion = `${CALCULATION_VERSIONS.difficulty}|${CALCULATION_VERSIONS.discrimination}|${CALCULATION_VERSIONS.quality}`;

    // Upsert QuestionAssessmentProfile
    await prisma.questionAssessmentProfile.upsert({
      where: { questionId },
      update: {
        attemptCount,
        uniqueStudentCount,
        correctCount,
        incorrectCount,
        skippedCount,
        accuracyRate,
        skipRate,
        authoredDifficulty,
        estimatedDifficulty: authoredDifficulty,
        observedDifficulty,
        difficultyConfidence,
        discriminationIndex,
        discriminationConfidence,
        averageResponseTime,
        medianResponseTime,
        timeP25: timePercentiles.p25,
        timeP50: timePercentiles.p50,
        timeP75: timePercentiles.p75,
        timeP90: timePercentiles.p90,
        optionDistribution: JSON.stringify(optionCounts),
        distractorEffectiveness: JSON.stringify(distractorEffectiveness),
        ambiguityScore,
        qualityScore,
        lastCalculatedAt: new Date(),
        calculationVersion,
      },
      create: {
        questionId,
        attemptCount,
        uniqueStudentCount,
        correctCount,
        incorrectCount,
        skippedCount,
        accuracyRate,
        skipRate,
        authoredDifficulty,
        estimatedDifficulty: authoredDifficulty,
        observedDifficulty,
        difficultyConfidence,
        discriminationIndex,
        discriminationConfidence,
        averageResponseTime,
        medianResponseTime,
        timeP25: timePercentiles.p25,
        timeP50: timePercentiles.p50,
        timeP75: timePercentiles.p75,
        timeP90: timePercentiles.p90,
        optionDistribution: JSON.stringify(optionCounts),
        distractorEffectiveness: JSON.stringify(distractorEffectiveness),
        ambiguityScore,
        qualityScore,
        lastCalculatedAt: new Date(),
        calculationVersion,
      },
    });

    return {
      questionId,
      attemptCount,
      uniqueStudentCount,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracyRate,
      skipRate,
      authoredDifficulty,
      estimatedDifficulty: authoredDifficulty,
      observedDifficulty,
      difficultyConfidence,
      discriminationIndex,
      discriminationConfidence,
      averageResponseTime,
      medianResponseTime,
      timePercentiles,
      optionDistribution: optionCounts,
      distractorEffectiveness,
      ambiguityScore,
      qualityScore,
      calculationVersion,
    };
  }
}
