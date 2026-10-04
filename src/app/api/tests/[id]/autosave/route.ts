import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CbtExamEngine } from '@/lib/intelligence/cbt-engine';

export async function POST(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { attemptId, activeQuestionIndex, remainingSeconds, answers, markedForReview } = body;

    const result = await CbtExamEngine.saveAttemptState(attemptId, student.id, {
      activeQuestionIndex: activeQuestionIndex ?? 0,
      remainingSeconds: remainingSeconds ?? 0,
      answers: answers ?? {},
      markedForReview: markedForReview ?? [],
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
