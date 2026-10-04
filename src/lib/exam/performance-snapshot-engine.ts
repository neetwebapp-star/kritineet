import prisma from '../prisma';

export interface ReadinessDimension {
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'OPTIMAL' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'CRITICAL';
  description: string;
}

export interface ReadinessReport {
  userId: string;
  studentName: string;
  generatedAt: string;
  dimensions: {
    contentCoverage: ReadinessDimension;
    practiceAccuracy: ReadinessDimension;
    pyqCoverage: ReadinessDimension;
    revisionCompletion: ReadinessDimension;
    mockPerformance: ReadinessDimension;
    timeEfficiency: ReadinessDimension;
    weakConceptCount: ReadinessDimension;
    recentConsistency: ReadinessDimension;
  };
}

export class PerformanceSnapshotEngine {
  /**
   * Calculates the 8 independent readiness dimensions without collapsing into a fake composite score
   */
  static async getReadinessReport(userId: string): Promise<ReadinessReport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new Error('User not found');

    const totalConcepts = await prisma.concept.count();
    const attemptedConcepts = await prisma.studentConceptMastery.count({
      where: { userId, attempts: { gte: 1 } },
    });
    const contentCoveragePct = totalConcepts > 0
      ? Number(((attemptedConcepts / totalConcepts) * 100).toFixed(1))
      : 0;

    // 2. Practice Accuracy
    const totalAttempts = user.profile?.totalAttempted || 0;
    const totalCorrect = user.profile?.totalCorrect || 0;
    const practiceAccuracy = totalAttempts > 0
      ? Number(((totalCorrect / totalAttempts) * 100).toFixed(1))
      : 0;

    // 3. PYQ Coverage
    const totalPyqs = await prisma.question.count({ where: { sourceType: 'PYQ' } });
    const solvedPyqs = await prisma.attemptEvent.groupBy({
      by: ['questionId'],
      where: { userId, sourceType: 'PYQ', isCorrect: true },
    });
    const pyqCoveragePct = totalPyqs > 0
      ? Number(((solvedPyqs.length / totalPyqs) * 100).toFixed(1))
      : 0;

    // 4. Revision Completion Rate
    const totalRevisions = await prisma.revisionSchedule.count({ where: { userId } });
    const overdueRevisions = await prisma.revisionSchedule.count({
      where: { userId, nextRevisionAt: { lte: new Date() } },
    });
    const revisionCompletionPct = totalRevisions > 0
      ? Number((((totalRevisions - overdueRevisions) / totalRevisions) * 100).toFixed(1))
      : 100.0;

    // 5. Mock Performance Average
    const mockAttempts = await prisma.examAttempt.findMany({
      where: { userId, status: 'SUBMITTED' },
      select: { totalScore: true, accuracy: true },
    });
    const mockAverageScore = mockAttempts.length > 0
      ? Number((mockAttempts.reduce((acc, m) => acc + m.totalScore, 0) / mockAttempts.length).toFixed(1))
      : 0;
    const mockAverageAccuracy = mockAttempts.length > 0
      ? Number((mockAttempts.reduce((acc, m) => acc + m.accuracy, 0) / mockAttempts.length).toFixed(1))
      : 0;

    // 6. Time Efficiency (Average seconds per question)
    const timeAgg = await prisma.attemptEvent.aggregate({
      where: { userId },
      _avg: { timeSpentSeconds: true },
    });
    const averageTimeSeconds = Number((timeAgg._avg.timeSpentSeconds || 50).toFixed(1));

    // 7. Weak Concept Count
    const weakCount = await prisma.studentConceptMastery.count({
      where: {
        userId,
        OR: [
          { status: 'WEAK' },
          { masteryScore: { lt: 50.0 } },
          { consecutiveIncorrect: { gte: 2 } },
        ],
      },
    });

    // 8. Consistency Streak
    const streakDays = user.profile?.currentStreak || 0;

    return {
      userId,
      studentName: user.name,
      generatedAt: new Date().toISOString(),
      dimensions: {
        contentCoverage: {
          name: 'Content Coverage',
          value: contentCoveragePct,
          unit: '%',
          target: 95.0,
          status: contentCoveragePct >= 70 ? 'OPTIMAL' : contentCoveragePct >= 40 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `${attemptedConcepts} of ${totalConcepts} canonical NCERT concepts attempted.`,
        },
        practiceAccuracy: {
          name: 'Practice Accuracy',
          value: practiceAccuracy,
          unit: '%',
          target: 85.0,
          status: practiceAccuracy >= 80 ? 'OPTIMAL' : practiceAccuracy >= 65 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `Historical accuracy across ${totalAttempts} total practice items.`,
        },
        pyqCoverage: {
          name: 'NEET PYQ Coverage',
          value: pyqCoveragePct,
          unit: '%',
          target: 100.0,
          status: pyqCoveragePct >= 60 ? 'OPTIMAL' : pyqCoveragePct >= 30 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `${solvedPyqs.length} of ${totalPyqs} verified NEET/AIPMT PYQs solved correctly.`,
        },
        revisionCompletion: {
          name: 'Revision Completion',
          value: revisionCompletionPct,
          unit: '%',
          target: 90.0,
          status: revisionCompletionPct >= 85 ? 'OPTIMAL' : revisionCompletionPct >= 60 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `${overdueRevisions} revision items currently overdue for spaced review.`,
        },
        mockPerformance: {
          name: 'Mock Test Performance',
          value: mockAverageScore,
          unit: 'Marks',
          target: 650.0,
          status: mockAverageScore >= 600 ? 'OPTIMAL' : mockAverageScore >= 450 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `Average score across ${mockAttempts.length} completed mock simulations (Avg Accuracy: ${mockAverageAccuracy}%).`,
        },
        timeEfficiency: {
          name: 'Time Efficiency',
          value: averageTimeSeconds,
          unit: 'sec/q',
          target: 50.0,
          status: averageTimeSeconds <= 55 ? 'OPTIMAL' : averageTimeSeconds <= 75 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `Average pacing per question against the NEET target of 50-60 seconds.`,
        },
        weakConceptCount: {
          name: 'Active Weak Concepts',
          value: weakCount,
          unit: 'Concepts',
          target: 0,
          status: weakCount === 0 ? 'OPTIMAL' : weakCount <= 5 ? 'ON_TRACK' : 'CRITICAL',
          description: `${weakCount} concepts currently flagged requiring 3-step targeted remediation.`,
        },
        recentConsistency: {
          name: 'Study Consistency',
          value: streakDays,
          unit: 'Days',
          target: 30,
          status: streakDays >= 14 ? 'OPTIMAL' : streakDays >= 3 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
          description: `Consecutive active daily study streak.`,
        },
      },
    };
  }

  /**
   * Captures and persists a historical performance snapshot
   */
  static async captureSnapshot(userId: string, periodType: 'DAILY' | 'WEEKLY' | 'POST_MOCK') {
    const report = await this.getReadinessReport(userId);
    const d = report.dimensions;

    return prisma.performanceSnapshot.create({
      data: {
        userId,
        periodType,
        overallMastery: d.contentCoverage.value,
        practiceAccuracy: d.practiceAccuracy.value,
        totalQuestionsSolved: Math.round(d.pyqCoverage.value),
        pyqCoverageRate: d.pyqCoverage.value,
        revisionCompletion: d.revisionCompletion.value,
        mockTestAverageScore: d.mockPerformance.value,
        mockTestAverageAccuracy: 0,
        weakConceptsCount: Math.round(d.weakConceptCount.value),
        timeEfficiencySeconds: d.timeEfficiency.value,
        consistencyStreakDays: Math.round(d.recentConsistency.value),
        metricsJson: JSON.stringify(report),
      },
    });
  }
}
