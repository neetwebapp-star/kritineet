import { NextRequest, NextResponse } from 'next/server';
import { ReadinessEvaluator } from '@/lib/preparation/readiness-evaluator';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'cmuo5qiz5002xevh8l3g4ds60';
    const readiness = await ReadinessEvaluator.evaluateReadiness(userId);
    return NextResponse.json(readiness);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to evaluate readiness' }, { status: 500 });
  }
}
