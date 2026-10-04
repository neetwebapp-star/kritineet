/**
 * Phase 15: Student Personal Baseline Service
 * Calculates empirical baselines exclusively from the student's own historical data.
 * Adheres strictly to the invariant: Never compare against external populations
 * unless explicitly defined by cohort research parameters.
 */

import prisma from '@/lib/prisma';

export interface BaselineCalculationParams {
  studentId: string;
  metricType: 'ACCURACY_30D' | 'RESPONSE_TIME_30D' | 'SUBJECT_ACCURACY' | 'CHAPTER_ACCURACY' | 'QUESTION_TYPE_ACCURACY';
  scopeEntity?: string;
  windowDays?: number;
}

export interface StudentBaselineResult {
  metricType: string;
  scopeEntity: string | null;
  baselineValue: number;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
  sampleSize: number;
  windowDays: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  calculationVersion: string;
}

export class StudentBaselineService {
  public static readonly VERSION = 'baseline-v1';

  /**
   * Calculates percentile value from a sorted array of numbers
   */
  public static calculatePercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    if (sorted.length === 1) return sorted[0];

    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 100) / 100;
  }

  /**
   * Evaluates and updates personal baseline for a student
   */
  public static async calculateBaseline(params: BaselineCalculationParams): Promise<StudentBaselineResult> {
    const windowDays = params.windowDays || 30;
    const sinceDate = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const responses = await prisma.attemptEvent.findMany({
      where: {
        userId: params.studentId,
        answeredAt: { gte: sinceDate },
        question: params.metricType === 'SUBJECT_ACCURACY' && params.scopeEntity
          ? { subject: { code: params.scopeEntity } }
          : params.metricType === 'CHAPTER_ACCURACY' && params.scopeEntity
          ? { chapterId: params.scopeEntity }
          : params.metricType === 'QUESTION_TYPE_ACCURACY' && params.scopeEntity
          ? { questionType: params.scopeEntity }
          : undefined,
      },
      select: {
        isCorrect: true,
        timeSpentSeconds: true,
      },
    });

    const sampleSize = responses.length;

    let baselineValue = 0;
    let p25: number | null = null;
    let p50: number | null = null;
    let p75: number | null = null;
    let p90: number | null = null;

    if (params.metricType === 'RESPONSE_TIME_30D') {
      const times = responses
        .map((r) => (r.timeSpentSeconds || 0) * 1000)
        .filter((t) => t > 0 && t < 1800000) // Filter invalid/negative durations
        .sort((a, b) => a - b);

      if (times.length > 0) {
        p25 = this.calculatePercentile(times, 25);
        p50 = this.calculatePercentile(times, 50);
        p75 = this.calculatePercentile(times, 75);
        p90 = this.calculatePercentile(times, 90);
        baselineValue = p50; // Median response time
      }
    } else {
      // Accuracy metrics
      if (sampleSize > 0) {
        const correctCount = responses.filter((r) => r.isCorrect).length;
        baselineValue = Math.round((correctCount / sampleSize) * 1000) / 10; // Percentage
      }
    }

    let confidence: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (sampleSize >= 30) {
      confidence = 'HIGH';
    } else if (sampleSize >= 10) {
      confidence = 'MODERATE';
    }

    const result: StudentBaselineResult = {
      metricType: params.metricType,
      scopeEntity: params.scopeEntity || null,
      baselineValue,
      p25,
      p50,
      p75,
      p90,
      sampleSize,
      windowDays,
      confidence,
      calculationVersion: this.VERSION,
    };

    // Upsert baseline record
    await prisma.studentBaseline.upsert({
      where: {
        studentId_metricType_scopeEntity: {
          studentId: params.studentId,
          metricType: params.metricType,
          scopeEntity: params.scopeEntity || 'GLOBAL',
        },
      },
      update: {
        baselineValue,
        p25,
        p50,
        p75,
        p90,
        sampleSize,
        windowDays,
        confidence,
        calculationVersion: this.VERSION,
      },
      create: {
        studentId: params.studentId,
        metricType: params.metricType,
        scopeEntity: params.scopeEntity || 'GLOBAL',
        baselineValue,
        p25,
        p50,
        p75,
        p90,
        sampleSize,
        windowDays,
        confidence,
        calculationVersion: this.VERSION,
      },
    });

    return result;
  }
}
