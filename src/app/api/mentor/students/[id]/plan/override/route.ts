import { NextRequest, NextResponse } from 'next/server';
import { AdaptiveReplanner } from '@/lib/study-os/adaptive-replanner';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const body = await req.json();
    const { mentorId, date, reason, adjustedCapacityMinutes, additionalFocusSubject, note } = body;

    if (!mentorId || !reason) {
      return NextResponse.json({ error: 'mentorId and reason are required' }, { status: 400 });
    }

    const planDate = date || new Date().toISOString().split('T')[0];

    const result = await AdaptiveReplanner.executeReplan({
      userId: studentId,
      date: planDate,
      checkpoint: 'MENTOR_TRIGGERED',
      adjustedCapacityMinutes,
      additionalFocusSubject,
      triggerEventDescription: reason,
      mentorUserId: mentorId,
      mentorNote: note,
    });

    return NextResponse.json({
      studentId,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Mentor plan override failed' }, { status: 500 });
  }
}
