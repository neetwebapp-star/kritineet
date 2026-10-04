import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { DiagnosticEngine } from '@/lib/saas/diagnostic-engine';

export async function GET() {
  try {
    const questions = await DiagnosticEngine.getDiagnosticQuestions();
    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'STUDENT');
    const body = await req.json();
    const { answers, preferences } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers array is required' }, { status: 400 });
    }

    const result = await DiagnosticEngine.evaluateDiagnostic(actor.id, answers, preferences);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
