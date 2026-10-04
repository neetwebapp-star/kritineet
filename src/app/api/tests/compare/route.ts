import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TestHistoryAndComparisonEngine } from '@/lib/exam/test-history-and-comparison-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attemptA = searchParams.get('attemptA');
    const attemptB = searchParams.get('attemptB');

    if (!attemptA || !attemptB) {
      return NextResponse.json({ error: 'Both attemptA and attemptB query parameters are required' }, { status: 400 });
    }

    const comparison = await TestHistoryAndComparisonEngine.compareAttempts(student.id, attemptA, attemptB);
    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
