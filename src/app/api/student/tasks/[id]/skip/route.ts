import { NextRequest, NextResponse } from 'next/server';
import { AdaptiveReplanner } from '@/lib/study-os/adaptive-replanner';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await AdaptiveReplanner.skipOptionalTask(id, userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to skip task' }, { status: 500 });
  }
}
