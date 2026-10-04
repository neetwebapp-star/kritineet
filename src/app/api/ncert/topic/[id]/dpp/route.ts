import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await resolveUser(req);

    // Locate the topic
    let topic = await prisma.topic.findUnique({
      where: { id },
      include: { chapter: true },
    });

    if (!topic) {
      topic = await prisma.topic.findFirst({
        where: { topicNumber: id },
        include: { chapter: true },
      });
      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    // Retrieve DPP questions explicitly linked to this topic, or fallback to chapter questions
    let questions = await prisma.question.findMany({
      where: { topicId: topic.id },
      take: 10,
      orderBy: { examYear: 'desc' },
      select: {
        id: true,
        questionText: true,
        options: {
          orderBy: { orderIndex: 'asc' },
          select: { label: true, text: true },
        },
        difficulty: true,
        questionType: true,
        sourceType: true,
        examName: true,
        examYear: true,
        primaryConcept: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If fewer than 5 questions tied to topic directly, augment with chapter questions
    if (questions.length < 5) {
      const needed = 5 - questions.length;
      const existingIds = questions.map((q) => q.id);
      const chapterQuestions = await prisma.question.findMany({
        where: {
          chapterId: topic.chapterId,
          id: { notIn: existingIds },
        },
        take: needed,
        orderBy: { examYear: 'desc' },
        select: {
          id: true,
          questionText: true,
          options: {
            orderBy: { orderIndex: 'asc' },
            select: { label: true, text: true },
          },
          difficulty: true,
          questionType: true,
          sourceType: true,
          examName: true,
          examYear: true,
          primaryConcept: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      questions = [...questions, ...chapterQuestions];
    }

    // Check user's previous DPP submission if any
    const progress = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topic.id,
        },
      },
      select: {
        dppCompleted: true,
        dppScore: true,
      },
    });

    return NextResponse.json({
      success: true,
      topicId: topic.id,
      topicNumber: topic.topicNumber,
      topicTitle: topic.title,
      chapterTitle: topic.chapter.title,
      totalQuestions: questions.length,
      previousSubmission: progress?.dppCompleted
        ? {
            completed: true,
            score: progress.dppScore,
          }
        : null,
      questions: questions.map((q, idx) => ({
        index: idx + 1,
        id: q.id,
        text: q.questionText,
        options: q.options.map((o) => ({
          key: o.label,
          text: o.text,
        })),
        difficulty: q.difficulty,
        source: q.sourceType,
        exam: q.examName ? `${q.examName} ${q.examYear || ''}` : 'NEET NCERT Practice',
        conceptName: q.primaryConcept?.name || null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch DPP questions' },
      { status: 500 }
    );
  }
}
