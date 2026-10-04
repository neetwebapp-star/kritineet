import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CbtExamEngine } from '@/lib/intelligence/cbt-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, testId, attemptId, questionId, selectedOption, isMarkedForReview, timeSpentSeconds } = body;

    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (action === 'START') {
      const session = await CbtExamEngine.startAttempt(testId, student.id);
      return NextResponse.json(session);
    }

    if (action === 'AUTOSAVE') {
      const saved = await CbtExamEngine.recordResponse(
        attemptId,
        questionId,
        selectedOption,
        isMarkedForReview ?? false,
        timeSpentSeconds ?? 0
      );
      return NextResponse.json({ success: true, saved });
    }

    if (action === 'SUBMIT') {
      const result = await CbtExamEngine.submitAttempt(attemptId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
