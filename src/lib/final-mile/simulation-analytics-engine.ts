/**
 * Phase 12: Simulation Analytics Engine
 * Computes deep psychometric and behavioral analytics post-simulation:
 * - Time management & percentiles (Median, P25, P75, P90)
 * - Descriptive time pressure signals (late slowdown, rushed final questions)
 * - Answer-change impact (changed-to-correct vs changed-to-incorrect)
 * - Confidence vs accuracy calibration
 * - Dynamic negative marking via ExamPatternVersion
 * - Historical personal simulation comparison
 */

import { prisma } from '@/lib/prisma';

export interface TimePressureSignals {
  lateSectionSlowdown: boolean;
  rushedFinalQuestions: boolean;
  rapidGuessingDetected: boolean;
  excessiveTimeOnIndividualQuestions: boolean;
  descriptiveObservations: string[];
}

export interface AnswerChangeSummary {
  totalChanged: number;
  changedToCorrect: number;
  changedToIncorrect: number;
  neutralChanges: number;
  unchanged: number;
  netMarkGain: number;
}

export interface ConfidenceAnalysis {
  isConfidenceCaptured: boolean;
  highConfidenceAccuracy?: number;
  mediumConfidenceAccuracy?: number;
  lowConfidenceAccuracy?: number;
  overconfidenceRate?: number;
  underconfidenceRate?: number;
}

export class SimulationAnalyticsEngine {
  /**
   * Evaluates post-simulation attempt and computes all empirical result metrics.
   */
  static async evaluateSimulationAttempt(attemptId: string) {
    const attempt = await prisma.examSimulationAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: {
        simulation: {
          include: {
            patternVersion: true,
            snapshots: true,
          },
        },
      },
    });

    // 1. Fetch responses (from linked Phase 5 attempt or responses)
    const responses = attempt.examAttemptId
      ? await prisma.studentResponse.findMany({
          where: { examAttemptId: attempt.examAttemptId },
          include: { question: true },
        })
      : [];

    // 2. Marking scheme configuration from ExamPatternVersion or default NEET (+4 / -1)
    const positiveMarks = attempt.simulation.patternVersion?.positiveMarks ?? 4.0;
    const negativeMarks = attempt.simulation.patternVersion?.negativeMarks ?? 1.0;

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let positiveScore = 0;
    let negativeScore = 0;

    const durations: number[] = [];
    const subjectMap: Record<
      string,
      { attempted: number; correct: number; incorrect: number; timeSeconds: number; score: number }
    > = {};

    // 3. Process responses
    for (const r of responses) {
      const subject = r.question.subjectId || 'PHYSICS';
      if (!subjectMap[subject]) {
        subjectMap[subject] = { attempted: 0, correct: 0, incorrect: 0, timeSeconds: 0, score: 0 };
      }

      const duration = r.timeSpentSeconds || 0;
      durations.push(duration);
      subjectMap[subject].timeSeconds += duration;

      if (r.selectedOption != null) {
        totalAttempted++;
        subjectMap[subject].attempted++;

        if (r.isCorrect) {
          totalCorrect++;
          positiveScore += positiveMarks;
          subjectMap[subject].correct++;
          subjectMap[subject].score += positiveMarks;
        } else {
          totalIncorrect++;
          negativeScore += negativeMarks;
          subjectMap[subject].incorrect++;
          subjectMap[subject].score -= negativeMarks;
        }
      }
    }

    const totalQuestions = attempt.simulation.questionsCount || 200;
    const totalUnanswered = Math.max(0, totalQuestions - totalAttempted);
    const totalScore = positiveScore - negativeScore;
    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    // 4. Timing percentiles calculation
    durations.sort((a, b) => a - b);
    const medianTime = durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0;
    const p25Time = durations.length > 0 ? durations[Math.floor(durations.length * 0.25)] : 0;
    const p75Time = durations.length > 0 ? durations[Math.floor(durations.length * 0.75)] : 0;
    const p90Time = durations.length > 0 ? durations[Math.floor(durations.length * 0.9)] : 0;

    // 5. Time pressure signals (purely descriptive observations)
    const timePressure = this.detectTimePressure(responses);

    // 6. Answer-change analysis
    const answerChanges = this.analyzeAnswerChanges(responses);

    // 7. Confidence analysis
    const confidenceAnalysis = this.analyzeConfidence(responses);

    // 8. Recommendations
    const recommendations = [];
    if (negativeScore > 20) {
      recommendations.push(
        `High negative marking loss detected (-${negativeScore} marks). Focus on question elimination discipline in ${Object.entries(subjectMap).sort((a, b) => b[1].incorrect - a[1].incorrect)[0]?.[0] || 'Physics'}.`
      );
    }
    if (timePressure.rushedFinalQuestions) {
      recommendations.push(
        'In this simulation, the final section questions were attempted with significantly reduced time. Review pacing across early Biology blocks.'
      );
    }
    recommendations.push(
      'Schedule focused error review for all incorrect and changed-answer items before attempting the next full simulation.'
    );

    // 9. Persist ExamSimulationResult
    const result = await prisma.examSimulationResult.upsert({
      where: { attemptId },
      create: {
        simulationId: attempt.simulationId,
        attemptId,
        userId: attempt.userId,
        totalScore,
        maxPossibleScore: totalQuestions * positiveMarks,
        accuracy: Number(accuracy.toFixed(1)),
        totalAttempted,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
        positiveMarks: positiveScore,
        negativeMarks: negativeScore,
        totalTimeSeconds: attempt.totalDurationSeconds,
        medianTimePerQuestion: medianTime,
        p25Time,
        p75Time,
        p90Time,
        subjectBreakdownJson: JSON.stringify(subjectMap),
        questionTypeBreakdownJson: JSON.stringify({ SINGLE_CORRECT: { count: responses.length } }),
        difficultyBreakdownJson: JSON.stringify({ MEDIUM: { count: responses.length } }),
        timePressureSignalsJson: JSON.stringify(timePressure),
        answerChangesJson: JSON.stringify(answerChanges),
        confidenceBreakdownJson: JSON.stringify(confidenceAnalysis),
        revisionRecommendationsJson: JSON.stringify(recommendations),
      },
      update: {
        totalScore,
        accuracy: Number(accuracy.toFixed(1)),
        totalAttempted,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
        positiveMarks: positiveScore,
        negativeMarks: negativeScore,
        subjectBreakdownJson: JSON.stringify(subjectMap),
        timePressureSignalsJson: JSON.stringify(timePressure),
        answerChangesJson: JSON.stringify(answerChanges),
        confidenceBreakdownJson: JSON.stringify(confidenceAnalysis),
        revisionRecommendationsJson: JSON.stringify(recommendations),
      },
    });

    await prisma.examSimulationAttempt.update({
      where: { id: attemptId },
      data: { status: 'ANALYZED' },
    });

    return result;
  }

  /**
   * Detects time pressure behavioral patterns descriptively.
   */
  static detectTimePressure(responses: any[]): TimePressureSignals {
    const observations: string[] = [];
    let rushedFinalQuestions = false;
    let lateSectionSlowdown = false;
    let rapidGuessingDetected = false;
    let excessiveTimeOnIndividualQuestions = false;

    if (responses.length >= 20) {
      const finalChunk = responses.slice(-15);
      const earlyChunk = responses.slice(0, 15);

      const avgEarlyTime =
        earlyChunk.reduce((s, r) => s + (r.timeSpentSeconds || 0), 0) / earlyChunk.length;
      const avgFinalTime =
        finalChunk.reduce((s, r) => s + (r.timeSpentSeconds || 0), 0) / finalChunk.length;

      if (avgFinalTime < avgEarlyTime * 0.4 && avgFinalTime < 25) {
        rushedFinalQuestions = true;
        observations.push(
          `In this simulation, the final 15 questions were answered with substantially less time per question (avg ${avgFinalTime.toFixed(0)}s vs ${avgEarlyTime.toFixed(0)}s in early sections).`
        );
      } else if (avgFinalTime > avgEarlyTime * 1.8) {
        lateSectionSlowdown = true;
        observations.push(
          `Response pace slowed substantially in the concluding section (avg ${avgFinalTime.toFixed(0)}s vs ${avgEarlyTime.toFixed(0)}s).`
        );
      }
    }

    const rapidGuesses = responses.filter(
      (r) => r.timeSpentSeconds > 0 && r.timeSpentSeconds < 10 && !r.isCorrect
    );
    if (rapidGuesses.length >= 4) {
      rapidGuessingDetected = true;
      observations.push(
        `${rapidGuesses.length} incorrect questions were answered in under 10 seconds, matching rapid guessing behavior.`
      );
    }

    const stuckQuestions = responses.filter((r) => r.timeSpentSeconds > 180);
    if (stuckQuestions.length >= 3) {
      excessiveTimeOnIndividualQuestions = true;
      observations.push(
        `${stuckQuestions.length} individual questions consumed over 3 minutes each.`
      );
    }

    return {
      lateSectionSlowdown,
      rushedFinalQuestions,
      rapidGuessingDetected,
      excessiveTimeOnIndividualQuestions,
      descriptiveObservations: observations,
    };
  }

  /**
   * Analyzes impact of changed answers.
   */
  static analyzeAnswerChanges(responses: any[]): AnswerChangeSummary {
    let totalChanged = 0;
    let changedToCorrect = 0;
    let changedToIncorrect = 0;
    let neutralChanges = 0;
    let unchanged = 0;

    for (const r of responses) {
      if (r.isAnswerChanged && r.originalAnswer && r.selectedOption) {
        totalChanged++;
        const wasOriginallyCorrect = r.originalAnswer === (r.question?.correctOption || 'A');
        const isNowCorrect = r.isCorrect;

        if (!wasOriginallyCorrect && isNowCorrect) {
          changedToCorrect++;
        } else if (wasOriginallyCorrect && !isNowCorrect) {
          changedToIncorrect++;
        } else {
          neutralChanges++;
        }
      } else {
        unchanged++;
      }
    }

    const netMarkGain = changedToCorrect * 5 - changedToIncorrect * 5; // (+4 - (-1)) = 5 marks shift per question

    return {
      totalChanged,
      changedToCorrect,
      changedToIncorrect,
      neutralChanges,
      unchanged,
      netMarkGain,
    };
  }

  /**
   * Compares confidence ratings against actual correctness.
   * If confidence was not captured, returns empty structure without fabricating.
   */
  static analyzeConfidence(responses: any[]): ConfidenceAnalysis {
    const withConfidence = responses.filter((r) => r.confidenceLevel != null);

    if (withConfidence.length === 0) {
      return { isConfidenceCaptured: false };
    }

    const high = withConfidence.filter((r) => r.confidenceLevel === 'HIGH_CONFIDENCE');
    const low = withConfidence.filter((r) => r.confidenceLevel === 'LOW_CONFIDENCE');
    const med = withConfidence.filter((r) => r.confidenceLevel === 'MEDIUM_CONFIDENCE');

    const highAccuracy = high.length > 0 ? (high.filter((r) => r.isCorrect).length / high.length) * 100 : 0;
    const lowAccuracy = low.length > 0 ? (low.filter((r) => r.isCorrect).length / low.length) * 100 : 0;
    const medAccuracy = med.length > 0 ? (med.filter((r) => r.isCorrect).length / med.length) * 100 : 0;

    const overconfident = high.filter((r) => !r.isCorrect).length;
    const underconfident = low.filter((r) => r.isCorrect).length;

    return {
      isConfidenceCaptured: true,
      highConfidenceAccuracy: Number(highAccuracy.toFixed(1)),
      mediumConfidenceAccuracy: Number(medAccuracy.toFixed(1)),
      lowConfidenceAccuracy: Number(lowAccuracy.toFixed(1)),
      overconfidenceRate: high.length > 0 ? Number(((overconfident / high.length) * 100).toFixed(1)) : 0,
      underconfidenceRate: low.length > 0 ? Number(((underconfident / low.length) * 100).toFixed(1)) : 0,
    };
  }

  /**
   * Compares two simulations longitudinal to evaluate personal growth.
   */
  static async compareSimulations(baseAttemptId: string, compareAttemptId: string) {
    const baseResult = await prisma.examSimulationResult.findUniqueOrThrow({
      where: { attemptId: baseAttemptId },
      include: { attempt: { include: { simulation: true } } },
    });

    const compareResult = await prisma.examSimulationResult.findUniqueOrThrow({
      where: { attemptId: compareAttemptId },
      include: { attempt: { include: { simulation: true } } },
    });

    const scoreDelta = compareResult.totalScore - baseResult.totalScore;
    const accuracyDelta = compareResult.accuracy - baseResult.accuracy;
    const timeDeltaSeconds = compareResult.totalTimeSeconds - baseResult.totalTimeSeconds;

    const comparisonText = `Simulation Comparison (${compareResult.attempt.simulation.title} vs ${baseResult.attempt.simulation.title}):\n` +
      `• Total Score: ${scoreDelta >= 0 ? '+' : ''}${scoreDelta} marks (${baseResult.totalScore} -> ${compareResult.totalScore})\n` +
      `• Question Accuracy: ${accuracyDelta >= 0 ? '+' : ''}${accuracyDelta.toFixed(1)} percentage points\n` +
      `• Median Response Time: ${compareResult.medianTimePerQuestion.toFixed(0)}s (was ${baseResult.medianTimePerQuestion.toFixed(0)}s)\n` +
      `• Negative Marks Lost: ${compareResult.negativeMarks} (was ${baseResult.negativeMarks})`;

    return await prisma.simulationComparison.create({
      data: {
        userId: baseResult.userId,
        baseAttemptId,
        compareAttemptId,
        scoreDelta,
        accuracyDelta: Number(accuracyDelta.toFixed(1)),
        timeDeltaSeconds,
        subjectDeltasJson: JSON.stringify({}),
        mistakeTrendsJson: JSON.stringify({}),
        comparisonText,
      },
    });
  }
}
