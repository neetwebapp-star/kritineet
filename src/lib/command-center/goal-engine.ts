/**
 * Phase 7: Goal System Engine
 * Allows students and mentors to configure measurable, time-bound targets
 * (daily questions, weekly mock tests, revision completion) and track real progress.
 */

import prisma from '@/lib/prisma';

export interface CreateGoalInput {
  userId: string;
  title: string;
  metricType: 'QUESTIONS_COUNT' | 'ACCURACY_RATE' | 'TESTS_COMPLETED' | 'REVISION_RATE' | 'STUDY_MINUTES';
  target: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  endDate: Date;
}

export class GoalEngine {
  public static async createGoal(input: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        userId: input.userId,
        title: input.title,
        metricType: input.metricType,
        target: input.target,
        current: 0,
        period: input.period,
        endDate: input.endDate,
        status: 'ACTIVE',
      },
    });
  }

  public static async getGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async updateGoalProgress(goalId: string, userId: string, increment: number = 1) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) throw new Error('Goal not found');
    if (goal.userId !== userId) throw new Error('Unauthorized');

    const newCurrent = goal.current + increment;
    const isCompleted = newCurrent >= goal.target;

    return prisma.goal.update({
      where: { id: goalId },
      data: {
        current: newCurrent,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      },
    });
  }
}
