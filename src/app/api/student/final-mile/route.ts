import { NextRequest, NextResponse } from 'next/server';
import { FinalMileConfigService } from '@/lib/final-mile/final-mile-config-service';
import { ReadinessMatrixService } from '@/lib/final-mile/readiness-matrix-service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'student_demo';

    // 1. Evaluate activation & status
    const status = await FinalMileConfigService.evaluateActivation(userId);

    // 2. Fetch readiness summary
    const readiness = await ReadinessMatrixService.evaluateReadiness(userId);

    // 3. Fetch latest simulation result if available
    const latestResult = await prisma.examSimulationResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        attempt: {
          include: {
            simulation: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      status,
      readiness,
      latestResult: latestResult
        ? {
            id: latestResult.id,
            simulationTitle: latestResult.attempt.simulation.title,
            score: latestResult.totalScore,
            accuracy: latestResult.accuracy,
            date: latestResult.createdAt.toISOString().split('T')[0],
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching final-mile status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
