import prisma from '../prisma';

export interface TestComparisonResult {
  studentId: string;
  attemptA: {
    id: string;
    testTitle: string;
    date: Date;
    score: number;
    maxScore: number;
    accuracy: number;
    attempted: number;
    unanswered: number;
    durationSeconds: number;
    subjectBreakdown: Record<string, any>;
    weakConcepts: string[];
  };
  attemptB: {
    id: string;
    testTitle: string;
    date: Date;
    score: number;
    maxScore: number;
    accuracy: number;
    attempted: number;
    unanswered: number;
    durationSeconds: number;
    subjectBreakdown: Record<string, any>;
    weakConcepts: string[];
  };
  comparison: {
    scoreDelta: number;
    accuracyDelta: number;
    timeDeltaSeconds: number;
    resolvedWeakConcepts: string[];
    newWeakConcepts: string[];
    subjectPerformanceDelta: Record<string, number>;
  };
}

export class TestHistoryAndComparisonEngine {
  /**
   * Retrieves chronological test history for a student
   */
  static async getStudentHistory(userId: string, limit = 20) {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId },
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        test: {
          include: { examPattern: true },
        },
      },
    });

    return attempts.map((a) => {
      const analytics = a.analyticsJson ? JSON.parse(a.analyticsJson) : null;
      return {
        attemptId: a.id,
        testId: a.testId,
        testTitle: a.test.title,
        testType: a.test.testType,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        status: a.status,
        score: a.totalScore,
        maxScore: a.test.totalMarks,
        accuracy: a.accuracy,
        durationSeconds: a.durationSeconds,
        totalQuestions: a.test.totalQuestions,
        attemptedCount: analytics?.attemptedCount || (a.isSubmitted ? a.test.totalQuestions : 0),
        weakConceptsCount: analytics?.weakConcepts?.length || 0,
      };
    });
  }

  static async getStudentTestHistory(userId: string, limit = 20) {
    const list = await this.getStudentHistory(userId, limit);
    const totalScore = list.reduce((a, b) => a + b.score, 0);
    const totalAccuracy = list.reduce((a, b) => a + b.accuracy, 0);
    return {
      history: list.map((item) => ({
        id: item.attemptId,
        ...item,
      })),
      summary: {
        totalTests: list.length,
        averageScore: list.length > 0 ? Number((totalScore / list.length).toFixed(1)) : 0,
        averageAccuracy: list.length > 0 ? Number((totalAccuracy / list.length).toFixed(1)) : 0,
        totalTimeSpentMinutes: Math.round(list.reduce((a, b) => a + b.durationSeconds, 0) / 60),
      },
    };
  }

  /**
   * Compares two test attempts belonging to the student
   */
  static async compareAttempts(
    userId: string,
    attemptIdAOrIds: string | string[],
    attemptIdBParam?: string
  ): Promise<any> {
    const attemptIdA = Array.isArray(attemptIdAOrIds) ? attemptIdAOrIds[0] : attemptIdAOrIds;
    const attemptIdB = Array.isArray(attemptIdAOrIds) ? attemptIdAOrIds[1] : attemptIdBParam!;

    const attemptA = await prisma.examAttempt.findUnique({
      where: { id: attemptIdA },
      include: { test: true },
    });
    const attemptB = await prisma.examAttempt.findUnique({
      where: { id: attemptIdB },
      include: { test: true },
    });

    if (!attemptA || !attemptB) throw new Error('One or both exam attempts not found.');

    // Security check: Must belong to the requesting student
    if (attemptA.userId !== userId || attemptB.userId !== userId) {
      throw new Error('Unauthorized: You can only compare your own test attempts.');
    }

    const analyticsA = attemptA.analyticsJson ? JSON.parse(attemptA.analyticsJson) : {};
    const analyticsB = attemptB.analyticsJson ? JSON.parse(attemptB.analyticsJson) : {};

    const weakA: string[] = (analyticsA.weakConcepts || []).map((w: any) => w.name || w.id);
    const weakB: string[] = (analyticsB.weakConcepts || []).map((w: any) => w.name || w.id);

    // Resolved weak concepts: appeared in A but no longer in B
    const resolvedWeakConcepts = weakA.filter((w) => !weakB.includes(w));
    // New weak concepts: appeared in B but not in A
    const newWeakConcepts = weakB.filter((w) => !weakA.includes(w));

    // Subject breakdown comparison
    const subjA = analyticsA.subjectBreakdown || {};
    const subjB = analyticsB.subjectBreakdown || {};
    const subjectDelta: Record<string, number> = {};

    const allSubjects = new Set([...Object.keys(subjA), ...Object.keys(subjB)]);
    for (const s of allSubjects) {
      const scoreA = subjA[s]?.score || 0;
      const scoreB = subjB[s]?.score || 0;
      subjectDelta[s] = scoreB - scoreA;
    }

    const objA = {
      id: attemptA.id,
      testTitle: attemptA.test.title,
      testType: attemptA.test.testType,
      date: attemptA.submittedAt || attemptA.startedAt,
      submittedAt: attemptA.submittedAt || attemptA.startedAt,
      score: attemptA.totalScore,
      totalScore: attemptA.totalScore,
      maxScore: attemptA.test.totalMarks,
      accuracy: attemptA.accuracy,
      correctCount: analyticsA.correctCount || 0,
      incorrectCount: analyticsA.incorrectCount || 0,
      attempted: analyticsA.attemptedCount || 0,
      unanswered: analyticsA.unansweredCount || 0,
      durationSeconds: attemptA.durationSeconds,
      timeSpentSeconds: attemptA.durationSeconds,
      subjectBreakdown: subjA,
      weakConcepts: weakA,
    };

    const objB = {
      id: attemptB.id,
      testTitle: attemptB.test.title,
      testType: attemptB.test.testType,
      date: attemptB.submittedAt || attemptB.startedAt,
      submittedAt: attemptB.submittedAt || attemptB.startedAt,
      score: attemptB.totalScore,
      totalScore: attemptB.totalScore,
      maxScore: attemptB.test.totalMarks,
      accuracy: attemptB.accuracy,
      correctCount: analyticsB.correctCount || 0,
      incorrectCount: analyticsB.incorrectCount || 0,
      attempted: analyticsB.attemptedCount || 0,
      unanswered: analyticsB.unansweredCount || 0,
      durationSeconds: attemptB.durationSeconds,
      timeSpentSeconds: attemptB.durationSeconds,
      subjectBreakdown: subjB,
      weakConcepts: weakB,
    };

    const delta = {
      scoreDiff: Number((attemptB.totalScore - attemptA.totalScore).toFixed(1)),
      accuracyDiff: Number((attemptB.accuracy - attemptA.accuracy).toFixed(1)),
      scoreDelta: Number((attemptB.totalScore - attemptA.totalScore).toFixed(1)),
      accuracyDelta: Number((attemptB.accuracy - attemptA.accuracy).toFixed(1)),
      timeDeltaSeconds: attemptB.durationSeconds - attemptA.durationSeconds,
      resolvedWeakConcepts,
      newWeakConcepts,
      subjectPerformanceDelta: subjectDelta,
    };

    return {
      studentId: userId,
      attemptA: objA,
      attemptB: objB,
      comparison: {
        attempts: [objA, objB],
        delta,
        ...delta,
      },
    };
  }
}
