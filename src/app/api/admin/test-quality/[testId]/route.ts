import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AssessmentBlueprintEngine } from '@/lib/assessment/blueprint-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;
    const { searchParams } = new URL(req.url);
    const blueprintId = searchParams.get('blueprintId') || undefined;

    // Check if report already exists or compute fresh
    const existingReports = await prisma.assessmentQualityReport.findMany({
      where: { testId },
      include: { metrics: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (existingReports.length > 0 && !searchParams.get('recalculate')) {
      return NextResponse.json({ report: existingReports[0] });
    }

    // Generate fresh evaluation
    const evaluation = await AssessmentBlueprintEngine.evaluateTestQuality(testId, blueprintId);
    return NextResponse.json({ report: evaluation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to evaluate test quality' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;
    const body = await req.json().catch(() => ({}));
    const { blueprintId } = body;

    const evaluation = await AssessmentBlueprintEngine.evaluateTestQuality(testId, blueprintId);
    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to evaluate and persist test quality' }, { status: 500 });
  }
}
