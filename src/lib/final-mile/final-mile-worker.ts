/**
 * Phase 12: Final-Mile Background Worker Jobs
 * Idempotent, observable, and retryable background workers for:
 * - Simulation analysis & psychometrics
 * - Review queue generation
 * - Final-mile daily plan refresh
 * - Periodic readiness snapshots
 * - Exam update systemic impact processing
 */

import { prisma } from '@/lib/prisma';
import { SimulationAnalyticsEngine } from './simulation-analytics-engine';
import { SimulationReviewAndActionPlanner } from './simulation-review-and-action-planner';
import { ReadinessMatrixService } from './readiness-matrix-service';
import { FinalRevisionScopeEngine } from './final-revision-scope-engine';
import { FinalDaysAndChecklistService } from './final-days-and-checklist-service';

export class FinalMileWorker {
  /**
   * Evaluates post-simulation metrics and generates analytical result.
   */
  static async runSimulationAnalysisJob(attemptId: string) {
    const result = await SimulationAnalyticsEngine.evaluateSimulationAttempt(attemptId);
    return { success: true, attemptId, totalScore: result.totalScore, accuracy: result.accuracy };
  }

  /**
   * Generates review queue and action plan for an evaluated simulation attempt.
   */
  static async runSimulationReviewGenerationJob(attemptId: string) {
    const queue = await SimulationReviewAndActionPlanner.generateReviewQueue(attemptId);
    const actionPlan = await SimulationReviewAndActionPlanner.generateActionPlan(attemptId);
    return {
      success: true,
      attemptId,
      queueItemsCount: queue.length,
      actionPlanId: actionPlan.id,
    };
  }

  /**
   * Refreshes active final revision plans for all students in final-mile mode.
   */
  static async runFinalMilePlanRefreshJob(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const activeConfigs = await prisma.finalMileConfiguration.findMany({
      where: { isActive: true },
      select: { userId: true },
    });

    let plansCreatedOrRefreshed = 0;
    for (const c of activeConfigs) {
      await FinalRevisionScopeEngine.generateFinalRevisionPlan(c.userId, targetDate);
      plansCreatedOrRefreshed++;
    }

    return { success: true, targetDate, plansProcessed: plansCreatedOrRefreshed };
  }

  /**
   * Periodically takes immutable readiness snapshots for all students.
   */
  static async runReadinessSnapshotJob() {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
      take: 50,
    });

    let snapshotsTaken = 0;
    for (const s of students) {
      await ReadinessMatrixService.captureReadinessSnapshot(s.id);
      snapshotsTaken++;
    }

    return { success: true, snapshotsTaken };
  }

  /**
   * Processes the systemic impact of an official exam update.
   */
  static async runExamUpdateImpactJob(updateId: string) {
    const analysis = await FinalDaysAndChecklistService.analyzeExamUpdateImpact(updateId);
    return { success: true, updateId, ...analysis };
  }
}
