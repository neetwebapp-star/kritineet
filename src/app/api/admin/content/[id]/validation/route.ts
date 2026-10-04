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
    const validations = await prisma.scientificValidationRecord.findMany({
      where: { contentId: id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      contentId: id,
      validations,
      count: validations.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch validations' }, { status: 500 });
  }
}
