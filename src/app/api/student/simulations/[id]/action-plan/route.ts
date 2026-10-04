import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SimulationReviewAndActionPlanner } from '@/lib/final-mile/simulation-review-and-action-planner';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attempt = await prisma.examSimulationAttempt.findUnique({
      where: { id },
      include: { result: true },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, error: 'Simulation attempt not found' }, { status: 404 });
    }

    let actionPlan = await prisma.finalMileActionPlan.findFirst({
      where: { simulationResultId: attempt.result?.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!actionPlan) {
      actionPlan = await SimulationReviewAndActionPlanner.generateActionPlan(id);
    }

    return NextResponse.json({
      success: true,
      actionPlan: {
        id: actionPlan.id,
        date: actionPlan.date,
        status: actionPlan.status,
        immediateActions: JSON.parse(actionPlan.immediateActionsJson),
        next24Hours: JSON.parse(actionPlan.next24HoursJson),
        next3Days: JSON.parse(actionPlan.next3DaysJson),
        next7Days: JSON.parse(actionPlan.next7DaysJson),
      },
    });
  } catch (error: any) {
    console.error('Error fetching action plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
