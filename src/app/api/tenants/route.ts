import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { TenantEngine } from '@/lib/saas/tenant-engine';
import { PlanEngine } from '@/lib/saas/billing/plan-engine';
import { SubscriptionEngine } from '@/lib/saas/billing/subscription-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const organizations = await TenantEngine.listOrganizations();
    return NextResponse.json({ organizations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const tenant = await TenantEngine.createTenant({
      name: body.name,
      type: body.type || 'COACHING',
      adminUserId: actor.id,
      planId: body.planId,
    });

    // Start 14-day trial for new organization
    await SubscriptionEngine.startTrial(tenant.id, 'INSTITUTE', 14);

    return NextResponse.json({
      success: true,
      tenant,
      message: 'Organization created successfully with active 14-day trial',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
