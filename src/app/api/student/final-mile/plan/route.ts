import { NextRequest, NextResponse } from 'next/server';
import { FinalRevisionScopeEngine } from '@/lib/final-mile/final-revision-scope-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'student_demo';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const plan = await FinalRevisionScopeEngine.generateFinalRevisionPlan(userId, date);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error('Error fetching final revision plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, blockId, userId = 'student_demo', freezeRules } = body;

    if (action === 'COMPLETE_BLOCK' && blockId) {
      const updated = await FinalRevisionScopeEngine.completeRevisionBlock(blockId);
      return NextResponse.json({ success: true, block: updated });
    }

    if (action === 'ACTIVATE_FREEZE') {
      const updatedPlan = await FinalRevisionScopeEngine.activateRevisionFreeze(userId, freezeRules);
      return NextResponse.json({ success: true, plan: updatedPlan });
    }

    return NextResponse.json({ success: false, error: 'Invalid plan action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating final revision plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
