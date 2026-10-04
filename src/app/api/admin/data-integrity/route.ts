import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { DataIntegrityService } from '@/lib/production/data-integrity-service';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const report = await DataIntegrityService.runFullAudit();
    return NextResponse.json(report, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Data integrity audit failed' }, { status: 500 });
  }
}
