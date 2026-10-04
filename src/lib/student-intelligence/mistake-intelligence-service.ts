/**
 * Phase 15: Mistake Intelligence & Error Clustering Service
 * Detects recurring error categories, groups errors into descriptive clusters,
 * generates difficulty and source performance profiles, and integrates with
 * Phase 10 question anomalies.
 *
 * Core Invariant: Strictly describes observed errors without inferring
 * psychological traits (e.g. careless, lazy, undisciplined).
 */

import prisma from '@/lib/prisma';

export interface MistakeClusterSummary {
  clusterLabel: string;
  subject: string;
  errorCategory: string;
  occurrenceCount: number;
  distinctSessionsCount: number;
  affectedChaptersCount: number;
  targetedIntervention: string;
}

export interface DifficultyProfileResult {
  easy: { attempts: number; correct: number; accuracy: number; medianTimeMs: number };
  medium: { attempts: number; correct: number; accuracy: number; medianTimeMs: number };
  hard: { attempts: number; correct: number; accuracy: number; medianTimeMs: number };
}

export interface QuestionTypeProfileResult {
  [type: string]: { attempts: number; correct: number; accuracy: number; medianTimeMs: number };
}

export interface SourceProfileResult {
  pyq: { attempts: number; correct: number; accuracy: number };
  fingertips: { attempts: number; correct: number; accuracy: number };
  ncert: { attempts: number; correct: number; accuracy: number };
  aiGenerated: { attempts: number; correct: number; accuracy: number };
}

export class MistakeIntelligenceService {
  public static readonly VERSION = 'mistake-recurrence-v1';

  /**
   * Scans student mistake records and constructs recurrence profiles & clusters
   */
  public static async analyzeMistakeRecurrence(studentId: string): Promise<MistakeClusterSummary[]> {
    const mistakes = await prisma.studentMistake.findMany({
      where: { userId: studentId },
      include: {
        question: {
          select: {
            id: true,
            subject: { select: { code: true } },
            chapterId: true,
            primaryConceptId: true,
            questionType: true,
            difficulty: true,
          },
        },
      },
      orderBy: { lastMistakeAt: 'desc' },
    });

    // Group mistakes by [subject + errorCategory]
    const clusterMap = new Map<string, {
      subject: string;
      errorCategory: string;
      conceptIds: Set<string>;
      chapterIds: Set<string>;
      sessionCount: number;
      occurrenceCount: number;
    }>();

    for (const m of mistakes) {
      const subject = m.question.subject?.code || 'GENERAL';
      const category = m.mistakeType || 'CONCEPTUAL';
      const key = `${subject}_${category}`;

      if (!clusterMap.has(key)) {
        clusterMap.set(key, {
          subject,
          errorCategory: category,
          conceptIds: new Set(),
          chapterIds: new Set(),
          sessionCount: 0,
          occurrenceCount: 0,
        });
      }

      const cluster = clusterMap.get(key)!;
      cluster.occurrenceCount++;
      if (m.question.primaryConceptId) cluster.conceptIds.add(m.question.primaryConceptId);
      if (m.question.chapterId) cluster.chapterIds.add(m.question.chapterId);
    }

    const clusters: MistakeClusterSummary[] = [];

    for (const [key, data] of clusterMap.entries()) {
      if (data.occurrenceCount >= 2) {
        const clusterLabel = `${data.subject} / ${data.errorCategory} Recurrence`;
        const intervention = `Targeted ${data.errorCategory.toLowerCase()} remediation in ${data.subject} across ${data.chapterIds.size} chapters.`;

        clusters.push({
          clusterLabel,
          subject: data.subject,
          errorCategory: data.errorCategory,
          occurrenceCount: data.occurrenceCount,
          distinctSessionsCount: Math.max(1, Math.floor(data.occurrenceCount / 2)),
          affectedChaptersCount: data.chapterIds.size,
          targetedIntervention: intervention,
        });

        // Persist recurrence profile
        await prisma.mistakeRecurrenceProfile.upsert({
          where: {
            id: `rec_${studentId}_${key}`,
          },
          update: {
            occurrenceCount: data.occurrenceCount,
            distinctSessionsCount: Math.max(1, Math.floor(data.occurrenceCount / 2)),
            lastOccurredAt: new Date(),
            isClustered: true,
            clusterLabel,
            targetedIntervention: intervention,
          },
          create: {
            id: `rec_${studentId}_${key}`,
            studentId,
            subject: data.subject,
            errorCategory: data.errorCategory,
            occurrenceCount: data.occurrenceCount,
            distinctSessionsCount: Math.max(1, Math.floor(data.occurrenceCount / 2)),
            isClustered: true,
            clusterLabel,
            targetedIntervention: intervention,
          },
        });
      }
    }

    return clusters;
  }

  /**
   * Evaluates student accuracy and response times grouped by question difficulty
   */
  public static async getDifficultyProfile(studentId: string): Promise<DifficultyProfileResult> {
    const responses = await prisma.attemptEvent.findMany({
      where: { userId: studentId },
      include: {
        question: { select: { difficulty: true } },
      },
    });

    const groups: Record<string, { attempts: number; correct: number; times: number[] }> = {
      EASY: { attempts: 0, correct: 0, times: [] },
      MEDIUM: { attempts: 0, correct: 0, times: [] },
      HARD: { attempts: 0, correct: 0, times: [] },
    };

    for (const r of responses) {
      const diff = (r.question.difficulty || 'MEDIUM').toUpperCase();
      if (groups[diff]) {
        groups[diff].attempts++;
        if (r.isCorrect) groups[diff].correct++;
        if (r.timeSpentSeconds) groups[diff].times.push(r.timeSpentSeconds * 1000);
      }
    }

    const calcGroup = (g: { attempts: number; correct: number; times: number[] }) => {
      const acc = g.attempts > 0 ? Math.round((g.correct / g.attempts) * 1000) / 10 : 0;
      g.times.sort((a, b) => a - b);
      const medianTime = g.times.length > 0 ? g.times[Math.floor(g.times.length / 2)] : 0;
      return { attempts: g.attempts, correct: g.correct, accuracy: acc, medianTimeMs: medianTime };
    };

    return {
      easy: calcGroup(groups.EASY),
      medium: calcGroup(groups.MEDIUM),
      hard: calcGroup(groups.HARD),
    };
  }

  /**
   * Evaluates student performance by Question Type
   */
  public static async getQuestionTypeProfile(studentId: string): Promise<QuestionTypeProfileResult> {
    const responses = await prisma.attemptEvent.findMany({
      where: { userId: studentId },
      include: {
        question: { select: { questionType: true } },
      },
    });

    const result: QuestionTypeProfileResult = {};

    for (const r of responses) {
      const type = r.question.questionType || 'SINGLE_CORRECT';
      if (!result[type]) {
        result[type] = { attempts: 0, correct: 0, accuracy: 0, medianTimeMs: 0 };
      }
      result[type].attempts++;
      if (r.isCorrect) result[type].correct++;
    }

    for (const type of Object.keys(result)) {
      const item = result[type];
      item.accuracy = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 1000) / 10 : 0;
    }

    return result;
  }

  /**
   * Evaluates performance separated strictly by educational source: PYQ != FINGERTIPS != NCERT != AI_GENERATED
   */
  public static async getSourceProfile(studentId: string): Promise<SourceProfileResult> {
    const responses = await prisma.attemptEvent.findMany({
      where: { userId: studentId },
      include: {
        question: { select: { sourceType: true } },
      },
    });

    const counts: Record<string, { attempts: number; correct: number }> = {
      PYQ: { attempts: 0, correct: 0 },
      FINGERTIPS: { attempts: 0, correct: 0 },
      NCERT: { attempts: 0, correct: 0 },
      AI_GENERATED: { attempts: 0, correct: 0 },
    };

    for (const r of responses) {
      const src = (r.question.sourceType || 'NCERT').toUpperCase();
      if (counts[src]) {
        counts[src].attempts++;
        if (r.isCorrect) counts[src].correct++;
      }
    }

    const calcSrc = (s: { attempts: number; correct: number }) => ({
      attempts: s.attempts,
      correct: s.correct,
      accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 1000) / 10 : 0,
    });

    return {
      pyq: calcSrc(counts.PYQ),
      fingertips: calcSrc(counts.FINGERTIPS),
      ncert: calcSrc(counts.NCERT),
      aiGenerated: calcSrc(counts.AI_GENERATED),
    };
  }

  /**
   * Phase 10 Assessment Anomaly Integration:
   * Inspects if question had active anomalies (e.g. LOW_DISCRIMINATION, AMBIGUOUS_OPTIONS)
   * so performance is flagged rather than attributed solely to student weakness.
   */
  public static async checkQuestionAnomalyIntegration(questionId: string) {
    const anomalies = await prisma.questionAnomaly.findMany({
      where: {
        questionId,
        status: { in: ['FLAGGED', 'UNDER_REVIEW', 'CONFIRMED'] },
      },
      select: {
        anomalyType: true,
        severity: true,
        evidence: true,
      },
    });

    const isDistorted = anomalies.length > 0;
    return {
      isDistorted,
      anomalyCount: anomalies.length,
      anomalies,
      attributionNote: isDistorted
        ? `Question assessment quality is under review (${anomalies.map((a) => a.anomalyType).join(', ')}). Student outcome must be evaluated with caveat.`
        : null,
    };
  }
}
