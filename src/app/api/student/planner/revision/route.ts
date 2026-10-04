import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

const REVISION_TYPES = [
  'SPACED_REVISION',
  'ACTIVE_RECALL',
  'FORMULA_REVISION',
  'DIAGRAM_REVISION',
  'MISTAKE_REVIEW',
];

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);
    const currentDate = searchParams.get('date') || '2026-10-05';

    // 1. Revision tasks for specified date
    const todayPlan = await prisma.dailyStudyPlan.findFirst({
      where: { userId: user.id, date: currentDate },
      include: {
        tasks: {
          where: { taskType: { in: REVISION_TYPES } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    const dueToday = (todayPlan ? todayPlan.tasks : []).map((t) => {
      let meta = null;
      try {
        meta = t.metaJson ? JSON.parse(t.metaJson) : null;
      } catch (e) {}
      return {
        ...t,
        whyToday: meta?.whyToday || t.description || 'Spaced retention drill',
      };
    });

    // 2. Overdue revision tasks (prior to currentDate, status != COMPLETED)
    const overduePlans = await prisma.dailyStudyPlan.findMany({
      where: {
        userId: user.id,
        date: { lt: currentDate },
      },
      include: {
        tasks: {
          where: {
            taskType: { in: REVISION_TYPES },
            status: { not: 'COMPLETED' },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const overdueTasks = overduePlans.flatMap((p) =>
      p.tasks.map((t) => {
        let meta = null;
        try {
          meta = t.metaJson ? JSON.parse(t.metaJson) : null;
        } catch (e) {}
        return {
          ...t,
          originalDate: p.date,
          whyToday: meta?.whyToday || t.description || 'Spaced retention drill',
        };
      })
    );

    // 3. Upcoming revision tasks (next 7 days)
    const upcomingPlans = await prisma.dailyStudyPlan.findMany({
      where: {
        userId: user.id,
        date: { gt: currentDate },
      },
      include: {
        tasks: {
          where: { taskType: { in: REVISION_TYPES } },
        },
      },
      orderBy: { date: 'asc' },
      take: 7,
    });

    const upcomingTasks = upcomingPlans.flatMap((p) =>
      p.tasks.map((t) => ({ ...t, scheduledDate: p.date }))
    );

    // 4. Breakdown by Spaced Repetition Level
    const allRevisionTasks = await prisma.dailyStudyTask.findMany({
      where: {
        userId: user.id,
        taskType: { in: REVISION_TYPES },
      },
      select: {
        id: true,
        taskType: true,
        status: true,
        description: true,
        metaJson: true,
        estimatedMinutes: true,
        actualMinutes: true,
      },
    });

    const r1Count = allRevisionTasks.filter((t) => t.description?.includes('R1') || t.metaJson?.includes('R1')).length;
    const r2Count = allRevisionTasks.filter((t) => t.description?.includes('R2') || t.metaJson?.includes('R2')).length;
    const r3Count = allRevisionTasks.filter((t) => t.description?.includes('R3') || t.metaJson?.includes('R3')).length;
    const r4Count = allRevisionTasks.filter((t) => t.description?.includes('R4') || t.metaJson?.includes('R4')).length;
    const completedRevisionCount = allRevisionTasks.filter((t) => t.status === 'COMPLETED').length;

    // 5. Mistake Review statistics
    const mistakeReviews = allRevisionTasks.filter((t) => t.taskType === 'MISTAKE_REVIEW');

    return NextResponse.json({
      currentDate,
      summary: {
        totalScheduledRevisions: allRevisionTasks.length,
        completedRevisions: completedRevisionCount,
        pendingToday: dueToday.filter((t) => t.status !== 'COMPLETED').length,
        overdueCount: overdueTasks.length,
        retentionRate:
          allRevisionTasks.length > 0
            ? Math.round((completedRevisionCount / allRevisionTasks.length) * 100)
            : 0,
        spacedIntervals: {
          r1_2day: r1Count,
          r2_3day: r2Count,
          r3_5day: r3Count,
          r4_7day: r4Count,
          other: allRevisionTasks.length - (r1Count + r2Count + r3Count + r4Count),
        },
      },
      dueToday,
      overdue: overdueTasks,
      upcoming: upcomingTasks,
      mistakeReviewsCount: mistakeReviews.length,
    });
  } catch (error: any) {
    console.error('Error fetching revision queue:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
