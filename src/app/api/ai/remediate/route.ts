import { NextRequest, NextResponse } from 'next/server';
import { AITutorEngine } from '@/lib/ai/ai-tutor-engine';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conceptId, userId: bodyUserId } = body;

    const user = await resolveUser(req, bodyUserId);

    const response = await AITutorEngine.processRequest({
      userId: user.id,
      query: `Coach me on my weak concepts and create a remediation plan.`,
      explicitMode: 'WEAKNESS_COACH',
      conceptId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
