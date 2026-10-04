import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LearningSnapshotAndCohortService } from '@/lib/student-intelligence/learning-snapshot-and-cohort-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const cohortId = searchParams.get('cohortId') || undefined;
    const subject = searchParams.get('subject') || undefined;

    const snapshots = await prisma.cohortAnalyticsSnapshot.findMany({
      where: {
        tenantId: tenantId ? tenantId : undefined,
        cohortId: cohortId ? cohortId : undefined,
        subject: subject ? subject : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      cohortSnapshots: snapshots,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to retrieve cohort analytics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const periodStart = body.periodStart ? new Date(body.periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const periodEnd = body.periodEnd ? new Date(body.periodEnd) : new Date();

    const snapshot = await LearningSnapshotAndCohortService.aggregateCohort({
      tenantId: body.tenantId,
      cohortId: body.cohortId,
      subject: body.subject,
      chapterId: body.chapterId,
      periodStart,
      periodEnd,
    });

    return NextResponse.json({
      success: true,
      snapshot,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to aggregate cohort' }, { status: 500 });
  }
}
