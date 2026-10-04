import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
      include: { profile: true },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    // Fetch attempt events for this student
    const attempts = await prisma.attemptEvent.findMany({
      where: { userId: student.id },
      orderBy: { answeredAt: 'asc' },
    });

    const totalAttempts = attempts.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? Number(((correctCount / totalAttempts) * 100).toFixed(1)) : 0;

    // Difficulty breakdown
    const difficultyMap: Record<string, { total: number; correct: number }> = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
    };

    // Mistake type distribution
    const mistakeTypeMap: Record<string, number> = {};

    let totalSeconds = 0;
    for (const a of attempts) {
      totalSeconds += a.timeSpentSeconds;
      const diff = a.difficulty || 'MEDIUM';
      if (difficultyMap[diff]) {
        difficultyMap[diff].total += 1;
        if (a.isCorrect) difficultyMap[diff].correct += 1;
      }
      if (!a.isCorrect && a.mistakeType) {
        mistakeTypeMap[a.mistakeType] = (mistakeTypeMap[a.mistakeType] || 0) + 1;
      }
    }

    const avgResponseTime = totalAttempts > 0 ? Number((totalSeconds / totalAttempts).toFixed(1)) : 0;

    // Daily accuracy grouping
    const dailyMap = new Map<string, { date: string; attempts: number; correct: number }>();
    for (const a of attempts) {
      const dateKey = a.answeredAt.toISOString().split('T')[0];
      const entry = dailyMap.get(dateKey) || { date: dateKey, attempts: 0, correct: 0 };
      entry.attempts += 1;
      if (a.isCorrect) entry.correct += 1;
      dailyMap.set(dateKey, entry);
    }

    const dailyTrend = Array.from(dailyMap.values()).map((d) => ({
      date: d.date,
      attempts: d.attempts,
      accuracy: Math.round((d.correct / d.attempts) * 100),
    }));

    return NextResponse.json({
      hasData: totalAttempts > 0,
      totalAttempts,
      correctCount,
      accuracy,
      avgResponseTime,
      streak: student.profile?.currentStreak || 0,
      difficultyBreakdown: {
        easy: {
          ...difficultyMap.EASY,
          accuracy: difficultyMap.EASY.total > 0 ? Math.round((difficultyMap.EASY.correct / difficultyMap.EASY.total) * 100) : 0,
        },
        medium: {
          ...difficultyMap.MEDIUM,
          accuracy: difficultyMap.MEDIUM.total > 0 ? Math.round((difficultyMap.MEDIUM.correct / difficultyMap.MEDIUM.total) * 100) : 0,
        },
        hard: {
          ...difficultyMap.HARD,
          accuracy: difficultyMap.HARD.total > 0 ? Math.round((difficultyMap.HARD.correct / difficultyMap.HARD.total) * 100) : 0,
        },
      },
      mistakeDistribution: mistakeTypeMap,
      dailyTrend,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
