import { NextRequest, NextResponse } from 'next/server';
import { PreparationPlanner } from '@/lib/preparation/preparation-planner';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'cmuo5qiz5002xevh8l3g4ds60';
    
    // Look up active plan
    let activePlan = await prisma.preparationPlan.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
      include: { edition: true, overrides: true },
    });

    if (!activePlan) {
      // Generate initial plan
      const result = await PreparationPlanner.generatePlan(userId);
      activePlan = result.plan as any;
    }

    return NextResponse.json({
      plan: {
        id: activePlan?.id,
        version: activePlan?.version,
        status: activePlan?.status,
        currentStage: activePlan?.currentStage,
        targetExamDate: activePlan?.targetExamDate,
        weeklyCapacityHours: activePlan?.weeklyCapacityHours,
        plannedWorkloadHours: activePlan?.plannedWorkloadHours,
        isOverloaded: activePlan?.isOverloaded,
        roadmap: activePlan?.roadmapJson ? JSON.parse(activePlan.roadmapJson) : [],
        calendar: activePlan?.calendarJson ? JSON.parse(activePlan.calendarJson) : [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch preparation plan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'cmuo5qiz5002xevh8l3g4ds60';
    const editionId = body.editionId;
    const reason = body.reason || 'Student or System recalculation';

    const result = await PreparationPlanner.generatePlan(userId, editionId, reason);
    return NextResponse.json({
      success: true,
      plan: result.plan,
      calendar: result.calendar,
      roadmap: result.roadmap,
      currentStage: result.currentStage,
      isOverloaded: result.isOverloaded,
      workloadWarning: result.workloadWarning,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate preparation plan' }, { status: 500 });
  }
}
