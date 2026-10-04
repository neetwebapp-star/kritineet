/**
 * Phase 15: Learning Snapshots, Cohort Analytics & Analytics Rebuild Service
 * Creates immutable longitudinal snapshots, generates privacy-safe distribution analytics
 * (P25, P50, P75, P90) across cohorts and tenants, detects statistical outliers without
 * punitive moral labeling, and provides an end-to-end reproducible analytics rebuild job.
 */

import prisma from '@/lib/prisma';
import { StudentBaselineService } from './student-baseline-service';
import { LearningTrendEngine } from './learning-trend-engine';
import { ConceptStabilityAndRetentionService } from './concept-stability-and-retention-service';

export interface TakeSnapshotParams {
  studentId: string;
  snapshotType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MOCK' | 'MILESTONE';
  planVersion?: number;
  assessmentVersion?: number;
}

export interface AggregateCohortParams {
  tenantId?: string;
  cohortId?: string;
  subject?: string;
  chapterId?: string;
  periodStart: Date;
  periodEnd: Date;
}

export class LearningSnapshotAndCohortService {
  public static readonly VERSION = 'cohort-v1';

  /**
   * Captures an immutable multi-dimensional snapshot of student learning state
   */
  public static async captureSnapshot(params: TakeSnapshotParams) {
    const [profile, masteries, mistakes, tasks] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId: params.studentId } }),
      prisma.studentConceptMastery.findMany({ where: { userId: params.studentId }, take: 20 }),
      prisma.studentMistake.groupBy({
        by: ['mistakeType'],
        where: { userId: params.studentId },
        _count: { id: true },
      }),
      prisma.dailyStudyTask.findMany({
        where: { userId: params.studentId },
        take: 30,
      }),
    ]);

    const coverageSnapshot = JSON.stringify({
      totalAttempted: profile?.totalAttempted || 0,
      accuracyRate: profile?.accuracyRate || 0,
    });

    const masterySnapshot = JSON.stringify(
      masteries.map((m) => ({ conceptId: m.conceptId, mastery: m.masteryScore }))
    );

    const mistakeSnapshot = JSON.stringify(
      mistakes.map((m) => ({ category: m.mistakeType, count: m._count.id }))
    );

    const plannedMins = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const actualMins = tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
    const studyExecutionSnapshot = JSON.stringify({ plannedMinutes: plannedMins, actualMinutes: actualMins });

    return prisma.studentLearningSnapshot.create({
      data: {
        studentId: params.studentId,
        snapshotType: params.snapshotType,
        planVersion: params.planVersion || 1,
        assessmentVersion: params.assessmentVersion || 1,
        contentCoverageSnapshot: coverageSnapshot,
        masterySnapshot,
        mistakeSnapshot,
        studyExecutionSnapshot,
        calculationVersion: 'snapshot-v1',
        isImmutable: true,
      },
    });
  }

  /**
   * Aggregates privacy-safe cohort analytics with distribution percentiles
   */
  public static async aggregateCohort(params: AggregateCohortParams) {
    const studentFilter: any = {};
    if (params.tenantId) {
      studentFilter.tenantId = params.tenantId;
    }

    const responses = await prisma.attemptEvent.findMany({
      where: {
        answeredAt: { gte: params.periodStart, lte: params.periodEnd },
        user: studentFilter,
        question: params.subject ? { subject: { code: params.subject } } : undefined,
      },
      select: {
        userId: true,
        isCorrect: true,
        timeSpentSeconds: true,
      },
    });

    const studentIds = Array.from(new Set(responses.map((r) => r.userId)));
    const studentCount = studentIds.length;
    const sampleSize = responses.length;

    if (sampleSize === 0) {
      return prisma.cohortAnalyticsSnapshot.create({
        data: {
          tenantId: params.tenantId || null,
          cohortId: params.cohortId || null,
          subject: params.subject || null,
          chapterId: params.chapterId || null,
          periodStart: params.periodStart,
          periodEnd: params.periodEnd,
          studentCount: 0,
          p25Accuracy: 0,
          medianAccuracy: 0,
          p75Accuracy: 0,
          p90Accuracy: 0,
          meanAccuracy: 0,
          medianResponseTimeMs: 0,
          meanStudyMinutes: 0,
          sampleSizeAttempts: 0,
        },
      });
    }

    // Calculate student individual accuracies for distribution
    const studentAccuracies: number[] = [];
    for (const sid of studentIds) {
      const studentResp = responses.filter((r) => r.userId === sid);
      const acc = (studentResp.filter((r) => r.isCorrect).length / studentResp.length) * 100;
      studentAccuracies.push(acc);
    }
    studentAccuracies.sort((a, b) => a - b);

    const times = responses
      .map((r) => (r.timeSpentSeconds || 0) * 1000)
      .filter((t) => t > 0)
      .sort((a, b) => a - b);

    const p25Acc = StudentBaselineService.calculatePercentile(studentAccuracies, 25);
    const medianAcc = StudentBaselineService.calculatePercentile(studentAccuracies, 50);
    const p75Acc = StudentBaselineService.calculatePercentile(studentAccuracies, 75);
    const p90Acc = StudentBaselineService.calculatePercentile(studentAccuracies, 90);
    const meanAcc = Math.round((studentAccuracies.reduce((a, b) => a + b, 0) / studentAccuracies.length) * 10) / 10;
    const medianTime = times.length > 0 ? times[Math.floor(times.length / 2)] : 0;

    return prisma.cohortAnalyticsSnapshot.create({
      data: {
        tenantId: params.tenantId || null,
        cohortId: params.cohortId || null,
        subject: params.subject || null,
        chapterId: params.chapterId || null,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        studentCount,
        p25Accuracy: p25Acc,
        medianAccuracy: medianAcc,
        p75Accuracy: p75Acc,
        p90Accuracy: p90Acc,
        meanAccuracy: meanAcc,
        medianResponseTimeMs: medianTime,
        meanStudyMinutes: 0,
        sampleSizeAttempts: sampleSize,
        calculationVersion: this.VERSION,
      },
    });
  }

  /**
   * Outlier Detection:
   * Identifies statistical anomalies (e.g. extremely rapid response times < 2000ms)
   * Flags investigation signal without ungrounded moral judgments.
   */
  public static async scanOutliers(studentId: string) {
    const rapidResponses = await prisma.attemptEvent.findMany({
      where: {
        userId: studentId,
        timeSpentSeconds: { gt: 0, lt: 2 }, // Under 2 seconds
      },
      take: 10,
    });

    const detectedOutliers = [];
    if (rapidResponses.length >= 3) {
      const event = await prisma.learningDataQualityEvent.create({
        data: {
          eventType: 'OUTLIER_DETECTED',
          severity: 'INFO',
          entityType: 'ATTEMPT_SPEED',
          entityId: rapidResponses[0].id,
          studentId,
          detailsJson: JSON.stringify({
            count: rapidResponses.length,
            note: `${rapidResponses.length} questions completed in under 2 seconds. Signal flagged for verification.`,
          }),
          isExcludedFromAnalytics: false,
        },
      });
      detectedOutliers.push(event);
    }

    return detectedOutliers;
  }

  /**
   * Analytics Rebuild Job:
   * Regenerates all derived analytical models deterministically from raw historical records.
   */
  public static async rebuildAnalytics(studentId: string) {
    const user = await prisma.user.findUnique({ where: { id: studentId } });
    if (!user) throw new Error(`Student ${studentId} not found`);

    // 1. Rebuild baselines
    const baselineAcc = await StudentBaselineService.calculateBaseline({
      studentId,
      metricType: 'ACCURACY_30D',
      windowDays: 30,
    });

    const baselineTime = await StudentBaselineService.calculateBaseline({
      studentId,
      metricType: 'RESPONSE_TIME_30D',
      windowDays: 30,
    });

    // 2. Rebuild trends
    const overallTrend = await LearningTrendEngine.evaluateTrend({
      studentId,
      domain: 'OVERALL',
      windowDays: 30,
    });

    // 3. Rebuild profile
    const learningProfile = await prisma.studentLearningProfile.upsert({
      where: { studentId },
      update: {
        questionAccuracy: baselineAcc.baselineValue,
        medianResponseTimeMs: baselineTime.baselineValue,
        volatilityScore: overallTrend.direction === 'VOLATILE' ? 0.35 : 0.05,
        calculationVersion: 'profile-v1-rebuilt',
        updatedAt: new Date(),
      },
      create: {
        studentId,
        questionAccuracy: baselineAcc.baselineValue,
        medianResponseTimeMs: baselineTime.baselineValue,
        volatilityScore: overallTrend.direction === 'VOLATILE' ? 0.35 : 0.05,
        calculationVersion: 'profile-v1-rebuilt',
      },
    });

    return {
      status: 'REBUILT',
      studentId,
      profile: learningProfile,
      baselines: [baselineAcc, baselineTime],
      trends: [overallTrend],
      rebuiltAt: new Date(),
    };
  }
}
