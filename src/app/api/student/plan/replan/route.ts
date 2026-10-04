import { NextRequest, NextResponse } from 'next/server';
import { AdaptiveReplanner, ReplanningCheckpoint } from '@/lib/study-os/adaptive-replanner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, checkpoint, adjustedCapacityMinutes, additionalFocusSubject, triggerEventDescription } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: 'userId and date are required' }, { status: 400 });
    }

    const result = await AdaptiveReplanner.executeReplan({
      userId,
      date,
      checkpoint: (checkpoint as ReplanningCheckpoint) || 'STUDENT_REQUESTED',
      adjustedCapacityMinutes,
      additionalFocusSubject,
      triggerEventDescription,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Adaptive replan failed' }, { status: 500 });
  }
}
