/**
 * Phase 15: Concept Stability & Longitudinal Retention Service
 * Assesses whether concept understanding remains stable across separate days,
 * distinct sessions, and delayed re-testing.
 *
 * Core Invariant: A concept is not permanently mastered from a single correct answer.
 * Uses descriptive terminology (e.g. "Delayed performance declined by 9 percentage points")
 * and explicitly avoids unsupported biological memory claims.
 */

import prisma from '@/lib/prisma';

export interface ConceptStabilityInput {
  studentId: string;
  conceptId: string;
}

export interface ConceptStabilityResult {
  conceptId: string;
  state: 'UNSTABLE' | 'DEVELOPING' | 'STABLE' | 'STRONG' | 'INSUFFICIENT_DATA';
  correctAcrossSessions: number;
  correctAcrossDays: number;
  correctAfterRevision: number;
  correctAfterDelay: number;
  incorrectAfterMastery: number;
  lastAttemptAccuracy: number;
  delayedDropPercentage: number;
  sampleSize: number;
  evidenceText: string;
  calculationVersion: string;
}

export interface RetentionAnalysisResult {
  conceptId: string;
  initialAccuracy: number;
  delayedAccuracy: number;
  deltaPercentagePoints: number;
  delayDays: number;
  sampleSize: number;
  observedDescription: string;
  calculationVersion: string;
}

export class ConceptStabilityAndRetentionService {
  public static readonly VERSION = 'stability-v1';

  /**
   * Evaluates stability of a student's grasp of a specific concept
   */
  public static async evaluateStability(input: ConceptStabilityInput): Promise<ConceptStabilityResult> {
    const responses = await prisma.attemptEvent.findMany({
      where: {
        userId: input.studentId,
        question: {
          primaryConceptId: input.conceptId,
        },
      },
      select: {
        isCorrect: true,
        answeredAt: true,
        sessionId: true,
      },
      orderBy: { answeredAt: 'asc' },
    });

    const sampleSize = responses.length;

    if (sampleSize < 3) {
      const result: ConceptStabilityResult = {
        conceptId: input.conceptId,
        state: 'INSUFFICIENT_DATA',
        correctAcrossSessions: 0,
        correctAcrossDays: 0,
        correctAfterRevision: 0,
        correctAfterDelay: 0,
        incorrectAfterMastery: 0,
        lastAttemptAccuracy: sampleSize > 0 && responses[sampleSize - 1].isCorrect ? 100 : 0,
        delayedDropPercentage: 0,
        sampleSize,
        evidenceText: `Insufficient observations (${sampleSize} attempts recorded, minimum required: 3).`,
        calculationVersion: this.VERSION,
      };

      await this.persistStabilityRecord(input.studentId, input.conceptId, result);
      return result;
    }

    // 1. Distinct sessions with correct answers
    const correctSessions = new Set(
      responses.filter((r) => r.isCorrect && r.sessionId).map((r) => r.sessionId)
    );
    const correctAcrossSessions = correctSessions.size;

    // 2. Distinct calendar days with correct answers
    const correctDays = new Set(
      responses.filter((r) => r.isCorrect).map((r) => r.answeredAt.toISOString().slice(0, 10))
    );
    const correctAcrossDays = correctDays.size;

    // 3. Delayed reattempt performance
    let correctAfterDelay = 0;
    let initialCorrect = 0;
    let initialCount = 0;
    let delayedCorrect = 0;
    let delayedCount = 0;

    const firstAttemptDate = responses[0].answeredAt.getTime();
    for (const r of responses) {
      const daysSinceFirst = (r.answeredAt.getTime() - firstAttemptDate) / (1000 * 60 * 60 * 24);
      if (daysSinceFirst >= 3) {
        delayedCount++;
        if (r.isCorrect) {
          delayedCorrect++;
          correctAfterDelay++;
        }
      } else {
        initialCount++;
        if (r.isCorrect) {
          initialCorrect++;
        }
      }
    }

    const initialAcc = initialCount > 0 ? (initialCorrect / initialCount) * 100 : 0;
    const delayedAcc = delayedCount > 0 ? (delayedCorrect / delayedCount) * 100 : initialAcc;
    const delayedDrop = Math.max(0, Math.round((initialAcc - delayedAcc) * 10) / 10);

    // 4. Incorrect after mastery: check if student failed after previously reaching 3 consecutive correct
    let consecutiveCorrect = 0;
    let incorrectAfterMastery = 0;
    let reachedTemporaryMastery = false;

    for (const r of responses) {
      if (r.isCorrect) {
        consecutiveCorrect++;
        if (consecutiveCorrect >= 3) {
          reachedTemporaryMastery = true;
        }
      } else {
        if (reachedTemporaryMastery) {
          incorrectAfterMastery++;
        }
        consecutiveCorrect = 0;
      }
    }

    // 5. Correct after revision
    const revisionCount = await prisma.revisionSchedule.count({
      where: {
        userId: input.studentId,
        conceptId: input.conceptId,
      },
    });
    const correctAfterRevision = Math.min(revisionCount, correctAcrossSessions);

    // Determine state
    let state: 'UNSTABLE' | 'DEVELOPING' | 'STABLE' | 'STRONG' = 'DEVELOPING';
    if (incorrectAfterMastery >= 2 || delayedDrop >= 25.0) {
      state = 'UNSTABLE';
    } else if (correctAcrossSessions >= 3 && correctAcrossDays >= 2 && correctAfterDelay >= 2) {
      state = 'STRONG';
    } else if (correctAcrossSessions >= 2 && correctAcrossDays >= 2) {
      state = 'STABLE';
    } else {
      state = 'DEVELOPING';
    }

    const recent5 = responses.slice(-5);
    const lastAttemptAccuracy = Math.round(
      (recent5.filter((r) => r.isCorrect).length / recent5.length) * 100
    );

    let evidenceText = '';
    if (state === 'UNSTABLE') {
      evidenceText = `Concept exhibits instability: ${incorrectAfterMastery} incorrect responses observed after prior success; delayed performance dropped by ${delayedDrop} percentage points.`;
    } else if (state === 'STRONG') {
      evidenceText = `Concept exhibits strong stability across ${correctAcrossSessions} distinct sessions and ${correctAcrossDays} days with sustained retention.`;
    } else if (state === 'STABLE') {
      evidenceText = `Concept exhibits stable recall across ${correctAcrossSessions} sessions and ${correctAcrossDays} separate days.`;
    } else {
      evidenceText = `Concept is developing: ${correctAcrossSessions} verified successful sessions recorded so far.`;
    }

    const result: ConceptStabilityResult = {
      conceptId: input.conceptId,
      state,
      correctAcrossSessions,
      correctAcrossDays,
      correctAfterRevision,
      correctAfterDelay,
      incorrectAfterMastery,
      lastAttemptAccuracy,
      delayedDropPercentage: delayedDrop,
      sampleSize,
      evidenceText,
      calculationVersion: this.VERSION,
    };

    await this.persistStabilityRecord(input.studentId, input.conceptId, result);
    return result;
  }

  /**
   * Measures empirical performance drop over a defined retention delay window
   */
  public static async analyzeRetention(studentId: string, conceptId: string): Promise<RetentionAnalysisResult> {
    const responses = await prisma.attemptEvent.findMany({
      where: {
        userId: studentId,
        question: { primaryConceptId: conceptId },
      },
      select: { isCorrect: true, answeredAt: true },
      orderBy: { answeredAt: 'asc' },
    });

    if (responses.length < 2) {
      return {
        conceptId,
        initialAccuracy: responses.length === 1 && responses[0].isCorrect ? 100 : 0,
        delayedAccuracy: responses.length === 1 && responses[0].isCorrect ? 100 : 0,
        deltaPercentagePoints: 0,
        delayDays: 0,
        sampleSize: responses.length,
        observedDescription: `Insufficient observations to evaluate delayed retention (${responses.length} attempts).`,
        calculationVersion: this.VERSION,
      };
    }

    const firstTime = responses[0].answeredAt.getTime();
    const lastTime = responses[responses.length - 1].answeredAt.getTime();
    const delayDays = Math.round((lastTime - firstTime) / (1000 * 60 * 60 * 24));

    const initialWindow = responses.slice(0, Math.ceil(responses.length / 2));
    const delayedWindow = responses.slice(Math.ceil(responses.length / 2));

    const initialAcc = Math.round((initialWindow.filter((r) => r.isCorrect).length / initialWindow.length) * 1000) / 10;
    const delayedAcc = Math.round((delayedWindow.filter((r) => r.isCorrect).length / delayedWindow.length) * 1000) / 10;
    const delta = Math.round((delayedAcc - initialAcc) * 10) / 10;

    let observedDescription = '';
    if (delta < 0) {
      observedDescription = `Delayed performance declined by ${Math.abs(delta)} percentage points (from ${initialAcc}% to ${delayedAcc}%) over an observed ${delayDays}-day window.`;
    } else if (delta > 0) {
      observedDescription = `Delayed performance improved by ${delta} percentage points (from ${initialAcc}% to ${delayedAcc}%) over an observed ${delayDays}-day window.`;
    } else {
      observedDescription = `Delayed performance remained identical at ${initialAcc}% over an observed ${delayDays}-day window.`;
    }

    return {
      conceptId,
      initialAccuracy: initialAcc,
      delayedAccuracy: delayedAcc,
      deltaPercentagePoints: delta,
      delayDays,
      sampleSize: responses.length,
      observedDescription,
      calculationVersion: this.VERSION,
    };
  }

  private static async persistStabilityRecord(studentId: string, conceptId: string, result: ConceptStabilityResult) {
    await prisma.conceptStabilityProfile.upsert({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
      update: {
        state: result.state,
        correctAcrossSessions: result.correctAcrossSessions,
        correctAcrossDays: result.correctAcrossDays,
        correctAfterRevision: result.correctAfterRevision,
        correctAfterDelay: result.correctAfterDelay,
        incorrectAfterMastery: result.incorrectAfterMastery,
        lastAttemptAccuracy: result.lastAttemptAccuracy,
        delayedDropPercentage: result.delayedDropPercentage,
        sampleSize: result.sampleSize,
        evidenceJson: JSON.stringify({ evidenceText: result.evidenceText }),
        calculationVersion: result.calculationVersion,
      },
      create: {
        studentId,
        conceptId,
        state: result.state,
        correctAcrossSessions: result.correctAcrossSessions,
        correctAcrossDays: result.correctAcrossDays,
        correctAfterRevision: result.correctAfterRevision,
        correctAfterDelay: result.correctAfterDelay,
        incorrectAfterMastery: result.incorrectAfterMastery,
        lastAttemptAccuracy: result.lastAttemptAccuracy,
        delayedDropPercentage: result.delayedDropPercentage,
        sampleSize: result.sampleSize,
        evidenceJson: JSON.stringify({ evidenceText: result.evidenceText }),
        calculationVersion: result.calculationVersion,
      },
    });
  }
}
