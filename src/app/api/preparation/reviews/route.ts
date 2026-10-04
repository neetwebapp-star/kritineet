import { NextRequest, NextResponse } from 'next/server';
import { ReviewEngine } from '@/lib/preparation/review-engine';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'cmuo5qiz5002xevh8l3g4ds60';
    const weekly = await ReviewEngine.getWeeklyReview(userId);
    const monthly = await ReviewEngine.getMonthlyReview(userId);

    return NextResponse.json({
      weekly,
      monthly,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch review data' }, { status: 500 });
  }
}
