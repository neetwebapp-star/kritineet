import prisma from '../prisma';
import { ConceptMasteryEngine } from '../intelligence/concept-mastery-engine';

export interface TestRecommendation {
  recommendedType:
    | 'WEAKNESS_TEST'
    | 'REVISION_TEST'
    | 'CHAPTER_TEST'
    | 'SUBJECT_TEST'
    | 'PYQ_TEST'
    | 'FULL_MOCK'
    | 'GRAND_MOCK';
  title: string;
  reason: string;
  focusAreas: string[];
  suggestedDurationMinutes: number;
  suggestedQuestionCount: number;
}

export class NextTestRecommendationEngine {
  static async recommendNextTest(userId: string) {
    const rec = await this.getRecommendation(userId);
    return {
      recommendedTest: {
        ...rec,
        rationale: rec.reason,
      },
    };
  }

  /**
   * Generates a data-driven test recommendation based on student learning telemetry
   */
  static async getRecommendation(userId: string): Promise<TestRecommendation> {
    // 1. Fetch weak concepts
    const weakConcepts = await ConceptMasteryEngine.getWeakConcepts(userId, 5);

    // 2. Fetch overdue revisions
    const overdueRevisions = await prisma.revisionSchedule.count({
      where: {
        userId,
        nextRevisionAt: { lte: new Date() },
      },
    });

    // 3. Fetch past test count & latest score
    const pastAttempts = await prisma.examAttempt.findMany({
      where: { userId, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
      take: 3,
    });

    // Priority 1: High weakness backlog (> 2 weak concepts)
    if (weakConcepts.length >= 2) {
      const topWeakNames = weakConcepts.slice(0, 3).map((w) => w.concept.name);
      return {
        recommendedType: 'WEAKNESS_TEST',
        title: 'Targeted Weakness Mastery Test',
        reason: `You have ${weakConcepts.length} concepts flagged with low mastery or repeated mistakes. Consolidate these before advancing to full-length mocks.`,
        focusAreas: topWeakNames,
        suggestedDurationMinutes: 45,
        suggestedQuestionCount: 30,
      };
    }

    // Priority 2: Overdue spaced revision backlog (>= 5 items)
    if (overdueRevisions >= 5) {
      return {
        recommendedType: 'REVISION_TEST',
        title: 'Spaced Memory Retention Drill',
        reason: `You have ${overdueRevisions} concepts scheduled for SM-2 spaced repetition today. Completing this ensures long-term memory consolidation.`,
        focusAreas: ['Overdue NCERT Topics', 'Spaced Repetition Queue'],
        suggestedDurationMinutes: 30,
        suggestedQuestionCount: 20,
      };
    }

    // Priority 3: First-time student or no recent full mock
    if (pastAttempts.length === 0) {
      return {
        recommendedType: 'PYQ_TEST',
        title: 'Diagnostic NEET PYQ Assessment',
        reason: 'Establish your baseline NEET performance with a verified Previous Year Question set.',
        focusAreas: ['NEET 2024 / 2023 Real Exam Questions'],
        suggestedDurationMinutes: 60,
        suggestedQuestionCount: 45,
      };
    }

    const latestAccuracy = pastAttempts[0]?.accuracy || 0;

    // Priority 4: High accuracy on recent tests -> Full Mock Simulation
    if (latestAccuracy >= 75) {
      return {
        recommendedType: 'FULL_MOCK',
        title: 'Full-Length NEET UG 2027 Mock Simulation',
        reason: `Your recent test accuracy is strong (${latestAccuracy}%). Take a full 180-question timed mock to build exam stamina.`,
        focusAreas: ['Physics (45)', 'Chemistry (45)', 'Biology (90)'],
        suggestedDurationMinutes: 180,
        suggestedQuestionCount: 180,
      };
    }

    // Priority 5: Intermediate performance -> Subject Test
    return {
      recommendedType: 'SUBJECT_TEST',
      title: 'Subject Focus Assessment',
      reason: 'Deepen your accuracy in a single subject before undertaking full-syllabus simulations.',
      focusAreas: ['Physics or Chemistry Focus'],
      suggestedDurationMinutes: 60,
      suggestedQuestionCount: 45,
    };
  }
}
