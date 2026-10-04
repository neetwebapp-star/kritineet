import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { ContentHealthAndBacklogService } from '@/lib/content-lifecycle/content-health-and-backlog-service';
import { ReviewWorkflowService } from '@/lib/content-lifecycle/review-workflow-service';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const healthMetrics = await ContentHealthAndBacklogService.getGlobalHealthMetrics();
    const slaStats = await ReviewWorkflowService.getReviewSLAStats();

    const [recentReviews, recentDiffs] = await Promise.all([
      prisma.contentReview.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contentDiff.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      overview: healthMetrics,
      reviewBacklogSLA: slaStats,
      recentReviews,
      recentDiffs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content intelligence' }, { status: 500 });
  }
}
