import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveUser(req);
    const { id } = await params;

    const notification = await prisma.officialNotification.findUnique({
      where: { id },
      include: {
        source: true,
        document: {
          include: {
            versions: { orderBy: { versionNumber: 'desc' } },
          },
        },
        versions: { orderBy: { versionNumber: 'desc' } },
        impacts: true,
        readStates: {
          where: { userId: user.id },
        },
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Official notification not found' }, { status: 404 });
    }

    let facts = null;
    try {
      facts = notification.officialFactExtractJson
        ? JSON.parse(notification.officialFactExtractJson)
        : null;
    } catch (e) {}

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        isRead: notification.readStates.length > 0,
        facts,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notification detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
