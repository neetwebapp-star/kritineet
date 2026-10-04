import prisma from '../prisma';
import { DailyPlanGenerator } from './daily-plan-generator';
import { RecoveryPlanner } from './recovery-planner';
import { ReviewsAndAnalyticsService } from './reviews-and-analytics-service';

export class StudyOSWorker {
  /**
   * Idempotent job: Generates daily plans for all active students for a given date
   */
  static async runDailyPlanGenerationJob(dateStr?: string): Promise<{ totalProcessed: number; plansCreated: number }> {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    let plansCreated = 0;
    for (const student of students) {
      const plan = await DailyPlanGenerator.generatePlan(student.id, today, {
        reason: 'DAILY_REFRESH',
        generatedBy: 'PLANNER_CRON',
      });
      if (plan) plansCreated++;
    }

    return { totalProcessed: students.length, plansCreated };
  }

  /**
   * Idempotent job: Evaluates yesterday's missed tasks and generates recovery distributions
   */
  static async runMissedTaskRecoveryJob(referenceDate?: string): Promise<{ totalProcessed: number; recoveriesCreated: number }> {
    const today = referenceDate ? new Date(referenceDate) : new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const uncompletedPlans = await prisma.dailyStudyPlan.findMany({
      where: {
        date: yesterdayStr,
        tasks: {
          some: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        },
      },
      select: { userId: true },
    });

    let recoveriesCreated = 0;
    for (const p of uncompletedPlans) {
      // Check if recovery plan already exists
      const existingRecovery = await prisma.recoveryPlan.findFirst({
        where: { userId: p.userId, missedPlanDate: yesterdayStr },
      });

      if (!existingRecovery) {
        await RecoveryPlanner.planRecovery({
          userId: p.userId,
          missedPlanDate: yesterdayStr,
        });
        recoveriesCreated++;
      }
    }

    return { totalProcessed: uncompletedPlans.length, recoveriesCreated };
  }

  /**
   * Idempotent job: Generates weekly reviews for students at end of week
   */
  static async runWeeklyReviewJob(weekStartDate: string, weekEndDate: string): Promise<{ totalProcessed: number; reviewsGenerated: number }> {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    let reviewsGenerated = 0;
    for (const student of students) {
      const review = await ReviewsAndAnalyticsService.generateWeeklyReview(student.id, weekStartDate, weekEndDate);
      if (review) reviewsGenerated++;
    }

    return { totalProcessed: students.length, reviewsGenerated };
  }

  /**
   * Idempotent job: Generates monthly preparation reviews
   */
  static async runMonthlyReviewJob(monthKey: string): Promise<{ totalProcessed: number; reviewsGenerated: number }> {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    let reviewsGenerated = 0;
    for (const student of students) {
      const review = await ReviewsAndAnalyticsService.generateMonthlyReview(student.id, monthKey);
      if (review) reviewsGenerated++;
    }

    return { totalProcessed: students.length, reviewsGenerated };
  }
}
