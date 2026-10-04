import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MockTestGenerator } from '@/lib/exam/mock-test-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category'); // FULL_MOCK | PYQ | SUBJECT | CHAPTER | WEAKNESS | REVISION | ALL
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const where: any = { isPublished: true };
    if (category && category !== 'ALL') {
      if (category === 'FULL_MOCK') {
        where.testType = { in: ['FULL_MOCK', 'GRAND_MOCK', 'FULL_SYLLABUS'] };
      } else if (category === 'PYQ') {
        where.testType = 'PYQ_TEST';
      } else if (category === 'SUBJECT') {
        where.testType = 'SUBJECT_TEST';
      } else if (category === 'CHAPTER') {
        where.testType = 'CHAPTER_TEST';
      } else if (category === 'WEAKNESS') {
        where.testType = 'WEAKNESS_TEST';
      } else if (category === 'REVISION') {
        where.testType = 'REVISION_TEST';
      } else {
        where.testType = category;
      }
    }

    const tests = await prisma.test.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        examPattern: true,
        _count: { select: { testQuestions: true, attempts: true } },
      },
    });

    return NextResponse.json({
      success: true,
      count: tests.length,
      tests: tests.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        testType: t.testType,
        mode: t.mode,
        durationMinutes: t.durationMinutes,
        totalQuestions: t.totalQuestions,
        totalMarks: t.totalMarks,
        positiveMarks: t.positiveMarks,
        negativeMarks: t.negativeMarks,
        version: t.version,
        examName: t.examPattern?.examName || 'NEET UG',
        examYear: t.examPattern?.examYear || 2027,
        attemptsCount: t._count.attempts,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });

    const body = await req.json();
    const result = await MockTestGenerator.generateMock({
      ...body,
      userId: student?.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
