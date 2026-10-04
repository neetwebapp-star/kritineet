import prisma from '../prisma';
import crypto from 'crypto';

export interface FingertipsQuestionInput {
  stableId: string;
  questionText: string;
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  chapterSlug: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sourcePage?: number;
  sourceDocumentId?: string;
}

export class FingertipsQuestionEngine {
  /**
   * Generates a normalized text fingerprint for exact and near-duplicate matching
   */
  static generateFingerprint(questionText: string, options: Array<{ label: string; text: string }>): string {
    const cleanText = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanOptions = options
      .map((o) => o.text.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .sort()
      .join('');
    return crypto.createHash('sha256').update(`${cleanText}::${cleanOptions}`).digest('hex');
  }

  /**
   * Calculate Jaccard similarity between two string token sets
   */
  static calculateTextSimilarity(a: string, b: string): number {
    const setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
    const setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
    if (setA.size === 0 || setB.size === 0) return 0;
    
    let intersection = 0;
    for (const token of setA) {
      if (setB.has(token)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
  }

  /**
   * Process and ingest a question from MTG Fingertips.
   * Duplicate detection: Never delete duplicates automatically; mark as DUPLICATE_CANDIDATE.
   */
  static async ingestQuestion(input: FingertipsQuestionInput) {
    const fingerprint = this.generateFingerprint(input.questionText, input.options);

    // Check for exact duplicate fingerprint
    const existingExact = await prisma.question.findFirst({
      where: { fingerprint },
    });

    let verificationStatus = 'NEEDS_REVIEW';
    let qualityFlags: string[] = [];

    if (existingExact) {
      verificationStatus = 'DUPLICATE_CANDIDATE';
      qualityFlags.push(`Exact duplicate detected with existing question: ${existingExact.id}`);
    } else {
      // Check for near-duplicates in the same chapter
      const chapterQuestions = await prisma.question.findMany({
        where: { chapter: { slug: input.chapterSlug } },
        take: 50,
        select: { id: true, questionText: true },
      });

      for (const candidate of chapterQuestions) {
        const similarity = this.calculateTextSimilarity(input.questionText, candidate.questionText);
        if (similarity > 0.85) {
          verificationStatus = 'DUPLICATE_CANDIDATE';
          qualityFlags.push(`High near-duplicate similarity (${(similarity * 100).toFixed(1)}%) with question: ${candidate.id}`);
          break;
        }
      }
    }

    const chapter = await prisma.chapter.findUnique({
      where: { slug: input.chapterSlug },
      include: { subject: { include: { classLevel: true } } },
    });

    if (!chapter) {
      throw new Error(`Target chapter slug '${input.chapterSlug}' not found in canonical hierarchy.`);
    }

    // Ingest with proper provenance
    const question = await prisma.question.upsert({
      where: { id: input.stableId },
      update: {
        questionText: input.questionText,
        correctOption: input.correctOption,
        explanation: input.explanation,
        difficulty: input.difficulty || 'MEDIUM',
        sourcePage: input.sourcePage,
        sourceDocumentId: input.sourceDocumentId,
        verificationStatus,
        publicationStatus: 'UNPUBLISHED',
        fingerprint,
        qualityFlags: qualityFlags.length > 0 ? JSON.stringify(qualityFlags) : null,
      },
      create: {
        id: input.stableId,
        questionText: input.questionText,
        questionType: 'SINGLE_CORRECT',
        difficulty: input.difficulty || 'MEDIUM',
        subjectId: chapter.subject.id,
        classLevelId: chapter.subject.classLevel.id,
        chapterId: chapter.id,
        sourceType: 'FINGERTIPS',
        sourceDocumentId: input.sourceDocumentId,
        sourcePage: input.sourcePage,
        verificationStatus,
        publicationStatus: 'UNPUBLISHED',
        correctOption: input.correctOption,
        explanation: input.explanation,
        fingerprint,
        qualityFlags: qualityFlags.length > 0 ? JSON.stringify(qualityFlags) : null,
      },
    });

    // Save options
    for (let i = 0; i < input.options.length; i++) {
      const opt = input.options[i];
      await prisma.questionOption.upsert({
        where: {
          questionId_label: {
            questionId: question.id,
            label: opt.label,
          },
        },
        update: { text: opt.text, orderIndex: i + 1 },
        create: {
          questionId: question.id,
          label: opt.label,
          text: opt.text,
          orderIndex: i + 1,
        },
      });
    }

    return {
      question,
      isDuplicateCandidate: verificationStatus === 'DUPLICATE_CANDIDATE',
      qualityFlags,
    };
  }
}
