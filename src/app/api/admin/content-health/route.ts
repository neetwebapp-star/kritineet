import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { ContentHealthAndBacklogService } from '@/lib/content-lifecycle/content-health-and-backlog-service';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const metrics = await ContentHealthAndBacklogService.getGlobalHealthMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content health' }, { status: 500 });
  }
}
