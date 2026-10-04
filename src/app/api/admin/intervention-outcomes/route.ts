import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { InterventionAndExperimentService } from '@/lib/student-intelligence/intervention-and-experiment-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const horizon = searchParams.get('horizon') || undefined;

    const outcomes = await prisma.learningInterventionOutcome.findMany({
      where: horizon ? { outcomeHorizon: horizon } : undefined,
      include: {
        intervention: {
          select: {
            id: true,
            type: true,
            studentId: true,
            reason: true,
            status: true,
          },
        },
      },
      orderBy: { measuredAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      outcomes,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to retrieve intervention outcomes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const outcome = await InterventionAndExperimentService.recordOutcome({
      interventionId: body.interventionId,
      horizon: body.horizon || 'IMMEDIATE',
      performanceBefore: body.performanceBefore,
      performanceAfter: body.performanceAfter,
      sampleSizeAfter: body.sampleSizeAfter,
    });

    return NextResponse.json({
      success: true,
      outcome,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to record intervention outcome' }, { status: 500 });
  }
}
