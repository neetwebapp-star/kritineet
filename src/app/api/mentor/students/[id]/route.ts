import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeStudentAccess } from '@/lib/command-center/auth-utils';
import { ReportingEngine } from '@/lib/command-center/reporting-engine';
import { AlertEngine } from '@/lib/command-center/alert-engine';
import { AssignmentEngine } from '@/lib/command-center/assignment-engine';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const auth = await authorizeStudentAccess(req, id, 'STUDENT_VIEW');

    if (!auth.allowed) {
      return NextResponse.json({ error: auth.reason || 'Forbidden' }, { status: 403 });
    }

    const [report, alerts, assignments, notes] = await Promise.all([
      ReportingEngine.generateReport(id),
      AlertEngine.getActiveAlerts(id),
      AssignmentEngine.getStudentAssignments(id),
      prisma.mentorNote.findMany({
        where: {
          studentId: id,
          OR: [
            { authorId: auth.actor.id },
            { visibility: { in: ['STUDENT_VISIBLE', 'PARENT_VISIBLE'] } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, role: true } } },
      }),
    ]);

    return NextResponse.json({
      report,
      alerts,
      assignments,
      notes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
