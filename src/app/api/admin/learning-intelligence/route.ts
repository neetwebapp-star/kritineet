import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const [
      totalProfiles,
      activeTrends,
      totalInterventions,
      completedOutcomes,
      activeExperiments,
      qualityEvents,
      recentSnapshots,
    ] = await Promise.all([
      prisma.studentLearningProfile.count(),
      prisma.learningTrend.groupBy({
        by: ['direction'],
        _count: { id: true },
      }),
      prisma.learningIntervention.count(),
      prisma.learningInterventionOutcome.count(),
      prisma.learningExperiment.count({ where: { status: 'ACTIVE' } }),
      prisma.learningDataQualityEvent.count({ where: { isExcludedFromAnalytics: true } }),
      prisma.studentLearningSnapshot.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          studentId: true,
          snapshotType: true,
          timestamp: true,
        },
      }),
    ]);

    const trendBreakdown: Record<string, number> = {};
    for (const t of activeTrends) {
      trendBreakdown[t.direction] = t._count.id;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalTrackedStudents: totalProfiles,
        trendDistribution: trendBreakdown,
        totalInterventions,
        completedOutcomes,
        activeExperiments,
        quarantinedQualityEvents: qualityEvents,
      },
      recentSnapshots,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to retrieve learning intelligence' }, { status: 500 });
  }
}
