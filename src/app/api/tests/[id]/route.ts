import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        examPattern: true,
        blueprint: true,
        _count: { select: { testQuestions: true, attempts: true } },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: test.id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      durationMinutes: test.durationMinutes,
      totalQuestions: test.totalQuestions,
      totalMarks: test.totalMarks,
      positiveMarks: test.positiveMarks,
      negativeMarks: test.negativeMarks,
      version: test.version,
      mode: test.mode,
      instructions: test.examPattern?.instructions || null,
      examPattern: test.examPattern
        ? {
            name: test.examPattern.examName,
            year: test.examPattern.examYear,
            subjectConfiguration: JSON.parse(test.examPattern.subjectConfiguration),
          }
        : null,
      attemptsCount: test._count.attempts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
