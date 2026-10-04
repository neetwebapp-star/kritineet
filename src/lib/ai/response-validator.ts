/**
 * Phase 6: AI Response Validator
 * Enforces strict grounding, citation integrity, and eliminates hallucinated
 * answer keys or unverified claims.
 */

import { RetrievedGroundingContext, VerifiedCitation } from './knowledge-retriever';

export interface ValidationReport {
  isValid: boolean;
  groundingStatus: 'GROUNDED' | 'PARTIALLY_GROUNDED' | 'NOT_GROUNDED';
  sanitizedContent: string;
  sanitizedCitations: VerifiedCitation[];
  correctOptionVerified: boolean;
  warnings: string[];
}

export class ResponseValidator {
  public static validate(
    generatedContent: string,
    context: RetrievedGroundingContext
  ): ValidationReport {
    const warnings: string[] = [];
    let sanitized = generatedContent;
    let correctOptionVerified = true;

    // 1. Validate Option Key Integrity if question is present
    if (context.question) {
      const correctOpt = context.question.correctOption.toUpperCase();
      // Check if text mentions a different option as correct
      const optionMatches = generatedContent.match(/correct option\s*[:=-]?\s*\(?([A-D])\)?/i);
      if (optionMatches && optionMatches[1]) {
        const statedOpt = optionMatches[1].toUpperCase();
        if (statedOpt !== correctOpt) {
          warnings.push(`Stated option ${statedOpt} contradicted verified database option ${correctOpt}. Corrected.`);
          sanitized = sanitized.replace(
            /correct option\s*[:=-]?\s*\(?[A-D]\)?/gi,
            `Correct Option: (${correctOpt})`
          );
          correctOptionVerified = false;
        }
      }
    }

    // 2. Ensure No Internal Database UUIDs / CUIDs Leak into Citations or Content
    // Strip strings matching cuid (cmun... or 25-char alphanumeric) or uuid (8-4-4-4-12)
    const cuidPattern = /\b(c[a-z0-9]{24})\b/gi;
    const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

    sanitized = sanitized.replace(cuidPattern, '[Reference]').replace(uuidPattern, '[Reference]');

    const sanitizedCitations = context.citations.map(c => ({
      ...c,
      title: c.title.replace(cuidPattern, '').replace(uuidPattern, '').trim(),
      chapterTitle: c.chapterTitle?.replace(cuidPattern, '').replace(uuidPattern, '')?.trim(),
    }));

    // 3. Grounding Enforcement & Disclaimer
    let finalGroundingStatus = context.groundingStatus;

    if (finalGroundingStatus === 'NOT_GROUNDED') {
      const standardDisclaimer = '⚠️ इस information का verified source platform में उपलब्ध नहीं है. कृपया NCERT अधिकृत पाठ्यपुस्तक से पुष्टि करें.';
      if (!sanitized.includes('इस information का verified source platform में उपलब्ध नहीं है')) {
        sanitized = `${sanitized}\n\n> ${standardDisclaimer}`;
      }
    }

    return {
      isValid: warnings.length === 0,
      groundingStatus: finalGroundingStatus,
      sanitizedContent: sanitized,
      sanitizedCitations,
      correctOptionVerified,
      warnings,
    };
  }
}
