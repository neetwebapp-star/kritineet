import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuestionLifecycleEngine } from '@/lib/assessment/question-lifecycle-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId') || undefined;
    const status = searchParams.get('status') || undefined;
    const reviewType = searchParams.get('reviewType') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = {};
    if (questionId) where.questionId = questionId;
    if (status) where.status = status;
    if (reviewType) where.reviewType = reviewType;

    const [reviews, total] = await Promise.all([
      prisma.questionReview.findMany({
        where,
        include: {
          question: {
            select: {
              id: true,
              questionText: true,
              subject: { select: { name: true } },
              chapter: { select: { title: true } },
              correctOption: true,
              assessmentStatus: true,
            },
          },
          reviewer: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.questionReview.count({ where }),
    ]);

    return NextResponse.json({ reviews, total, limit, offset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch question reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'SUBMIT_DISPUTE') {
      const { questionId, reviewerId, notes, proposedAnswerKey, reason } = body;
      if (!questionId || !reviewerId) {
        return NextResponse.json({ error: 'questionId and reviewerId are required' }, { status: 400 });
      }

      const q = await prisma.question.findUnique({ where: { id: questionId }, select: { correctOption: true } });
      const review = await prisma.questionReview.create({
        data: {
          questionId,
          reviewerId,
          reviewType: 'ANSWER_KEY_DISPUTE',
          previousStatus: q?.correctOption || 'A',
          newStatus: proposedAnswerKey !== undefined ? String(proposedAnswerKey) : 'REVIEW',
          findings: notes || reason || 'Dispute submitted for review',
          decision: 'PENDING',
          actionTaken: 'Review submitted',
          auditNotes: notes || reason || null,
        },
      });

      // Update question status to REVIEW_REQUIRED if currently ACTIVE or MONITORED
      await prisma.question.updateMany({
        where: {
          id: questionId,
          assessmentStatus: { in: ['ACTIVE', 'MONITORED'] },
        },
        data: { assessmentStatus: 'REVIEW_REQUIRED' },
      });

      return NextResponse.json({ success: true, review });
    }

    if (action === 'RESOLVE_REVIEW') {
      const { reviewId, questionId, reviewerId, actionTaken, newCorrectOption, explanation, decisionNotes } = body;
      if (!questionId || !reviewerId || !actionTaken) {
        return NextResponse.json({ error: 'questionId, reviewerId, and actionTaken are required' }, { status: 400 });
      }

      const result = await QuestionLifecycleEngine.reviewAnswerKey({
        questionId,
        reviewerId,
        newCorrectOption: newCorrectOption || 'A',
        reason: decisionNotes || explanation || 'Admin review resolution',
        findings: explanation || decisionNotes || 'Reviewed',
      });

      if (reviewId) {
        await prisma.questionReview.update({
          where: { id: reviewId },
          data: {
            decision: actionTaken === 'MAINTAIN_KEY' ? 'REJECTED' : 'CORRECTED',
            actionTaken,
            auditNotes: decisionNotes || explanation || null,
          },
        });
      }

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
