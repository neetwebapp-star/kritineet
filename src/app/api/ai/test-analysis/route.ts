import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, userId: bodyUserId } = body;

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    const user = await resolveUser(req, bodyUserId);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
        responses: {
          include: {
            question: {
              include: {
                chapter: { include: { subject: true } },
                primaryConcept: true,
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this test attempt' }, { status: 403 });
    }

    if (attempt.status === 'IN_PROGRESS') {
      return NextResponse.json({
        locked: true,
        error: 'Exam is still in progress. AI Tutor post-test analysis is only available after final submission.',
      }, { status: 403 });
    }

    // Compute diagnostic metrics
    const totalQuestions = attempt.responses.length;
    const correctCount = attempt.responses.filter(r => r.isCorrect).length;
    const incorrectCount = attempt.responses.filter(r => !r.isCorrect && r.selectedOption !== null).length;
    const unattemptedCount = attempt.responses.filter(r => r.selectedOption === null).length;
    const score = attempt.totalScore;
    const maxScore = attempt.test?.totalMarks || (totalQuestions * 4);
    const accuracy = totalQuestions > 0 ? (correctCount / (correctCount + incorrectCount || 1)) * 100 : 0;

    // Identify weak subjects and chapters
    const chapterMistakes: Record<string, number> = {};
    for (const r of attempt.responses) {
      if (!r.isCorrect && r.question?.chapter?.title) {
        chapterMistakes[r.question.chapter.title] = (chapterMistakes[r.question.chapter.title] || 0) + 1;
      }
    }

    const topMistakeChapters = Object.entries(chapterMistakes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([chapter, count]) => ({ chapter, mistakes: count }));

    const analysisReport = {
      attemptId: attempt.id,
      testTitle: attempt.test.title,
      testType: attempt.test.testType,
      totalScore: score,
      maxScore,
      percentage: ((score / (maxScore || 1)) * 100).toFixed(1),
      accuracy: accuracy.toFixed(1),
      counts: {
        correct: correctCount,
        incorrect: incorrectCount,
        unattempted: unattemptedCount,
      },
      topMistakeChapters,
      strategicInsights: [
        `You scored ${score}/${maxScore} (${((score / (maxScore || 1)) * 100).toFixed(1)}%).`,
        incorrectCount > 10 ? `Negative marks cost you ${incorrectCount} points. Practice skipping doubtful questions in Round 1.` : 'Excellent discipline in negative marking avoidance.',
        topMistakeChapters.length > 0 ? `Focus your revision on ${topMistakeChapters.map(c => c.chapter).join(', ')}.` : 'Balanced performance across chapters.',
      ],
      recommendedAction: 'Review every incorrect question in the Error Book and solve 5 remediation questions per weak chapter.',
    };

    return NextResponse.json(analysisReport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
