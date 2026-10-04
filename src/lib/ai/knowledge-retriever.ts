/**
 * Phase 6: Grounded Knowledge Retriever
 * Fetches verified NCERT concepts, chapters, formulas, PYQs, and student mastery context.
 * Enforces zero hallucination and clean student-facing citation formatting
 * (never exposing raw internal database UUIDs).
 */

import prisma from '@/lib/prisma';
import { DetectedIntent } from './intent-detector';

export interface VerifiedCitation {
  title: string;
  sourceType: 'NCERT_TEXTBOOK' | 'NEET_PYQ' | 'MTG_FINGERTIPS' | 'PLATFORM_CONCEPT';
  classLevel?: string;
  subject: string;
  chapterTitle?: string;
  examYear?: number;
  verified: boolean;
}

export interface RetrievedGroundingContext {
  groundingStatus: 'GROUNDED' | 'PARTIALLY_GROUNDED' | 'NOT_GROUNDED';
  citations: VerifiedCitation[];
  concepts: Array<{
    id: string;
    name: string;
    definition: string | null;
    formula: string | null;
    chapterTitle: string;
    subjectName: string;
    classLevel: number;
    biologyCategory?: string | null;
  }>;
  question?: {
    id: string;
    questionText: string;
    options: Array<{ label: string; text: string }>;
    correctOption: string;
    explanation: string | null;
    sourceType: string;
    examName?: string | null;
    examYear?: number | null;
    difficulty: string;
    chapterTitle: string;
    subjectName: string;
    primaryConceptName?: string | null;
    figures: Array<{ assetPath: string; caption?: string | null }>;
  } | null;
  studentMastery?: {
    conceptName: string;
    masteryScore: number;
    status: string;
    accuracy: number;
    attempts: number;
  } | null;
  studentMistake?: {
    mistakeType: string;
    mistakeCount: number;
    notes?: string | null;
  } | null;
  relatedPYQs: Array<{
    id: string;
    examName: string;
    examYear: number;
    questionText: string;
    conceptName?: string;
  }>;
  missingSourceWarning?: string;
}

export class KnowledgeRetriever {
  public static async retrieve(
    intent: DetectedIntent,
    userId?: string
  ): Promise<RetrievedGroundingContext> {
    const citations: VerifiedCitation[] = [];
    let groundingStatus: 'GROUNDED' | 'PARTIALLY_GROUNDED' | 'NOT_GROUNDED' = 'NOT_GROUNDED';

    // 1. Fetch Question if specified
    let questionData: RetrievedGroundingContext['question'] = null;
    if (intent.questionId) {
      const q = await prisma.question.findUnique({
        where: { id: intent.questionId },
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
          chapter: { include: { subject: { include: { classLevel: true } } } },
          primaryConcept: true,
        },
      });

      if (q) {
        const classNum = q.chapter?.subject?.classLevel?.order || 11;
        questionData = {
          id: q.id,
          questionText: q.questionText,
          options: q.options.map(o => ({ label: o.label, text: o.text })),
          correctOption: q.correctOption,
          explanation: q.explanation,
          sourceType: q.sourceType,
          examName: q.examName,
          examYear: q.examYear,
          difficulty: q.difficulty,
          chapterTitle: q.chapter?.title || 'General',
          subjectName: q.chapter?.subject?.name || 'General',
          primaryConceptName: q.primaryConcept?.name || null,
          figures: q.figures.map(f => ({ assetPath: f.assetPath, caption: f.caption })),
        };

        if (q.sourceType === 'PYQ') {
          citations.push({
            title: `${q.examName || 'NEET'} ${q.examYear || ''} (Question Paper)`.trim(),
            sourceType: 'NEET_PYQ',
            subject: q.chapter?.subject?.name || 'NEET',
            chapterTitle: q.chapter?.title,
            examYear: q.examYear || undefined,
            verified: true,
          });
        } else {
          citations.push({
            title: `NCERT Class ${classNum} ${q.chapter?.subject?.name || 'Science'} - ${q.chapter?.title}`,
            sourceType: 'NCERT_TEXTBOOK',
            classLevel: `Class ${classNum}`,
            subject: q.chapter?.subject?.name || 'NEET',
            chapterTitle: q.chapter?.title,
            verified: true,
          });
        }
      }
    }

    // 2. Fetch Relevant Concepts
    const concepts: RetrievedGroundingContext['concepts'] = [];
    const keywords = intent.conceptKeywords;

    if (keywords.length > 0 || intent.subject) {
      const whereClause: any = {};
      if (intent.subject) {
        const sub = intent.subject.toUpperCase();
        whereClause.chapter = {
          subject: {
            OR: [
              { code: sub },
              { code: sub.substring(0, 3) },
              { name: { contains: sub } }
            ]
          }
        };
      }

      // Keyword matching
      if (keywords.length > 0) {
        whereClause.OR = keywords.map(kw => ({
          OR: [
            { name: { contains: kw } },
            { definition: { contains: kw } }
          ]
        }));
      }

      const matchedConcepts = await prisma.concept.findMany({
        where: whereClause,
        take: 3,
        include: {
          chapter: { include: { subject: { include: { classLevel: true } } } }
        }
      });

      for (const c of matchedConcepts) {
        const classNum = c.chapter?.subject?.classLevel?.order || 11;
        concepts.push({
          id: c.id,
          name: c.name,
          definition: c.definition,
          formula: c.formula,
          chapterTitle: c.chapter?.title || 'General',
          subjectName: c.chapter?.subject?.name || 'General',
          classLevel: classNum,
          biologyCategory: c.chapter?.biologyCategory,
        });

        citations.push({
          title: `NCERT Class ${classNum} ${c.chapter?.subject?.name || 'Science'} - Concept: ${c.name}`,
          sourceType: 'NCERT_TEXTBOOK',
          classLevel: `Class ${classNum}`,
          subject: c.chapter?.subject?.name || 'NEET',
          chapterTitle: c.chapter?.title,
          verified: true,
        });
      }
    }

    // 3. Fetch Related PYQs
    const relatedPYQs: RetrievedGroundingContext['relatedPYQs'] = [];
    if (questionData?.chapterTitle || concepts.length > 0) {
      const pyqs = await prisma.question.findMany({
        where: {
          sourceType: 'PYQ',
          verificationStatus: 'VERIFIED',
          ...(questionData ? { id: { not: questionData.id } } : {}),
          ...(concepts[0] ? { primaryConceptId: concepts[0].id } : {})
        },
        take: 3,
        orderBy: { examYear: 'desc' },
        include: { primaryConcept: true }
      });

      for (const p of pyqs) {
        relatedPYQs.push({
          id: p.id,
          examName: p.examName || 'NEET',
          examYear: p.examYear || 2023,
          questionText: p.questionText,
          conceptName: p.primaryConcept?.name || undefined,
        });
      }
    }

    // 4. Student Context (Mastery & Mistakes)
    let studentMastery: RetrievedGroundingContext['studentMastery'] = null;
    let studentMistake: RetrievedGroundingContext['studentMistake'] = null;

    if (userId) {
      // Find concept mastery
      const targetConceptId = concepts[0]?.id || (questionData ? questionData.id : null);
      if (concepts[0]?.id) {
        const mastery = await prisma.studentConceptMastery.findUnique({
          where: {
            userId_conceptId: {
              userId,
              conceptId: concepts[0].id,
            },
          },
        });
        if (mastery) {
          studentMastery = {
            conceptName: concepts[0].name,
            masteryScore: mastery.masteryScore,
            status: mastery.status,
            accuracy: mastery.accuracy,
            attempts: mastery.attempts,
          };
        }
      }

      // Find past mistake on this question
      if (questionData?.id) {
        const mistake = await prisma.studentMistake.findUnique({
          where: {
            userId_questionId: {
              userId,
              questionId: questionData.id,
            },
          },
        });
        if (mistake) {
          studentMistake = {
            mistakeType: mistake.mistakeType,
            mistakeCount: mistake.mistakeCount,
            notes: mistake.notes,
          };
        }
      }
    }

    // Determine Grounding Status
    if (citations.length > 0 && (questionData || concepts.length > 0)) {
      groundingStatus = 'GROUNDED';
    } else if (citations.length > 0) {
      groundingStatus = 'PARTIALLY_GROUNDED';
    } else {
      groundingStatus = 'NOT_GROUNDED';
    }

    // Missing source warning when not grounded
    let missingSourceWarning: string | undefined = undefined;
    if (groundingStatus === 'NOT_GROUNDED') {
      missingSourceWarning = '⚠️ इस information का verified source platform में उपलब्ध नहीं है. कृपया NCERT अधिकृत पाठ्यपुस्तक से पुष्टि करें.';
    }

    return {
      groundingStatus,
      citations,
      concepts,
      question: questionData,
      studentMastery,
      studentMistake,
      relatedPYQs,
      missingSourceWarning,
    };
  }
}
