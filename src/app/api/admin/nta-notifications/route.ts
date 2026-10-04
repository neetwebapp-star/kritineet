import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const notifications = await prisma.officialNotification.findMany({
      include: {
        source: true,
        document: true,
        impacts: true,
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    const sources = await prisma.officialSource.findMany();

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
      sources,
    });
  } catch (error: any) {
    console.error('Error in admin notifications list:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
