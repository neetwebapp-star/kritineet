import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { ReviewWorkflowService } from '@/lib/content-lifecycle/review-workflow-service';

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

    if (!body.correctedContent || !body.reason) {
      return NextResponse.json({ error: 'correctedContent and reason are required' }, { status: 400 });
    }

    const result = await ReviewWorkflowService.correctContent({
      reviewId: id,
      correctedContent: body.correctedContent,
      reason: body.reason,
      correctedBy: actor.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to correct content' }, { status: 500 });
  }
}
