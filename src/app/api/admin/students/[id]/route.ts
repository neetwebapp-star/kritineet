import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { RbacEngine } from '@/lib/command-center/rbac-engine';
import { ReportingEngine } from '@/lib/command-center/reporting-engine';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const actor = await resolveActor(req, 'ADMIN');

    if (!RbacEngine.hasPermission(actor.role, 'STUDENT_VIEW') || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin permissions required.' }, { status: 403 });
    }

    const report = await ReportingEngine.generateReport(id);

    // Fetch notes and relationships
    const [notes, mentors, parents, alerts, auditLogs] = await Promise.all([
      prisma.mentorNote.findMany({
        where: { studentId: id },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, role: true } } },
      }),
      prisma.mentorStudentAssignment.findMany({
        where: { studentId: id, status: 'ACTIVE' },
        include: { mentor: { select: { id: true, name: true, email: true } } },
      }),
      prisma.parentStudentRelationship.findMany({
        where: { studentId: id, status: 'ACTIVE' },
        include: { parent: { select: { id: true, name: true, email: true } } },
      }),
      prisma.alert.findMany({
        where: { studentId: id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        where: { entityId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      report,
      notes,
      mentors: mentors.map(m => m.mentor),
      parents: parents.map(p => p.parent),
      alerts,
      auditLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
