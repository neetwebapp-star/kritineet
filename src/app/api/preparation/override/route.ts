import { NextRequest, NextResponse } from 'next/server';
import { PreparationPlanner } from '@/lib/preparation/preparation-planner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, mentorId, studentId, reason, affectedDates, adjustmentDetails } = body;

    if (!planId || !mentorId || !studentId || !reason || !affectedDates) {
      return NextResponse.json({ error: 'Missing required parameters for mentor plan override' }, { status: 400 });
    }

    const override = await PreparationPlanner.applyMentorOverride({
      planId,
      mentorId,
      studentId,
      reason,
      affectedDates,
      adjustmentDetails: adjustmentDetails || {},
    });

    return NextResponse.json({ success: true, override });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to apply mentor override' }, { status: 500 });
  }
}
