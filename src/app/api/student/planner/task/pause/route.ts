import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const body = await req.json();
    const { taskId, partialMinutes = 0 } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await prisma.dailyStudyTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await prisma.dailyStudyTask.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        actualMinutes: { increment: partialMinutes },
      },
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task paused and session saved',
    });
  } catch (error: any) {
    console.error('Error pausing task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
