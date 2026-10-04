import { NextRequest, NextResponse } from 'next/server';
import { StudySessionEngine } from '@/lib/study-os/study-session-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId, sessionId } = body;

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'userId and sessionId are required' }, { status: 400 });
    }

    const session = await StudySessionEngine.resumeSession(sessionId, userId);
    return NextResponse.json({ success: true, session, taskId: id, action: 'RESUMED' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to resume task' }, { status: 500 });
  }
}
