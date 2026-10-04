import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const dependencies = await prisma.contentDependency.findMany({
      where: { upstreamId: id },
    });

    return NextResponse.json({
      contentId: id,
      dependencies,
      count: dependencies.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content dependencies' }, { status: 500 });
  }
}
