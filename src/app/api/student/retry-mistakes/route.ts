import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ErrorBookEngine } from '@/lib/intelligence/error-book-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const queue = await ErrorBookEngine.getRetryQueue(student.id, limit);

    return NextResponse.json({
      count: queue.length,
      questions: queue,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
