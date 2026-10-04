import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';
import { AutonomousPlannerEngine } from '@/lib/study-os/autonomous-planner-engine';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const inventory = await AutonomousPlannerEngine.getInventory();

    const plan = await prisma.preparationPlan.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
    });

    const totalDaysCount = await prisma.dailyStudyPlan.count({
      where: { userId: user.id },
    });

    const completedTasksCount = await prisma.dailyStudyTask.count({
      where: { userId: user.id, status: 'COMPLETED' },
    });

    const totalTasksCount = await prisma.dailyStudyTask.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      plan: {
        id: plan?.id || `PREP_PLAN_${user.id}_V1`,
        version: plan?.version || 1,
        status: plan?.status || 'ACTIVE',
        targetExamDate: '2027-05-05',
        startDate: '2026-10-05',
        totalCalendarDays: 213,
        currentStage: plan?.currentStage || 'FOUNDATION',
        weeklyCapacityHours: plan?.weeklyCapacityHours || 63.0,
        plannedWorkloadHours: plan?.plannedWorkloadHours || 54.0,
        isOverloaded: plan?.isOverloaded || false,
        totalDaysGenerated: totalDaysCount,
        progress: {
          totalTasks: totalTasksCount,
          completedTasks: completedTasksCount,
          percent: totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0,
        },
      },
      inventory,
    });
  } catch (error: any) {
    console.error('Error fetching planner metadata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const body = await req.json().catch(() => ({}));
    const { forceReplan = false, reason = 'MANUAL_REPLAN' } = body;

    const planResult = await AutonomousPlannerEngine.generateComplete213DayPlan(user.id);

    return NextResponse.json({
      success: true,
      message: 'Autonomous 213-Day Plan generated successfully',
      result: {
        version: planResult.version,
        totalDays: planResult.days.length,
        totalScheduledHours: planResult.totalScheduledMinutes / 60,
        averageDailyHours: planResult.averageDailyMinutes / 60,
        overloadedDays: planResult.overloadedDays,
        unscheduledTopics: planResult.unscheduledTopics,
      },
    });
  } catch (error: any) {
    console.error('Error generating 213-day plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
