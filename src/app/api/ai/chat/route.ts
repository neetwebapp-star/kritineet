import { NextRequest, NextResponse } from 'next/server';
import { AITutorEngine } from '@/lib/ai/ai-tutor-engine';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query,
      conversationId,
      mode,
      questionId,
      conceptId,
      socraticStage,
      bypassSocratic,
      userId: bodyUserId,
    } = body;

    if (!query && !questionId) {
      return NextResponse.json({ error: 'Query or questionId is required' }, { status: 400 });
    }

    const user = await resolveUser(req, bodyUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = await AITutorEngine.processRequest({
      userId: user.id,
      query: query || 'Explain this question and solve step by step',
      conversationId,
      explicitMode: mode,
      questionId,
      conceptId,
      socraticStage,
      bypassSocratic,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API /api/ai/chat] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
