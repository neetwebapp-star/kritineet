import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await resolveUser(req);
    const body = await req.json().catch(() => ({}));
    const { explanationUsed, audioListened } = body;

    // Locate the topic
    let topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            topics: {
              select: { id: true, orderIndex: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!topic) {
      topic = await prisma.topic.findFirst({
        where: { topicNumber: id },
        include: {
          chapter: {
            include: {
              topics: {
                select: { id: true, orderIndex: true },
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      });
      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    const topicId = topic.id;

    // Update or upsert TopicProgress
    const progress = await prisma.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topicId,
        },
      },
      create: {
        userId: user.id,
        topicId: topicId,
        status: 'COMPLETED',
        contentRead: true,
        explanationUsed: explanationUsed ?? false,
        audioListened: audioListened ?? false,
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        contentRead: true,
        explanationUsed: explanationUsed ?? undefined,
        audioListened: audioListened ?? undefined,
        completedAt: new Date(),
      },
    });

    // Timetable / Study Planner integration:
    // Auto-complete any DailyStudyTask that references this topicId or matches the chapter
    try {
      const today = new Date().toISOString().split('T')[0];
      const matchedTasks = await prisma.dailyStudyTask.findMany({
        where: {
          userId: user.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          OR: [
            { topicId: topicId },
            {
              chapterTitle: {
                contains: topic.chapter.title,
              },
            },
            {
              routeUrl: {
                contains: topicId,
              },
            },
          ],
        },
      });

      for (const task of matchedTasks) {
        await prisma.dailyStudyTask.update({
          where: { id: task.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            actualMinutes: task.estimatedMinutes || 25,
          },
        });
      }
    } catch (plannerErr) {
      console.warn('Planner sync notice:', plannerErr);
    }

    // Check if entire chapter is now completed
    const allTopicIds = topic.chapter.topics.map((t) => t.id);
    const completedProgresses = await prisma.topicProgress.findMany({
      where: {
        userId: user.id,
        topicId: { in: allTopicIds },
        status: 'COMPLETED',
      },
    });

    const isChapterCompleted =
      completedProgresses.length >= topic.chapter.topics.length;

    // Next topic calculation
    const sorted = [...topic.chapter.topics].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const currIdx = sorted.findIndex((t) => t.id === topicId);
    const nextTopic = currIdx < sorted.length - 1 ? sorted[currIdx + 1] : null;

    return NextResponse.json({
      success: true,
      message: `Topic ${topic.topicNumber} marked as completed`,
      progress,
      isChapterCompleted,
      chapterTitle: topic.chapter.title,
      nextTopicId: nextTopic?.id || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to complete topic' },
      { status: 500 }
    );
  }
}
