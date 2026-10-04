import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);

    // Total published notifications
    const totalPublished = await prisma.officialNotification.count({
      where: {
        status: 'PUBLISHED',
        isNeetRelevant: true,
      },
    });

    // Notifications already read by this student
    const readCount = await prisma.officialNotificationReadState.count({
      where: {
        userId: user.id,
        notification: {
          status: 'PUBLISHED',
          isNeetRelevant: true,
        },
      },
    });

    const unreadCount = Math.max(0, totalPublished - readCount);

    // Get latest published notification date
    const latestNotice = await prisma.officialNotification.findFirst({
      where: { status: 'PUBLISHED', isNeetRelevant: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        alertLevel: true,
        authority: true,
      },
    });

    return NextResponse.json({
      success: true,
      unreadCount,
      totalCount: totalPublished,
      latestNotice,
    });
  } catch (error: any) {
    console.error('Error fetching unread notification count:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
