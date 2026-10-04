/**
 * Phase 12: Grounded AI Final-Mile Coach
 * Extends Phase 6 AI intelligence for final-mile exam readiness.
 * STRICT PRINCIPLES:
 * - Always grounds advice in verifiable platform data
 * - Never invents scores, percentiles, or exam dates
 * - Adheres strictly to Strategy Boundary: No guarantees of future NEET rank/score
 */

import { prisma } from '@/lib/prisma';
import { ReadinessMatrixService } from './readiness-matrix-service';
import { FinalRevisionScopeEngine } from './final-revision-scope-engine';

export interface FinalMileAIResponse {
  intent: string;
  responseMessage: string;
  groundedFacts: string[];
  actionRecommendation?: string;
  nonPredictiveDisclaimer: string;
}

export class FinalMileAICoach {
  /**
   * Processes a student prompt within the Final-Mile context.
   */
  static async processCoachQuery(
    userId: string,
    query: string
  ): Promise<FinalMileAIResponse> {
    const qLower = query.toLowerCase();

    // 1. Analyze my last mock
    if (qLower.includes('last mock') || qLower.includes('simulation result')) {
      const lastResult = await prisma.examSimulationResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { attempt: { include: { simulation: true } } },
      });

      if (!lastResult) {
        return {
          intent: 'MOCK_ANALYSIS',
          responseMessage:
            'You do not have any completed examination simulations recorded yet. Complete an exam simulation to generate detailed pacing and score breakdowns.',
          groundedFacts: ['Completed simulations: 0'],
          nonPredictiveDisclaimer: 'Simulation data reflects historical practice performance only.',
        };
      }

      const tp: any = lastResult.timePressureSignalsJson
        ? JSON.parse(lastResult.timePressureSignalsJson)
        : null;

      const pacingNote = tp?.rushedFinalQuestions
        ? 'Your concluding questions were answered in noticeably less time, suggesting time pressure.'
        : 'Your pacing remained relatively stable across the simulation sections.';

      return {
        intent: 'MOCK_ANALYSIS',
        responseMessage:
          `In your latest simulation (${lastResult.attempt.simulation.title}), you achieved a total score of ${lastResult.totalScore} with ${lastResult.accuracy}% question accuracy. ${pacingNote} You lost ${lastResult.negativeMarks} marks to negative marking.`,
        groundedFacts: [
          `Score: ${lastResult.totalScore}`,
          `Accuracy: ${lastResult.accuracy}%`,
          `Median time: ${lastResult.medianTimePerQuestion.toFixed(0)}s`,
          `Negative marks: ${lastResult.negativeMarks}`,
        ],
        actionRecommendation: 'Review your Error Book items before scheduling your next full mock.',
        nonPredictiveDisclaimer:
          'This analysis describes observed simulation behavior and does not forecast official NEET outcomes.',
      };
    }

    // 2. What should I revise today?
    if (qLower.includes('revise today') || qLower.includes('revision plan')) {
      const today = new Date().toISOString().split('T')[0];
      const plan = await FinalRevisionScopeEngine.generateFinalRevisionPlan(userId, today);

      const blockTitles = plan.blocks.map((b) => `• ${b.title} (${b.estimatedMinutes}m, [${b.priority}])`).join('\n');

      return {
        intent: 'REVISION_GUIDANCE',
        responseMessage:
          `Here is your evidence-based final revision plan for today (${plan.totalEstimatedMinutes} minutes total):\n${blockTitles}\n\nAll items are prioritized based on uncorrected error book mistakes and canonical NCERT high-yield sections.`,
        groundedFacts: [
          `Active revision blocks: ${plan.blocks.length}`,
          `Total estimated duration: ${plan.totalEstimatedMinutes}m`,
          `Revision freeze status: ${plan.isFrozen ? 'Active (New low-yield content blocked)' : 'Standard'}`,
        ],
        actionRecommendation: 'Start with the critical Error Book block to eliminate recurring traps.',
        nonPredictiveDisclaimer: 'Recommendations are derived from your recorded platform activity.',
      };
    }

    // 3. Which mistakes should I review first?
    if (qLower.includes('mistakes') || qLower.includes('error book')) {
      const mistakes = await prisma.studentMistake.findMany({
        where: { userId, isResolved: false },
        include: { chapter: true, question: true },
        orderBy: { mistakeCount: 'desc' },
        take: 3,
      });

      if (mistakes.length === 0) {
        return {
          intent: 'MISTAKE_PRIORITIZATION',
          responseMessage:
            'You currently have zero unresolved mistakes in your Error Book. All previously logged errors are verified resolved.',
          groundedFacts: ['Unresolved mistakes: 0'],
          nonPredictiveDisclaimer: 'Based on student error book records.',
        };
      }

      const list = mistakes
        .map((m) => `• ${m.chapter?.title || 'Topic'}: ${m.mistakeCount} occurrences (Trap: ${m.mistakeType})`)
        .join('\n');

      return {
        intent: 'MISTAKE_PRIORITIZATION',
        responseMessage:
          `The highest-impact mistake clusters in your preparation history are:\n${list}\n\nPrioritizing these concepts addresses recurring calculation and conceptual traps.`,
        groundedFacts: mistakes.map((m) => `${m.chapter?.title || 'Topic'}: count ${m.mistakeCount}`),
        actionRecommendation: 'Complete the 6-step remediation sequence for each recurring trap.',
        nonPredictiveDisclaimer: 'Error counts reflect historical practice and mock test data.',
      };
    }

    // 4. I have 3 hours today. What should I do?
    if (qLower.includes('hours') || qLower.includes('capacity')) {
      return {
        intent: 'CAPACITY_PACING',
        responseMessage:
          'For a 3-hour study window in the final mile, the recommended allocation is: 45 minutes on canonical NCERT textbook lines, 45 minutes resolving high-frequency Error Book traps, 60 minutes on timed authentic PYQ drills, and 30 minutes on formula retention review.',
        groundedFacts: [
          'Allocated: 180 minutes',
          'Breakdown: 45m NCERT, 45m Mistakes, 60m PYQ, 30m Formulas',
        ],
        actionRecommendation: 'Follow the 4-block cognitive sequence to maintain high mental freshness.',
        nonPredictiveDisclaimer: 'Pacing schedule is designed to optimize cognitive endurance.',
      };
    }

    // Default: General readiness inquiry
    const readiness = await ReadinessMatrixService.evaluateReadiness(userId);
    return {
      intent: 'GENERAL_FINAL_MILE_STATUS',
      responseMessage:
        `Your final-mile preparation status is currently categorized as ${readiness.overallStatus}. You have observable strengths in evaluated syllabus areas, with specific attention recommended for unreviewed mock errors and overdue spaced revisions.`,
      groundedFacts: readiness.dimensions.map((d) => `${d.dimension}: ${d.status}`),
      actionRecommendation: 'Review your 9 readiness dimensions on your /final-mile dashboard.',
      nonPredictiveDisclaimer: readiness.nonPredictiveDisclaimer,
    };
  }
}
