import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DailyPlanGenerator } from '@/lib/study-os/daily-plan-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate/fetch 7 consecutive days starting from startDate
    const base = new Date(startDate);
    const dayPromises = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dStr = d.toISOString().split('T')[0];

      dayPromises.push(
        prisma.dailyStudyPlan.findFirst({
          where: { userId, date: dStr },
          include: {
            tasks: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { planVersion: 'desc' },
        }).then(async (existing) => {
          if (existing) return existing;
          return DailyPlanGenerator.generatePlan(userId!, dStr, {
            reason: 'DAILY_REFRESH',
            generatedBy: 'PLANNER_CRON',
          });
        })
      );
    }

    const weekPlans = await Promise.all(dayPromises);

    const daysSummary = weekPlans.map((p) => ({
      date: p.date,
      planId: p.id,
      plannedMinutes: p.plannedMinutes,
      actualMinutes: p.actualMinutes,
      status: p.status,
      tasksCount: p.tasks.length,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        taskType: t.taskType,
        subjectCode: t.subjectCode,
        estimatedMinutes: t.estimatedMinutes,
        actualMinutes: t.actualMinutes,
        priority: t.priority,
        status: t.status,
      })),
    }));

    const totalPlanned = daysSummary.reduce((sum, d) => sum + d.plannedMinutes, 0);
    const totalActual = daysSummary.reduce((sum, d) => sum + d.actualMinutes, 0);

    return NextResponse.json({
      startDate,
      totalPlannedMinutes: totalPlanned,
      totalActualMinutes: totalActual,
      completionRate: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
      days: daysSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch weekly plan' }, { status: 500 });
  }
}
