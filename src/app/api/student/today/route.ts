import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DailyPlanGenerator } from '@/lib/study-os/daily-plan-generator';
import { PreparationProfileService } from '@/lib/study-os/preparation-profile-service';
import { AIStudyCoach } from '@/lib/study-os/ai-study-coach';

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

    // 1. Get or generate today's plan
    let plan = await prisma.dailyStudyPlan.findFirst({
      where: { userId, date },
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        sessions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { planVersion: 'desc' },
    });

    if (!plan) {
      plan = await DailyPlanGenerator.generatePlan(userId, date, {
        reason: 'DAILY_REFRESH',
        generatedBy: 'PLANNER_CRON',
      });
    }

    // 2. Fetch student profile & preparation stage
    const profile = await PreparationProfileService.getOrCreateProfile(userId);

    // 3. Due revisions
    const dueRevisions = await prisma.revisionSchedule.findMany({
      where: {
        userId,
        category: { not: 'MASTERED' },
        nextRevisionAt: { lte: new Date() },
      },
      include: { concept: true },
      take: 5,
    });

    // 4. Recent mistakes
    const recentMistakes = await prisma.studentMistake.findMany({
      where: { userId, isResolved: false },
      include: { concept: true, chapter: true },
      orderBy: { lastMistakeAt: 'desc' },
      take: 5,
    });

    // 5. Categorize tasks
    const tasks = plan.tasks;
    const coreTasks = tasks.filter((t) => t.priority === 'CORE');
    const recommendedTasks = tasks.filter((t) => t.priority === 'RECOMMENDED');
    const optionalTasks = tasks.filter((t) => t.priority === 'OPTIONAL');

    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
    const remainingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
    const nextTask = remainingTasks[0] || null;

    // 6. Streak record
    const streak = await prisma.studyStreak.findUnique({ where: { userId } });

    // 7. Grounded AI Brief
    const aiBrief = plan.aiDailyBrief || (await AIStudyCoach.generateDailyBrief(userId, date));

    return NextResponse.json({
      date,
      plan: {
        id: plan.id,
        status: plan.status,
        planVersion: plan.planVersion,
        targetCapacityMinutes: plan.targetCapacityMinutes,
        plannedMinutes: plan.plannedMinutes,
        actualMinutes: plan.actualMinutes,
        preparationStage: plan.preparationStage,
        summaryNotes: plan.summaryNotes,
        aiDailyBrief: aiBrief,
      },
      execution: {
        totalTasks: tasks.length,
        completedCount: completedTasks.length,
        remainingCount: remainingTasks.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
        nextTask,
        currentActiveSession: plan.sessions[0] && plan.sessions[0].status === 'STARTED' ? plan.sessions[0] : null,
      },
      priorityBuckets: {
        core: coreTasks,
        recommended: recommendedTasks,
        optional: optionalTasks,
      },
      dueRevisions: dueRevisions.map((r) => ({
        id: r.id,
        conceptId: r.conceptId,
        conceptName: r.concept?.name || 'Concept',
        nextReviewDate: r.nextRevisionAt,
      })),
      recentMistakes: recentMistakes.map((m) => ({
        id: m.id,
        questionId: m.questionId,
        conceptName: m.concept?.name,
        chapterTitle: m.chapter.title,
        mistakeType: m.mistakeType,
      })),
      profile: {
        currentStage: profile.currentPreparationStage,
        planningMode: profile.planningMode,
        dailyCapacity: profile.dailyStudyCapacityMinutes,
      },
      streak: {
        dailyStreak: streak?.currentDailyStreak || 0,
        coreStreak: streak?.currentCorePlanStreak || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch today study view' }, { status: 500 });
  }
}
