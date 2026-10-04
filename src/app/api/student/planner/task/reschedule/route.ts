import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const body = await req.json();
    const { taskId, targetDate, reason } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await prisma.dailyStudyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== user.id && task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this task' }, { status: 403 });
    }

    // Do not allow rescheduling completed tasks
    if (task.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Completed tasks cannot be rescheduled' }, { status: 400 });
    }

    const originalDayPlan = task.plan;
    let targetDayPlan = null;

    if (targetDate) {
      // User specified target date
      targetDayPlan = await prisma.dailyStudyPlan.findFirst({
        where: { userId: user.id, date: targetDate },
      });

      if (!targetDayPlan) {
        return NextResponse.json({ error: `No study plan exists for date ${targetDate}` }, { status: 404 });
      }

      // Check daily capacity invariant: max 600 mins
      if (targetDayPlan.plannedMinutes + task.estimatedMinutes > 600) {
        return NextResponse.json({
          error: `Target date ${targetDate} would exceed max 600m capacity (${targetDayPlan.plannedMinutes + task.estimatedMinutes}m). Choose another day or clear buffer.`,
          currentPlannedMinutes: targetDayPlan.plannedMinutes,
          taskEstimatedMinutes: task.estimatedMinutes,
        }, { status: 400 });
      }
    } else {
      // Find earliest future day with capacity <= 600 mins
      const futurePlans = await prisma.dailyStudyPlan.findMany({
        where: {
          userId: user.id,
          date: { gt: originalDayPlan.date },
          plannedMinutes: { lte: 600 - task.estimatedMinutes },
        },
        orderBy: { date: 'asc' },
        take: 1,
      });

      if (futurePlans.length === 0) {
        return NextResponse.json({
          error: 'No available day with sufficient capacity within 600m limit found in the next calendar window.',
        }, { status: 400 });
      }
      targetDayPlan = futurePlans[0];
    }

    // Move task to target day plan in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Deduct minutes from original day plan
      await tx.dailyStudyPlan.update({
        where: { id: originalDayPlan.id },
        data: {
          plannedMinutes: Math.max(0, originalDayPlan.plannedMinutes - task.estimatedMinutes),
        },
      });

      // 2. Add minutes to target day plan
      await tx.dailyStudyPlan.update({
        where: { id: targetDayPlan.id },
        data: {
          plannedMinutes: targetDayPlan.plannedMinutes + task.estimatedMinutes,
        },
      });

      // 3. Move the task and update explanation
      let meta: any = {};
      try {
        meta = task.metaJson ? JSON.parse(task.metaJson) : {};
      } catch (e) {}
      meta.rescheduledFrom = originalDayPlan.date;
      meta.rescheduleReason = reason || 'Workload balancing';
      meta.whyToday = `[Rescheduled from ${originalDayPlan.date}] ${meta.whyToday || task.description || ''}`;

      const movedTask = await tx.dailyStudyTask.update({
        where: { id: task.id },
        data: {
          planId: targetDayPlan.id,
          date: targetDayPlan.date,
          metaJson: JSON.stringify(meta),
          description: meta.whyToday,
        },
      });

      return { movedTask, targetDayPlan };
    });

    return NextResponse.json({
      success: true,
      rescheduledTo: targetDayPlan.date,
      task: updated.movedTask,
      message: `Task successfully rescheduled to ${targetDayPlan.date}`,
    });
  } catch (error: any) {
    console.error('Error rescheduling task:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
