import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { RelationshipEngine } from '@/lib/command-center/relationship-engine';
import { AlertEngine } from '@/lib/command-center/alert-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'MENTOR');

    if (actor.role !== 'MENTOR' && actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Mentor access required.' }, { status: 403 });
    }

    const assignedStudents = await RelationshipEngine.getAssignedStudents(actor.id);

    // Build "Needs Attention" digest for each student using real database alerts
    const studentDigests = await Promise.all(
      assignedStudents.map(async (student) => {
        const alerts = await AlertEngine.scanStudentAlerts(student.id);
        const needsAttention = alerts.length > 0;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          targetYear: student.profile?.targetExamYear || 2027,
          streakDays: student.profile?.currentStreak || 0,
          totalAttempted: student.profile?.totalAttempted || 0,
          accuracyRate: student.profile?.accuracyRate || 0.0,
          needsAttention,
          alertsCount: alerts.length,
          topAlert: alerts[0] || null,
        };
      })
    );

    return NextResponse.json({
      mentor: { id: actor.id, name: actor.name, email: actor.email },
      assignedCount: assignedStudents.length,
      studentsNeedingAttentionCount: studentDigests.filter(s => s.needsAttention).length,
      students: studentDigests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
