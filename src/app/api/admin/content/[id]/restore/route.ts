import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { LifecycleEngine } from '@/lib/content-lifecycle/lifecycle-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // Restore to REVIEW_REQUIRED for revalidation
    const result = await LifecycleEngine.transitionStatus(id, 'REVIEW_REQUIRED', body.reason || 'Restored from retired state', actor.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to restore content' }, { status: 500 });
  }
}
