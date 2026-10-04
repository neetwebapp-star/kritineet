import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'student_demo';

    const attempts = await prisma.examSimulationAttempt.findMany({
      where: { userId },
      include: {
        simulation: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      attempts: attempts.map((a) => ({
        id: a.id,
        simulationId: a.simulationId,
        title: a.simulation.title,
        status: a.status,
        isStrictExamDay: a.isStrictExamDay,
        startedAt: a.startedAt.toISOString(),
        submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
        totalDurationSeconds: a.totalDurationSeconds,
        interruptionCount: a.interruptionCount,
        result: a.result
          ? {
              totalScore: a.result.totalScore,
              accuracy: a.result.accuracy,
              attempted: a.result.totalAttempted,
              correct: a.result.totalCorrect,
              incorrect: a.result.totalIncorrect,
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error('Error listing student simulations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
