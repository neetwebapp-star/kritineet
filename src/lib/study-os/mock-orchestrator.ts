import prisma from '../prisma';

export type MockReviewStatus =
  | 'MOCK_TAKEN'
  | 'MOCK_ANALYSIS_PENDING'
  | 'MOCK_ANALYZED'
  | 'REMEDIATION_PENDING'
  | 'REMEDIATION_COMPLETED';

export interface MockSchedulingEligibility {
  isEligible: boolean;
  blockReason?: string;
  previousMockStatus?: MockReviewStatus;
  lastMockAttemptId?: string;
  recommendedTestId?: string;
  recommendedDate?: string;
}

export class MockOrchestrator {
  /**
   * Evaluates the Mock Review Gate to prevent test burnout without review
   */
  static async evaluateMockEligibility(userId: string): Promise<MockSchedulingEligibility> {
    // 1. Get the most recent completed mock attempt
    const lastAttempt = await prisma.examAttempt.findFirst({
      where: { userId, status: { in: ['SUBMITTED', 'EVALUATED'] } },
      orderBy: { submittedAt: 'desc' },
      include: {
        test: true,
        responses: {
          where: { isCorrect: false },
        },
      },
    });

    if (!lastAttempt) {
      // First mock: student is fully eligible
      return {
        isEligible: true,
      };
    }

    // 2. Count unresolved mistakes originating from this mock
    const incorrectQuestionIds = lastAttempt.responses.map((r) => r.questionId);
    const unresolvedMistakes = await prisma.studentMistake.count({
      where: {
        userId,
        questionId: { in: incorrectQuestionIds },
        isResolved: false,
      },
    });

    // Check if remediation has been completed for these mistakes
    let reviewStatus: MockReviewStatus = 'MOCK_ANALYZED';
    if (unresolvedMistakes > 5) {
      reviewStatus = 'REMEDIATION_PENDING';
      return {
        isEligible: false,
        blockReason: `Mock Review Gate: ${unresolvedMistakes} mistakes from previous mock (${lastAttempt.test?.title || 'Mock'}) remain unreviewed. Complete error review before starting a new mock.`,
        previousMockStatus: reviewStatus,
        lastMockAttemptId: lastAttempt.id,
      };
    }

    return {
      isEligible: true,
      previousMockStatus: unresolvedMistakes > 0 ? 'REMEDIATION_PENDING' : 'REMEDIATION_COMPLETED',
      lastMockAttemptId: lastAttempt.id,
    };
  }

  /**
   * Post-mock processing: extracts mistakes, triggers revision schedules, and sets up remediation
   */
  static async processCompletedMock(attemptId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: {
            question: {
              include: { chapter: true, primaryConcept: true },
            },
          },
        },
      },
    });

    if (!attempt || !['SUBMITTED', 'EVALUATED'].includes(attempt.status)) {
      throw new Error(`Attempt ${attemptId} not found or not completed`);
    }

    const incorrectResponses = attempt.responses.filter((r) => !r.isCorrect);
    let mistakesRecorded = 0;
    let revisionsScheduled = 0;

    for (const resp of incorrectResponses) {
      const q = resp.question;
      if (!q) continue;

      // 1. Record or update StudentMistake
      await prisma.studentMistake.upsert({
        where: {
          userId_questionId: {
            userId: attempt.userId,
            questionId: q.id,
          },
        },
        create: {
          userId: attempt.userId,
          questionId: q.id,
          conceptId: q.primaryConceptId,
          chapterId: q.chapterId,
          selectedOption: resp.selectedOption,
          correctOption: q.correctOption,
          mistakeType: 'MOCK_ERROR',
          mistakeCount: 1,
          isResolved: false,
        },
        update: {
          mistakeCount: { increment: 1 },
          lastMistakeAt: new Date(),
          isResolved: false,
        },
      });
      mistakesRecorded++;

      // 2. Schedule immediate SpacedRevision if primaryConcept exists
      if (q.primaryConceptId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await prisma.revisionSchedule.findFirst({
          where: {
            userId: attempt.userId,
            conceptId: q.primaryConceptId,
            questionId: q.id,
          },
        });

        if (!existing) {
          await prisma.revisionSchedule.create({
            data: {
              userId: attempt.userId,
              conceptId: q.primaryConceptId,
              questionId: q.id,
              nextRevisionAt: tomorrow,
              category: 'DUE_TODAY',
              intervalDays: 1,
              repetitionLevel: 0,
              easeFactor: 2.3,
            },
          });
        } else {
          await prisma.revisionSchedule.update({
            where: { id: existing.id },
            data: {
              nextRevisionAt: tomorrow,
              category: 'DUE_TODAY',
            },
          });
        }
        revisionsScheduled++;
      }
    }

    return {
      attemptId,
      totalQuestions: attempt.responses.length,
      incorrectCount: incorrectResponses.length,
      mistakesRecorded,
      revisionsScheduled,
    };
  }
}

