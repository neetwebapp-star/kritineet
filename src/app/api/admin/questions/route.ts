import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuestionQualityEvaluator } from '@/lib/intelligence/quality-evaluator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const source = searchParams.get('source') || 'ALL';
    const type = searchParams.get('type') || 'ALL';
    const qualityBand = searchParams.get('qualityBand') || 'ALL';
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (status !== 'ALL') {
      where.verificationStatus = status;
    }

    if (source !== 'ALL') {
      if (source === 'NCERT') {
        where.sourceType = { in: ['NCERT', 'NCERT_EXERCISE', 'NCERT_EXEMPLAR'] };
      } else {
        where.sourceType = source;
      }
    }

    if (type !== 'ALL') {
      where.questionType = type;
    }

    if (qualityBand !== 'ALL') {
      where.qualityBand = qualityBand;
    }

    if (search.trim()) {
      where.questionText = { contains: search.trim() };
    }

    const questions = await prisma.question.findMany({
      where,
      take: 60,
      orderBy: { updatedAt: 'desc' },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
        chapter: { include: { subject: true } },
        primaryConcept: true,
        sourceDocument: true,
      },
    });

    return NextResponse.json({ questions, count: questions.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionId,
      action, // "APPROVE" | "EDIT" | "REJECT" | "MARK_VERIFIED" | "MERGE" | "FLAG"
      questionText,
      options,
      correctOption,
      explanation,
      chapterId,
      primaryConceptId,
      difficulty,
      targetQuestionId, // For MERGE
      flagReason,       // For FLAG
    } = body;

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    let verificationStatus = existing.verificationStatus;
    let publicationStatus = existing.publicationStatus;
    let duplicateOfId = existing.duplicateOfId;
    let qualityFlags = existing.qualityFlags;

    if (action === 'APPROVE' || action === 'MARK_VERIFIED') {
      verificationStatus = 'VERIFIED';
      publicationStatus = 'PUBLISHED';
    } else if (action === 'REJECT') {
      verificationStatus = 'REJECTED';
      publicationStatus = 'ARCHIVED';
    } else if (action === 'MERGE') {
      verificationStatus = 'DUPLICATE';
      publicationStatus = 'ARCHIVED';
      duplicateOfId = targetQuestionId || existing.duplicateOfId;
    } else if (action === 'FLAG') {
      verificationStatus = 'FLAGGED';
      publicationStatus = 'DRAFT';
      const flags = qualityFlags ? JSON.parse(qualityFlags) : [];
      flags.push({ flag: flagReason || 'Flagged for human manual audit', date: new Date().toISOString() });
      qualityFlags = JSON.stringify(flags);
    }

    // Run quality check on update
    const quality = QuestionQualityEvaluator.evaluate({
      questionText: questionText ?? existing.questionText,
      options: options ?? existing.options,
      correctOption: correctOption ?? existing.correctOption,
      chapterId: chapterId ?? existing.chapterId,
      primaryConceptId: primaryConceptId ?? existing.primaryConceptId,
      sourceType: existing.sourceType,
      examYear: existing.examYear,
    });

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText: questionText ?? existing.questionText,
        correctOption: correctOption ?? existing.correctOption,
        explanation: explanation ?? existing.explanation,
        chapterId: chapterId ?? existing.chapterId,
        primaryConceptId: primaryConceptId ?? existing.primaryConceptId,
        difficulty: difficulty ?? existing.difficulty,
        verificationStatus,
        publicationStatus,
        duplicateOfId,
        qualityScore: quality.score,
        qualityFlags: qualityFlags || (quality.warnings.length > 0 ? JSON.stringify(quality.warnings) : null),
        lastVerifiedAt: (action === 'APPROVE' || action === 'MARK_VERIFIED') ? new Date() : existing.lastVerifiedAt,
        verifiedBy: (action === 'APPROVE' || action === 'MARK_VERIFIED') ? 'admin@neet2027.com' : existing.verifiedBy,
      },
    });

    // Update options if provided
    if (options && Array.isArray(options)) {
      for (const opt of options) {
        await prisma.questionOption.upsert({
          where: {
            questionId_label: {
              questionId: updated.id,
              label: opt.label,
            },
          },
          update: { text: opt.text },
          create: {
            questionId: updated.id,
            label: opt.label,
            text: opt.text,
          },
        });
      }
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: `ADMIN_${action}`,
        entityType: 'Question',
        entityId: questionId,
        oldValues: JSON.stringify({
          verificationStatus: existing.verificationStatus,
          publicationStatus: existing.publicationStatus,
          duplicateOfId: existing.duplicateOfId,
          questionText: existing.questionText,
        }),
        newValues: JSON.stringify({
          verificationStatus,
          publicationStatus,
          duplicateOfId,
          questionText: updated.questionText,
          flagReason: flagReason || null,
        }),
      },
    });

    return NextResponse.json({ question: updated, quality });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
