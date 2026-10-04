import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DailyPlanGenerator } from '@/lib/study-os/daily-plan-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const plan = await prisma.dailyStudyPlan.findFirst({
      where: { userId, date },
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        sessions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { planVersion: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({ error: 'No plan found for this date', date }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, availableMinutes, reason, forceReplan } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: 'userId and date are required' }, { status: 400 });
    }

    const plan = await DailyPlanGenerator.generatePlan(userId, date, {
      availableMinutes,
      reason: reason || 'DAILY_REFRESH',
      forceReplan: Boolean(forceReplan),
      generatedBy: 'STUDENT',
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate plan' }, { status: 500 });
  }
}
