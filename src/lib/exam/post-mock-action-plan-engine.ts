import prisma from '../prisma';

export interface ActionPlanTask {
  subject: string;
  taskType: 'NCERT_REVIEW' | 'RETRY_MISTAKES' | 'CHAPTER_DRILL' | 'TARGETED_PRACTICE' | 'SPACED_REVISION';
  title: string;
  description: string;
  itemCount: number;
  conceptId?: string;
  chapterTitle?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PostMockActionPlan {
  attemptId: string;
  studentName: string;
  generatedAt: string;
  totalEstimatedHours?: number;
  summary: {
    totalWeakConcepts: number;
    totalMistakesToReattempt: number;
    estimatedStudyMinutes: number;
  };
  tasks: ActionPlanTask[];
}

export class PostMockActionPlanEngine {
  /**
   * Generates a concrete, data-driven post-mock study plan based on test analysis
   */
  static async generateActionPlan(attemptId: string, userId?: string): Promise<PostMockActionPlan> {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: true,
        test: true,
      },
    });

    if (!attempt) throw new Error('Attempt not found');

    const analysis = attempt.analyticsJson ? JSON.parse(attempt.analyticsJson) : null;
    const weakConcepts: Array<{ id: string; name: string; chapterTitle: string; count: number }> =
      analysis?.weakConcepts || [];
    const incorrectCount = analysis?.incorrectCount || 0;

    const tasks: ActionPlanTask[] = [];

    // 1. Weak Concept Remediations
    for (const wc of weakConcepts.slice(0, 3)) {
      tasks.push({
        subject: wc.chapterTitle || 'Core Science',
        taskType: 'NCERT_REVIEW',
        title: `Remediate: ${wc.name}`,
        description: `Review NCERT textbook theory and formulas for ${wc.name} in chapter '${wc.chapterTitle}'. Missed ${wc.count} time(s) during exam.`,
        itemCount: 1,
        conceptId: wc.id,
        chapterTitle: wc.chapterTitle,
        priority: 'HIGH',
      });
    }

    // 2. Mistake Reattempts in Error Book
    if (incorrectCount > 0) {
      tasks.push({
        subject: 'General Exam Review',
        taskType: 'RETRY_MISTAKES',
        title: `Reattempt ${incorrectCount} Exam Mistakes in Error Book`,
        description: 'Log into My Error Book to reattempt incorrect test questions with step-by-step NCERT explanations.',
        itemCount: incorrectCount,
        priority: 'HIGH',
      });
    }

    // 3. Spaced Revision Task
    const overdueRevisions = await prisma.revisionSchedule.count({
      where: {
        userId: attempt.userId,
        nextRevisionAt: { lte: new Date() },
      },
    });

    if (overdueRevisions > 0) {
      tasks.push({
        subject: 'Spaced Repetition',
        taskType: 'SPACED_REVISION',
        title: `Complete ${overdueRevisions} Overdue Revision Concepts`,
        description: 'Clear the due spaced repetition queue using the SM-2 review scheduler.',
        itemCount: overdueRevisions,
        priority: 'MEDIUM',
      });
    }

    // 4. Targeted Practice Drill
    tasks.push({
      subject: 'Targeted Practice',
      taskType: 'TARGETED_PRACTICE',
      title: 'Solve 20 Adaptive Practice Questions',
      description: 'Strengthen medium and hard application problems matching your newly updated knowledge profile.',
      itemCount: 20,
      priority: 'MEDIUM',
    });

    const estimatedStudyMinutes = Math.min(300, (weakConcepts.length * 25) + (incorrectCount * 4) + (overdueRevisions * 3) + 30);

    const plan: PostMockActionPlan = {
      attemptId: attempt.id,
      studentName: attempt.user.name,
      generatedAt: new Date().toISOString(),
      totalEstimatedHours: Number((estimatedStudyMinutes / 60).toFixed(1)),
      summary: {
        totalWeakConcepts: weakConcepts.length,
        totalMistakesToReattempt: incorrectCount,
        estimatedStudyMinutes,
      },
      tasks,
    };

    // Save action plan to attempt
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: { actionPlanJson: JSON.stringify(plan) },
    });

    return plan;
  }
}
