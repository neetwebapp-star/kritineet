import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReviewsAndAnalyticsService } from '@/lib/study-os/reviews-and-analytics-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const monthKey = searchParams.get('monthKey') || new Date().toISOString().substring(0, 7); // e.g. "2026-09"

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const review = await ReviewsAndAnalyticsService.generateMonthlyReview(userId, monthKey);

    return NextResponse.json({
      review: {
        ...review,
        mockScores: review.mockScoresJson ? JSON.parse(review.mockScoresJson) : [],
        comparisonWithPreviousMonth: review.comparisonWithPreviousMonthJson ? JSON.parse(review.comparisonWithPreviousMonthJson) : {},
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch monthly review' }, { status: 500 });
  }
}
