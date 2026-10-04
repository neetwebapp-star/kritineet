import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate') || '2026-10-05';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    const dayPlans = await prisma.dailyStudyPlan.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        tasks: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            taskType: true,
            subjectCode: true,
            estimatedMinutes: true,
            actualMinutes: true,
            priority: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const totalMinutes = dayPlans.reduce((sum, d) => sum + d.plannedMinutes, 0);
    const completedMinutes = dayPlans.reduce(
      (sum, d) =>
        sum +
        d.tasks
          .filter((t) => t.status === 'COMPLETED')
          .reduce((s, t) => s + (t.actualMinutes || t.estimatedMinutes), 0),
      0
    );

    const subjectMinutes = {
      biology: 0,
      physics: 0,
      chemistry: 0,
      fullPcb: 0,
    };

    for (const d of dayPlans) {
      for (const t of d.tasks) {
        if (t.subjectCode === 'BIOLOGY') subjectMinutes.biology += t.estimatedMinutes;
        else if (t.subjectCode === 'PHYSICS') subjectMinutes.physics += t.estimatedMinutes;
        else if (t.subjectCode === 'CHEMISTRY') subjectMinutes.chemistry += t.estimatedMinutes;
        else subjectMinutes.fullPcb += t.estimatedMinutes;
      }
    }

    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      totalPlannedHours: Math.round((totalMinutes / 60) * 10) / 10,
      completedHours: Math.round((completedMinutes / 60) * 10) / 10,
      completionPercent: totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0,
      subjectMinutes,
      days: dayPlans.map((d) => ({
        date: d.date,
        dayOfWeek: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        plannedMinutes: d.plannedMinutes,
        actualMinutes: d.actualMinutes,
        status: d.status,
        stage: d.preparationStage,
        taskCount: d.tasks.length,
        completedTaskCount: d.tasks.filter((t) => t.status === 'COMPLETED').length,
        tasks: d.tasks,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching weekly planner data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
