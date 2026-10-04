import { NextRequest, NextResponse } from 'next/server';
import { ExamSimulationEngine } from '@/lib/final-mile/exam-simulation-engine';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const simulations = await prisma.examSimulation.findMany({
      where: { status: { in: ['READY', 'SCHEDULED'] } },
      include: {
        patternVersion: true,
        blueprint: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      simulations,
    });
  } catch (error: any) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      simulationCode,
      blueprintId,
      patternVersionId,
      isStrictExamDay = false,
      durationMinutes = 200,
      questionsCount = 200,
      testId,
    } = body;

    if (!title || !simulationCode) {
      return NextResponse.json(
        { success: false, error: 'title and simulationCode are required' },
        { status: 400 }
      );
    }

    const simulation = await ExamSimulationEngine.createSimulation({
      title,
      simulationCode,
      blueprintId,
      patternVersionId,
      isStrictExamDay,
      durationMinutes,
      questionsCount,
      testId,
    });

    return NextResponse.json({
      success: true,
      simulation,
    });
  } catch (error: any) {
    console.error('Error creating simulation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
