import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AssessmentBlueprintEngine } from '@/lib/assessment/blueprint-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const where: any = {};
    if (status) where.status = status;

    const blueprints = await prisma.assessmentBlueprint.findMany({
      where,
      include: {
        blueprintRules: true,
        _count: {
          select: {
            qualityReports: true,
            testForms: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ blueprints });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch blueprints' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, examType, targetQuestionCount, targetDurationMinutes, rules } = body;

    if (!title || !targetQuestionCount || !targetDurationMinutes || !Array.isArray(rules)) {
      return NextResponse.json({
        error: 'title, targetQuestionCount, targetDurationMinutes, and rules array are required',
      }, { status: 400 });
    }

    const blueprint = await AssessmentBlueprintEngine.createBlueprint({
      title,
      description,
      examType,
      targetQuestionCount,
      targetDurationMinutes,
      rules,
    });

    return NextResponse.json({ success: true, blueprint });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create blueprint' }, { status: 500 });
  }
}
