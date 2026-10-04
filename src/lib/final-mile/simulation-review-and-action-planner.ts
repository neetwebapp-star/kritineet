/**
 * Phase 12: Simulation Review Queue & Final-Mile Action Planner
 * Automatically bridges simulation outcomes directly into:
 * Error Book -> Spaced Revision -> Remediation -> Action Plans
 */

import { prisma } from '@/lib/prisma';

export class SimulationReviewAndActionPlanner {
  /**
   * Generates the structured review queue for an evaluated simulation attempt.
   * Categorizes questions into:
   * WRONG | GUESSED | SLOW | MARKED_REVIEW | CHANGED_ANSWER | CORRECT_BUT_UNCERTAIN
   */
  static async generateReviewQueue(attemptId: string) {
    const attempt = await prisma.examSimulationAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: { simulation: true },
    });

    if (!attempt.examAttemptId) {
      return [];
    }

    const responses = await prisma.studentResponse.findMany({
      where: { examAttemptId: attempt.examAttemptId },
      include: { question: { include: { chapter: true } } },
    });

    const queueItems = [];

    for (const r of responses) {
      let category: string | null = null;

      if (!r.isCorrect && r.selectedOption != null) {
        category = 'WRONG';
      } else if (r.isAnswerChanged && !r.isCorrect) {
        category = 'CHANGED_ANSWER';
      } else if (r.timeSpentSeconds > 150) {
        category = 'SLOW';
      } else if (r.isMarkedForReview) {
        category = 'MARKED_REVIEW';
      } else if (r.confidenceLevel === 'LOW_CONFIDENCE' && r.isCorrect) {
        category = 'CORRECT_BUT_UNCERTAIN';
      }

      if (category) {
        const item = await prisma.simulationReviewQueue.create({
          data: {
            attemptId,
            userId: attempt.userId,
            questionId: r.questionId,
            category,
            isReviewed: false,
          },
        });
        queueItems.push(item);

        // Also record to StudentMistake if WRONG or CHANGED_ANSWER
        if (category === 'WRONG' || category === 'CHANGED_ANSWER') {
          await prisma.studentMistake.upsert({
            where: {
              userId_questionId: {
                userId: attempt.userId,
                questionId: r.questionId,
              },
            },
            create: {
              userId: attempt.userId,
              questionId: r.questionId,
              chapterId: r.question.chapterId,
              correctOption: r.question.correctOption || 'A',
              selectedOption: r.selectedOption,
              mistakeType: category === 'CHANGED_ANSWER' ? 'OPTION_CONFUSION' : 'CONCEPTUAL',
              mistakeCount: 1,
              isResolved: false,
            },
            update: {
              mistakeCount: { increment: 1 },
              isResolved: false,
              lastMistakeAt: new Date(),
            },
          });
        }
      }
    }

    return queueItems;
  }

  /**
   * Generates a 4-horizon FinalMileActionPlan based on real simulation evidence.
   */
  static async generateActionPlan(attemptId: string) {
    const attempt = await prisma.examSimulationAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: { result: true },
    });

    const today = new Date().toISOString().split('T')[0];

    // Fetch review queue items
    const unreviewed = await prisma.simulationReviewQueue.findMany({
      where: { attemptId, isReviewed: false },
      include: { question: { include: { chapter: true } } },
      take: 10,
    });

    const immediateActions = unreviewed.slice(0, 4).map((item) => ({
      title: `Review Error: ${item.question.chapter?.title || 'Subject'} [${item.category}]`,
      description: `Understand the underlying concept trap on question ${item.questionId}.`,
      estimatedMinutes: 20,
      priority: 'CRITICAL',
    }));

    if (immediateActions.length === 0) {
      immediateActions.push({
        title: 'Review Simulation Pacing Analytics',
        description: 'Examine response time distribution across question types.',
        estimatedMinutes: 15,
        priority: 'HIGH',
      });
    }

    const next24Hours = [
      {
        title: 'Complete Associated NCERT Textbook Rereading',
        description: 'Review high-yield canonical textbook sections matching missed concepts.',
        estimatedMinutes: 45,
        priority: 'HIGH',
      },
      {
        title: 'Clear Spaced Repetition Due Revisions',
        description: 'Execute active spaced review to solidify retrievability.',
        estimatedMinutes: 30,
        priority: 'HIGH',
      },
    ];

    const next3Days = [
      {
        title: 'Reattempt Missed Simulation Questions',
        description: 'Verify remediation with independent reattempt without viewing solution.',
        estimatedMinutes: 30,
        priority: 'HIGH',
      },
      {
        title: 'Targeted PYQ Speed Drill in Weakest Subject',
        description: 'Solve 20 authentic past year questions in the subject with lowest accuracy.',
        estimatedMinutes: 40,
        priority: 'MEDIUM',
      },
    ];

    const next7Days = [
      {
        title: 'Schedule Second Full-Length Simulation',
        description: 'Verify endurance and test pacing improvements under strict simulation conditions.',
        estimatedMinutes: 200,
        priority: 'HIGH',
      },
      {
        title: 'Conduct Comparative Analysis',
        description: 'Compare score, accuracy, and median response time with this simulation.',
        estimatedMinutes: 20,
        priority: 'MEDIUM',
      },
    ];

    const actionPlan = await prisma.finalMileActionPlan.create({
      data: {
        userId: attempt.userId,
        simulationResultId: attempt.result?.id,
        date: today,
        immediateActionsJson: JSON.stringify(immediateActions),
        next24HoursJson: JSON.stringify(next24Hours),
        next3DaysJson: JSON.stringify(next3Days),
        next7DaysJson: JSON.stringify(next7Days),
        status: 'ACTIVE',
      },
    });

    return actionPlan;
  }

  /**
   * Marks a question in the simulation review queue as reviewed.
   */
  static async markQueueItemReviewed(queueItemId: string, notes?: string) {
    return await prisma.simulationReviewQueue.update({
      where: { id: queueItemId },
      data: {
        isReviewed: true,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    });
  }
}
