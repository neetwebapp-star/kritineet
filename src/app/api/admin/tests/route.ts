import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MockTestGenerator } from '@/lib/exam/mock-test-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testType = searchParams.get('testType');
    const isPublished = searchParams.get('isPublished');

    const where: any = {};
    if (testType) where.testType = testType;
    if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const tests = await prisma.test.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        examPattern: true,
        _count: {
          select: {
            testQuestions: true,
            attempts: true,
          },
        },
        attempts: {
          where: { status: 'SUBMITTED' },
          select: {
            totalScore: true,
            accuracy: true,
          },
        },
      },
    });

    const formatted = tests.map((t) => {
      const submittedAttempts = t.attempts;
      const avgScore = submittedAttempts.length > 0
        ? Number((submittedAttempts.reduce((acc, a) => acc + a.totalScore, 0) / submittedAttempts.length).toFixed(1))
        : 0;
      const avgAccuracy = submittedAttempts.length > 0
        ? Number((submittedAttempts.reduce((acc, a) => acc + a.accuracy, 0) / submittedAttempts.length).toFixed(1))
        : 0;

      return {
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
        isPublished: t.isPublished,
        version: t.version,
        examName: t.examPattern?.examName || 'NEET UG',
        examYear: t.examPattern?.examYear || 2027,
        questionCount: t._count.testQuestions,
        totalAttempts: t._count.attempts,
        submittedAttemptsCount: submittedAttempts.length,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      count: formatted.length,
      tests: formatted,
    });
  } catch (error: any) {
    console.error('Error in admin tests GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await MockTestGenerator.generateMock(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error generating test in admin:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
