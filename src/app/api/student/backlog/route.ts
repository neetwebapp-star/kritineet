import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RecoveryPlanner } from '@/lib/study-os/recovery-planner';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'ACTIVE';

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const items = await prisma.preparationBacklog.findMany({
      where: { userId, status },
      orderBy: { createdAt: 'desc' },
    });

    const counts = await prisma.preparationBacklog.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });

    return NextResponse.json({
      userId,
      items,
      statusCounts: counts.reduce((acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch backlog' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { backlogId, targetDate } = body;

    if (!backlogId || !targetDate) {
      return NextResponse.json({ error: 'backlogId and targetDate are required' }, { status: 400 });
    }

    const item = await RecoveryPlanner.scheduleBacklogItem(backlogId, targetDate);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reschedule backlog item' }, { status: 500 });
  }
}
