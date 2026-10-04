import { NextRequest, NextResponse } from 'next/server';
import { QuestionLifecycleEngine } from '@/lib/assessment/question-lifecycle-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, reason, adminUserId } = body;

    if (!questionId || !reason || !adminUserId) {
      return NextResponse.json({ error: 'questionId, reason, and adminUserId are required' }, { status: 400 });
    }

    const question = await QuestionLifecycleEngine.restoreQuestion(questionId, reason, adminUserId);
    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to restore question' }, { status: 500 });
  }
}
