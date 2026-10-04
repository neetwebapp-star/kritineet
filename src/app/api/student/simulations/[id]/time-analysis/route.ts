import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.examSimulationResult.findUnique({
      where: { attemptId: id },
    });

    if (result) {
      return NextResponse.json({
        success: true,
        timeMetrics: {
          totalTimeSeconds: result.totalTimeSeconds,
          medianTimePerQuestion: result.medianTimePerQuestion,
          p25Time: result.p25Time,
          p75Time: result.p75Time,
          p90Time: result.p90Time,
        },
        timePressure: result.timePressureSignalsJson ? JSON.parse(result.timePressureSignalsJson) : null,
        answerChanges: result.answerChangesJson ? JSON.parse(result.answerChangesJson) : null,
        confidenceBreakdown: result.confidenceBreakdownJson ? JSON.parse(result.confidenceBreakdownJson) : null,
        subjectBreakdown: JSON.parse(result.subjectBreakdownJson),
      });
    }

    // Fallback: check ExamAttempt directly
    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, error: 'Simulation attempt not found' }, { status: 404 });
    }

    if (attempt.timeAnalysisJson) {
      const parsed = JSON.parse(attempt.timeAnalysisJson);
      return NextResponse.json({ success: true, ...parsed });
    }

    const { TimeManagementAnalyzer } = await import('@/lib/exam/time-management-analyzer');
    const computed = await TimeManagementAnalyzer.analyze(id);
    return NextResponse.json({ success: true, ...computed });
  } catch (error: any) {
    console.error('Error fetching simulation time analysis:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
