import { NextRequest, NextResponse } from 'next/server';
import { AITutorEngine } from '@/lib/ai/ai-tutor-engine';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, conceptId, subject, userId: bodyUserId } = body;

    const user = await resolveUser(req, bodyUserId);

    const response = await AITutorEngine.processRequest({
      userId: user.id,
      query: `Generate a quiz test question on ${topic || subject || 'NEET syllabus'}`,
      explicitMode: 'QUIZ_ME',
      conceptId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
