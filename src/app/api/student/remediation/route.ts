import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ConceptRemediationEngine } from '@/lib/intelligence/concept-remediation-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conceptId = searchParams.get('conceptId');

    if (!conceptId) {
      return NextResponse.json({ error: 'conceptId parameter is required' }, { status: 400 });
    }

    const remediation = await ConceptRemediationEngine.getRemediationPackage(student.id, conceptId);
    return NextResponse.json(remediation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const body = await req.json();
    const { conceptId, questionId, isCorrect, timeSpentSeconds } = body;

    if (!conceptId || !questionId || isCorrect === undefined) {
      return NextResponse.json({ error: 'conceptId, questionId, and isCorrect are required' }, { status: 400 });
    }

    const result = await ConceptRemediationEngine.submitRemediationStep(
      student.id,
      conceptId,
      questionId,
      isCorrect,
      timeSpentSeconds || 45
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
