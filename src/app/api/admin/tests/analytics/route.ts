import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const [totalTests, publishedTests, draftTests, totalAttempts, submittedAttempts] = await Promise.all([
      prisma.test.count(),
      prisma.test.count({ where: { isPublished: true } }),
      prisma.test.count({ where: { isPublished: false } }),
      prisma.examAttempt.count(),
      prisma.examAttempt.findMany({
        where: { status: 'SUBMITTED' },
        select: {
          totalScore: true,
          accuracy: true,
          durationSeconds: true,
          test: {
            select: {
              testType: true,
              totalMarks: true,
            },
          },
        },
      }),
    ]);

    const avgScore = submittedAttempts.length > 0
      ? Number((submittedAttempts.reduce((acc, a) => acc + a.totalScore, 0) / submittedAttempts.length).toFixed(1))
      : 0;

    const avgAccuracy = submittedAttempts.length > 0
      ? Number((submittedAttempts.reduce((acc, a) => acc + a.accuracy, 0) / submittedAttempts.length).toFixed(1))
      : 0;

    const avgTimeMinutes = submittedAttempts.length > 0
      ? Number((submittedAttempts.reduce((acc, a) => acc + (a.durationSeconds || 0), 0) / (submittedAttempts.length * 60)).toFixed(1))
      : 0;

    // Group by test type
    const testsByType = await prisma.test.groupBy({
      by: ['testType'],
      _count: { id: true },
    });

    const activePatterns = await prisma.examPattern.findMany({
      where: { active: true },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalTests,
        publishedTests,
        draftTests,
        totalAttempts,
        submittedAttemptsCount: submittedAttempts.length,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
        averageTimeMinutes: avgTimeMinutes,
        testsByType: testsByType.map((t) => ({
          testType: t.testType,
          count: t._count.id,
        })),
        activePatterns: activePatterns.map((p) => ({
          id: p.id,
          name: p.examName,
          year: p.examYear,
          totalQuestions: p.totalQuestions,
          totalMarks: p.totalMarks,
          durationMinutes: p.durationMinutes,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin test analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
