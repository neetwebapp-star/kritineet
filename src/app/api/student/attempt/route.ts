import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ConceptMasteryEngine } from '@/lib/intelligence/concept-mastery-engine';
import { MistakeClassifier } from '@/lib/intelligence/mistake-classifier';
import { QuestionExposureEngine } from '@/lib/intelligence/question-exposure-engine';
import { DailyLearningPlanEngine } from '@/lib/intelligence/daily-learning-plan-engine';

export async function POST(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      questionId,
      selectedOption,
      timeSpentSeconds = 30,
      sourceContext = 'PRACTICE',
      sessionId,
    } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        primaryConcept: true,
        chapter: { include: { subject: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedOption?.toUpperCase() === question.correctOption.toUpperCase();
    const difficulty = (question.difficulty as any) || 'MEDIUM';

    let mistakeType: string | null = null;
    let confidence = 1.0;
    let evidence: string | null = null;

    if (!isCorrect) {
      const classification = MistakeClassifier.classify({
        questionText: question.questionText,
        questionType: question.questionType,
        selectedOption,
        correctOption: question.correctOption,
        timeSpentSeconds,
        expectedTimeSeconds: 60,
        explanation: question.explanation,
      });

      mistakeType = classification.mistakeType;
      confidence = classification.confidence;
      evidence = classification.evidence;

      // Update student mistake record
      await prisma.studentMistake.upsert({
        where: {
          userId_questionId: {
            userId: student.id,
            questionId: question.id,
          },
        },
        update: {
          mistakeCount: { increment: 1 },
          selectedOption,
          correctOption: question.correctOption,
          lastMistakeAt: new Date(),
          isResolved: false,
          mistakeType,
          confidence,
          evidence,
        },
        create: {
          userId: student.id,
          questionId: question.id,
          conceptId: question.primaryConceptId,
          chapterId: question.chapterId,
          selectedOption,
          correctOption: question.correctOption,
          mistakeCount: 1,
          isResolved: false,
          mistakeType,
          confidence,
          evidence,
        },
      });
    } else {
      // Resolve existing mistake if any
      await prisma.studentMistake.updateMany({
        where: { userId: student.id, questionId: question.id },
        data: { isResolved: true },
      });
    }

    // 1. Create immutable AttemptEvent record
    const attemptEvent = await prisma.attemptEvent.create({
      data: {
        userId: student.id,
        questionId: question.id,
        selectedOption,
        correctOption: question.correctOption,
        isCorrect,
        timeSpentSeconds,
        sourceType: question.sourceType,
        examYear: question.examYear,
        chapterId: question.chapterId,
        conceptId: question.primaryConceptId,
        difficulty: question.difficulty,
        mistakeType,
        confidence,
        evidenceJson: evidence ? JSON.stringify({ evidence }) : null,
        sessionId,
        sourceContext,
      },
    });

    // 2. Update Concept Mastery
    let masteryResult = null;
    if (question.primaryConceptId) {
      masteryResult = await ConceptMasteryEngine.updateMastery({
        userId: student.id,
        conceptId: question.primaryConceptId,
        isCorrect,
        difficulty,
        timeSpentSeconds,
        questionId: question.id,
      });
    }

    // 3. Record Question Exposure
    await QuestionExposureEngine.recordExposure(student.id, question.id, isCorrect, timeSpentSeconds);

    // 4. Update Daily Learning Plan Mission Progress
    await DailyLearningPlanEngine.recordMissionProgress(student.id, question.chapter.subject.code);

    return NextResponse.json({
      success: true,
      attemptEventId: attemptEvent.id,
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
      mistakeType,
      confidence,
      evidence,
      mastery: masteryResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
