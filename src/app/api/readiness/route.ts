import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PerformanceSnapshotEngine } from '@/lib/exam/performance-snapshot-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
      include: { profile: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const report = await PerformanceSnapshotEngine.getReadinessReport(student.id);

    // Also fetch recent snapshots for trend observation
    const snapshots = await prisma.performanceSnapshot.findMany({
      where: { userId: student.id },
      orderBy: { snapshotDate: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      report,
      snapshots: snapshots.map((s) => ({
        id: s.id,
        periodType: s.periodType,
        snapshotDate: s.snapshotDate,
        overallMastery: s.overallMastery,
        practiceAccuracy: s.practiceAccuracy,
        pyqCoverageRate: s.pyqCoverageRate,
        revisionCompletion: s.revisionCompletion,
        mockTestAverageScore: s.mockTestAverageScore,
        weakConceptsCount: s.weakConceptsCount,
        timeEfficiencySeconds: s.timeEfficiencySeconds,
        consistencyStreakDays: s.consistencyStreakDays,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching readiness data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const periodType = body.periodType || 'DAILY';

    const snapshot = await PerformanceSnapshotEngine.captureSnapshot(student.id, periodType);
    return NextResponse.json({ success: true, snapshot }, { status: 201 });
  } catch (error: any) {
    console.error('Error capturing readiness snapshot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
