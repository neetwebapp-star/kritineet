import { NextRequest, NextResponse } from 'next/server';
import { ReadinessMatrixService } from '@/lib/final-mile/readiness-matrix-service';
import { FinalMileConfigService } from '@/lib/final-mile/final-mile-config-service';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check student existence
    const student = await prisma.user.findUnique({
      where: { id },
      include: { finalMileConfig: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const readiness = await ReadinessMatrixService.evaluateReadiness(id);
    const simulations = await prisma.examSimulationAttempt.findMany({
      where: { userId: id },
      include: { simulation: true, result: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        mode: student.finalMileConfig?.mode || 'NORMAL_PREPARATION',
        isActive: student.finalMileConfig?.isActive || false,
      },
      readiness,
      simulations: simulations.map((s) => ({
        id: s.id,
        title: s.simulation.title,
        status: s.status,
        date: s.startedAt.toISOString().split('T')[0],
        score: s.result?.totalScore ?? null,
        accuracy: s.result?.accuracy ?? null,
      })),
    });
  } catch (error: any) {
    console.error('Error in mentor final-mile route:', error);
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
    const { mentorId = 'mentor_demo', mode, reason } = body;

    if (!mode || !reason) {
      return NextResponse.json(
        { success: false, error: 'mode and reason are required for mentor override' },
        { status: 400 }
      );
    }

    const updated = await FinalMileConfigService.setMentorOverride({
      userId: id,
      mentorId,
      mode,
      reason,
    });

    return NextResponse.json({
      success: true,
      updatedConfig: updated,
    });
  } catch (error: any) {
    console.error('Error setting mentor override:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
