import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AdaptivePracticeEngine } from '@/lib/intelligence/adaptive-engine';
import { StudentMistakeEngine } from '@/lib/intelligence/mistake-engine';
import { SpacedRevisionEngine } from '@/lib/intelligence/revision-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || '10', 10);
    const subjectCode = searchParams.get('subject') || undefined;
    const source = searchParams.get('source') || 'ALL'; // ALL | PYQ | FINGERTIPS | NCERT
    const difficulty = searchParams.get('difficulty') || undefined;
    const questionType = searchParams.get('type') || undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    const exam = searchParams.get('exam') || undefined;

    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Build filter query
    const where: any = {
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      syllabusStatus: 'CURRENT',
    };

    if (source === 'PYQ') {
      where.sourceType = 'PYQ';
    } else if (source === 'FINGERTIPS') {
      where.sourceType = 'FINGERTIPS';
    } else if (source === 'NCERT') {
      where.sourceType = { in: ['NCERT', 'NCERT_EXERCISE', 'NCERT_EXEMPLAR'] };
    }

    if (subjectCode && subjectCode !== 'ALL') {
      where.subject = { code: subjectCode };
    }

    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }

    if (questionType && questionType !== 'ALL') {
      where.questionType = questionType;
    }

    if (year) {
      where.examYear = year;
    }

    if (exam && exam !== 'ALL') {
      where.examName = exam;
    }

    const questions = await prisma.question.findMany({
      where,
      take: count,
      orderBy: { createdAt: 'desc' },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
        chapter: {
          select: {
            title: true,
            biologyCategory: true,
            subject: { select: { name: true, code: true } }
          }
        },
        primaryConcept: {
          select: {
            id: true,
            name: true,
            definition: true,
            formula: true,
          }
        }
      }
    });

    const sanitized = questions.map((q) => {
      // Build clean, student-facing source badge without internal IDs
      let cleanBadge = 'NEET Preparation';
      if (q.sourceType === 'PYQ') {
        cleanBadge = `${q.examName || 'NEET'} ${q.examYear || ''}`.trim();
      } else if (q.sourceType === 'FINGERTIPS') {
        cleanBadge = 'MTG Fingertips';
      } else {
        cleanBadge = 'NCERT';
      }

      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options.map((o) => ({ label: o.label, text: o.text })),
        figures: q.figures.map(f => ({ assetPath: f.assetPath, caption: f.caption })),
        difficulty: q.difficulty,
        sourceType: q.sourceType,
        sourceBadge: cleanBadge,
        examName: q.examName,
        examYear: q.examYear,
        chapter: {
          title: q.chapter?.title,
          biologyCategory: q.chapter?.biologyCategory,
          subjectName: q.chapter?.subject?.name,
        },
        conceptTested: q.primaryConcept?.name || null
      };
    });

    return NextResponse.json({ questions: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, selectedOption } = body;

    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        primaryConcept: {
          include: {
            chapter: { include: { subject: true } },
          },
        },
        chapter: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedOption?.toUpperCase() === question.correctOption.toUpperCase();

    // If incorrect, record mistake
    if (!isCorrect) {
      await StudentMistakeEngine.recordMistake({
        userId: student.id,
        questionId: question.id,
        conceptId: question.primaryConceptId,
        chapterId: question.chapterId,
        selectedOption: selectedOption ?? 'UNANSWERED',
        correctOption: question.correctOption,
      });

      // Update Spaced Revision (Quality score 1: incorrect)
      await SpacedRevisionEngine.updateRevisionItem(student.id, question.id, 1);
    } else {
      // If correct, resolve past mistake if any
      await prisma.studentMistake.updateMany({
        where: {
          userId: student.id,
          questionId: question.id,
          isResolved: false,
        },
        data: {
          isResolved: true,
        },
      });

      // Update Spaced Revision (Quality score 4: correct)
      await SpacedRevisionEngine.updateRevisionItem(student.id, question.id, 4);
    }

    // Find related PYQs or related Fingertips questions
    const relatedQuestions = await prisma.question.findMany({
      where: {
        chapterId: question.chapterId,
        id: { not: question.id },
        verificationStatus: 'VERIFIED',
      },
      take: 2,
      select: {
        id: true,
        questionText: true,
        sourceType: true,
        examName: true,
        examYear: true,
      }
    });

    return NextResponse.json({
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation || 'Detailed NCERT solution available in course material.',
      primaryConcept: question.primaryConcept ? {
        id: question.primaryConcept.id,
        name: question.primaryConcept.name,
        definition: question.primaryConcept.definition,
        formula: question.primaryConcept.formula,
      } : null,
      relatedQuestions,
      whyThisQuestion: question.whyThisQuestion ? JSON.parse(question.whyThisQuestion) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
