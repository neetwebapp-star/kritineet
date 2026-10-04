import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReviewsAndAnalyticsService } from '@/lib/study-os/reviews-and-analytics-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const weekStartDate = searchParams.get('weekStartDate') || new Date().toISOString().split('T')[0];

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const weekEndDate = end.toISOString().split('T')[0];

    const review = await ReviewsAndAnalyticsService.generateWeeklyReview(userId, weekStartDate, weekEndDate);

    return NextResponse.json({
      review: {
        ...review,
        improvedConcepts: review.improvedConceptsJson ? JSON.parse(review.improvedConceptsJson) : [],
        declinedConcepts: review.declinedConceptsJson ? JSON.parse(review.declinedConceptsJson) : [],
        attentionConcepts: review.attentionConceptsJson ? JSON.parse(review.attentionConceptsJson) : [],
        mockSummary: review.mockSummaryJson ? JSON.parse(review.mockSummaryJson) : {},
        nextWeekPriorities: review.nextWeekPrioritiesJson ? JSON.parse(review.nextWeekPrioritiesJson) : [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch weekly review' }, { status: 500 });
  }
}
