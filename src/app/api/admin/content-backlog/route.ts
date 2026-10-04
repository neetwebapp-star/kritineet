import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const priority = searchParams.get('priority') || undefined;
    const type = searchParams.get('type') || undefined;

    const items = await prisma.contentBacklogItem.findMany({
      where: {
        priority: priority ? priority : undefined,
        type: type ? type : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      backlog: items,
      count: items.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content backlog' }, { status: 500 });
  }
}
