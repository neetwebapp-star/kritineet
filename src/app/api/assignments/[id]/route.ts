import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { AssignmentEngine } from '@/lib/command-center/assignment-engine';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const actor = await resolveActor(req);
    const body = await req.json();

    const { action } = body;

    if (action === 'MARK_COMPLETE') {
      const updated = await AssignmentEngine.markComplete(id, actor.id);
      return NextResponse.json({ success: true, progress: updated });
    }

    // Mentor / Admin direct update
    if (actor.role === 'MENTOR' || actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN') {
      const updated = await prisma.assignmentProgress.update({
        where: { id },
        data: {
          status: body.status || undefined,
          score: body.score !== undefined ? parseFloat(body.score) : undefined,
        },
      });
      return NextResponse.json({ success: true, progress: updated });
    }

    return NextResponse.json({ error: 'Unsupported action or unauthorized' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const actor = await resolveActor(req, 'MENTOR');

    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.creatorId !== actor.id && actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to delete this assignment' }, { status: 403 });
    }

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
