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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const history = await TestHistoryAndComparisonEngine.getStudentHistory(student.id, limit);
    return NextResponse.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
