import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const body = await req.json();
    const { targetDailyMinutes, targetDate, applyToFuture = false } = body;

    // Validate target capacity: must be between 480 (8h) and 600 (10h)
    const capacity = Number(targetDailyMinutes) || 540;
    if (capacity < 420 || capacity > 600) {
      return NextResponse.json({
        error: 'Target daily minutes must be within 420 (7h) and 600 (10h) to preserve NEET 2027 completion invariants.',
      }, { status: 400 });
    }

    const effectiveDate = targetDate || '2026-10-05';

    if (applyToFuture) {
      // Update target preferences in DailyStudyPlan records for future dates
      const updatedCount = await prisma.dailyStudyPlan.updateMany({
        where: {
          userId: user.id,
          date: { gte: effectiveDate },
        },
        data: {
          // Adjust target while capping at 600
          plannedMinutes: capacity,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Updated capacity to ${capacity}m (${(capacity / 60).toFixed(1)}h) across ${updatedCount.count} days from ${effectiveDate}.`,
        targetDailyMinutes: capacity,
        daysUpdated: updatedCount.count,
      });
    } else {
      // Update just for effectiveDate
      const dayPlan = await prisma.dailyStudyPlan.findFirst({
        where: { userId: user.id, date: effectiveDate },
        include: { tasks: true },
      });

      if (!dayPlan) {
        return NextResponse.json({ error: `No plan found for ${effectiveDate}` }, { status: 404 });
      }

      await prisma.dailyStudyPlan.update({
        where: { id: dayPlan.id },
        data: { plannedMinutes: capacity },
      });

      return NextResponse.json({
        success: true,
        message: `Daily target adjusted to ${capacity}m (${(capacity / 60).toFixed(1)}h) for ${effectiveDate}.`,
        targetDailyMinutes: capacity,
        date: effectiveDate,
      });
    }
  } catch (error: any) {
    console.error('Error recalculating planner capacity:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
