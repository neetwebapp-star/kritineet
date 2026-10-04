import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

interface SubmissionAnswer {
  questionId: string;
  selectedOption: string; // 'A' | 'B' | 'C' | 'D'
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await resolveUser(req);
    const body = await req.json().catch(() => ({}));
    const answers: SubmissionAnswer[] = body.answers || [];

    if (!answers.length) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    // Locate topic
    let topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            topics: { select: { id: true, orderIndex: true } },
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
              topics: { select: { id: true, orderIndex: true } },
            },
          },
        },
      });
      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        questionText: true,
        correctOption: true,
        explanation: true,
        primaryConceptId: true,
        difficulty: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    const results = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const isCorrect =
        ans.selectedOption.trim().toUpperCase() ===
        q.correctOption.trim().toUpperCase();

      if (isCorrect) {
        correctCount++;
      } else {
        // Record student mistake
        try {
          await prisma.studentMistake.create({
            data: {
              userId: user.id,
              chapterId: topic.chapterId,
              questionId: q.id,
              selectedOption: ans.selectedOption,
              correctOption: q.correctOption,
              mistakeType: 'CONCEPTUAL',
              notes: `Topic DPP Error: ${topic.title}`,
            },
          });
        } catch {
          // Ignore duplicate / foreign key collision
        }
      }

      results.push({
        questionId: q.id,
        selectedOption: ans.selectedOption,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation || 'Refer to NCERT textbook section for this topic.',
      });
    }

    const totalQuestions = answers.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Update topic progress
    const progress = await prisma.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topic.id,
        },
      },
      create: {
        userId: user.id,
        topicId: topic.id,
        status: 'COMPLETED',
        contentRead: true,
        dppCompleted: true,
        dppScore: scorePercentage,
        completedAt: new Date(),
      },
      update: {
        dppCompleted: true,
        dppScore: scorePercentage,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Check if entire chapter is completed
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

    // Find next topic
    const sorted = [...topic.chapter.topics].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const currIdx = sorted.findIndex((t) => t.id === topic.id);
    const nextTopic = currIdx < sorted.length - 1 ? sorted[currIdx + 1] : null;

    return NextResponse.json({
      success: true,
      totalQuestions,
      correctCount,
      scorePercentage,
      passed: scorePercentage >= 60,
      results,
      progress,
      isChapterCompleted,
      chapterTitle: topic.chapter.title,
      nextTopicId: nextTopic?.id || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit DPP' },
      { status: 500 }
    );
  }
}
