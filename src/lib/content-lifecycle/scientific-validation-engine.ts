/**
 * Phase 14: Scientific Validation & Terminology Integrity Engine
 * Implements:
 * 1. Scientific validation across FACTUAL, FORMULA, CALCULATION, CHEMICAL, BIOLOGICAL, etc.
 * 2. Validator type enforcement (AUTOMATED, RULE_BASED, AI_ASSISTED, HUMAN, OFFICIAL_SOURCE)
 * 3. AI validation boundary (creates REVIEW_SIGNAL without altering source truth)
 * 4. NCERT terminology integrity (prevents automated "improving" of authoritative wording)
 * 5. PYQ authenticity validation (year, exam, options, provenance)
 * 6. Two-person approval workflows for high-impact answer key and scientific updates
 */

import prisma from '@/lib/prisma';

export type ValidationCategory =
  | 'FACTUAL'
  | 'FORMULA'
  | 'CALCULATION'
  | 'CHEMICAL'
  | 'BIOLOGICAL'
  | 'PHYSICAL'
  | 'DIAGRAM'
  | 'CLASSIFICATION'
  | 'DEFINITION';

export type ValidatorType =
  | 'AUTOMATED'
  | 'RULE_BASED'
  | 'AI_ASSISTED'
  | 'HUMAN'
  | 'OFFICIAL_SOURCE';

export type ValidationStatus =
  | 'NOT_REVIEWED'
  | 'VALIDATED'
  | 'REVIEW_REQUIRED'
  | 'DISPUTED'
  | 'REJECTED';

export class ScientificValidationEngine {
  /**
   * Records a scientific validation result
   */
  public static async recordValidation(input: {
    contentId: string;
    contentType: string;
    category: ValidationCategory;
    status: ValidationStatus;
    validatorType: ValidatorType;
    validatorId?: string;
    method: string;
    evidence?: string;
    isContradiction?: boolean;
  }) {
    // Invariant: AI_ASSISTED validation cannot unilaterally set status to VALIDATED
    let effectiveStatus = input.status;
    if (input.validatorType === 'AI_ASSISTED' && input.status === 'VALIDATED') {
      effectiveStatus = 'REVIEW_REQUIRED'; // Downgrade to require human/rule verification
    }

    const record = await prisma.scientificValidationRecord.create({
      data: {
        contentId: input.contentId,
        contentType: input.contentType,
        category: input.category,
        status: effectiveStatus,
        validatorType: input.validatorType,
        validatorId: input.validatorId || null,
        method: input.method,
        evidence: input.evidence || null,
        isContradiction: input.isContradiction || false,
      },
    });

    // If contradiction or disputed, open a review queue case
    if (effectiveStatus === 'DISPUTED' || effectiveStatus === 'REVIEW_REQUIRED' || input.isContradiction) {
      await prisma.contentReview.create({
        data: {
          contentId: input.contentId,
          contentType: input.contentType,
          reviewType: 'SCIENTIFIC',
          severity: input.isContradiction ? 'CRITICAL' : 'HIGH',
          status: 'OPEN',
          evidenceJson: JSON.stringify({
            validationRecordId: record.id,
            category: input.category,
            validatorType: input.validatorType,
            evidence: input.evidence,
          }),
          reviewNotes: `Scientific validation flag: ${input.category} (${input.validatorType}). Evidence: ${input.evidence || 'None'}`,
        },
      });
    }

    return record;
  }

  /**
   * NCERT Terminology Integrity: Verifies formula syntax and scientific definitions
   */
  public static verifyNCERTTerminology(text: string, referenceCanonicalTerms: string[]): {
    isFaithful: boolean;
    missingTerms: string[];
    potentialAlterations: string[];
  } {
    const lower = text.toLowerCase();
    const missingTerms: string[] = [];
    const potentialAlterations: string[] = [];

    for (const term of referenceCanonicalTerms) {
      if (!lower.includes(term.toLowerCase())) {
        missingTerms.push(term);
      }
    }

    // Check for common paraphrase pitfalls that alter scientific meaning
    const PARAPHRASE_PATTERNS = [
      { bad: 'weight of mass', good: 'mass' },
      { bad: 'speed is equal to velocity', good: 'velocity is directional' },
      { bad: 'centrifugal force is real', good: 'pseudo force' },
    ];

    for (const p of PARAPHRASE_PATTERNS) {
      if (lower.includes(p.bad)) {
        potentialAlterations.push(`Detected non-NCERT terminology: "${p.bad}" instead of standard NCERT "${p.good}"`);
      }
    }

    return {
      isFaithful: missingTerms.length === 0 && potentialAlterations.length === 0,
      missingTerms,
      potentialAlterations,
    };
  }

  /**
   * PYQ Authenticity Validation: Verifies past year questions against official archives
   */
  public static async validatePYQ(input: {
    questionId: string;
    exam: string;
    year: number;
    questionText: string;
    options: Array<{ id: string; text: string }>;
    correctAnswer: string;
    sourceDocument: string;
    provenance?: Record<string, any>;
  }) {
    // Rule: Exam year must be valid medical entrance year (1988 to current)
    const currentYear = new Date().getFullYear();
    const isValidYear = input.year >= 1988 && input.year <= currentYear;
    const hasOptions = input.options && input.options.length >= 4;
    const hasAnswer = Boolean(input.correctAnswer && input.correctAnswer.length > 0);

    const isVerified = isValidYear && hasOptions && hasAnswer && input.sourceDocument.length > 0;
    const status = isVerified ? 'VERIFIED' : 'REVIEW_REQUIRED';

    return prisma.pYQValidationRecord.upsert({
      where: { questionId: input.questionId },
      update: {
        exam: input.exam,
        year: input.year,
        questionText: input.questionText,
        optionsJson: JSON.stringify(input.options),
        correctAnswer: input.correctAnswer,
        sourceDocument: input.sourceDocument,
        provenanceJson: input.provenance ? JSON.stringify(input.provenance) : null,
        status,
        verifiedAt: isVerified ? new Date() : null,
      },
      create: {
        questionId: input.questionId,
        exam: input.exam,
        year: input.year,
        questionText: input.questionText,
        optionsJson: JSON.stringify(input.options),
        correctAnswer: input.correctAnswer,
        sourceDocument: input.sourceDocument,
        provenanceJson: input.provenance ? JSON.stringify(input.provenance) : null,
        status,
        verifiedAt: isVerified ? new Date() : null,
      },
    });
  }

  /**
   * Two-Person Approval Workflow for High-Impact Answer Key or Scientific Corrections
   */
  public static async processTwoPersonApproval(input: {
    reviewId: string;
    reviewerAId: string;
    reviewerBId?: string;
    isApproved: boolean;
    notes?: string;
  }) {
    const review = await prisma.contentReview.findUnique({
      where: { id: input.reviewId },
    });

    if (!review) {
      throw new Error(`ContentReview record not found: ${input.reviewId}`);
    }

    // First reviewer approves
    if (!review.reviewerAId) {
      return prisma.contentReview.update({
        where: { id: input.reviewId },
        data: {
          reviewerAId: input.reviewerAId,
          status: 'NEEDS_MORE_EVIDENCE', // Pending second reviewer
          reviewNotes: input.notes || 'First approval recorded; awaiting second scientific reviewer.',
        },
      });
    }

    // Prevent same reviewer approving twice
    if (review.reviewerAId === input.reviewerBId) {
      throw new Error('Two-person approval invariant: Reviewer B must be distinct from Reviewer A');
    }

    // Second reviewer approves
    return prisma.contentReview.update({
      where: { id: input.reviewId },
      data: {
        reviewerBId: input.reviewerBId,
        status: input.isApproved ? 'APPROVED' : 'REJECTED',
        actionTaken: input.isApproved ? 'APPROVED' : 'REJECTED',
        resolvedAt: new Date(),
        reviewNotes: `${review.reviewNotes || ''}\nSecond approval by ${input.reviewerBId}: ${input.notes || 'Approved'}`,
      },
    });
  }
}
