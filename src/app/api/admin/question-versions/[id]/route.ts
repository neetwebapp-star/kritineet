import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuestionLifecycleEngine } from '@/lib/assessment/question-lifecycle-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versions = await prisma.questionVersion.findMany({
      where: { questionId: id },
      orderBy: { versionNumber: 'desc' },
    });

    return NextResponse.json({ questionId: id, versions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch question versions' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { changes, adminUserId, reason } = body;

    if (!changes || !adminUserId || !reason) {
      return NextResponse.json({ error: 'changes, adminUserId, and reason are required' }, { status: 400 });
    }

    const version = await QuestionLifecycleEngine.createQuestionVersion({
      questionId: id,
      stem: changes.stem || changes.questionText || '',
      options: changes.options || [],
      correctAnswer: changes.correctAnswer || changes.correctOption || 'A',
      explanation: changes.explanation,
      sourceReference: changes.sourceReference,
      changeReason: reason,
      changedBy: adminUserId,
    });
    return NextResponse.json({ success: true, version });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create question version' }, { status: 500 });
  }
}
