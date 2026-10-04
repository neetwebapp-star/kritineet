import prisma from '../prisma';

export type ResponseSpeedPattern = 'TOO_FAST' | 'NORMAL' | 'SLOW' | 'EXTREMELY_SLOW';

export type ErrorClassification2 =
  | 'CONCEPTUAL'
  | 'FACTUAL'
  | 'CALCULATION'
  | 'UNIT_ERROR'
  | 'SIGN_ERROR'
  | 'FORMULA_RECALL'
  | 'READING_ERROR'
  | 'MISINTERPRETATION'
  | 'DISTRACTOR_TRAP'
  | 'CARELESS'
  | 'TIME_PRESSURE'
  | 'GUESS'
  | 'KNOWLEDGE_GAP';

export interface CarelessErrorDetectionResult {
  isPossibleCarelessError: boolean;
  confidence: number;
  evidence: string[];
}

export class StudentBaselineEngine {
  /**
   * Recalculates personal performance baseline for a student
   */
  static async recalculateStudentBaseline(userId: string) {
    const attempts = await prisma.attemptEvent.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        timeSpentSeconds: true,
        sourceType: true,
        chapterId: true,
        question: {
          select: {
            difficulty: true,
            primaryConceptId: true,
          },
        },
      },
    });

    const sampleSize = attempts.length;
    if (sampleSize === 0) {
      return prisma.studentAssessmentBaseline.upsert({
        where: { userId },
        update: { sampleSize: 0, accuracy: 0.0, medianResponseTime: 0.0 },
        create: { userId, sampleSize: 0, accuracy: 0.0, medianResponseTime: 0.0 },
      });
    }

    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / sampleSize) * 1000) / 10;

    const times = attempts.map((a) => a.timeSpentSeconds).filter((t) => t > 0).sort((a, b) => a - b);
    const medianResponseTime = times.length > 0 ? times[Math.floor(times.length / 2)] : 45.0;

    // Difficulty band accuracy
    const diffMap: Record<string, { total: number; correct: number }> = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
    };

    attempts.forEach((a) => {
      const d = a.question?.difficulty || 'MEDIUM';
      if (diffMap[d]) {
        diffMap[d].total++;
        if (a.isCorrect) diffMap[d].correct++;
      }
    });

    const difficultyBandAccuracy: Record<string, number> = {};
    for (const [k, v] of Object.entries(diffMap)) {
      difficultyBandAccuracy[k] = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
    }

    const baseline = await prisma.studentAssessmentBaseline.upsert({
      where: { userId },
      update: {
        accuracy,
        medianResponseTime,
        difficultyBandAccuracyJson: JSON.stringify(difficultyBandAccuracy),
        sampleSize,
        calculationVersion: 'baseline-v2.0',
      },
      create: {
        userId,
        accuracy,
        medianResponseTime,
        difficultyBandAccuracyJson: JSON.stringify(difficultyBandAccuracy),
        sampleSize,
        calculationVersion: 'baseline-v2.0',
      },
    });

    return baseline;
  }

  /**
   * Evaluates response speed pattern based on response duration
   */
  static classifyResponseSpeed(timeSpentSeconds: number, medianCohortSeconds: number = 60.0): ResponseSpeedPattern {
    if (timeSpentSeconds < 8.0) return 'TOO_FAST';
    if (timeSpentSeconds > medianCohortSeconds * 2.5) return 'EXTREMELY_SLOW';
    if (timeSpentSeconds > medianCohortSeconds * 1.5) return 'SLOW';
    return 'NORMAL';
  }

  /**
   * Detects careless errors using evidence-based heuristic patterns
   */
  static async detectCarelessError(params: {
    userId: string;
    questionId: string;
    conceptId?: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }): Promise<CarelessErrorDetectionResult> {
    if (params.isCorrect) {
      return { isPossibleCarelessError: false, confidence: 0.0, evidence: [] };
    }

    const evidence: string[] = [];
    let score = 0;

    // 1. Rapid response time (< 10 seconds)
    if (params.timeSpentSeconds < 10) {
      score += 40;
      evidence.push(`Answered very rapidly in ${params.timeSpentSeconds}s (below 10s cognitive threshold)`);
    }

    // 2. High prior concept mastery
    if (params.conceptId) {
      const mastery = await prisma.studentConceptMastery.findUnique({
        where: {
          userId_conceptId: {
            userId: params.userId,
            conceptId: params.conceptId,
          },
        },
      });

      if (mastery) {
        if (mastery.status === 'MASTERED' || mastery.masteryScore >= 75) {
          score += 40;
          evidence.push(`Student had previously mastered this concept (mastery score: ${mastery.masteryScore}%)`);
        }
        if (mastery.consecutiveCorrect >= 3) {
          score += 20;
          evidence.push(`Student had ${mastery.consecutiveCorrect} consecutive correct answers on this concept`);
        }
      }
    }

    const isPossibleCarelessError = score >= 50;
    const confidence = Math.min(0.95, score / 100);

    return {
      isPossibleCarelessError,
      confidence,
      evidence,
    };
  }

  static async calculateAndSaveBaseline(userId: string) {
    return this.recalculateStudentBaseline(userId);
  }

  static evaluateResponseSpeed(timeSpent: number, median: number): ResponseSpeedPattern {
    if (timeSpent < median * 0.35) return 'TOO_FAST';
    if (timeSpent > median * 3.5) return 'EXTREMELY_SLOW';
    if (timeSpent > median * 1.8) return 'SLOW';
    return 'NORMAL';
  }

  static isCarelessErrorRisk(params: {
    isCorrect: boolean;
    timeSpent: number;
    medianResponseTime: number;
    questionDifficulty: string;
    studentEasyAccuracy: number;
  }): boolean {
    if (params.isCorrect) return false;
    const isVeryFast = params.timeSpent < params.medianResponseTime * 0.35;
    const isEasy = params.questionDifficulty === 'EASY';
    const hasHighAccuracy = params.studentEasyAccuracy >= 80;
    return isVeryFast && isEasy && hasHighAccuracy;
  }
}
