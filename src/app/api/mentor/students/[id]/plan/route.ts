import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DailyPlanGenerator } from '@/lib/study-os/daily-plan-generator';
import { PreparationProfileService } from '@/lib/study-os/preparation-profile-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const [plan, profile, overrides] = await Promise.all([
      prisma.dailyStudyPlan.findFirst({
        where: { userId: studentId, date },
        include: {
          tasks: { orderBy: { orderIndex: 'asc' } },
          sessions: true,
        },
        orderBy: { planVersion: 'desc' },
      }).then(async (p) => {
        if (p) return p;
        return DailyPlanGenerator.generatePlan(studentId, date, {
          reason: 'DAILY_REFRESH',
          generatedBy: 'PLANNER_CRON',
        });
      }),
      PreparationProfileService.getOrCreateProfile(studentId),
      prisma.auditLog.findMany({
        where: {
          entityType: 'DailyStudyPlan',
          action: 'MENTOR_OVERRIDE_PLAN',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      studentId,
      date,
      plan,
      profile,
      recentOverrides: overrides,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch student plan for mentor' }, { status: 500 });
  }
}
