import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { StudentBaselineEngine } from '@/lib/assessment/student-baseline-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');

    if (!userId) {
      const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
      });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'No student found' }, { status: 404 });
    }

    // Refresh or get baseline
    const baseline = await StudentBaselineEngine.calculateAndSaveBaseline(userId);

    // Get recent responses with pacing classification
    const recentResponses = await prisma.studentResponse.findMany({
      where: {
        examAttempt: {
          userId,
        },
      },
      take: 20,
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            difficulty: true,
            subject: { select: { name: true, code: true } },
          },
        },
      },
    });

    const parsedBaseline = {
      ...baseline,
      subjectAccuracy: baseline.subjectAccuracyJson ? JSON.parse(baseline.subjectAccuracyJson) : {},
      chapterAccuracy: baseline.chapterAccuracyJson ? JSON.parse(baseline.chapterAccuracyJson) : {},
      difficultyBandAccuracy: baseline.difficultyBandAccuracyJson ? JSON.parse(baseline.difficultyBandAccuracyJson) : {},
      questionTypeAccuracy: baseline.questionTypeAccuracyJson ? JSON.parse(baseline.questionTypeAccuracyJson) : {},
    };

    return NextResponse.json({
      baseline: parsedBaseline,
      recentResponses: recentResponses.map(r => ({
        id: r.id,
        questionId: r.questionId,
        subject: r.question.subject.name,
        difficulty: r.question.difficulty,
        isCorrect: r.isCorrect,
        timeSpentSeconds: r.timeSpentSeconds,
        pacingEvaluation: StudentBaselineEngine.evaluateResponseSpeed(
          r.timeSpentSeconds,
          baseline.medianResponseTime
        ),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch student assessment insights' }, { status: 500 });
  }
}
