import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { RelationshipEngine } from '@/lib/command-center/relationship-engine';
import { ReportingEngine } from '@/lib/command-center/reporting-engine';
import { RbacEngine } from '@/lib/command-center/rbac-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'PARENT');

    if (actor.role !== 'PARENT' && actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Parent access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetStudentId = searchParams.get('studentId');

    const linkedStudents = await RelationshipEngine.getLinkedStudents(actor.id);

    if (linkedStudents.length === 0) {
      return NextResponse.json({
        parent: { id: actor.id, name: actor.name, email: actor.email },
        linkedCount: 0,
        message: 'No student accounts currently linked. Enter a student invitation token to link.',
        students: [],
      });
    }

    // If specific studentId requested, verify relationship
    const studentToView = targetStudentId
      ? linkedStudents.find(s => s.id === targetStudentId)
      : linkedStudents[0];

    if (!studentToView) {
      return NextResponse.json({ error: 'Unauthorized: Student is not actively linked to your account' }, { status: 403 });
    }

    // Generate report and sanitize via Parent Visibility Policy
    const rawReport = await ReportingEngine.generateReport(studentToView.id);
    const parentSafeReport = RbacEngine.filterDataForParent(rawReport);

    // Fetch parent-visible notes
    const parentNotes = await prisma.mentorNote.findMany({
      where: {
        studentId: studentToView.id,
        visibility: 'PARENT_VISIBLE',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({
      parent: { id: actor.id, name: actor.name, email: actor.email },
      linkedStudents: linkedStudents.map(s => ({ id: s.id, name: s.name, email: s.email })),
      activeStudent: {
        id: studentToView.id,
        name: studentToView.name,
      },
      report: parentSafeReport,
      mentorNotes: parentNotes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
