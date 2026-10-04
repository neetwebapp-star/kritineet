import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SpacedRevisionEngine } from '@/lib/intelligence/revision-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const revisionSet = await SpacedRevisionEngine.getTodaysRevisionSet(student.id, limit);
    const summary = await SpacedRevisionEngine.getRevisionSummary(student.id);

    return NextResponse.json({
      summary,
      count: revisionSet.length,
      questions: revisionSet,
    });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, qualityScore } = body; // 0 to 5

    if (!questionId || qualityScore === undefined) {
      return NextResponse.json({ error: 'questionId and qualityScore are required' }, { status: 400 });
    }

    const updated = await SpacedRevisionEngine.updateRevisionItem(student.id, questionId, qualityScore);
    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
