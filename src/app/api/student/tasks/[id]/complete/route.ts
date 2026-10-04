import { NextRequest, NextResponse } from 'next/server';
import { StudySessionEngine } from '@/lib/study-os/study-session-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId, sessionId, actualMinutes, notes } = body;

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'userId and sessionId are required' }, { status: 400 });
    }

    const session = await StudySessionEngine.completeSession({
      sessionId,
      userId,
      actualMinutes,
      completionNotes: notes,
    });

    return NextResponse.json({ success: true, session, taskId: id, action: 'COMPLETED' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to complete task' }, { status: 500 });
  }
}
