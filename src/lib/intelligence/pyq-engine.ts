import prisma from '../prisma';

export const VALID_QUESTION_TYPES = [
  'SINGLE_CORRECT',
  'ASSERTION_REASON',
  'STATEMENT_BASED',
  'MATCH_THE_FOLLOWING',
  'NUMERICAL',
  'DIAGRAM_BASED',
  'PASSAGE_BASED',
] as const;

export type QuestionType = typeof VALID_QUESTION_TYPES[number];

export interface VerifiedPyqPayload {
  stableId: string;
  examName: string; // e.g. "NEET-UG", "AIIMS", "AIPMT"
  examYear: number;
  examShift?: string;
  questionNumber: string;
  subjectCode: 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY';
  classCode: 'CLASS_11' | 'CLASS_12';
  chapterSlug: string;
  questionText: string;
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  questionType?: QuestionType;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sourceDocumentId?: string;
  sourcePage?: number;
  primaryConceptId?: string;
  secondaryConceptIds?: string[];
  isVerified?: boolean;
}

export class PyqIntelligenceEngine {
  /**
   * Ingest and validate a PYQ strictly adhering to provenance rules
   */
  static async ingestPyq(payload: VerifiedPyqPayload) {
    if (!payload.examYear || payload.examYear < 1990 || payload.examYear > 2026) {
      throw new Error(`Invalid or uncertain exam year: ${payload.examYear}. Never fabricate exam year.`);
    }

    // Resolve subject and chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug: payload.chapterSlug },
      include: { subject: { include: { classLevel: true } } },
    });

    if (!chapter) {
      throw new Error(`Chapter not found with slug: ${payload.chapterSlug}`);
    }

    // Verification status rule: If verification is uncertain, mark as NEEDS_REVIEW
    const verificationStatus = payload.isVerified ? 'VERIFIED' : 'NEEDS_REVIEW';
    const publicationStatus = payload.isVerified ? 'PUBLISHED' : 'UNPUBLISHED';

    // Normalize question text and create fingerprint
    const normalizedText = payload.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedOptions = payload.options
      .map((o) => `${o.label}:${o.text.trim().toLowerCase()}`)
      .sort()
      .join('|');
    
    // Hash for duplicate detection
    const crypto = await import('crypto');
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${normalizedText}::${normalizedOptions}`)
      .digest('hex');

    // Create or update question
    const question = await prisma.question.upsert({
      where: { id: payload.stableId },
      update: {
        questionText: payload.questionText,
        questionType: payload.questionType || 'SINGLE_CORRECT',
        difficulty: payload.difficulty || 'MEDIUM',
        correctOption: payload.correctOption,
        explanation: payload.explanation,
        examName: payload.examName,
        examYear: payload.examYear,
        examShift: payload.examShift,
        originalQuestionNumber: payload.questionNumber,
        sourceDocumentId: payload.sourceDocumentId,
        sourcePage: payload.sourcePage,
        primaryConceptId: payload.primaryConceptId,
        secondaryConceptIds: payload.secondaryConceptIds ? JSON.stringify(payload.secondaryConceptIds) : null,
        verificationStatus,
        publicationStatus,
        fingerprint,
        whyThisQuestion: JSON.stringify({
          conceptTested: payload.primaryConceptId,
          exam: `${payload.examName} ${payload.examYear}`,
          questionNumber: payload.questionNumber,
        }),
      },
      create: {
        id: payload.stableId,
        questionText: payload.questionText,
        questionType: payload.questionType || 'SINGLE_CORRECT',
        difficulty: payload.difficulty || 'MEDIUM',
        subjectId: chapter.subject.id,
        classLevelId: chapter.subject.classLevel.id,
        chapterId: chapter.id,
        primaryConceptId: payload.primaryConceptId,
        secondaryConceptIds: payload.secondaryConceptIds ? JSON.stringify(payload.secondaryConceptIds) : null,
        sourceType: 'PYQ',
        examName: payload.examName,
        examYear: payload.examYear,
        examShift: payload.examShift,
        originalQuestionNumber: payload.questionNumber,
        sourceDocumentId: payload.sourceDocumentId,
        sourcePage: payload.sourcePage,
        verificationStatus,
        publicationStatus,
        correctOption: payload.correctOption,
        explanation: payload.explanation,
        fingerprint,
        whyThisQuestion: JSON.stringify({
          conceptTested: payload.primaryConceptId,
          exam: `${payload.examName} ${payload.examYear}`,
          questionNumber: payload.questionNumber,
        }),
      },
    });

    // Save options
    for (let i = 0; i < payload.options.length; i++) {
      const opt = payload.options[i];
      await prisma.questionOption.upsert({
        where: {
          questionId_label: {
            questionId: question.id,
            label: opt.label,
          },
        },
        update: {
          text: opt.text,
          orderIndex: i + 1,
        },
        create: {
          questionId: question.id,
          label: opt.label,
          text: opt.text,
          orderIndex: i + 1,
        },
      });
    }

    return question;
  }

  /**
   * Concept Frequency Analysis:
   * Calculated strictly from the real imported database questions. Never invent statistics.
   */
  static async calculateConceptFrequency(subjectCode?: string) {
    const whereClause: any = {
      sourceType: 'PYQ',
      primaryConceptId: { not: null },
      verificationStatus: 'VERIFIED',
    };

    if (subjectCode) {
      whereClause.subject = { code: subjectCode };
    }

    const pyqs = await prisma.question.findMany({
      where: whereClause,
      select: {
        id: true,
        examYear: true,
        primaryConceptId: true,
        primaryConcept: {
          select: {
            id: true,
            name: true,
            chapter: { select: { title: true, biologyCategory: true } },
          },
        },
      },
    });

    // Group and aggregate
    const frequencyMap = new Map<
      string,
      {
        conceptId: string;
        conceptName: string;
        chapterTitle: string;
        pyqCount: number;
        years: number[];
      }
    >();

    for (const q of pyqs) {
      if (!q.primaryConceptId || !q.primaryConcept) continue;
      const cid = q.primaryConceptId;

      if (!frequencyMap.has(cid)) {
        frequencyMap.set(cid, {
          conceptId: cid,
          conceptName: q.primaryConcept.name,
          chapterTitle: q.primaryConcept.chapter.title,
          pyqCount: 1,
          years: q.examYear ? [q.examYear] : [],
        });
      } else {
        const item = frequencyMap.get(cid)!;
        item.pyqCount += 1;
        if (q.examYear && !item.years.includes(q.examYear)) {
          item.years.push(q.examYear);
        }
      }
    }

    return Array.from(frequencyMap.values())
      .sort((a, b) => b.pyqCount - a.pyqCount)
      .map((item) => ({
        ...item,
        years: item.years.sort((a, b) => b - a),
      }));
  }
}
