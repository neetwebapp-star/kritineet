import { NextRequest, NextResponse } from 'next/server';
import { AITutorEngine } from '@/lib/ai/ai-tutor-engine';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, selectedOption, mistakeType, userId: bodyUserId } = body;

    const user = await resolveUser(req, bodyUserId);

    const response = await AITutorEngine.processRequest({
      userId: user.id,
      query: `Analyze my mistake on this question. I selected ${selectedOption || 'an incorrect option'}, which was flagged as ${mistakeType || 'an error'}.`,
      explicitMode: 'MISTAKE_ANALYSIS',
      questionId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
