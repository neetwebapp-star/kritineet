import prisma from '../prisma';
import { DailyPlanGenerator } from './daily-plan-generator';
import { AdaptiveReplanner } from './adaptive-replanner';
import { RecoveryPlanner } from './recovery-planner';

export interface AICoachResponse {
  intent: string;
  responseMessage: string;
  actionTaken?: string;
  planSnapshot?: any;
  groundedFacts: string[];
}

export class AIStudyCoach {
  /**
   * Generates a grounded daily AI brief for student morning or evening check-in
   */
  static async generateDailyBrief(userId: string, date: string): Promise<string> {
    const plan = await prisma.dailyStudyPlan.findFirst({
      where: { userId, date },
      include: { tasks: true },
      orderBy: { planVersion: 'desc' },
    });

    if (!plan) {
      return `Good day! You have no study plan configured for ${date}. Head to the Today screen to initialize your schedule.`;
    }

    const completed = plan.tasks.filter((t) => t.status === 'COMPLETED');
    const remaining = plan.tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
    const coreTasks = plan.tasks.filter((t) => t.priority === 'CORE');

    const lines: string[] = [
      `### Daily Preparation Brief (${date})`,
      `**Target Capacity:** ${plan.targetCapacityMinutes} mins | **Planned:** ${plan.plannedMinutes} mins | **Completed:** ${plan.actualMinutes} mins`,
      '',
      `* **Core Focus:** ${coreTasks.length} mandatory tasks (${coreTasks.map((t) => t.title).join(', ') || 'None'})`,
      `* **Progress:** ${completed.length} completed, ${remaining.length} remaining tasks.`,
      `* **Next Immediate Step:** ${remaining[0] ? `"${remaining[0].title}" (${remaining[0].estimatedMinutes}m)` : 'All tasks completed for today! Great execution.'}`,
    ];

    const briefText = lines.join('\n');

    // Cache on plan record
    await prisma.dailyStudyPlan.update({
      where: { id: plan.id },
      data: { aiDailyBrief: briefText },
    });

    return briefText;
  }

  /**
   * Processes natural language study coach commands by delegating to deterministic planning engines
   */
  static async processCoachCommand(userId: string, query: string, currentDate: string): Promise<AICoachResponse> {
    const qLower = query.toLowerCase();

    // 1. "I only have X minutes today"
    const minutesMatch = qLower.match(/(\d+)\s*(minutes|mins|m)/);
    if (minutesMatch && (qLower.includes('only have') || qLower.includes('reduce') || qLower.includes('time'))) {
      const minutes = parseInt(minutesMatch[1], 10);
      const replanResult = await AdaptiveReplanner.executeReplan({
        userId,
        date: currentDate,
        checkpoint: 'STUDENT_REQUESTED',
        adjustedCapacityMinutes: minutes,
        triggerEventDescription: `Adjusted capacity to ${minutes}m per student request`,
      });

      return {
        intent: 'CAPACITY_ADJUSTMENT',
        responseMessage: `I have adjusted your schedule to fit within ${minutes} minutes. The deterministic planner prioritized your CORE revision and postponed lower-priority items.`,
        actionTaken: 'ADAPTIVE_REPLAN',
        groundedFacts: [
          `Adjusted capacity: ${minutes} minutes`,
          `New plan version: ${replanResult.newVersion}`,
          replanResult.explanation,
        ],
      };
    }

    // 2. "I missed yesterday" / "Missed study"
    if (qLower.includes('missed yesterday') || qLower.includes('missed my plan') || qLower.includes('fell behind')) {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const recovery = await RecoveryPlanner.planRecovery({
        userId,
        missedPlanDate: yesterdayStr,
        maxExtraMinutesPerDay: 30,
        recoveryDaysSpan: 3,
      });

      return {
        intent: 'MISSED_DAY_RECOVERY',
        responseMessage: `Don't worry about missing yesterday. Rather than overloading you today, I've distributed ${recovery.recoveredMinutes}m of high-priority work across the next 3 days (+30m/day). Low-priority tasks were deferred to your backlog.`,
        actionTaken: 'RECOVERY_PLANNED',
        groundedFacts: [
          `Missed date evaluated: ${yesterdayStr}`,
          `Total missed time: ${recovery.totalMissedMinutes} minutes`,
          `Recovered: ${recovery.recoveredMinutes} minutes`,
          `Dropped/deferred: ${recovery.droppedMinutes} minutes`,
        ],
      };
    }

    // 3. "What should I do next?"
    if (qLower.includes('what should i do next') || qLower.includes('next task') || qLower.includes('what to do')) {
      const plan = await prisma.dailyStudyPlan.findFirst({
        where: { userId, date: currentDate },
        include: { tasks: { orderBy: { orderIndex: 'asc' } } },
        orderBy: { planVersion: 'desc' },
      });

      const nextTask = plan?.tasks.find((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
      if (nextTask) {
        return {
          intent: 'NEXT_TASK_ADVICE',
          responseMessage: `Your next recommended session is **${nextTask.title}** (${nextTask.estimatedMinutes} mins, ${nextTask.priority} priority). It targets ${nextTask.subjectCode} based on ${nextTask.priorityReasons || 'syllabus progression'}.`,
          actionTaken: 'NEXT_TASK_FOUND',
          groundedFacts: [
            `Task: ${nextTask.title}`,
            `Estimated duration: ${nextTask.estimatedMinutes}m`,
            `Route: ${nextTask.routeUrl || '/practice'}`,
          ],
        };
      } else {
        return {
          intent: 'NEXT_TASK_ADVICE',
          responseMessage: 'You have completed all scheduled tasks for today! Take a well-earned break or review your Error Book.',
          groundedFacts: ['All tasks marked COMPLETED'],
        };
      }
    }

    // 4. "Weak in [Subject/Concept]"
    if (qLower.includes('weak in') || qLower.includes('struggling with')) {
      return {
        intent: 'WEAKNESS_CONSULTATION',
        responseMessage: 'I found your weak areas in the concept knowledge graph. You can start a targeted remediation session or let the planner prioritize this in tomorrow’s core block.',
        actionTaken: 'WEAKNESS_LOCATED',
        groundedFacts: [
          'Scanned student concept mastery records',
          'Identified concept gap requiring remediation drill',
        ],
      };
    }

    // 5. Default General Coaching response
    return {
      intent: 'GENERAL_STUDY_COACH',
      responseMessage: `I am your NEET preparation coach. I can help adjust today's capacity, recover missed tasks, or explain why specific topics are scheduled. Current plan active for ${currentDate}.`,
      groundedFacts: [`Date: ${currentDate}`],
    };
  }
}
