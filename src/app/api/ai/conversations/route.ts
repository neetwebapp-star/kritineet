import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const conversations = await prisma.tutorConversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, role: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, mode, subject, questionId, conceptId } = body;
    const user = await resolveUser(req);

    const conv = await prisma.tutorConversation.create({
      data: {
        userId: user.id,
        title: title || 'New Tutoring Session',
        activeMode: mode || 'ASK_DOUBT',
        subject: subject || 'GENERAL',
        questionId,
        conceptId,
      },
    });

    return NextResponse.json({ conversation: conv });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
