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
    const category = searchParams.get('category') as any; // ALL | REPEATED | SLOW | GUESSED | FLAGGED | LEARNED
    const subject = searchParams.get('subject') || undefined;

    const items = await ErrorBookEngine.getErrorBook(student.id, {
      category: category || 'ALL',
      subjectCode: subject,
      limit: 60,
    });

    return NextResponse.json({
      count: items.length,
      items,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, action } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    if (action === 'MARK_LEARNED') {
      await ErrorBookEngine.markAsLearned(student.id, questionId);
      return NextResponse.json({ success: true, message: 'Question marked as learned' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
