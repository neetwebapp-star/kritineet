import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);

    // Default to 2026-10-05 (Start of 213-day calendar) if current date is before start date
    const todayStr = searchParams.get('date') || '2026-10-05';

    let dayPlan = await prisma.dailyStudyPlan.findFirst({
      where: { userId: user.id, date: todayStr },
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        sessions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { planVersion: 'desc' },
    });

    // Fallback to first available plan if specified date not found
    if (!dayPlan) {
      dayPlan = await prisma.dailyStudyPlan.findFirst({
        where: { userId: user.id },
        include: {
          tasks: { orderBy: { orderIndex: 'asc' } },
          sessions: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { date: 'asc' },
      });
    }

    if (!dayPlan) {
      return NextResponse.json({ error: 'No study plan found for user' }, { status: 404 });
    }

    const tasks = dayPlan.tasks;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
    const nextTask = pendingTasks[0] || null;

    // Time calculations
    const plannedMinutes = dayPlan.plannedMinutes;
    const completedMinutes = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0);
    const remainingMinutes = Math.max(0, plannedMinutes - completedMinutes);

    // Dynamic checklist categories
    const checklist = {
      ncert: tasks.some((t) => t.taskType === 'NCERT_READ'),
      fingertips: tasks.some((t) => t.taskType === 'FINGERTIPS'),
      pyq: tasks.some((t) => t.taskType === 'PYQ'),
      revision: tasks.some((t) => ['SPACED_REVISION', 'ACTIVE_RECALL', 'FORMULA_REVISION', 'DIAGRAM_REVISION'].includes(t.taskType)),
      mistakes: tasks.some((t) => t.taskType === 'MISTAKE_REVIEW'),
      test: tasks.some((t) => ['CHAPTER_TEST', 'HALF_BOOK_TEST', 'MOCK_TEST'].includes(t.taskType)),
      buffer: tasks.some((t) => t.taskType === 'EXTERNAL_TEST_SLOT'),
    };

    // Category breakdown
    const subjectMinutes = {
      biology: tasks.filter((t) => t.subjectCode === 'BIOLOGY').reduce((s, t) => s + t.estimatedMinutes, 0),
      physics: tasks.filter((t) => t.subjectCode === 'PHYSICS').reduce((s, t) => s + t.estimatedMinutes, 0),
      chemistry: tasks.filter((t) => t.subjectCode === 'CHEMISTRY').reduce((s, t) => s + t.estimatedMinutes, 0),
      fullPcb: tasks.filter((t) => t.subjectCode === 'FULL_PCB').reduce((s, t) => s + t.estimatedMinutes, 0),
    };

    const breakdown = {
      subjectMinutes,
      newLearningMinutes: tasks.filter((t) => t.taskType === 'NCERT_READ').reduce((s, t) => s + t.estimatedMinutes, 0),
      practiceMinutes: tasks.filter((t) => ['FINGERTIPS', 'PYQ', 'DPP'].includes(t.taskType)).reduce((s, t) => s + t.estimatedMinutes, 0),
      revisionMinutes: tasks.filter((t) => ['SPACED_REVISION', 'ACTIVE_RECALL', 'FORMULA_REVISION', 'DIAGRAM_REVISION', 'MISTAKE_REVIEW'].includes(t.taskType)).reduce((s, t) => s + t.estimatedMinutes, 0),
      testMinutes: tasks.filter((t) => ['CHAPTER_TEST', 'HALF_BOOK_TEST', 'MOCK_TEST'].includes(t.taskType)).reduce((s, t) => s + t.estimatedMinutes, 0),
      bufferMinutes: tasks.filter((t) => t.taskType === 'EXTERNAL_TEST_SLOT').reduce((s, t) => s + t.estimatedMinutes, 0),
    };

    const startMs = new Date('2026-10-05').getTime();
    const curMs = new Date(dayPlan.date).getTime();
    const dayNumber = Math.max(1, Math.min(213, Math.round((curMs - startMs) / (1000 * 60 * 60 * 24)) + 1));
    const dayOfWeek = new Date(dayPlan.date).getDay();
    const isSunday = dayOfWeek === 0;

    let phase = 'Phase 1: Foundation Sprint';
    if (dayNumber > 185) phase = 'Phase 4: High-Yield Consolidation';
    else if (dayNumber > 145) phase = 'Phase 3: Integration & CBT Mocks';
    else if (dayNumber > 70) phase = 'Phase 2: Class 12 & Multi-Chapter';

    const progressPercent = plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;

    return NextResponse.json({
      success: true,
      date: dayPlan.date,
      planId: dayPlan.id,
      dayNumber,
      totalDays: 213,
      phase,
      stage: dayPlan.preparationStage,
      status: dayPlan.status,
      isSunday,
      version: dayPlan.planVersion,
      summaryNotes: dayPlan.summaryNotes,
      aiDailyBrief: dayPlan.aiDailyBrief,
      plannedMinutes,
      completedMinutes,
      remainingMinutes,
      progressPercent,
      capacity: {
        targetMinutes: dayPlan.targetCapacityMinutes,
        plannedMinutes,
        completedMinutes,
        remainingMinutes,
        percentComplete: plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0,
      },
      nextTask: nextTask
        ? {
            id: nextTask.id,
            title: nextTask.title,
            description: nextTask.description,
            taskType: nextTask.taskType,
            subjectCode: nextTask.subjectCode,
            chapterTitle: nextTask.chapterTitle,
            topicId: nextTask.topicId,
            estimatedMinutes: nextTask.estimatedMinutes,
            routeUrl: nextTask.routeUrl,
            priority: nextTask.priority,
          }
        : null,
      checklist,
      breakdown,
      tasks: tasks.map((t) => {
        let meta = null;
        try {
          meta = t.metaJson ? JSON.parse(t.metaJson) : null;
        } catch (e) {}
        const whyToday = meta?.whyToday || t.description || 'Core curriculum progression calibrated for 9.0h daily pace.';
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          subjectCode: t.subjectCode,
          chapterSlug: t.chapterSlug,
          chapterTitle: t.chapterTitle,
          topicId: t.topicId,
          estimatedMinutes: t.estimatedMinutes,
          actualMinutes: t.actualMinutes,
          priority: t.priority,
          status: t.status,
          routeUrl: t.routeUrl,
          whyToday,
          meta,
        };
      }),
    });
  } catch (error: any) {
    console.error('Error fetching today planner data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
