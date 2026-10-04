import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const body = await req.json();
    const { taskId, actualMinutes } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await prisma.dailyStudyTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const minutesSpent = actualMinutes ?? task.estimatedMinutes;

    const updatedTask = await prisma.dailyStudyTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        actualMinutes: minutesSpent,
        completedAt: new Date(),
      },
    });

    // Update DailyStudyPlan actualMinutes
    await prisma.dailyStudyPlan.update({
      where: { id: task.planId },
      data: {
        actualMinutes: { increment: minutesSpent },
      },
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task completed successfully',
    });
  } catch (error: any) {
    console.error('Error completing planner task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
