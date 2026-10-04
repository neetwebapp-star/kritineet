import prisma from '../prisma';

export interface TimeAnalysisResult {
  averageSecondsPerQuestion: number;
  medianSecondsPerQuestion: number;
  fastestQuestion: { questionId: string; timeSeconds: number; questionText: string } | null;
  slowestQuestion: { questionId: string; timeSeconds: number; questionText: string } | null;
  rushedCount: number; // < 20s
  stuckCount: number; // > 180s
  negativeMarkLoss: number; // marks deducted (-1 per wrong)
  guessPenaltyEstimate: number; // marks lost on rushed mistakes
  timeBySubject: Record<string, { averageTime: number; totalTime: number; questionCount: number }>;
  timeByDifficulty: Record<string, { averageTime: number; questionCount: number }>;
  timeByQuestionType: Record<string, { averageTime: number; questionCount: number }>;
  observations: string[];
}

export class TimeManagementAnalyzer {
  static async analyzeAttempt(attemptId: string): Promise<TimeAnalysisResult> {
    return this.analyze(attemptId);
  }

  /**
   * Analyzes student test pacing and generates neutral, data-driven observations
   */
  static async analyze(attemptId: string): Promise<TimeAnalysisResult> {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
        responses: {
          include: {
            question: {
              include: {
                chapter: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    if (!attempt || attempt.responses.length === 0) {
      return {
        averageSecondsPerQuestion: 0,
        medianSecondsPerQuestion: 0,
        fastestQuestion: null,
        slowestQuestion: null,
        rushedCount: 0,
        stuckCount: 0,
        negativeMarkLoss: 0,
        guessPenaltyEstimate: 0,
        timeBySubject: {},
        timeByDifficulty: {},
        timeByQuestionType: {},
        observations: ['Insufficient attempt response data to conduct time analysis.'],
      };
    }

    const times: number[] = [];
    let rushedCount = 0;
    let stuckCount = 0;
    let negativeMarkLoss = 0;
    let guessPenaltyEstimate = 0;
    const subjectMap: Record<string, { totalTime: number; count: number }> = {};
    const diffMap: Record<string, { totalTime: number; count: number }> = {};
    const typeMap: Record<string, { totalTime: number; count: number }> = {};

    let fastest: { questionId: string; timeSeconds: number; questionText: string } | null = null;
    let slowest: { questionId: string; timeSeconds: number; questionText: string } | null = null;

    for (const r of attempt.responses) {
      const t = r.timeSpentSeconds || 45; // fallback to calibrated default
      times.push(t);

      if (!fastest || t < fastest.timeSeconds) {
        fastest = { questionId: r.questionId, timeSeconds: t, questionText: r.question.questionText };
      }
      if (!slowest || t > slowest.timeSeconds) {
        slowest = { questionId: r.questionId, timeSeconds: t, questionText: r.question.questionText };
      }

      if (t < 20) rushedCount++;
      if (t > 180) stuckCount++;

      const isWrong = r.selectedOption && r.selectedOption.toUpperCase() !== r.question.correctOption.toUpperCase();
      if (isWrong) {
        const penalty = attempt.test?.negativeMarks ?? 1.0;
        negativeMarkLoss += penalty;
        if (t < 20) {
          guessPenaltyEstimate += penalty;
        }
      }

      // Subject breakdown
      const subj = r.question.chapter?.subject?.name || 'General';
      if (!subjectMap[subj]) subjectMap[subj] = { totalTime: 0, count: 0 };
      subjectMap[subj].totalTime += t;
      subjectMap[subj].count += 1;

      // Difficulty breakdown
      const diff = r.question.difficulty || 'MEDIUM';
      if (!diffMap[diff]) diffMap[diff] = { totalTime: 0, count: 0 };
      diffMap[diff].totalTime += t;
      diffMap[diff].count += 1;

      // Type breakdown
      const qtype = r.question.questionType || 'SINGLE_CORRECT';
      if (!typeMap[qtype]) typeMap[qtype] = { totalTime: 0, count: 0 };
      typeMap[qtype].totalTime += t;
      typeMap[qtype].count += 1;
    }

    // Averages and median
    times.sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = Number((sum / times.length).toFixed(1));
    const mid = Math.floor(times.length / 2);
    const median = times.length % 2 !== 0 ? times[mid] : Number(((times[mid - 1] + times[mid]) / 2).toFixed(1));

    const timeBySubject: Record<string, any> = {};
    for (const [k, v] of Object.entries(subjectMap)) {
      timeBySubject[k] = {
        averageTime: Number((v.totalTime / v.count).toFixed(1)),
        totalTime: v.totalTime,
        questionCount: v.count,
      };
    }

    const timeByDifficulty: Record<string, any> = {};
    for (const [k, v] of Object.entries(diffMap)) {
      timeByDifficulty[k] = {
        averageTime: Number((v.totalTime / v.count).toFixed(1)),
        questionCount: v.count,
      };
    }

    const timeByQuestionType: Record<string, any> = {};
    for (const [k, v] of Object.entries(typeMap)) {
      timeByQuestionType[k] = {
        averageTime: Number((v.totalTime / v.count).toFixed(1)),
        questionCount: v.count,
      };
    }

    // Objective Pacing Observations
    const observations: string[] = [];

    if (rushedCount > 0) {
      observations.push(`${rushedCount} question(s) were answered in < 20s (rushed attempts).`);
    }

    if (stuckCount > 0) {
      observations.push(`${stuckCount} question(s) took > 180s (stuck / excessive cognitive load).`);
    }

    if (negativeMarkLoss > 0) {
      observations.push(
        `Negative marking reduced score by -${negativeMarkLoss} marks (approx. -${guessPenaltyEstimate} marks from rushed guesses).`
      );
    }

    // Numerical vs Theory comparison
    const numAvg = timeByQuestionType['NUMERICAL']?.averageTime;
    const theoryAvg = timeByQuestionType['SINGLE_CORRECT']?.averageTime;
    if (numAvg && theoryAvg && numAvg > theoryAvg * 1.3) {
      observations.push(
        `Numerical questions averaged ${numAvg}s compared to ${theoryAvg}s for theoretical items.`
      );
    }

    // Difficulty scaling check
    if (timeByDifficulty['HARD'] && timeByDifficulty['EASY']) {
      observations.push(
        `Hard questions required an average of ${timeByDifficulty['HARD'].averageTime}s versus ${timeByDifficulty['EASY'].averageTime}s on Easy items.`
      );
    }

    // Late test accuracy or pacing
    if (attempt.remainingSeconds < 120 && times.length < attempt.test.totalQuestions) {
      observations.push('Test concluded with several questions left unattempted in the final minutes.');
    }

    if (observations.length === 0) {
      observations.push(
        `Consistent overall pacing of ${avg}s per question across ${times.length} evaluated items.`
      );
    }

    return {
      averageSecondsPerQuestion: avg,
      medianSecondsPerQuestion: median,
      fastestQuestion: fastest,
      slowestQuestion: slowest,
      rushedCount,
      stuckCount,
      negativeMarkLoss,
      guessPenaltyEstimate,
      timeBySubject,
      timeByDifficulty,
      timeByQuestionType,
      observations,
    };
  }
}
