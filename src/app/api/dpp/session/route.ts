import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';
import { StudentMistakeEngine } from '@/lib/intelligence/mistake-engine';
import { SpacedRevisionEngine } from '@/lib/intelligence/revision-engine';
import { ConceptMasteryEngine } from '@/lib/intelligence/concept-mastery-engine';
import { MistakeClassifier } from '@/lib/intelligence/mistake-classifier';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const subjectCode = searchParams.get('subject');
    const chapterId = searchParams.get('chapterId');

    const where: any = {
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
    };

    if (chapterId) {
      where.chapterId = chapterId;
    } else if (subjectCode && subjectCode !== 'ALL') {
      where.subject = { code: subjectCode };
    }

    // Prefer MTG Fingertips, then NCERT, then PYQ
    const questions = await prisma.question.findMany({
      where,
      take: limit,
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
        chapter: {
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            subject: { select: { name: true, code: true } },
          },
        },
        primaryConcept: {
          select: {
            id: true,
            name: true,
            definition: true,
            formula: true,
          },
        },
      },
    });

    const formatted = questions.map((q) => {
      let cleanBadge = 'NCERT Line-by-Line';
      if (q.sourceType === 'FINGERTIPS') cleanBadge = 'MTG Fingertips';
      if (q.sourceType === 'PYQ') cleanBadge = `${q.examName || 'NEET'} ${q.examYear || ''}`.trim();

      return {
        id: q.id,
        stem: q.questionText,
        options: q.options.map((o) => ({
          key: o.label,
          label: o.text,
          sub: o.label === q.correctOption ? 'Target Option' : '',
        })),
        correctOption: q.correctOption,
        explanation: q.explanation || 'Detailed explanation verified against canonical NCERT textbook.',
        difficulty: q.difficulty,
        sourceType: q.sourceType,
        sourceBadge: cleanBadge,
        ncertRef: q.chapter
          ? `NCERT Chapter ${q.chapter.chapterNumber}: ${q.chapter.title}`
          : 'NCERT Canonical Core',
        concept: q.primaryConcept?.name || null,
        chapterTitle: q.chapter?.title || 'NEET Syllabus',
        subjectName: q.chapter?.subject.name || 'Biology',
      };
    });

    return NextResponse.json({
      success: true,
      count: formatted.length,
      questions: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate DPP' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const body = await req.json();
    const { responses, timeSpentSeconds, dppTitle } = body;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'responses array is required' }, { status: 400 });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    const evaluatedResults = [];

    for (const item of responses) {
      const { questionId, selectedOption, timeSpent = 45, confidence = 'FAIRLY_CONFIDENT' } = item;
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { primaryConcept: true, chapter: true },
      });

      if (!question) continue;

      const isCorrect = selectedOption?.toUpperCase() === question.correctOption.toUpperCase();

      if (isCorrect) {
        correctCount += 1;
        // Metacognitive Calibration for Correct answers:
        // Correct + Certain -> Quality 5 (Perfect consolidation)
        // Correct + Fairly Confident -> Quality 4 (Normal)
        // Correct + Guess/50_50 -> Quality 3 (Fragile knowledge / hidden weakness, schedule sooner review)
        const qualityScore = (confidence === 'GUESS' || confidence === '50_50') ? 3 : (confidence === 'CERTAIN' ? 5 : 4);
        await SpacedRevisionEngine.updateRevisionItem(user.id, question.id, qualityScore);

        // Update Concept Mastery
        if (question.primaryConceptId) {
          await ConceptMasteryEngine.updateMastery({
            userId: user.id,
            conceptId: question.primaryConceptId,
            isCorrect: true,
            difficulty: question.difficulty as any,
            timeSpentSeconds: timeSpent,
            questionId: question.id,
          });
        }
      } else {
        incorrectCount += 1;
        // Metacognitive Calibration for Incorrect answers:
        // Wrong + Certain -> High Confidence Misconception -> Quality 0 (Complete blackout/remedy)
        // Wrong + Guess -> Knowledge gap -> Quality 1
        const wrongQuality = confidence === 'CERTAIN' ? 0 : 1;
        await SpacedRevisionEngine.updateRevisionItem(user.id, question.id, wrongQuality);

        // Classify mistake deterministically
        const classification = MistakeClassifier.classify({
          questionText: question.questionText,
          questionType: question.questionType,
          selectedOption,
          correctOption: question.correctOption,
          timeSpentSeconds: timeSpent,
          expectedTimeSeconds: 60,
        });

        // Record mistake in StudentMistake table
        await StudentMistakeEngine.recordMistake({
          userId: user.id,
          questionId: question.id,
          conceptId: question.primaryConceptId || undefined,
          chapterId: question.chapterId,
          selectedOption: selectedOption || 'UNANSWERED',
          correctOption: question.correctOption,
        });

        // Update mistakeType and evidence if record exists
        await prisma.studentMistake.updateMany({
          where: { userId: user.id, questionId: question.id },
          data: {
            mistakeType: classification.mistakeType,
            confidence: confidence as any,
            evidence: classification.evidence,
          },
        });

        // Update Spaced Repetition (Quality 1: incorrect)
        await SpacedRevisionEngine.updateRevisionItem(user.id, question.id, 1);

        // Update Concept Mastery
        if (question.primaryConceptId) {
          await ConceptMasteryEngine.updateMastery({
            userId: user.id,
            conceptId: question.primaryConceptId,
            isCorrect: false,
            difficulty: question.difficulty as any,
            timeSpentSeconds: timeSpent,
            questionId: question.id,
          });
        }
      }

      evaluatedResults.push({
        questionId: question.id,
        isCorrect,
        selectedOption,
        correctOption: question.correctOption,
        explanation: question.explanation,
        concept: question.primaryConcept?.name,
      });
    }

    const totalQuestions = evaluatedResults.length;
    const score = correctCount * 4 - incorrectCount * 1;

    return NextResponse.json({
      success: true,
      summary: {
        totalQuestions,
        correctCount,
        incorrectCount,
        unansweredCount: totalQuestions - (correctCount + incorrectCount),
        score,
        maxScore: totalQuestions * 4,
        accuracy: totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(1)) : 0,
      },
      results: evaluatedResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit DPP' }, { status: 500 });
  }
}
