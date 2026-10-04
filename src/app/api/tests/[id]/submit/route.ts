import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CbtExamEngine } from '@/lib/intelligence/cbt-engine';

export async function POST(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const body = await req.json();
    const { attemptId, submissionToken } = body;

    const analysis = await CbtExamEngine.submitAttempt(attemptId, student.id, submissionToken);
    return NextResponse.json(analysis);
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
