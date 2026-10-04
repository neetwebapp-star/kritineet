/**
 * Phase 12: Final-Mile Readiness Matrix & Snapshot Service
 * Evaluates 9 descriptive dimensions of student preparation evidence.
 * STRICT INVARIANT: Never creates a single composite score or predicts NEET selection/AIR.
 */

import { prisma } from '@/lib/prisma';

export type ReadinessStatus =
  | 'NOT_STARTED'
  | 'DEVELOPING'
  | 'ON_TRACK'
  | 'NEEDS_ATTENTION'
  | 'COMPLETED';

export interface ReadinessDimension {
  dimension:
    | 'SYLLABUS'
    | 'REVISION'
    | 'PYQ'
    | 'QUESTION_ACCURACY'
    | 'MISTAKE_RECOVERY'
    | 'TIME_MANAGEMENT'
    | 'MOCK_COMPLETION'
    | 'MOCK_REVIEW'
    | 'CONCEPT_MASTERY';
  status: ReadinessStatus;
  evidence: string;
  sampleSize: number | null;
  lastUpdated: string;
}

export interface FinalMileReadinessReport {
  userId: string;
  dimensions: ReadinessDimension[];
  overallStatus: 'DEVELOPING' | 'ON_TRACK' | 'NEEDS_ATTENTION' | 'WELL_PREPARED';
  snapshotDate: string;
  nonPredictiveDisclaimer: string;
}

export class ReadinessMatrixService {
  /**
   * Evaluates all 9 preparation dimensions using live database truth.
   */
  static async evaluateReadiness(userId: string): Promise<FinalMileReadinessReport> {
    const nowIso = new Date().toISOString();

    // 1. SYLLABUS
    const totalChapters = await prisma.chapter.count();
    const activeProgress = await prisma.studyProgress.count({
      where: { userId, conceptsCompleted: { gte: 3 } },
    });
    const syllabusCoverage = totalChapters > 0 ? (activeProgress / totalChapters) * 100 : 0;
    const syllabusStatus: ReadinessStatus =
      totalChapters === 0 ? 'NOT_STARTED' :
      syllabusCoverage >= 90 ? 'COMPLETED' :
      syllabusCoverage >= 70 ? 'ON_TRACK' :
      syllabusCoverage >= 35 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    // 2. REVISION
    const totalRevisions = await prisma.revisionSchedule.count({ where: { userId } });
    const overdueRevisions = await prisma.revisionSchedule.count({
      where: { userId, nextRevisionAt: { lte: new Date() }, category: { not: 'MASTERED' } },
    });
    const revisionStatus: ReadinessStatus =
      totalRevisions === 0 ? 'NOT_STARTED' :
      overdueRevisions === 0 ? 'COMPLETED' :
      overdueRevisions <= 3 ? 'ON_TRACK' : 'NEEDS_ATTENTION';

    // 3. PYQ
    const totalPyqs = await prisma.question.count({ where: { sourceType: 'PYQ' } });
    const attemptedPyqs = await prisma.questionExposure.count({
      where: { userId, question: { sourceType: 'PYQ' } },
    });
    const pyqCoverage = totalPyqs > 0 ? (attemptedPyqs / totalPyqs) * 100 : 0;
    const pyqStatus: ReadinessStatus =
      totalPyqs === 0 ? 'NOT_STARTED' :
      pyqCoverage >= 85 ? 'COMPLETED' :
      pyqCoverage >= 60 ? 'ON_TRACK' :
      pyqCoverage >= 25 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    // 4. QUESTION_ACCURACY
    const responses = await prisma.studentResponse.findMany({
      where: { examAttempt: { userId } },
      select: { isCorrect: true },
      take: 200,
      orderBy: { id: 'desc' },
    });
    const totalRecent = responses.length;
    const correctRecent = responses.filter((r) => r.isCorrect).length;
    const accuracy = totalRecent > 0 ? (correctRecent / totalRecent) * 100 : 0;
    const accuracyStatus: ReadinessStatus =
      totalRecent === 0 ? 'NOT_STARTED' :
      accuracy >= 80 ? 'ON_TRACK' :
      accuracy >= 65 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    // 5. MISTAKE_RECOVERY
    const totalMistakes = await prisma.studentMistake.count({ where: { userId } });
    const resolvedMistakes = await prisma.studentMistake.count({
      where: { userId, isResolved: true },
    });
    const resolutionRate = totalMistakes > 0 ? (resolvedMistakes / totalMistakes) * 100 : 100;
    const mistakeStatus: ReadinessStatus =
      totalMistakes === 0 ? 'ON_TRACK' :
      resolutionRate >= 80 ? 'ON_TRACK' :
      resolutionRate >= 50 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    // 6. TIME_MANAGEMENT
    const timedResponses = await prisma.studentResponse.findMany({
      where: { examAttempt: { userId }, timeSpentSeconds: { gt: 0 } },
      select: { timeSpentSeconds: true },
      take: 100,
    });
    const avgSeconds =
      timedResponses.length > 0
        ? timedResponses.reduce((sum, r) => sum + r.timeSpentSeconds, 0) / timedResponses.length
        : 60;
    const timeStatus: ReadinessStatus =
      timedResponses.length === 0 ? 'NOT_STARTED' :
      avgSeconds >= 45 && avgSeconds <= 75 ? 'ON_TRACK' :
      avgSeconds < 45 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    // 7. MOCK_COMPLETION
    const totalMocks = await prisma.examAttempt.count({
      where: { userId, status: { in: ['SUBMITTED', 'EVALUATED'] } },
    });
    const mockStatus: ReadinessStatus =
      totalMocks >= 5 ? 'COMPLETED' :
      totalMocks >= 2 ? 'ON_TRACK' :
      totalMocks === 1 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    // 8. MOCK_REVIEW
    const unreviewedAttempts = await prisma.examAttempt.count({
      where: {
        userId,
        status: 'EVALUATED',
        responses: { some: { isCorrect: false } },
      },
    });
    const mockReviewStatus: ReadinessStatus =
      totalMocks === 0 ? 'NOT_STARTED' :
      unreviewedAttempts === 0 ? 'COMPLETED' :
      unreviewedAttempts <= 1 ? 'ON_TRACK' : 'NEEDS_ATTENTION';

    // 9. CONCEPT_MASTERY
    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId },
      select: { masteryScore: true },
    });
    const avgMastery =
      masteries.length > 0
        ? masteries.reduce((sum, m) => sum + m.masteryScore, 0) / masteries.length
        : 0;
    const masteryStatus: ReadinessStatus =
      masteries.length === 0 ? 'NOT_STARTED' :
      avgMastery >= 75 ? 'ON_TRACK' :
      avgMastery >= 50 ? 'DEVELOPING' : 'NEEDS_ATTENTION';

    const dimensions: ReadinessDimension[] = [
      {
        dimension: 'SYLLABUS',
        status: syllabusStatus,
        evidence: `${activeProgress} of ${totalChapters} chapters studied with >= 75% coverage (${syllabusCoverage.toFixed(1)}%).`,
        sampleSize: totalChapters,
        lastUpdated: nowIso,
      },
      {
        dimension: 'REVISION',
        status: revisionStatus,
        evidence: `${overdueRevisions} overdue spaced revision tasks remaining out of ${totalRevisions} scheduled items.`,
        sampleSize: totalRevisions,
        lastUpdated: nowIso,
      },
      {
        dimension: 'PYQ',
        status: pyqStatus,
        evidence: `${attemptedPyqs} of ${totalPyqs} authentic NEET/AIPMT Past Year Questions attempted (${pyqCoverage.toFixed(1)}%).`,
        sampleSize: totalPyqs,
        lastUpdated: nowIso,
      },
      {
        dimension: 'QUESTION_ACCURACY',
        status: accuracyStatus,
        evidence: `Last ${totalRecent} questions answered with ${accuracy.toFixed(1)}% empirical accuracy (${correctRecent}/${totalRecent}).`,
        sampleSize: totalRecent,
        lastUpdated: nowIso,
      },
      {
        dimension: 'MISTAKE_RECOVERY',
        status: mistakeStatus,
        evidence: `${resolvedMistakes} of ${totalMistakes} logged error book mistakes verified resolved (${resolutionRate.toFixed(1)}%).`,
        sampleSize: totalMistakes,
        lastUpdated: nowIso,
      },
      {
        dimension: 'TIME_MANAGEMENT',
        status: timeStatus,
        evidence: `Average response duration is ${avgSeconds.toFixed(1)} seconds per question across ${timedResponses.length} timed attempts.`,
        sampleSize: timedResponses.length,
        lastUpdated: nowIso,
      },
      {
        dimension: 'MOCK_COMPLETION',
        status: mockStatus,
        evidence: `${totalMocks} full-length examination simulations completed.`,
        sampleSize: totalMocks,
        lastUpdated: nowIso,
      },
      {
        dimension: 'MOCK_REVIEW',
        status: mockReviewStatus,
        evidence: `${unreviewedAttempts} mock attempts currently contain unreviewed error questions.`,
        sampleSize: unreviewedAttempts,
        lastUpdated: nowIso,
      },
      {
        dimension: 'CONCEPT_MASTERY',
        status: masteryStatus,
        evidence: `Average concept mastery across ${masteries.length} assessed concepts is ${avgMastery.toFixed(1)}%.`,
        sampleSize: masteries.length,
        lastUpdated: nowIso,
      },
    ];

    // Compute overall qualitative status
    const onTrackCount = dimensions.filter((d) => d.status === 'ON_TRACK' || d.status === 'COMPLETED').length;
    const needsAttentionCount = dimensions.filter((d) => d.status === 'NEEDS_ATTENTION').length;

    const overallStatus =
      onTrackCount >= 7 ? 'WELL_PREPARED' :
      needsAttentionCount >= 4 ? 'NEEDS_ATTENTION' :
      onTrackCount >= 4 ? 'ON_TRACK' : 'DEVELOPING';

    return {
      userId,
      dimensions,
      overallStatus,
      snapshotDate: nowIso.split('T')[0],
      nonPredictiveDisclaimer:
        'These dimensions represent observable preparation progress and historical test behavior. They do not forecast or guarantee a specific NEET score or rank.',
    };
  }

  /**
   * Captures an immutable snapshot of student readiness for historical longitudinal tracking.
   */
  static async captureReadinessSnapshot(userId: string) {
    const report = await this.evaluateReadiness(userId);

    const dimMap = new Map(report.dimensions.map((d) => [d.dimension, d.status]));

    const snapshot = await prisma.examReadinessSnapshot.create({
      data: {
        userId,
        date: report.snapshotDate,
        syllabusStatus: dimMap.get('SYLLABUS') || 'NOT_STARTED',
        revisionStatus: dimMap.get('REVISION') || 'NOT_STARTED',
        pyqStatus: dimMap.get('PYQ') || 'NOT_STARTED',
        questionAccuracyStatus: dimMap.get('QUESTION_ACCURACY') || 'NOT_STARTED',
        mockStatus: dimMap.get('MOCK_COMPLETION') || 'NOT_STARTED',
        mockReviewStatus: dimMap.get('MOCK_REVIEW') || 'NOT_STARTED',
        mistakeRecoveryStatus: dimMap.get('MISTAKE_RECOVERY') || 'NOT_STARTED',
        timeManagementStatus: dimMap.get('TIME_MANAGEMENT') || 'NOT_STARTED',
        conceptStatus: dimMap.get('CONCEPT_MASTERY') || 'NOT_STARTED',
        overallStatus: report.overallStatus,
        evidenceSummaryJson: JSON.stringify(report.dimensions),
      },
    });

    return snapshot;
  }
}
