/**
 * Phase 15: Learning Trend Engine
 * Analyzes longitudinal changes in student performance across subjects, chapters,
 * question types, difficulties, and retention over time.
 *
 * Core Principles:
 * 1. Minimum sample thresholds: never classify trends from isolated observations.
 * 2. High variability detection: flags VOLATILE performance without assuming cause.
 * 3. Descriptive evidence: states observed facts, time windows, and sample sizes.
 * 4. Zero causal overreach: never claims activity X caused improvement Y without controlled evidence.
 */

import prisma from '@/lib/prisma';

export interface TrendAnalysisParams {
  studentId: string;
  domain: 'OVERALL' | 'SUBJECT' | 'CHAPTER' | 'QUESTION_TYPE' | 'DIFFICULTY' | 'RETENTION';
  entityId?: string; // e.g. 'PHYSICS', chapterId, 'SINGLE_CORRECT'
  windowDays?: number;
}

export interface TrendResult {
  domain?: string;
  entityId?: string | null;
  direction: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE' | 'INSUFFICIENT_DATA';
  currentValue: number;
  previousValue: number | null;
  deltaValue: number;
  sampleSize: number;
  measurementCount: number;
  timeWindowDays: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA';
  evidenceText: string;
  calculationVersion: string;
}

export class LearningTrendEngine {
  public static readonly VERSION = 'trend-v2';
  public static readonly MIN_SAMPLE_SIZE = 5;

  /**
   * Computes longitudinal trend for a specific domain and entity
   */
  public static async evaluateTrend(params: TrendAnalysisParams): Promise<TrendResult> {
    const windowDays = params.windowDays || 30;
    const sinceDate = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
    const midPointDate = new Date(Date.now() - (windowDays / 2) * 24 * 60 * 60 * 1000);

    // Fetch student responses in time window
    const attempts = await prisma.attemptEvent.findMany({
      where: {
        userId: params.studentId,
        answeredAt: { gte: sinceDate },
        question: params.domain === 'SUBJECT' && params.entityId
          ? { subject: { code: params.entityId } }
          : params.domain === 'CHAPTER' && params.entityId
          ? { chapterId: params.entityId }
          : params.domain === 'QUESTION_TYPE' && params.entityId
          ? { questionType: params.entityId }
          : params.domain === 'DIFFICULTY' && params.entityId
          ? { difficulty: params.entityId }
          : undefined,
      },
      select: {
        isCorrect: true,
        answeredAt: true,
      },
      orderBy: { answeredAt: 'asc' },
    });

    const sampleSize = attempts.length;

    // Minimum sample size requirement
    if (sampleSize < this.MIN_SAMPLE_SIZE) {
      const accuracy = sampleSize > 0
        ? attempts.filter((a) => a.isCorrect).length / sampleSize
        : 0;

      const result: TrendResult = {
        domain: params.domain,
        entityId: params.entityId || null,
        direction: 'INSUFFICIENT_DATA',
        currentValue: Math.round(accuracy * 1000) / 10,
        previousValue: null,
        deltaValue: 0,
        sampleSize,
        measurementCount: sampleSize,
        timeWindowDays: windowDays,
        confidence: 'INSUFFICIENT_DATA',
        evidenceText: `Insufficient observations (${sampleSize} answered, minimum required: ${this.MIN_SAMPLE_SIZE}).`,
        calculationVersion: this.VERSION,
      };

      await this.persistTrendRecord(params, result);
      return result;
    }

    // Split window into earlier period and recent period
    const earlierAttempts = attempts.filter((a) => a.answeredAt < midPointDate);
    const recentAttempts = attempts.filter((a) => a.answeredAt >= midPointDate);

    const earlierAccuracy = earlierAttempts.length > 0
      ? earlierAttempts.filter((a) => a.isCorrect).length / earlierAttempts.length
      : attempts.slice(0, Math.floor(sampleSize / 2)).filter((a) => a.isCorrect).length / Math.floor(sampleSize / 2);

    const recentAccuracy = recentAttempts.length > 0
      ? recentAttempts.filter((a) => a.isCorrect).length / recentAttempts.length
      : attempts.slice(Math.floor(sampleSize / 2)).filter((a) => a.isCorrect).length / (sampleSize - Math.floor(sampleSize / 2));

    const currentValPercent = Math.round(recentAccuracy * 1000) / 10;
    const prevValPercent = Math.round(earlierAccuracy * 1000) / 10;
    const deltaPercent = Math.round((currentValPercent - prevValPercent) * 10) / 10;

    // Volatility check: calculate sliding window chunks to detect large oscillation
    const chunkSize = Math.max(3, Math.floor(sampleSize / 4));
    const accuracies: number[] = [];
    for (let i = 0; i <= sampleSize - chunkSize; i += chunkSize) {
      const chunk = attempts.slice(i, i + chunkSize);
      const acc = chunk.filter((a) => a.isCorrect).length / chunk.length;
      accuracies.push(acc);
    }

    let isVolatile = false;
    if (accuracies.length >= 3) {
      const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      const variance = accuracies.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / accuracies.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev >= 0.22) {
        isVolatile = true;
      }
    }

    let direction: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE' = 'STABLE';
    if (isVolatile) {
      direction = 'VOLATILE';
    } else if (deltaPercent >= 5.0) {
      direction = 'IMPROVING';
    } else if (deltaPercent <= -5.0) {
      direction = 'DECLINING';
    } else {
      direction = 'STABLE';
    }

    // Confidence determination
    let confidence: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (sampleSize >= 30 && windowDays >= 14) {
      confidence = 'HIGH';
    } else if (sampleSize >= 15 && windowDays >= 7) {
      confidence = 'MODERATE';
    }

    const domainLabel = params.entityId ? `${params.entityId}` : params.domain;
    let evidenceText = '';
    if (direction === 'VOLATILE') {
      evidenceText = `${domainLabel} accuracy showed high variability (range ${Math.round(Math.min(...accuracies) * 100)}% to ${Math.round(Math.max(...accuracies) * 100)}%) across ${sampleSize} questions over ${windowDays} days.`;
    } else if (direction === 'IMPROVING') {
      evidenceText = `${domainLabel} accuracy increased from ${prevValPercent}% to ${currentValPercent}% (+${deltaPercent} pts) across ${sampleSize} questions over ${windowDays} days.`;
    } else if (direction === 'DECLINING') {
      evidenceText = `${domainLabel} accuracy declined from ${prevValPercent}% to ${currentValPercent}% (${deltaPercent} pts) across ${sampleSize} questions over ${windowDays} days.`;
    } else {
      evidenceText = `${domainLabel} accuracy remained stable at ${currentValPercent}% (shift: ${deltaPercent > 0 ? `+${deltaPercent}` : deltaPercent} pts) across ${sampleSize} questions over ${windowDays} days.`;
    }

    const result: TrendResult = {
      domain: params.domain,
      entityId: params.entityId || null,
      direction,
      currentValue: currentValPercent,
      previousValue: prevValPercent,
      deltaValue: deltaPercent,
      sampleSize,
      measurementCount: sampleSize,
      timeWindowDays: windowDays,
      confidence,
      evidenceText,
      calculationVersion: this.VERSION,
    };

    await this.persistTrendRecord(params, result);
    return result;
  }

  private static async persistTrendRecord(params: TrendAnalysisParams, result: TrendResult) {
    const user = await prisma.user.findUnique({
      where: { id: params.studentId },
      select: { id: true },
    });
    if (!user) {
      return;
    }

    const existing = await prisma.learningTrend.findFirst({
      where: {
        studentId: params.studentId,
        domain: params.domain,
        entityId: params.entityId || null,
      },
    });

    if (existing) {
      await prisma.learningTrend.update({
        where: { id: existing.id },
        data: {
          direction: result.direction,
          currentValue: result.currentValue,
          previousValue: result.previousValue,
          deltaValue: result.deltaValue,
          sampleSize: result.sampleSize,
          measurementCount: result.measurementCount,
          timeWindowDays: result.timeWindowDays,
          confidence: result.confidence,
          evidenceText: result.evidenceText,
          calculationVersion: result.calculationVersion,
        },
      });
    } else {
      await prisma.learningTrend.create({
        data: {
          studentId: params.studentId,
          domain: params.domain,
          entityId: params.entityId || null,
          direction: result.direction,
          currentValue: result.currentValue,
          previousValue: result.previousValue,
          deltaValue: result.deltaValue,
          sampleSize: result.sampleSize,
          measurementCount: result.measurementCount,
          timeWindowDays: result.timeWindowDays,
          confidence: result.confidence,
          evidenceText: result.evidenceText,
          calculationVersion: result.calculationVersion,
        },
      });
    }
  }
}
