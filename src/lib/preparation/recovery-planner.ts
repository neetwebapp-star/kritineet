export interface MissedTask {
  id: string;
  category: 'REVISION' | 'CONCEPT_LEARNING' | 'PYQ_PRACTICE' | 'TEST' | 'MISTAKE_CORRECTION';
  title: string;
  estimatedMinutes: number;
  priorityScore: number;
  scheduledDate: string; // YYYY-MM-DD
}

export interface RecoveryPlanResult {
  strategy: 'SPREAD' | 'PRIORITIZE_AND_DEFER' | 'REDUCE' | 'MERGE';
  totalMissedMinutes: number;
  recoveredMinutesTomorrow: number;
  deferredMinutes: number;
  actions: string[];
  tomorrowSchedule: Array<{ title: string; category: string; durationMinutes: number }>;
  upcomingBufferAllocations: Array<{ date: string; taskTitle: string; durationMinutes: number }>;
}

export class RecoveryPlanner {
  /**
   * Plans recovery for missed study days without overwhelming the student
   */
  static planMissedDayRecovery(
    missedTasks: MissedTask[],
    availableDailyMinutesTomorrow: number,
    bufferDaysAvailable: string[] = []
  ): RecoveryPlanResult {
    const totalMissedMinutes = missedTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

    // If no tasks missed, return empty
    if (missedTasks.length === 0) {
      return {
        strategy: 'SPREAD',
        totalMissedMinutes: 0,
        recoveredMinutesTomorrow: 0,
        deferredMinutes: 0,
        actions: ['No missed tasks to recover.'],
        tomorrowSchedule: [],
        upcomingBufferAllocations: [],
      };
    }

    // Sort missed tasks by priorityScore descending (highest priority first: Revision & Mistake correction)
    const sorted = [...missedTasks].sort((a, b) => b.priorityScore - a.priorityScore);

    // Max 40% of tomorrow's study time can be allocated to recovery, protecting normal daily progress
    const maxTomorrowRecoveryMinutes = Math.floor(availableDailyMinutesTomorrow * 0.4);

    const tomorrowSchedule: Array<{ title: string; category: string; durationMinutes: number }> = [];
    const upcomingBufferAllocations: Array<{ date: string; taskTitle: string; durationMinutes: number }> = [];
    const actions: string[] = [];

    let allocatedTomorrowMinutes = 0;
    let deferredMinutes = 0;

    let bufferDayIndex = 0;

    for (const task of sorted) {
      // If task fits in tomorrow's recovery allowance
      if (allocatedTomorrowMinutes + task.estimatedMinutes <= maxTomorrowRecoveryMinutes) {
        tomorrowSchedule.push({
          title: `[Recovery] ${task.title}`,
          category: task.category,
          durationMinutes: task.estimatedMinutes,
        });
        allocatedTomorrowMinutes += task.estimatedMinutes;
        actions.push(`Rescheduled high-priority task "${task.title}" to tomorrow.`);
      } else {
        // Defer to upcoming rest/buffer day or spread out
        const targetBufferDate = bufferDaysAvailable.length > 0 
          ? bufferDaysAvailable[bufferDayIndex % bufferDaysAvailable.length] 
          : 'Upcoming Weekend Buffer';
        
        bufferDayIndex++;
        upcomingBufferAllocations.push({
          date: targetBufferDate,
          taskTitle: task.title,
          durationMinutes: task.estimatedMinutes,
        });
        deferredMinutes += task.estimatedMinutes;
        actions.push(`Deferred task "${task.title}" (${task.estimatedMinutes}m) to ${targetBufferDate} to prevent burnout.`);
      }
    }

    return {
      strategy: deferredMinutes > 0 ? 'PRIORITIZE_AND_DEFER' : 'SPREAD',
      totalMissedMinutes,
      recoveredMinutesTomorrow: allocatedTomorrowMinutes,
      deferredMinutes,
      actions,
      tomorrowSchedule,
      upcomingBufferAllocations,
    };
  }
}
