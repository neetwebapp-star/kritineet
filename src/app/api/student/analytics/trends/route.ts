import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LearningTrendEngine } from '@/lib/student-intelligence/learning-trend-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');
    const domain = (searchParams.get('domain') || 'OVERALL') as any;
    const entityId = searchParams.get('entityId') || undefined;
    const windowDays = searchParams.get('windowDays') ? parseInt(searchParams.get('windowDays')!, 10) : 30;

    if (!studentId) {
      const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        select: { id: true },
      });
      studentId = student?.id || null;
    }

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required or student session not found' }, { status: 400 });
    }

    const trend = await LearningTrendEngine.evaluateTrend({
      studentId,
      domain,
      entityId,
      windowDays,
    });

    const historicalTrends = await prisma.learningTrend.findMany({
      where: { studentId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      currentTrend: trend,
      history: historicalTrends,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to retrieve learning trends' }, { status: 500 });
  }
}
