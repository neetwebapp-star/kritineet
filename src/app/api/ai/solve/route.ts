import { NextRequest, NextResponse } from 'next/server';
import { AITutorEngine } from '@/lib/ai/ai-tutor-engine';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, query, userId: bodyUserId } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const user = await resolveUser(req, bodyUserId);

    const response = await AITutorEngine.processRequest({
      userId: user.id,
      query: query || 'Provide a step-by-step solution for this question with governing laws and common traps',
      explicitMode: 'SOLVE_QUESTION',
      questionId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
