import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { AlertEngine } from '@/lib/command-center/alert-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');

    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN' && actor.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const alerts = await prisma.alert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    const body = await req.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 });
    }

    const resolved = await AlertEngine.resolveAlert(alertId, actor.id);
    return NextResponse.json({ success: true, alert: resolved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
