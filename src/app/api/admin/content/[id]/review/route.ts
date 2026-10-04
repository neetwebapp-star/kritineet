import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { ReviewWorkflowService } from '@/lib/content-lifecycle/review-workflow-service';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const review = await prisma.contentReview.create({
      data: {
        contentId: id,
        contentType: body.contentType || 'QUESTION',
        reviewType: body.reviewType || 'SOURCE',
        severity: body.severity || 'MEDIUM',
        status: 'OPEN',
        evidenceJson: body.evidence ? JSON.stringify(body.evidence) : null,
        reviewNotes: body.notes || 'Manual review triggered by administrator.',
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create review item' }, { status: 500 });
  }
}
