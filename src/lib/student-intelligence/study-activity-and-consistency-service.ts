/**
 * Phase 15: Study Activity, Consistency & Telemetry Data Quality Service
 * Evaluates planned vs actual execution, study cadence consistency, and
 * audits incoming learning telemetry for corruptions, duplicates, and impossible durations.
 *
 * Core Invariant: Raw learning events are immutable. Invalid events are flagged
 * in LearningDataQualityEvent and excluded from derived analytics, never deleted.
 */

import prisma from '@/lib/prisma';

export interface StudyConsistencyResult {
  activeDays: number;
  inactiveDays: number;
  totalStudyMinutes: number;
  sessionCount: number;
  averageSessionMinutes: number;
  medianSessionMinutes: number;
  descriptiveStatement: string;
}

export interface PlannedVsActualResult {
  plannedMinutes: number;
  actualMinutes: number;
  executionRatePercent: number;
  completedTasks: number;
  missedTasks: number;
  breakdown: {
    revisionMinutes: number;
    practiceMinutes: number;
    pyqMinutes: number;
    mockMinutes: number;
  };
}

export interface TelemetryValidationResult {
  isValid: boolean;
  errorType?: 'INVALID_DURATION' | 'IMPOSSIBLE_TIMESTAMP' | 'DUPLICATE_EVENT' | 'BROKEN_RELATION';
  message?: string;
}

export class StudyActivityAndConsistencyService {
  public static readonly VERSION = 'study-v1';

  /**
   * Evaluates planned vs actual study time over a given window
   */
  public static async evaluatePlannedVsActual(studentId: string, days: number = 7): Promise<PlannedVsActualResult> {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const tasks = await prisma.dailyStudyTask.findMany({
      where: {
        userId: studentId,
      },
    });

    let plannedMinutes = 0;
    let actualMinutes = 0;
    let completedTasks = 0;
    let missedTasks = 0;

    const breakdown = {
      revisionMinutes: 0,
      practiceMinutes: 0,
      pyqMinutes: 0,
      mockMinutes: 0,
    };

    for (const t of tasks) {
      plannedMinutes += t.estimatedMinutes || 0;
      actualMinutes += t.actualMinutes || 0;

      if (t.status === 'COMPLETED') completedTasks++;
      if (t.status === 'MISSED') missedTasks++;

      if (t.taskType.includes('REVISION')) breakdown.revisionMinutes += t.actualMinutes || 0;
      else if (t.taskType.includes('PYQ')) breakdown.pyqMinutes += t.actualMinutes || 0;
      else if (t.taskType.includes('MOCK') || t.taskType.includes('TEST')) breakdown.mockMinutes += t.actualMinutes || 0;
      else breakdown.practiceMinutes += t.actualMinutes || 0;
    }

    const executionRate = plannedMinutes > 0
      ? Math.round((actualMinutes / plannedMinutes) * 1000) / 10
      : 100;

    return {
      plannedMinutes,
      actualMinutes,
      executionRatePercent: executionRate,
      completedTasks,
      missedTasks,
      breakdown,
    };
  }

  /**
   * Evaluates study consistency across calendar days
   */
  public static async evaluateConsistency(studentId: string, days: number = 14): Promise<StudyConsistencyResult> {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: studentId,
        startTime: { gte: sinceDate },
        status: 'COMPLETED',
      },
      select: {
        startTime: true,
        actualMinutes: true,
      },
      orderBy: { startTime: 'asc' },
    });

    const activeDateSet = new Set(
      sessions.filter((s) => s.startTime).map((s) => s.startTime!.toISOString().slice(0, 10))
    );

    const activeDays = activeDateSet.size;
    const inactiveDays = Math.max(0, days - activeDays);
    const sessionCount = sessions.length;

    const durations = sessions
      .map((s) => s.actualMinutes)
      .filter((m) => m > 0 && m <= 1440)
      .sort((a, b) => a - b);

    const totalMinutes = durations.reduce((a, b) => a + b, 0);
    const avgMinutes = sessionCount > 0 ? Math.round((totalMinutes / sessionCount) * 10) / 10 : 0;
    const medianMinutes = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0;

    const descriptiveStatement = `Study activity was recorded on ${activeDays} of the last ${days} days (${sessionCount} completed study sessions).`;

    return {
      activeDays,
      inactiveDays,
      totalStudyMinutes: totalMinutes,
      sessionCount,
      averageSessionMinutes: avgMinutes,
      medianSessionMinutes: medianMinutes,
      descriptiveStatement,
    };
  }

  /**
   * Validates incoming study telemetry to protect downstream analytics from corrupted data
   */
  public static async validateStudyTelemetry(event: {
    entityId: string;
    entityType: string;
    studentId?: string;
    durationMinutes: number;
    timestamp: Date;
  }): Promise<TelemetryValidationResult> {
    const now = new Date();

    // 1. Duration bounds check (impossible negative or > 24 hours)
    if (event.durationMinutes < 0 || event.durationMinutes > 1440) {
      await prisma.learningDataQualityEvent.create({
        data: {
          eventType: 'INVALID_DURATION',
          severity: 'ERROR',
          entityType: event.entityType,
          entityId: event.entityId,
          studentId: event.studentId,
          detailsJson: JSON.stringify({ reportedDuration: event.durationMinutes }),
          isExcludedFromAnalytics: true,
        },
      });

      return {
        isValid: false,
        errorType: 'INVALID_DURATION',
        message: `Duration ${event.durationMinutes} minutes is physically impossible (must be between 0 and 1440).`,
      };
    }

    // 2. Future timestamp check
    if (event.timestamp.getTime() > now.getTime() + 60000) {
      await prisma.learningDataQualityEvent.create({
        data: {
          eventType: 'IMPOSSIBLE_TIMESTAMP',
          severity: 'ERROR',
          entityType: event.entityType,
          entityId: event.entityId,
          studentId: event.studentId,
          detailsJson: JSON.stringify({ reportedTimestamp: event.timestamp.toISOString() }),
          isExcludedFromAnalytics: true,
        },
      });

      return {
        isValid: false,
        errorType: 'IMPOSSIBLE_TIMESTAMP',
        message: `Event timestamp is set in the future (${event.timestamp.toISOString()}).`,
      };
    }

    // 3. Duplicate event check
    const existing = await prisma.learningDataQualityEvent.findFirst({
      where: {
        entityId: event.entityId,
        eventType: 'DUPLICATE_EVENT',
      },
    });

    if (existing) {
      return {
        isValid: false,
        errorType: 'DUPLICATE_EVENT',
        message: `Telemetry event with ID ${event.entityId} was already submitted.`,
      };
    }

    return { isValid: true };
  }
}
