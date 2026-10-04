import { NextRequest, NextResponse } from 'next/server';
import { ExamSimulationEngine } from '@/lib/final-mile/exam-simulation-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId = 'student_demo', acknowledgeRules = true } = body;

    const startResult = await ExamSimulationEngine.startSimulation({
      simulationId: id,
      userId,
      acknowledgeRules,
    });

    return NextResponse.json({
      success: true,
      ...startResult,
    });
  } catch (error: any) {
    console.error('Error starting simulation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
