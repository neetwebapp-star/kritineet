import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

interface ChapterAnswer {
  questionId: string;
  selectedOption: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'all'; // 'all' | 'test' | 'practice'
    const user = await resolveUser(req);

    // Locate the chapter by id or chapterNumber
    let chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: true,
        topics: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, topicNumber: true, title: true }
        }
      }
    });

    if (!chapter) {
      chapter = await prisma.chapter.findFirst({
        where: { chapterNumber: parseInt(id, 10) || 0 },
        include: {
          subject: true,
          topics: {
            orderBy: { orderIndex: 'asc' },
            select: { id: true, topicNumber: true, title: true }
          }
        }
      });
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
    }

    if (chapter.chapterNumber > 20 || !chapter.unitId) {
      return NextResponse.json({ error: 'Chapter not found in active curriculum' }, { status: 404 });
    }

    // Query questions for chapter
    let questionsQuery: any = {
      chapterId: chapter.id,
      sourceType: 'FINGERTIPS',
      syllabusStatus: 'CURRENT',
    };

    if (mode === 'test') {
      // Questions mapped to chapter level (e.g. Assertion-Reason / Chapter Test)
      questionsQuery.topicId = null;
    }

    let questions = await prisma.question.findMany({
      where: questionsQuery,
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
        topicId: true,
        whyThisQuestion: true,
      },
    });

    // If test mode has fewer than 5, also include hard questions from topics
    if (mode === 'test' && questions.length < 5) {
      const topicHardQuestions = await prisma.question.findMany({
        where: {
          chapterId: chapter.id,
          sourceType: 'FINGERTIPS',
          difficulty: 'HARD',
          id: { notIn: questions.map(q => q.id) }
        },
        take: 10,
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
          topicId: true,
          whyThisQuestion: true,
        },
      });
      questions = [...questions, ...topicHardQuestions];
    }

    return NextResponse.json({
      success: true,
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      subjectName: chapter.subject.name,
      mode,
      totalQuestions: questions.length,
      source: 'MTG Objective NCERT at your Fingertips',
      questions,
    });
  } catch (error: any) {
    console.error('Error fetching chapter Fingertips questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter questions', details: error.message },
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
    const body = await req.json();
    const { answers, timeSpentSeconds = 0 } = body as {
      answers: ChapterAnswer[];
      timeSpentSeconds?: number;
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers array is required' }, { status: 400 });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        correctOption: true,
        explanation: true,
        topicId: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    let incorrectCount = 0;
    const results = answers.map((ans) => {
      const q = questionMap.get(ans.questionId);
      const isCorrect = q ? q.correctOption.trim().toUpperCase() === ans.selectedOption.trim().toUpperCase() : false;
      if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        correctOption: q?.correctOption || '',
        isCorrect,
        explanation: q?.explanation || 'Refer to NCERT textbook explanations.',
      };
    });

    const totalQuestions = answers.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    return NextResponse.json({
      success: true,
      chapterId: id,
      totalQuestions,
      correctCount,
      incorrectCount,
      scorePercentage,
      timeSpentSeconds,
      results,
    });
  } catch (error: any) {
    console.error('Error evaluating chapter Fingertips submission:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate test submission', details: error.message },
      { status: 500 }
    );
  }
}
