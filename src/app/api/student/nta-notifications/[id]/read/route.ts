import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveUser(req);
    const { id } = await params;

    const readState = await prisma.officialNotificationReadState.upsert({
      where: {
        userId_notificationId: {
          userId: user.id,
          notificationId: id,
        },
      },
      create: {
        userId: user.id,
        notificationId: id,
      },
      update: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      readState,
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
