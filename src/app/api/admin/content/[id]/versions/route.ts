import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { LifecycleEngine } from '@/lib/content-lifecycle/lifecycle-engine';

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
    const versions = await LifecycleEngine.getVersionHistory(id);

    return NextResponse.json({
      contentId: id,
      versions,
      count: versions.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch version history' }, { status: 500 });
  }
}
