import prisma from '../prisma';

export interface NextActionItem {
  actionType:
    | 'LEARN'
    | 'ACTIVE_RECALL'
    | 'DPP'
    | 'PYQ'
    | 'ERROR_REVIEW'
    | 'REVISION'
    | 'FOUNDATION_RESCUE'
    | 'MOCK';
  title: string;
  description: string;
  estimatedMinutes: number;
  subjectCode: 'BIO' | 'PHY' | 'CHE';
  subjectName: string;
  chapterTitle?: string;
  topicTitle?: string;
  topicId?: string;
  reason: string;
  priority: 'CRITICAL' | 'HIGH' | 'RECOMMENDED';
  ctaLabel: string;
  targetRoute: string;
  metadata?: Record<string, any>;
}

export class NextActionEngine {
  /**
   * Evaluates the student's holistic state and computes the single highest-yield study action.
   * Priority hierarchy:
   * 1. Foundation Rescue / Critical Prerequisite Breakdown (if consecutive mistakes on core concepts)
   * 2. Spaced Revision Due (SM-2 review due today to prevent exponential forgetting curve)
   * 3. Error Notebook Quarantine (repeated unresolved mistakes)
   * 4. Daily Planner Core Milestone (NCERT topic reading or DPP)
   * 5. Fallback Default (Foundational High-Yield Chapter)
   */
  static async getNextAction(userId: string): Promise<NextActionItem> {
    // 1. Check for repeated mistakes / foundation gaps
    const recentRepeatedMistake = await prisma.studentMistake.findFirst({
      where: {
        userId,
        isLearned: false,
        mistakeCount: { gte: 2 },
      },
      include: {
        concept: {
          include: {
            chapter: { include: { subject: true } },
          },
        },
        question: true,
      },
      orderBy: { lastMistakeAt: 'desc' },
    });

    if (recentRepeatedMistake && recentRepeatedMistake.concept) {
      const subjectCode = (recentRepeatedMistake.concept.chapter.subject.code || 'BIO') as any;
      return {
        actionType: 'ERROR_REVIEW',
        title: `Remediate: ${recentRepeatedMistake.concept.name}`,
        description: `You've missed this concept ${recentRepeatedMistake.mistakeCount} times across recent tests. Clear this conceptual vulnerability now.`,
        estimatedMinutes: 12,
        subjectCode,
        subjectName: recentRepeatedMistake.concept.chapter.subject.name,
        chapterTitle: recentRepeatedMistake.concept.chapter.title,
        topicTitle: recentRepeatedMistake.concept.name,
        reason: `Repeated conceptual errors (${recentRepeatedMistake.mistakeType}) detected.`,
        priority: 'CRITICAL',
        ctaLabel: 'Start 12-Min Error Fix',
        targetRoute: `/error-book?category=REPEATED`,
        metadata: {
          conceptId: recentRepeatedMistake.conceptId,
          questionId: recentRepeatedMistake.questionId,
        },
      };
    }

    // 2. Check for Overdue Spaced Revision (SM-2)
    const overdueRevision = await prisma.revisionSchedule.findFirst({
      where: {
        userId,
        category: { not: 'MASTERED' },
        nextRevisionAt: { lte: new Date() },
      },
      include: {
        concept: {
          include: {
            chapter: { include: { subject: true } },
          },
        },
      },
      orderBy: { nextRevisionAt: 'asc' },
    });

    if (overdueRevision && overdueRevision.concept) {
      const subjectCode = (overdueRevision.concept.chapter.subject.code || 'BIO') as any;
      return {
        actionType: 'REVISION',
        title: `Spaced Revision: ${overdueRevision.concept.name}`,
        description: `Scheduled SM-2 active recall interval due today to lock concept into long-term memory.`,
        estimatedMinutes: 15,
        subjectCode,
        subjectName: overdueRevision.concept.chapter.subject.name,
        chapterTitle: overdueRevision.concept.chapter.title,
        topicTitle: overdueRevision.concept.name,
        reason: `Optimal Leitner retention window expires today.`,
        priority: 'HIGH',
        ctaLabel: 'Review Due Concept',
        targetRoute: `/today`,
      };
    }

    // 3. Check Today's Daily Planner Core Task
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPlan = await prisma.dailyStudyPlan.findFirst({
      where: { userId, date: todayStr },
      include: {
        tasks: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (todayPlan && todayPlan.tasks.length > 0) {
      const pendingTask = todayPlan.tasks[0];
      const subjectCode = (pendingTask.subjectCode || 'BIO') as any;
      const subjectName = subjectCode === 'PHY' ? 'Physics' : subjectCode === 'CHE' ? 'Chemistry' : 'Biology';

      return {
        actionType: pendingTask.taskType === 'NCERT_READ' ? 'LEARN' : 'DPP',
        title: pendingTask.title,
        description: pendingTask.description || `Autonomous 213-Day plan scheduled milestone for today.`,
        estimatedMinutes: pendingTask.estimatedMinutes || 25,
        subjectCode,
        subjectName,
        reason: pendingTask.description || `Target NEET 2027 daily syllabus progression.`,
        priority: pendingTask.priority === 'CORE' ? 'CRITICAL' : 'HIGH',
        ctaLabel: 'Execute Today\'s Milestone',
        targetRoute: pendingTask.taskType === 'NCERT_READ' ? '/ncert' : '/dpp',
        metadata: {
          taskId: pendingTask.id,
        },
      };
    }

    // 4. Default High-Impact Fallback Action: High-Yield NCERT Practice
    return {
      actionType: 'DPP',
      title: 'High-Yield NCERT & MTG Practice Sprint',
      description: 'Strengthen core biological classification & cell structures with 15 verified questions.',
      estimatedMinutes: 20,
      subjectCode: 'BIO',
      subjectName: 'Biology',
      chapterTitle: 'Biological Classification',
      reason: 'Regular daily practice maintains consistency and diagnostic telemetry.',
      priority: 'RECOMMENDED',
      ctaLabel: 'Start Practice Sprint',
      targetRoute: '/dpp',
    };
  }
}
