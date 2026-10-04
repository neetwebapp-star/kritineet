import { NextResponse } from 'next/server';
import { PlanEngine } from '@/lib/saas/billing/plan-engine';

export async function GET() {
  try {
    let plans = await PlanEngine.getPlans();
    if (plans.length === 0) {
      await PlanEngine.seedDefaultPlans();
      plans = await PlanEngine.getPlans();
    }
    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
