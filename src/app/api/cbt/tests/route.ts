import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CbtExamEngine } from '@/lib/intelligence/cbt-engine';

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { testQuestions: true, attempts: true } },
      },
    });

    return NextResponse.json({ tests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const test = await CbtExamEngine.createTest({
      title: body.title,
      description: body.description,
      testType: body.testType || 'CHAPTER',
      chapterSlug: body.chapterSlug,
      subjectCode: body.subjectCode,
      examYear: body.examYear ? parseInt(body.examYear, 10) : undefined,
      totalQuestions: body.totalQuestions ? parseInt(body.totalQuestions, 10) : 10,
      durationMinutes: body.durationMinutes ? parseInt(body.durationMinutes, 10) : 30,
      positiveMarks: body.positiveMarks ?? 4.0,
      negativeMarks: body.negativeMarks ?? 1.0,
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
