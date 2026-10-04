/**
 * Phase 7: Learning Activity & Study Session Analytics Engine
 * Tracks authenticated study actions, durations, and active learning time
 * (without counting idle browser time).
 */

import prisma from '@/lib/prisma';

export class ActivityEngine {
  public static async recordActivity(
    userId: string,
    activityType: 'PRACTICE' | 'CBT' | 'REVISION' | 'AI_TUTOR' | 'ASSIGNMENT' | 'NCERT_READING',
    durationSeconds: number,
    relatedEntity?: string,
    metadata?: any
  ) {
    // Only record non-zero, realistic durations (capped at 4 hours per single event to prevent idle runaways)
    const sanitizedDuration = Math.min(Math.max(10, durationSeconds), 14400);

    return prisma.learningActivity.create({
      data: {
        userId,
        activityType,
        durationSeconds: sanitizedDuration,
        relatedEntity: relatedEntity || null,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  public static async getStudySessionSummary(userId: string, days: number = 7) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const activities = await prisma.learningActivity.findMany({
      where: {
        userId,
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalSeconds = 0;
    const byType: Record<string, number> = {
      PRACTICE: 0,
      CBT: 0,
      REVISION: 0,
      AI_TUTOR: 0,
      ASSIGNMENT: 0,
      NCERT_READING: 0,
    };

    for (const act of activities) {
      totalSeconds += act.durationSeconds;
      byType[act.activityType] = (byType[act.activityType] || 0) + act.durationSeconds;
    }

    return {
      totalActiveMinutes: Math.round(totalSeconds / 60),
      breakdownMinutes: {
        practice: Math.round((byType.PRACTICE || 0) / 60),
        cbt: Math.round((byType.CBT || 0) / 60),
        revision: Math.round((byType.REVISION || 0) / 60),
        aiTutor: Math.round((byType.AI_TUTOR || 0) / 60),
        assignments: Math.round((byType.ASSIGNMENT || 0) / 60),
        ncertReading: Math.round((byType.NCERT_READING || 0) / 60),
      },
      recentActivities: activities.slice(0, 10),
    };
  }
}
