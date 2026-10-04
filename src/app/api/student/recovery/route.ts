import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecoveryPlanner } from '@/lib/study-os/recovery-planner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { userId, missedPlanDate, maxExtraMinutesPerDay, recoveryDaysSpan } = body;

    if (!userId) {
      const student = await prisma.user.findUnique({
        where: { email: 'student@neet2027.com' },
      });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student session required' }, { status: 401 });
    }

    if (!missedPlanDate) {
      // Default to yesterday
      const d = new Date();
      d.setDate(d.getDate() - 1);
      missedPlanDate = d.toISOString().split('T')[0];
    }

    const result = await RecoveryPlanner.planRecovery({
      userId,
      missedPlanDate,
      maxExtraMinutesPerDay: maxExtraMinutesPerDay || 45,
      recoveryDaysSpan: recoveryDaysSpan || 4,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to calculate recovery plan' }, { status: 500 });
  }
}
