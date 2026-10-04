import prisma from '../prisma';
import { DailyPlanGenerator } from './daily-plan-generator';

export type ReplanningCheckpoint =
  | 'MORNING_PLANNING'
  | 'AFTER_MAJOR_TEST'
  | 'AFTER_STUDY_BLOCK'
  | 'END_OF_DAY'
  | 'STUDENT_REQUESTED'
  | 'MENTOR_TRIGGERED'
  | 'EXAM_UPDATE';

export interface ReplanRequest {
  userId: string;
  date: string; // YYYY-MM-DD
  checkpoint: ReplanningCheckpoint;
  adjustedCapacityMinutes?: number;
  additionalFocusSubject?: string;
  triggerEventDescription?: string;
  mentorUserId?: string;
  mentorNote?: string;
}

export interface ReplanResult {
  success: boolean;
  planId: string;
  newVersion: number;
  checkpoint: ReplanningCheckpoint;
  explanation: string;
  tasksChanged: number;
}

export class AdaptiveReplanner {
  /**
   * Controlled replanning triggered strictly at verified checkpoints
   */
  static async executeReplan(request: ReplanRequest): Promise<ReplanResult> {
    const existingPlan = await prisma.dailyStudyPlan.findFirst({
      where: { userId: request.userId, date: request.date },
      include: { tasks: true },
      orderBy: { planVersion: 'desc' },
    });

    if (!existingPlan) {
      // No existing plan, generate fresh one
      const generated = await DailyPlanGenerator.generatePlan(request.userId, request.date, {
        availableMinutes: request.adjustedCapacityMinutes,
        reason: 'DAILY_REFRESH',
        generatedBy: request.mentorUserId ? 'MENTOR' : 'STUDENT',
      });
      return {
        success: true,
        planId: generated.id,
        newVersion: generated.planVersion,
        checkpoint: request.checkpoint,
        explanation: `Initial daily plan generated at checkpoint: ${request.checkpoint}`,
        tasksChanged: generated.tasks.length,
      };
    }

    // Rate-limit churn: max 4 replans per day
    if (existingPlan.replanCount >= 4) {
      return {
        success: false,
        planId: existingPlan.id,
        newVersion: existingPlan.planVersion,
        checkpoint: request.checkpoint,
        explanation: 'Plan churn protection: daily plan has already reached the maximum of 4 replanning iterations today.',
        tasksChanged: 0,
      };
    }

    const previousTaskCount = existingPlan.tasks.length;
    const completedTasks = existingPlan.tasks.filter((t) => t.status === 'COMPLETED');
    const completedMinutes = completedTasks.reduce((sum, t) => sum + t.actualMinutes, 0);

    const remainingCapacity = request.adjustedCapacityMinutes != null
      ? Math.max(30, request.adjustedCapacityMinutes - completedMinutes)
      : undefined;

    // Generate updated plan
    const newPlan = await DailyPlanGenerator.generatePlan(request.userId, request.date, {
      forceReplan: true,
      availableMinutes: remainingCapacity,
      reason: request.mentorUserId ? 'MENTOR_OVERRIDE' : 'PERFORMANCE_CHANGE',
      generatedBy: request.mentorUserId ? 'MENTOR' : 'ADAPTIVE_CHECKPOINT',
      subjectFocus: request.additionalFocusSubject,
    });

    // Increment replanCount
    await prisma.dailyStudyPlan.update({
      where: { id: newPlan.id },
      data: {
        replanCount: existingPlan.replanCount + 1,
        replanReason: `${request.checkpoint}: ${request.triggerEventDescription || 'Dynamic adaptation'}`,
      },
    });

    // Record mentor override audit if triggered by mentor
    if (request.mentorUserId) {
      await prisma.auditLog.create({
        data: {
          userId: request.mentorUserId,
          action: 'MENTOR_OVERRIDE_PLAN',
          entityType: 'DailyStudyPlan',
          entityId: newPlan.id,
          oldValues: JSON.stringify({ planVersion: existingPlan.planVersion, taskCount: previousTaskCount }),
          newValues: JSON.stringify({
            planVersion: newPlan.planVersion,
            checkpoint: request.checkpoint,
            mentorNote: request.mentorNote,
          }),
        },
      });
    }

    let explanation = `Replan executed at [${request.checkpoint}]. `;
    if (request.adjustedCapacityMinutes != null) {
      explanation += `Adjusted total capacity to ${request.adjustedCapacityMinutes}m (${remainingCapacity}m remaining). `;
    }
    explanation += `Preserved ${completedTasks.length} completed tasks, recalibrated ${newPlan.tasks.length} remaining tasks.`;

    return {
      success: true,
      planId: newPlan.id,
      newVersion: newPlan.planVersion,
      checkpoint: request.checkpoint,
      explanation,
      tasksChanged: Math.abs(newPlan.tasks.length - previousTaskCount),
    };
  }

  /**
   * Allows student to skip an optional task and explains consequences
   */
  static async skipOptionalTask(taskId: string, userId: string) {
    const task = await prisma.dailyStudyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    });

    if (!task || task.userId !== userId) {
      throw new Error(`Task ${taskId} not found for student`);
    }

    if (task.priority === 'CORE') {
      throw new Error(`Cannot skip CORE task "${task.title}". Only OPTIONAL or RECOMMENDED tasks may be skipped.`);
    }

    const updated = await prisma.dailyStudyTask.update({
      where: { id: taskId },
      data: { status: 'SKIPPED' },
    });

    // Update parent plan plannedMinutes
    await prisma.dailyStudyPlan.update({
      where: { id: task.planId },
      data: {
        plannedMinutes: { decrement: task.estimatedMinutes },
      },
    });

    return {
      task: updated,
      message: `Skipped optional task "${task.title}". Freed ${task.estimatedMinutes} minutes from today's schedule.`,
    };
  }
}
