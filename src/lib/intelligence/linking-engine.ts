import prisma from '../prisma';

export interface ConceptLinkResult {
  questionId: string;
  primaryConceptId: string | null;
  secondaryConceptIds: string[];
  confidenceScore: number;
  mappingStatus: 'AUTO_MAPPED' | 'REVIEW_REQUIRED' | 'MANUALLY_MAPPED';
  reason: string;
}

export class QuestionConceptLinkingEngine {
  /**
   * Links a question to the most relevant NCERT concept based on keyword and formula matching.
   * High confidence (>= 0.70) => AUTO_MAPPED
   * Low/moderate confidence (< 0.70) => REVIEW_REQUIRED (never silently link with low confidence)
   */
  static async linkQuestionToConcepts(
    questionId: string,
    chapterId: string,
    questionText: string,
    optionsText: string = ''
  ): Promise<ConceptLinkResult> {
    const fullText = `${questionText} ${optionsText}`.toLowerCase();

    // Fetch all concepts in this chapter
    const concepts = await prisma.concept.findMany({
      where: { chapterId },
    });

    if (concepts.length === 0) {
      return {
        questionId,
        primaryConceptId: null,
        secondaryConceptIds: [],
        confidenceScore: 0.0,
        mappingStatus: 'REVIEW_REQUIRED',
        reason: 'No concepts available in this chapter yet.',
      };
    }

    const scoredConcepts = concepts.map((concept) => {
      let score = 0;
      const conceptTokens = concept.name.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
      
      // Check concept title token overlap
      for (const token of conceptTokens) {
        if (fullText.includes(token)) {
          score += 0.3;
        }
      }

      // Check definition keyword overlap
      if (concept.definition) {
        const defTokens = concept.definition.toLowerCase().split(/\s+/).filter((t) => t.length > 4);
        for (const token of defTokens) {
          if (fullText.includes(token)) {
            score += 0.15;
          }
        }
      }

      // Check formula symbols
      if (concept.formula && fullText.includes(concept.formula.toLowerCase())) {
        score += 0.5;
      }

      // Check laws/scientific names
      if (concept.laws && fullText.includes(concept.laws.toLowerCase())) {
        score += 0.4;
      }

      // Cap at 1.0
      const finalScore = Math.min(score, 1.0);
      return { concept, score: finalScore };
    });

    // Sort by score descending
    scoredConcepts.sort((a, b) => b.score - a.score);

    const best = scoredConcepts[0];
    const secondBest = scoredConcepts.slice(1, 3).filter((s) => s.score > 0.3);

    const confidenceScore = Number(best.score.toFixed(2));
    const isHighConfidence = confidenceScore >= 0.7;

    const mappingStatus: 'AUTO_MAPPED' | 'REVIEW_REQUIRED' = isHighConfidence
      ? 'AUTO_MAPPED'
      : 'REVIEW_REQUIRED';

    const primaryConceptId = isHighConfidence ? best.concept.id : (confidenceScore > 0.4 ? best.concept.id : null);
    const secondaryConceptIds = secondBest.map((s) => s.concept.id);

    const linkConfidence = isHighConfidence ? 'HIGH' : (confidenceScore >= 0.4 ? 'MEDIUM' : 'LOW');
    const linkMethod = confidenceScore >= 0.8 ? 'EXACT_TERM' : 'KEYWORD';

    // Update in database
    await prisma.question.update({
      where: { id: questionId },
      data: {
        primaryConceptId,
        secondaryConceptIds: JSON.stringify(secondaryConceptIds),
        mappingStatus,
        qualityScore: confidenceScore,
        linkConfidence,
        linkMethod,
      },
    });

    return {
      questionId,
      primaryConceptId,
      secondaryConceptIds,
      confidenceScore,
      mappingStatus,
      reason: isHighConfidence
        ? `High keyword & concept concordance (${(confidenceScore * 100).toFixed(0)}%)`
        : `Moderate/low confidence (${(confidenceScore * 100).toFixed(0)}%). Marked for admin review.`,
    };
  }
}
