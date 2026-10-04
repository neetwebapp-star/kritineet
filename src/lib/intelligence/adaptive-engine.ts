import prisma from '../prisma';
import { QuestionExposureEngine } from './question-exposure-engine';

export interface AdaptivePracticeConfig {
  targetCount: number;
  subjectCode?: string;
  classLevelCode?: string;
  preferredDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  preferredSource?: 'ALL' | 'PYQ' | 'FINGERTIPS' | 'NCERT';
  includeOutOfSyllabus?: boolean;
}

export class AdaptivePracticeEngine {
  /**
   * Upgraded Phase 4 Adaptive Question Selection Algorithm:
   * 1. Evaluates student knowledge profile (weak concepts in StudentConceptMastery)
   * 2. Incorporates due spaced revision questions
   * 3. Governs difficulty progression:
   *    - Weak concept / recent errors => EASY / MEDIUM progression
   *    - Strong concepts => MEDIUM / HARD progression
   * 4. Multi-source balancing: NCERT (foundations) -> Fingertips (drills) -> PYQs (exam validation)
   * 5. Deprioritizes MASTERED questions using QuestionExposureEngine
   * 6. Strictly excludes duplicates (duplicateOfId)
   * Invariant: Never select unverified or unpublished questions.
   */
  static async selectAdaptiveQuestions(userId: string, config: AdaptivePracticeConfig) {
    const targetCount = config.targetCount || 15;

    // 1. Fetch student's profile & accuracy
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    const accuracy = profile?.accuracyRate ?? 65.0;

    // 2. Fetch student's weak concepts (status = 'WEAK' or masteryScore < 55)
    const weakConceptRecords = await prisma.studentConceptMastery.findMany({
      where: {
        userId,
        OR: [
          { status: 'WEAK' },
          { masteryScore: { lt: 55.0 } },
          { consecutiveIncorrect: { gte: 2 } },
        ],
      },
      take: 6,
      orderBy: { masteryScore: 'asc' },
      select: { conceptId: true, masteryScore: true },
    });

    const weakConceptIds = weakConceptRecords.map((w) => w.conceptId);

    // 3. Fetch active unlearned mistakes
    const activeMistakes = await prisma.studentMistake.findMany({
      where: { userId, isLearned: false },
      take: 5,
      orderBy: { mistakeCount: 'desc' },
      select: { questionId: true, conceptId: true },
    });

    const mistakeQids = activeMistakes.map((m) => m.questionId);
    for (const m of activeMistakes) {
      if (m.conceptId && !weakConceptIds.includes(m.conceptId)) {
        weakConceptIds.push(m.conceptId);
      }
    }

    // 4. Determine target difficulty
    let targetDifficulty: 'EASY' | 'MEDIUM' | 'HARD' = config.preferredDifficulty || 'MEDIUM';
    if (!config.preferredDifficulty) {
      if (accuracy >= 80) targetDifficulty = 'HARD';
      else if (accuracy < 55) targetDifficulty = 'EASY';
      else targetDifficulty = 'MEDIUM';
    }

    const selectedQuestionIds = new Set<string>();
    const resultQuestions: any[] = [];

    // Base query: ONLY VERIFIED + PUBLISHED
    const baseWhere: any = {
      verificationStatus: 'VERIFIED',
      publicationStatus: 'PUBLISHED',
      duplicateOfId: null, // Avoid duplicate copies
      ...(!config.includeOutOfSyllabus && {
        syllabusStatus: { in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'] },
      }),
    };

    if (config.subjectCode && config.subjectCode !== 'ALL') {
      baseWhere.subject = { code: config.subjectCode };
    }
    if (config.classLevelCode && config.classLevelCode !== 'ALL') {
      baseWhere.classLevel = { code: config.classLevelCode };
    }
    if (config.preferredSource && config.preferredSource !== 'ALL') {
      if (config.preferredSource === 'NCERT') {
        baseWhere.sourceType = { in: ['NCERT', 'NCERT_EXERCISE', 'NCERT_EXEMPLAR'] };
      } else {
        baseWhere.sourceType = config.preferredSource;
      }
    }

    // TIER 1: Unaddressed mistakes (Retry with prior error context)
    if (mistakeQids.length > 0) {
      const mistakeQuestions = await prisma.question.findMany({
        where: {
          ...baseWhere,
          id: { in: mistakeQids },
        },
        take: Math.ceil(targetCount * 0.3),
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
          primaryConcept: true,
          chapter: { include: { subject: true } },
        },
      });

      for (const q of mistakeQuestions) {
        if (!selectedQuestionIds.has(q.id) && resultQuestions.length < targetCount) {
          selectedQuestionIds.add(q.id);
          resultQuestions.push({
            ...q,
            selectionReason: 'Prior Mistake Remediation',
          });
        }
      }
    }

    // TIER 2: Weak concept targeted questions (Progression: EASY / MEDIUM)
    if (weakConceptIds.length > 0 && resultQuestions.length < targetCount) {
      const weakConceptQuestions = await prisma.question.findMany({
        where: {
          ...baseWhere,
          primaryConceptId: { in: weakConceptIds },
          id: { notIn: Array.from(selectedQuestionIds) },
          difficulty: { in: ['EASY', 'MEDIUM'] }, // Start easier for weak concepts
        },
        take: Math.ceil(targetCount * 0.4),
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
          primaryConcept: true,
          chapter: { include: { subject: true } },
        },
      });

      for (const q of weakConceptQuestions) {
        if (!selectedQuestionIds.has(q.id) && resultQuestions.length < targetCount) {
          selectedQuestionIds.add(q.id);
          resultQuestions.push({
            ...q,
            selectionReason: `Weak Concept Drill: ${q.primaryConcept?.name || 'Targeted'}`,
          });
        }
      }
    }

    // TIER 3: Calibrated difficulty questions (Avoid mastered exposures)
    const remainingNeeded = targetCount - resultQuestions.length;
    if (remainingNeeded > 0) {
      const candidateQuestions = await prisma.question.findMany({
        where: {
          ...baseWhere,
          id: { notIn: Array.from(selectedQuestionIds) },
          difficulty: targetDifficulty,
        },
        take: remainingNeeded * 3, // Over-fetch pool to rank by exposure
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
          primaryConcept: true,
          chapter: { include: { subject: true } },
        },
      });

      const candidateIds = candidateQuestions.map((q) => q.id);
      const rankedIds = await QuestionExposureEngine.rankQuestionsByExposure(userId, candidateIds);

      const qMap = new Map(candidateQuestions.map((q) => [q.id, q]));
      for (const qid of rankedIds) {
        const q = qMap.get(qid);
        if (q && !selectedQuestionIds.has(q.id) && resultQuestions.length < targetCount) {
          selectedQuestionIds.add(q.id);
          resultQuestions.push({
            ...q,
            selectionReason: `Adaptive Calibration (${targetDifficulty})`,
          });
        }
      }
    }

    // TIER 4: General fallback if constraints were too tight
    if (resultQuestions.length < targetCount) {
      const fallbackQuestions = await prisma.question.findMany({
        where: {
          ...baseWhere,
          id: { notIn: Array.from(selectedQuestionIds) },
        },
        take: targetCount - resultQuestions.length,
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
          primaryConcept: true,
          chapter: { include: { subject: true } },
        },
      });

      for (const q of fallbackQuestions) {
        if (!selectedQuestionIds.has(q.id)) {
          selectedQuestionIds.add(q.id);
          resultQuestions.push({
            ...q,
            selectionReason: 'Syllabus Coverage',
          });
        }
      }
    }

    return resultQuestions;
  }
}
