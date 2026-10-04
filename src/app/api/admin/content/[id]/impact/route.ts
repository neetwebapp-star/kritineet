import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { DiffAndSourceEngine } from '@/lib/content-lifecycle/diff-and-source-engine';

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
    const report = await DiffAndSourceEngine.generateImpactReport(id, 'INSPECTION');

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate impact report' }, { status: 500 });
  }
}
