import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExamSimulationEngine } from '@/lib/final-mile/exam-simulation-engine';
import { SimulationAnalyticsEngine } from '@/lib/final-mile/simulation-analytics-engine';
import { SimulationReviewAndActionPlanner } from '@/lib/final-mile/simulation-review-and-action-planner';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attempt = await prisma.examSimulationAttempt.findUnique({
      where: { id },
      include: {
        simulation: {
          include: {
            snapshots: {
              orderBy: { questionNumber: 'asc' },
            },
          },
        },
        result: true,
        reviewQueue: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, error: 'Simulation attempt not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error: any) {
    console.error('Error fetching simulation detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, userId = 'student_demo', submissionToken } = body;

    if (action === 'SUBMIT') {
      const submitResult = await ExamSimulationEngine.submitSimulation({
        attemptId: id,
        userId,
        submissionToken,
      });

      // Automatically trigger evaluation & review queue generation
      const evaluationResult = await SimulationAnalyticsEngine.evaluateSimulationAttempt(id);
      await SimulationReviewAndActionPlanner.generateReviewQueue(id);
      await SimulationReviewAndActionPlanner.generateActionPlan(id);

      return NextResponse.json({
        success: true,
        submitResult,
        evaluationResult,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error submitting simulation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
