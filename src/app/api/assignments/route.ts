import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { AssignmentEngine } from '@/lib/command-center/assignment-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req);

    if (actor.role === 'STUDENT') {
      const assignments = await AssignmentEngine.getStudentAssignments(actor.id);
      return NextResponse.json({ assignments });
    }

    // Mentor / Admin view
    const where = actor.role === 'MENTOR' ? { creatorId: actor.id } : {};
    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        progressList: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'MENTOR');
    const body = await req.json();

    const {
      title,
      description,
      type,
      subject,
      chapterId,
      conceptId,
      testId,
      targetCount,
      dueDate,
      targetStudentIds,
    } = body;

    if (!title || !type || !targetStudentIds || !Array.isArray(targetStudentIds) || targetStudentIds.length === 0) {
      return NextResponse.json({ error: 'Title, type, and targetStudentIds array are required' }, { status: 400 });
    }

    const assignment = await AssignmentEngine.createAssignment({
      creatorId: actor.id,
      title,
      description,
      type,
      subject,
      chapterId,
      conceptId,
      testId,
      targetCount: targetCount ? parseInt(targetCount, 10) : 10,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      targetStudentIds,
    });

    return NextResponse.json({ assignment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
