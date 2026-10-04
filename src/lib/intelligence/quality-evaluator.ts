export interface QualityEvaluationInput {
  questionText: string;
  options: Array<{ label: string; text: string }>;
  correctOption?: string;
  explanation?: string;
  ocrConfidence?: number;
  chapterId?: string;
  primaryConceptId?: string | null;
  sourceType: string;
  examYear?: number | null;
}

export interface QualityAssessmentResult {
  score: number; // 0.0 to 1.0
  score100?: number;
  qualityBand?: 'VERIFIED' | 'GOOD' | 'REVIEW_RECOMMENDED' | 'NEEDS_REVIEW';
  passedThreshold: boolean;
  requiresReview: boolean;
  warnings: string[];
  metrics: {
    ocrQuality: number;
    questionCompleteness: number;
    optionCompleteness: number;
    answerKeyConfidence: number;
    mappingConfidence: number;
    provenanceConfidence: number;
  };
}

export class QuestionQualityEvaluator {
  /**
   * Evaluates internal question quality score across 6 dimensions
   */
  static evaluate(input: QualityEvaluationInput): QualityAssessmentResult {
    const warnings: string[] = [];

    // 1. OCR Quality (0-1)
    const ocrQuality = input.ocrConfidence ?? 1.0;
    if (ocrQuality < 0.85) {
      warnings.push(`Low OCR confidence: ${(ocrQuality * 100).toFixed(1)}%`);
    }

    // 2. Question Completeness (0-1)
    let questionCompleteness = 1.0;
    const textLen = input.questionText.trim().length;
    if (textLen < 15) {
      questionCompleteness = 0.2;
      warnings.push('Question text is suspiciously short (< 15 chars)');
    } else if (textLen < 30) {
      questionCompleteness = 0.6;
    }
    // Check if question ends with punctuation or colon/question mark
    if (!/[?.!:\)]$/.test(input.questionText.trim())) {
      questionCompleteness = Math.max(0.5, questionCompleteness - 0.2);
      warnings.push('Question text does not terminate cleanly');
    }

    // 3. Option Completeness (0-1)
    let optionCompleteness = 1.0;
    const labels = new Set(input.options.map((o) => o.label.toUpperCase()));
    const expectedLabels = ['A', 'B', 'C', 'D'];
    const missing = expectedLabels.filter((l) => !labels.has(l));

    if (missing.length > 0) {
      optionCompleteness = Math.max(0.0, 1.0 - missing.length * 0.25);
      warnings.push(`Missing options: ${missing.join(', ')}`);
    }

    for (const opt of input.options) {
      if (!opt.text || opt.text.trim().length === 0) {
        optionCompleteness = Math.min(optionCompleteness, 0.4);
        warnings.push(`Empty option text for option ${opt.label}`);
      }
    }

    // 4. Answer-Key Confidence (0-1)
    let answerKeyConfidence = 1.0;
    if (!input.correctOption || !['A', 'B', 'C', 'D'].includes(input.correctOption.toUpperCase())) {
      answerKeyConfidence = 0.0;
      warnings.push('No valid official answer key option specified');
    }

    // 5. Concept & Chapter Mapping Confidence (0-1)
    let mappingConfidence = 0.5;
    if (input.chapterId) mappingConfidence += 0.3;
    if (input.primaryConceptId) mappingConfidence += 0.2;
    if (!input.primaryConceptId) {
      warnings.push('No primary NCERT concept mapped yet');
    }

    // 6. Source Provenance (0-1)
    let provenanceConfidence = 0.6;
    if (input.sourceType === 'PYQ') {
      if (input.examYear && input.examYear > 1990 && input.examYear <= 2026) {
        provenanceConfidence = 1.0;
      } else {
        provenanceConfidence = 0.3;
        warnings.push('PYQ missing verified exam year');
      }
    } else {
      provenanceConfidence = 0.9;
    }

    // Weighted composite score (Internal only - Never expose to student)
    let compositeScore = Number(
      (
        ocrQuality * 0.2 +
        questionCompleteness * 0.2 +
        optionCompleteness * 0.25 +
        answerKeyConfidence * 0.2 +
        mappingConfidence * 0.1 +
        provenanceConfidence * 0.05
      ).toFixed(2)
    );

    // Explanation quality factor
    if (input.explanation && input.explanation.length > 20) {
      compositeScore = Math.min(1.0, compositeScore + 0.05);
    }

    const score100 = Math.round(compositeScore * 100);
    let qualityBand: 'VERIFIED' | 'GOOD' | 'REVIEW_RECOMMENDED' | 'NEEDS_REVIEW' = 'NEEDS_REVIEW';
    if (score100 >= 95) qualityBand = 'VERIFIED';
    else if (score100 >= 85) qualityBand = 'GOOD';
    else if (score100 >= 70) qualityBand = 'REVIEW_RECOMMENDED';

    const requiresReview = compositeScore < 0.85 || warnings.length > 0;

    return {
      score: compositeScore,
      score100,
      qualityBand,
      passedThreshold: compositeScore >= 0.85,
      requiresReview,
      warnings,
      metrics: {
        ocrQuality,
        questionCompleteness,
        optionCompleteness,
        answerKeyConfidence,
        mappingConfidence,
        provenanceConfidence,
      },
    };
  }
}
