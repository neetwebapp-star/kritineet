import prisma from '../prisma';

export interface RecoveryDistributionDay {
  dayOffset: number;
  date: string;
  addedMinutes: number;
  tasksToReschedule: Array<{
    taskId?: string;
    taskType: string;
    title: string;
    subjectCode: string;
    conceptId?: string;
    action: 'MOVE' | 'SPLIT' | 'DEFER' | 'DROP';
    assignedMinutes: number;
  }>;
}

export interface RecoveryPlanResult {
  userId: string;
  missedPlanDate: string;
  totalMissedMinutes: number;
  recoveredMinutes: number;
  droppedMinutes: number;
  distribution: RecoveryDistributionDay[];
  backlogItemsCreated: number;
  explanation: string;
}

export class RecoveryPlanner {
  /**
   * Plans multi-day distributed recovery for missed tasks without overloading tomorrow's capacity
   */
  static async planRecovery(params: {
    userId: string;
    missedPlanDate: string; // YYYY-MM-DD
    maxExtraMinutesPerDay?: number; // default 30
    recoveryDaysSpan?: number; // default 3
  }): Promise<RecoveryPlanResult> {
    const maxExtra = params.maxExtraMinutesPerDay || 30;
    const daysSpan = params.recoveryDaysSpan || 3;

    // 1. Fetch incomplete tasks from the missed plan date
    const missedPlan = await prisma.dailyStudyPlan.findFirst({
      where: {
        userId: params.userId,
        date: params.missedPlanDate,
      },
      include: {
        tasks: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS', 'MISSED', 'PARTIALLY_COMPLETED'] },
          },
        },
      },
    });

    const missedTasks = missedPlan ? missedPlan.tasks : [];

    // 2. Classify tasks and calculate missed time
    let totalMissedMinutes = 0;
    for (const t of missedTasks) {
      const remainingTime = Math.max(0, t.estimatedMinutes - t.actualMinutes);
      totalMissedMinutes += remainingTime;
    }

    if (totalMissedMinutes === 0) {
      return {
        userId: params.userId,
        missedPlanDate: params.missedPlanDate,
        totalMissedMinutes: 0,
        recoveredMinutes: 0,
        droppedMinutes: 0,
        distribution: [],
        backlogItemsCreated: 0,
        explanation: 'No incomplete tasks to recover for this date.',
      };
    }

    // Sort missed tasks: CORE first, then RECOMMENDED, then OPTIONAL
    const sortedTasks = [...missedTasks].sort((a, b) => {
      const priorityOrder: Record<string, number> = { CORE: 1, RECOMMENDED: 2, OPTIONAL: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

    // 3. Multi-day progressive distribution
    const distribution: RecoveryDistributionDay[] = [];
    const baseDate = new Date(params.missedPlanDate);

    for (let i = 1; i <= daysSpan; i++) {
      const targetDay = new Date(baseDate);
      targetDay.setDate(baseDate.getDate() + i);
      const dateStr = targetDay.toISOString().split('T')[0];

      distribution.push({
        dayOffset: i,
        date: dateStr,
        addedMinutes: 0,
        tasksToReschedule: [],
      });
    }

    let recoveredMinutes = 0;
    let droppedMinutes = 0;
    let backlogCount = 0;

    let currentDayIdx = 0;

    for (const task of sortedTasks) {
      const neededTime = Math.max(15, task.estimatedMinutes - task.actualMinutes);

      // Low priority tasks when total backlog is high get DEFERRED or DROPPED
      if (task.priority === 'OPTIONAL') {
        droppedMinutes += neededTime;
        // Update task status to MISSED
        await prisma.dailyStudyTask.update({
          where: { id: task.id },
          data: { status: 'MISSED' },
        });
        continue;
      }

      // Find day with available recovery capacity
      let placed = false;
      while (currentDayIdx < distribution.length) {
        const day = distribution[currentDayIdx];
        if (day.addedMinutes + neededTime <= maxExtra) {
          // Fits within day's extra cap
          day.addedMinutes += neededTime;
          day.tasksToReschedule.push({
            taskId: task.id,
            taskType: task.taskType,
            title: task.title,
            subjectCode: task.subjectCode,
            conceptId: task.conceptId || undefined,
            action: 'MOVE',
            assignedMinutes: neededTime,
          });
          recoveredMinutes += neededTime;
          placed = true;
          break;
        } else if (day.addedMinutes < maxExtra) {
          // SPLIT task across days if time allows
          const timeForToday = maxExtra - day.addedMinutes;
          if (timeForToday >= 15) {
            day.addedMinutes += timeForToday;
            day.tasksToReschedule.push({
              taskId: task.id,
              taskType: task.taskType,
              title: `${task.title} (Part 1)`,
              subjectCode: task.subjectCode,
              conceptId: task.conceptId || undefined,
              action: 'SPLIT',
              assignedMinutes: timeForToday,
            });
            recoveredMinutes += timeForToday;
          }
          currentDayIdx++;
        } else {
          currentDayIdx++;
        }
      }

      if (!placed) {
        // Exceeds the recovery span -> Send to PreparationBacklog
        await prisma.preparationBacklog.create({
          data: {
            userId: params.userId,
            sourceTaskId: task.id,
            taskType: task.taskType,
            title: task.title,
            subjectCode: task.subjectCode,
            conceptId: task.conceptId,
            estimatedMinutes: neededTime,
            priority: task.priority,
            originalDate: params.missedPlanDate,
            status: 'ACTIVE',
            reason: 'Deferred to backlog: exceeded 3-day recovery capacity',
          },
        });
        backlogCount++;

        await prisma.dailyStudyTask.update({
          where: { id: task.id },
          data: { status: 'DEFERRED' },
        });
      }
    }

    const explanation = `Distributed ${recoveredMinutes}m of missed study across next ${daysSpan} days (+${maxExtra}m/day cap). ${backlogCount} items deferred to backlog, ${droppedMinutes}m optional tasks pruned to avoid student burnout.`;

    // Persist RecoveryPlan record
    await prisma.recoveryPlan.create({
      data: {
        userId: params.userId,
        missedPlanDate: params.missedPlanDate,
        totalMissedMinutes,
        distributionJson: JSON.stringify(distribution),
        status: 'APPLIED',
        explanation,
      },
    });

    return {
      userId: params.userId,
      missedPlanDate: params.missedPlanDate,
      totalMissedMinutes,
      recoveredMinutes,
      droppedMinutes,
      distribution,
      backlogItemsCreated: backlogCount,
      explanation,
    };
  }

  /**
   * Reschedules an active backlog item onto a specific plan date
   */
  static async scheduleBacklogItem(backlogId: string, targetDate: string) {
    const item = await prisma.preparationBacklog.findUnique({
      where: { id: backlogId },
    });
    if (!item) throw new Error(`Backlog item ${backlogId} not found`);

    return prisma.preparationBacklog.update({
      where: { id: backlogId },
      data: {
        status: 'SCHEDULED',
        rescheduledToDate: targetDate,
      },
    });
  }
}
