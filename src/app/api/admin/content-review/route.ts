import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const reviewType = searchParams.get('reviewType') || undefined;
    const severity = searchParams.get('severity') || undefined;

    const reviews = await prisma.contentReview.findMany({
      where: {
        status: status ? status : undefined,
        reviewType: reviewType ? reviewType : undefined,
        severity: severity ? severity : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      reviews,
      count: reviews.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch review items' }, { status: 500 });
  }
}
