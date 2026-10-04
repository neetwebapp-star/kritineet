/**
 * Phase 15: Student Analytics Background Worker Handlers
 * Integrates background tasks with Phase 13 ResilientWorker:
 * 1. daily-learning-snapshot
 * 2. weekly-learning-analysis
 * 3. monthly-learning-analysis
 * 4. trend-calculation
 * 5. retention-analysis
 * 6. mistake-clustering
 * 7. concept-stability-analysis
 * 8. intervention-outcome-analysis
 * 9. cohort-aggregation
 * 10. analytics-integrity-check
 * 11. analytics-rebuild
 */

import { ResilientWorker } from '@/lib/production/resilient-worker';
import { LearningTrendEngine } from './learning-trend-engine';
import { ConceptStabilityAndRetentionService } from './concept-stability-and-retention-service';
import { MistakeIntelligenceService } from './mistake-intelligence-service';
import { StudyActivityAndConsistencyService } from './study-activity-and-consistency-service';
import { InterventionAndExperimentService } from './intervention-and-experiment-service';
import { LearningSnapshotAndCohortService } from './learning-snapshot-and-cohort-service';

export class StudentAnalyticsWorker {
  private static isInitialized = false;

  public static initializeHandlers() {
    if (this.isInitialized) return;

    // 1. Daily Learning Snapshot
    ResilientWorker.registerHandler('daily-learning-snapshot', async (payload: { studentId: string }) => {
      return LearningSnapshotAndCohortService.captureSnapshot({
        studentId: payload.studentId,
        snapshotType: 'DAILY',
      });
    });

    // 2. Weekly Learning Analysis
    ResilientWorker.registerHandler('weekly-learning-analysis', async (payload: { studentId: string }) => {
      return StudyActivityAndConsistencyService.evaluateConsistency(payload.studentId, 7);
    });

    // 3. Monthly Learning Analysis
    ResilientWorker.registerHandler('monthly-learning-analysis', async (payload: { studentId: string }) => {
      return LearningSnapshotAndCohortService.captureSnapshot({
        studentId: payload.studentId,
        snapshotType: 'MONTHLY',
      });
    });

    // 4. Trend Calculation
    ResilientWorker.registerHandler('trend-calculation', async (payload: { studentId: string; domain: any; entityId?: string }) => {
      return LearningTrendEngine.evaluateTrend(payload);
    });

    // 5. Retention Analysis
    ResilientWorker.registerHandler('retention-analysis', async (payload: { studentId: string; conceptId: string }) => {
      return ConceptStabilityAndRetentionService.analyzeRetention(payload.studentId, payload.conceptId);
    });

    // 6. Mistake Clustering
    ResilientWorker.registerHandler('mistake-clustering', async (payload: { studentId: string }) => {
      return MistakeIntelligenceService.analyzeMistakeRecurrence(payload.studentId);
    });

    // 7. Concept Stability Analysis
    ResilientWorker.registerHandler('concept-stability-analysis', async (payload: { studentId: string; conceptId: string }) => {
      return ConceptStabilityAndRetentionService.evaluateStability(payload);
    });

    // 8. Intervention Outcome Analysis
    ResilientWorker.registerHandler('intervention-outcome-analysis', async (payload: any) => {
      return InterventionAndExperimentService.recordOutcome(payload);
    });

    // 9. Cohort Aggregation
    ResilientWorker.registerHandler('cohort-aggregation', async (payload: any) => {
      return LearningSnapshotAndCohortService.aggregateCohort({
        ...payload,
        periodStart: new Date(payload.periodStart),
        periodEnd: new Date(payload.periodEnd),
      });
    });

    // 10. Analytics Integrity Check
    ResilientWorker.registerHandler('analytics-integrity-check', async (payload: any) => {
      return StudyActivityAndConsistencyService.validateStudyTelemetry(payload);
    });

    // 11. Analytics Rebuild
    ResilientWorker.registerHandler('analytics-rebuild', async (payload: { studentId: string }) => {
      return LearningSnapshotAndCohortService.rebuildAnalytics(payload.studentId);
    });

    this.isInitialized = true;
  }
}
