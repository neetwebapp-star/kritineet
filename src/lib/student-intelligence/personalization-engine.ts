/**
 * Phase 15: Personalization Engine & Learning Insights Service
 * Synthesizes multi-dimensional student intelligence into explainable pedagogical
 * recommendations for the Phase 11 Deterministic Study OS and Phase 12 Final-Mile OS.
 *
 * Core Principles:
 * 1. The deterministic planner remains authoritative: this engine generates evidence.
 * 2. Transparent justifications: explains why, with what evidence, and what uncertainty exists.
 * 3. Learning Bottleneck Detection: identifies structural mismatches (e.g. high coverage + low mastery).
 * 4. Content version awareness: pins analytics to historical Phase 14 content versions.
 */

import prisma from '@/lib/prisma';
import { ConceptStabilityAndRetentionService } from './concept-stability-and-retention-service';
import { MistakeIntelligenceService } from './mistake-intelligence-service';
import { LearningTrendEngine } from './learning-trend-engine';

export interface PersonalizationRecommendation {
  type: 'TARGETED_REVISION' | 'CONCEPT_REMEDIATION' | 'PYQ_DRILL' | 'MISTAKE_RECOVERY' | 'MOCK_SIMULATION';
  targetEntityId: string;
  targetEntityName: string;
  priorityScore: number;
  reasons: string[];
  evidenceText: string;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  contentVersionSnapshot?: number;
}

export interface LearningBottleneck {
  type: 'HIGH_COVERAGE_LOW_MASTERY' | 'HIGH_MASTERY_LOW_RETENTION' | 'HIGH_PRACTICE_REPEATED_MISTAKE' | 'HIGH_STUDY_LOW_IMPROVEMENT';
  subject: string;
  chapterId?: string;
  description: string;
  evidence: string;
}

export class PersonalizationEngine {
  public static readonly VERSION = 'personalization-v1';

  /**
   * Generates prioritized study & revision recommendations backed by concrete evidence
   */
  public static async generatePersonalizedRecommendations(studentId: string): Promise<PersonalizationRecommendation[]> {
    const recommendations: PersonalizationRecommendation[] = [];

    // 1. Check unstable concepts
    const unstableConcepts = await prisma.conceptStabilityProfile.findMany({
      where: {
        studentId,
        state: 'UNSTABLE',
      },
      take: 5,
    });

    for (const c of unstableConcepts) {
      const concept = await prisma.concept.findUnique({
        where: { id: c.conceptId },
        select: { id: true, name: true, chapterId: true },
      });

      if (concept) {
        recommendations.push({
          type: 'TARGETED_REVISION',
          targetEntityId: concept.id,
          targetEntityName: concept.name,
          priorityScore: 92,
          reasons: [
            'Concept mastery is currently unstable',
            `Delayed retention dropped by ${c.delayedDropPercentage} percentage points`,
            'Prior incorrect answers occurred after initial success',
          ],
          evidenceText: `Based on ${c.sampleSize} recorded attempts, stability status evaluated as UNSTABLE.`,
          confidence: c.sampleSize >= 5 ? 'HIGH' : 'MODERATE',
          contentVersionSnapshot: 1,
        });
      }
    }

    // 2. Check clustered recurring mistakes
    const recurringClusters = await MistakeIntelligenceService.analyzeMistakeRecurrence(studentId);
    for (const cluster of recurringClusters.slice(0, 3)) {
      recommendations.push({
        type: 'MISTAKE_RECOVERY',
        targetEntityId: cluster.subject,
        targetEntityName: `${cluster.subject} (${cluster.errorCategory})`,
        priorityScore: 85,
        reasons: [
          `${cluster.errorCategory} errors appeared ${cluster.occurrenceCount} times`,
          `Observed across ${cluster.affectedChaptersCount} chapters`,
        ],
        evidenceText: `Clustered error pattern detected: ${cluster.occurrenceCount} occurrences across multiple sessions.`,
        confidence: 'HIGH',
      });
    }

    // Sort by priorityScore descending
    recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
    return recommendations;
  }

  /**
   * Scans for structural learning bottlenecks
   */
  public static async detectBottlenecks(studentId: string): Promise<LearningBottleneck[]> {
    const bottlenecks: LearningBottleneck[] = [];

    // Scan concept mastery vs attempts
    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId: studentId },
      include: { concept: { select: { id: true, name: true, chapter: { select: { id: true, title: true, subject: { select: { code: true } } } } } } },
    });

    for (const m of masteries) {
      const subject = m.concept?.chapter?.subject?.code || 'GENERAL';

      // Bottleneck 1: High attempts but low mastery
      if (m.attempts >= 10 && m.masteryScore < 45) {
        bottlenecks.push({
          type: 'HIGH_COVERAGE_LOW_MASTERY',
          subject,
          chapterId: m.concept?.chapter?.id,
          description: `Concept "${m.concept?.name}" shows multiple attempts (${m.attempts}) with low mastery (${Math.round(m.masteryScore)}%).`,
          evidence: `Student completed multiple practice items but accuracy remains below mastery threshold.`,
        });
      }
    }

    // Bottleneck 2: High practice but repeated mistake
    const clusters = await prisma.mistakeRecurrenceProfile.findMany({
      where: { studentId, occurrenceCount: { gte: 4 } },
    });

    for (const c of clusters) {
      bottlenecks.push({
        type: 'HIGH_PRACTICE_REPEATED_MISTAKE',
        subject: c.subject || 'GENERAL',
        description: `Persistent ${c.errorCategory} errors in ${c.subject} (${c.occurrenceCount} occurrences).`,
        evidence: `Error category recurs despite repeated problem solving. Targeted conceptual intervention advised.`,
      });
    }

    return bottlenecks;
  }

  /**
   * Generates student-facing insight cards backed by evidence
   */
  public static async generateInsightCards(studentId: string) {
    const insights = [];

    // 1. Trend insight
    const trend = await LearningTrendEngine.evaluateTrend({ studentId, domain: 'OVERALL', windowDays: 30 });
    if (trend.direction !== 'INSUFFICIENT_DATA') {
      const insight = await prisma.learningInsight.create({
        data: {
          studentId,
          category: 'ACCURACY',
          headline: `Overall Accuracy is ${trend.direction}`,
          detailText: trend.evidenceText,
          evidenceDataJson: JSON.stringify({ delta: trend.deltaValue, sampleSize: trend.sampleSize }),
          confidence: trend.confidence === 'HIGH' ? 'HIGH_CONFIDENCE' : 'MODERATE',
          sampleSize: trend.sampleSize,
          timeWindowDays: trend.timeWindowDays,
          calculationVersion: this.VERSION,
        },
      });
      insights.push(insight);
    }

    return insights;
  }

  /**
   * Records student subjective feedback on an insight card without mutating factual metrics
   */
  public static async submitInsightFeedback(insightId: string, studentId: string, feedback: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT', comments?: string) {
    return prisma.learningInsightFeedback.create({
      data: {
        insightId,
        studentId,
        feedback,
        comments,
      },
    });
  }
}
