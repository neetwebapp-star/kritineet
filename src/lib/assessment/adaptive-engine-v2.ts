import prisma from '../prisma';

export type AdaptiveAlgorithm = 'STATIC' | 'RULE_BASED_ADAPTIVE' | 'ABILITY_ESTIMATION' | 'IRT_READY';

export interface AdaptiveSelectionConfig {
  userId: string;
  targetCount?: number;
  count?: number;
  subjectCode?: string;
  subjectId?: string;
  chapterSlug?: string;
  preferredDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  algorithm?: AdaptiveAlgorithm;
  excludeOverexposed?: boolean;
}

export interface SelectedQuestionWithExplanation {
  questionId: string;
  stem: string;
  options: Array<{ label: string; text: string }>;
  difficulty: string;
  observedDifficulty: string;
  subject: string;
  chapterTitle: string;
  selectedBecause: string[];
  selectionScore: number;
}

export class AdaptiveEngineV2 {
  /**
   * Adaptive Question Selection 2.0 with multi-factor scoring and explainability.
   * Internal assessment technology strictly distinct from official NEET exam delivery.
   */
  static async selectAdaptiveQuestions(config: AdaptiveSelectionConfig): Promise<SelectedQuestionWithExplanation[]> {
    const targetCount = config.targetCount || config.count || 10;
    const algorithm = config.algorithm || 'RULE_BASED_ADAPTIVE';

    // 1. Fetch student baseline & concept masteries
    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId: config.userId },
      select: {
        conceptId: true,
        masteryScore: true,
        status: true,
      },
    });
    const masteryMap = new Map<string, number>();
    masteries.forEach((m) => masteryMap.set(m.conceptId, m.masteryScore));

    // 2. Fetch student exposures to penalize overexposed questions
    const exposures = await prisma.questionExposure.findMany({
      where: { userId: config.userId },
      select: {
        questionId: true,
        timesAttempted: true,
        state: true,
        lastAttemptedAt: true,
      },
    });
    const exposureMap = new Map<string, { times: number; state: string; lastSeen: Date }>();
    exposures.forEach((e) => exposureMap.set(e.questionId, { times: e.timesAttempted, state: e.state, lastSeen: e.lastAttemptedAt }));

    // 3. Fetch student active unresolved mistakes
    const mistakes = await prisma.studentMistake.findMany({
      where: { userId: config.userId, isResolved: false },
      select: { questionId: true, mistakeCount: true },
    });
    const mistakeMap = new Map<string, number>();
    mistakes.forEach((m) => mistakeMap.set(m.questionId, m.mistakeCount));

    // 4. Candidate pool: Only ACTIVE / MONITORED and CURRENT syllabus
    const whereClause: any = {
      assessmentStatus: { in: ['ACTIVE', 'MONITORED'] },
      syllabusStatus: { in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'] },
      verificationStatus: 'VERIFIED',
      publicationStatus: 'PUBLISHED',
      duplicateOfId: null,
    };

    if (config.subjectId) {
      whereClause.subjectId = config.subjectId;
    } else if (config.subjectCode && config.subjectCode !== 'ALL') {
      whereClause.subject = { code: config.subjectCode.toUpperCase() };
    }
    if (config.chapterSlug) {
      whereClause.chapter = { slug: config.chapterSlug };
    }

    const candidateQuestions = await prisma.question.findMany({
      where: whereClause,
      take: targetCount * 5,
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        chapter: { include: { subject: true } },
        primaryConcept: true,
        assessmentProfile: true,
      },
    });

    // 5. Score candidates with multi-factor heuristics
    const scoredCandidates: Array<{
      question: any;
      score: number;
      reasons: string[];
    }> = [];

    const now = new Date();

    for (const q of candidateQuestions) {
      let score = 100;
      const reasons: string[] = [];

      const exp = exposureMap.get(q.id);
      const isOverexposed = exp?.state === 'OVEREXPOSED' || (exp && exp.times >= 4);

      // Overexposure penalty
      if (isOverexposed) {
        if (config.excludeOverexposed) continue;
        score -= 60;
        reasons.push('Overexposure penalty applied (attempted 4+ times)');
      } else if (!exp) {
        score += 25;
        reasons.push('Unseen question: fresh practice exposure');
      } else {
        const daysSinceSeen = Math.floor((now.getTime() - exp.lastSeen.getTime()) / (24 * 3600 * 1000));
        if (daysSinceSeen > 14) {
          score += 15;
          reasons.push(`Spaced practice: not seen in ${daysSinceSeen} days`);
        }
      }

      // Concept Mastery alignment
      const conceptScore = q.primaryConceptId ? masteryMap.get(q.primaryConceptId) : null;
      if (conceptScore !== null && conceptScore !== undefined) {
        if (conceptScore < 50) {
          score += 35;
          reasons.push(`Targeted weak concept remediation (mastery is ${conceptScore}%)`);
        } else if (conceptScore >= 75) {
          score -= 10;
          reasons.push(`High mastery concept (${conceptScore}%): lower priority`);
        }
      }

      // Mistake retry boost
      const mistakeTimes = mistakeMap.get(q.id);
      if (mistakeTimes && mistakeTimes > 0) {
        score += 40;
        reasons.push(`Unresolved mistake detected (${mistakeTimes} previous error${mistakeTimes > 1 ? 's' : ''})`);
      }

      // Quality score weighting
      if (q.assessmentProfile) {
        if (q.assessmentProfile.qualityScore >= 0.8) {
          score += 15;
          reasons.push(`High psychometric quality item (quality: ${q.assessmentProfile.qualityScore})`);
        }
        if (q.assessmentProfile.observedDifficulty) {
          reasons.push(`Observed difficulty calibrated at ${q.assessmentProfile.observedDifficulty}`);
        }
      }

      // Preferred difficulty matching
      if (config.preferredDifficulty) {
        const effDiff = q.assessmentProfile?.observedDifficulty || q.difficulty;
        if (effDiff === config.preferredDifficulty) {
          score += 20;
          reasons.push(`Matches requested ${config.preferredDifficulty} difficulty`);
        }
      }

      scoredCandidates.push({
        question: q,
        score,
        reasons,
      });
    }

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Select top candidates up to targetCount
    const selected = scoredCandidates.slice(0, targetCount);

    return selected.map((s) => ({
      questionId: s.question.id,
      stem: s.question.questionText,
      options: s.question.options.map((o: any) => ({ label: o.label, text: o.text })),
      difficulty: s.question.difficulty,
      observedDifficulty: s.question.assessmentProfile?.observedDifficulty || s.question.difficulty,
      subject: s.question.chapter.subject.name,
      chapterTitle: s.question.chapter.title,
      selectedBecause: s.reasons,
      selectionScore: s.score,
    }));
  }
}
