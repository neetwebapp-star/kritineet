import { NextRequest, NextResponse } from 'next/server';
import { AITutorEngine } from '@/lib/ai/ai-tutor-engine';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conceptName, conceptId, query, userId: bodyUserId } = body;

    const user = await resolveUser(req, bodyUserId);
    const searchQuery = query || `Explain NCERT concept ${conceptName || ''}`;

    const response = await AITutorEngine.processRequest({
      userId: user.id,
      query: searchQuery,
      explicitMode: 'EXPLAIN_CONCEPT',
      conceptId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
