import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { GoalEngine } from '@/lib/command-center/goal-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || actor.id;

    const goals = await GoalEngine.getGoals(targetUserId);
    return NextResponse.json({ goals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor(req);
    const body = await req.json();

    const { title, metricType, target, period, endDate, targetUserId } = body;

    if (!title || !metricType || !target || !endDate) {
      return NextResponse.json({ error: 'Title, metricType, target, and endDate are required' }, { status: 400 });
    }

    const goal = await GoalEngine.createGoal({
      userId: targetUserId || actor.id,
      title,
      metricType,
      target: parseFloat(target),
      period: period || 'WEEKLY',
      endDate: new Date(endDate),
    });

    return NextResponse.json({ goal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
