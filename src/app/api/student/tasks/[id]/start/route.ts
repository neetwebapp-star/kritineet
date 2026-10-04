import { NextRequest, NextResponse } from 'next/server';
import { StudySessionEngine } from '@/lib/study-os/study-session-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId, timerPreset } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const session = await StudySessionEngine.startSession({
      userId,
      taskId: id,
      timerPreset,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      session,
      action: 'STARTED',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to start task' }, { status: 500 });
  }
}
