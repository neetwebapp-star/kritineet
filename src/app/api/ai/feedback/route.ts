import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, isHelpful, rating, reason, comments, userId: bodyUserId } = body;

    if (!messageId || typeof isHelpful !== 'boolean') {
      return NextResponse.json({ error: 'messageId and isHelpful are required' }, { status: 400 });
    }

    const user = await resolveUser(req, bodyUserId);

    const message = await prisma.tutorMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const feedback = await prisma.aIFeedback.create({
      data: {
        messageId,
        userId: user.id,
        isHelpful,
        rating: rating || (isHelpful ? 5 : 2),
        reason: reason || (isHelpful ? 'ACCURATE' : 'UNCLEAR'),
        comments: comments || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
