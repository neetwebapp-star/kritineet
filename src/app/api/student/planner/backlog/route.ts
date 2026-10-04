import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);
    const currentDate = searchParams.get('date') || '2026-10-05';

    // Find all incomplete tasks before currentDate
    const pastPlansWithPending = await prisma.dailyStudyPlan.findMany({
      where: {
        userId: user.id,
        date: { lt: currentDate },
      },
      include: {
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    const backlogTasks = pastPlansWithPending.flatMap((p) =>
      p.tasks.map((t) => {
        let meta = null;
        try {
          meta = t.metaJson ? JSON.parse(t.metaJson) : null;
        } catch (e) {}
        return {
          ...t,
          scheduledDate: p.date,
          subject: t.subjectCode || 'GENERAL',
          chapterTitle: t.chapterTitle || 'General Review',
          whyToday: meta?.whyToday || t.description || 'Backlog item',
        };
      })
    );

    const totalBacklogMinutes = backlogTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    // Subject breakdown
    const subjectBreakdown: Record<string, number> = {
      BIOLOGY: 0,
      PHYSICS: 0,
      CHEMISTRY: 0,
      GENERAL: 0,
    };

    backlogTasks.forEach((t) => {
      const subj = (t.subjectCode || 'GENERAL').toUpperCase();
      subjectBreakdown[subj] = (subjectBreakdown[subj] || 0) + t.estimatedMinutes;
    });

    // Find upcoming buffer slots and available capacity
    const upcomingBufferPlans = await prisma.dailyStudyPlan.findMany({
      where: {
        userId: user.id,
        date: { gte: currentDate },
        plannedMinutes: { lt: 600 },
      },
      orderBy: { date: 'asc' },
      take: 14,
    });

    const availableBufferMinutes = upcomingBufferPlans.reduce(
      (sum, p) => sum + (600 - p.plannedMinutes),
      0
    );

    // Determine recovery urgency
    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (totalBacklogMinutes > 600) urgency = 'CRITICAL';
    else if (totalBacklogMinutes > 300) urgency = 'HIGH';
    else if (totalBacklogMinutes > 60) urgency = 'MEDIUM';

    return NextResponse.json({
      currentDate,
      urgency,
      totalBacklogCount: backlogTasks.length,
      totalBacklogMinutes,
      totalBacklogHours: +(totalBacklogMinutes / 60).toFixed(1),
      subjectBreakdown,
      availableBufferMinutesNext14Days: availableBufferMinutes,
      canAutoAbsorb: availableBufferMinutes >= totalBacklogMinutes,
      recommendation:
        totalBacklogMinutes === 0
          ? 'On track! Zero backlog detected.'
          : totalBacklogMinutes <= availableBufferMinutes
          ? `Backlog can be absorbed across the next 14 days using spare buffer time (up to 600m max daily limit).`
          : `High backlog detected. Recommendation: Utilize Sunday buffer slots or switch daily study capacity to 10h to catch up.`,
      tasks: backlogTasks,
    });
  } catch (error: any) {
    console.error('Error fetching backlog:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
