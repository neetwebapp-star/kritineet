import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

interface FingertipsAnswer {
  questionId: string;
  selectedOption: string;
}

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

    // Retrieve authentic MTG questions linked to this topic
    let questions = await prisma.question.findMany({
      where: {
        topicId: topic.id,
        sourceType: 'FINGERTIPS',
      },
      orderBy: { id: 'asc' },
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
        bookName: true,
        bookEdition: true,
        whyThisQuestion: true,
        primaryConcept: {
          select: { id: true, name: true },
        },
      },
    });

    // If fewer than 2 questions mapped directly to topic, augment with chapter Fingertips questions
    if (questions.length < 2) {
      const needed = 3 - questions.length;
      const existingIds = questions.map((q) => q.id);
      const chapterFingertips = await prisma.question.findMany({
        where: {
          chapterId: topic.chapterId,
          sourceType: 'FINGERTIPS',
          id: { notIn: existingIds },
        },
        take: needed,
        orderBy: { id: 'asc' },
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
          bookName: true,
          bookEdition: true,
          whyThisQuestion: true,
          primaryConcept: {
            select: { id: true, name: true },
          },
        },
      });
      questions = [...questions, ...chapterFingertips];
    }

    return NextResponse.json({
      success: true,
      topicId: topic.id,
      topicNumber: topic.topicNumber,
      topicTitle: topic.title,
      chapterTitle: topic.chapter.title,
      totalQuestions: questions.length,
      source: 'MTG Objective NCERT at your Fingertips',
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
        bookName: q.bookName || 'MTG NCERT at your Fingertips',
        conceptName: q.primaryConcept?.name || null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch MTG Fingertips questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await resolveUser(req);
    const body = await req.json().catch(() => ({}));
    const answers: FingertipsAnswer[] = body.answers || [];

    if (!answers.length) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

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
        try {
          await prisma.studentMistake.create({
            data: {
              userId: user.id,
              chapterId: topic.chapterId,
              questionId: q.id,
              selectedOption: ans.selectedOption,
              correctOption: q.correctOption,
              mistakeType: 'CONCEPTUAL',
              notes: `MTG Fingertips Practice Error: ${topic.title}`,
            },
          });
        } catch {
          // ignore unique or fk collision
        }
      }

      results.push({
        questionId: q.id,
        selectedOption: ans.selectedOption,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation || 'Refer to MTG NCERT at your Fingertips solutions.',
      });
    }

    const totalQuestions = answers.length;
    const attemptedCount = answers.filter((a) => a.selectedOption && a.selectedOption.trim() !== '').length;
    const skippedCount = totalQuestions - attemptedCount;
    const incorrectCount = attemptedCount - correctCount;
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(2)) : 0;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 90% Mastery Rule (Step 25)
    const MASTERY_THRESHOLD = 90;
    const isMastered = accuracy >= MASTERY_THRESHOLD && scorePercentage >= MASTERY_THRESHOLD;

    // Progression Gating (Step 27): Only mark COMPLETED if accuracy >= 90%
    let progressStatus = isMastered ? 'COMPLETED' : 'REVIEW_REQUIRED';

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
        status: progressStatus,
        contentRead: true,
        dppCompleted: isMastered,
        dppScore: accuracy,
        mtgPracticeCompleted: isMastered,
        mtgPracticeScore: accuracy,
        completedAt: isMastered ? new Date() : null,
      },
      update: {
        status: isMastered ? 'COMPLETED' : 'REVIEW_REQUIRED',
        dppCompleted: isMastered,
        dppScore: accuracy,
        mtgPracticeCompleted: isMastered,
        mtgPracticeScore: accuracy,
        completedAt: isMastered ? new Date() : null,
      },
    });

    // Check if entire chapter is completed (all topics >= 90% mastered)
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
      source: 'MTG Objective NCERT at your Fingertips',
      masteryThreshold: MASTERY_THRESHOLD,
      mastered: isMastered,
      status: isMastered ? '🟢 MASTERED' : '🔴 REPEAT REQUIRED',
      message: isMastered
        ? 'Congratulations! You have mastered this topic with ≥90% accuracy.'
        : 'Your accuracy is below 90%. Review this topic and attempt the practice again.',
      summary: {
        totalQuestions,
        attempted: attemptedCount,
        correct: correctCount,
        incorrect: incorrectCount,
        skipped: skippedCount,
        accuracy: `${accuracy}%`,
        score: scorePercentage,
      },
      results,
      progress,
      isChapterCompleted,
      chapterTitle: topic.chapter.title,
      nextTopicId: isMastered ? nextTopic?.id || null : null, // Gating: Do not advance to next topic if not mastered!
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit MTG Fingertips practice' },
      { status: 500 }
    );
  }
}
