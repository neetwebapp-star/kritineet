import { NextRequest, NextResponse } from 'next/server';
import { QuestionLifecycleEngine } from '@/lib/assessment/question-lifecycle-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, reason, adminUserId, permanent } = body;

    if (!questionId || !reason || !adminUserId) {
      return NextResponse.json({ error: 'questionId, reason, and adminUserId are required' }, { status: 400 });
    }

    const question = await QuestionLifecycleEngine.suppressQuestion(questionId, reason, adminUserId, !!permanent);
    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to suppress question' }, { status: 500 });
  }
}
