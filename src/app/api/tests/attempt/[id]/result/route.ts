import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { id } = await params;
    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
      include: {
        test: {
          include: { examPattern: true },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.userId !== student.id) {
      return NextResponse.json({ error: 'Unauthorized: Access denied to other student results' }, { status: 403 });
    }

    if (!attempt.analyticsJson) {
      return NextResponse.json({ error: 'Attempt has not been evaluated or submitted yet' }, { status: 400 });
    }

    const analysis = JSON.parse(attempt.analyticsJson);
    const timeAnalysis = attempt.timeAnalysisJson ? JSON.parse(attempt.timeAnalysisJson) : null;
    const actionPlan = attempt.actionPlanJson ? JSON.parse(attempt.actionPlanJson) : null;

    return NextResponse.json({
      ...analysis,
      timeAnalysis,
      actionPlan,
      test: {
        id: attempt.test.id,
        title: attempt.test.title,
        testType: attempt.test.testType,
        totalMarks: attempt.test.totalMarks,
        totalQuestions: attempt.test.totalQuestions,
        examName: attempt.test.examPattern?.examName || 'NEET UG',
        examYear: attempt.test.examPattern?.examYear || 2027,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
