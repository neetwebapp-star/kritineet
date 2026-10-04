import prisma from '../prisma';
import { PlanPriorityEngine, CandidateTask } from './plan-priority-engine';
import { PreparationProfileService } from './preparation-profile-service';

export interface GeneratePlanOptions {
  forceReplan?: boolean;
  availableMinutes?: number;
  reason?:
    | 'DAILY_REFRESH'
    | 'MISSED_DAY'
    | 'PERFORMANCE_CHANGE'
    | 'MOCK_COMPLETED'
    | 'MENTOR_OVERRIDE'
    | 'STUDENT_CHANGE'
    | 'EXAM_UPDATE'
    | 'MANUAL_REPLAN';
  generatedBy?: 'STUDENT' | 'MENTOR' | 'PLANNER_CRON' | 'ADAPTIVE_CHECKPOINT';
  subjectFocus?: string;
}

export class DailyPlanGenerator {
  /**
   * Generates or retrieves an explainable, capacity-governed daily study plan
   */
  static async generatePlan(userId: string, date: string, options: GeneratePlanOptions = {}) {
    const reason = options.reason || 'DAILY_REFRESH';
    const generatedBy = options.generatedBy || 'PLANNER_CRON';

    // 1. Check if plan already exists for this date
    const existingPlan = await prisma.dailyStudyPlan.findFirst({
      where: { userId, date },
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        sessions: true,
      },
      orderBy: { planVersion: 'desc' },
    });

    if (existingPlan && !options.forceReplan && options.availableMinutes == null) {
      return existingPlan;
    }

    const nextVersion = existingPlan ? existingPlan.planVersion + 1 : 1;

    // 2. Fetch student preparation profile & capacity
    const profile = await PreparationProfileService.getOrCreateProfile(userId);
    const capacityMinutes = options.availableMinutes ?? profile.dailyStudyCapacityMinutes;
    const sessionLength = profile.preferredSessionLength || 45;
    const currentStage = profile.currentPreparationStage;

    // 3. Gather empirical evidence from student state
    const [
      dueRevisions,
      recentMistakes,
      weakMasteries,
      activeAssignments,
      backlogItems,
      recentMocks,
    ] = await Promise.all([
      // A. Due revisions
      prisma.revisionSchedule.findMany({
        where: {
          userId,
          nextRevisionAt: { lte: new Date() },
          category: { not: 'MASTERED' },
        },
        include: { concept: { include: { chapter: { include: { subject: true } } } } },
        take: 3,
      }),
      // B. Recent unresolved mistakes
      prisma.studentMistake.findMany({
        where: { userId, isResolved: false },
        include: {
          concept: true,
          chapter: { include: { subject: true } },
          question: true,
        },
        orderBy: { lastMistakeAt: 'desc' },
        take: 3,
      }),
      // C. Weak concepts (mastery < 50%)
      prisma.studentConceptMastery.findMany({
        where: { userId, masteryScore: { lt: 50.0 } },
        include: { concept: { include: { chapter: { include: { subject: true } } } } },
        orderBy: { masteryScore: 'asc' },
        take: 3,
      }),
      // D. Mentor assignments
      prisma.assignmentProgress.findMany({
        where: { studentId: userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
        include: { assignment: true },
        take: 2,
      }),
      // E. Backlog items
      prisma.preparationBacklog.findMany({
        where: { userId, status: 'ACTIVE' },
        take: 2,
      }),
      // F. Completed mock awaiting review
      prisma.examAttempt.findMany({
        where: { userId, status: { in: ['SUBMITTED', 'EVALUATED'] } },
        orderBy: { submittedAt: 'desc' },
        take: 1,
      }),
    ]);

    // 4. Construct candidate tasks
    const candidateTasks: Array<{
      taskType: string;
      title: string;
      description?: string;
      subjectCode: string;
      chapterSlug?: string;
      chapterTitle?: string;
      conceptId?: string;
      sourceType: string;
      estimatedMinutes: number;
      candidateInfo: CandidateTask;
      routeUrl?: string;
      meta?: any;
    }> = [];

    // 4.1 Mentor assigned tasks
    for (const a of activeAssignments) {
      candidateTasks.push({
        taskType: 'PRACTICE',
        title: `Mentor Assignment: ${a.assignment.title}`,
        description: a.assignment.description || undefined,
        subjectCode: a.assignment.subject || 'BIOLOGY',
        sourceType: 'GENERAL',
        estimatedMinutes: Math.min(sessionLength, 45),
        routeUrl: `/practice`,
        meta: { assignmentId: a.assignmentId },
        candidateInfo: {
          taskType: 'PRACTICE',
          subjectCode: a.assignment.subject || 'BIOLOGY',
          sourceType: 'GENERAL',
          estimatedMinutes: Math.min(sessionLength, 45),
          isMentorAssigned: true,
          mentorNote: a.assignment.description || undefined,
        },
      });
    }

    // 4.2 Spaced Revision Tasks (Highest memory retention value)
    for (const r of dueRevisions) {
      if (r.concept) {
        candidateTasks.push({
          taskType: 'SPACED_REVISION',
          title: `Revision: ${r.concept.name}`,
          description: `Spaced review for ${r.concept.chapter?.title || 'Chapter'}`,
          subjectCode: r.concept.chapter?.subject?.code || 'PHYSICS',
          chapterSlug: r.concept.chapter?.slug,
          chapterTitle: r.concept.chapter?.title,
          conceptId: r.concept.id,
          sourceType: 'NCERT',
          estimatedMinutes: Math.min(sessionLength, 30),
          routeUrl: `/revision?conceptId=${r.concept.id}`,
          candidateInfo: {
            taskType: 'SPACED_REVISION',
            subjectCode: r.concept.chapter?.subject?.code || 'PHYSICS',
            conceptId: r.concept.id,
            sourceType: 'NCERT',
            estimatedMinutes: 30,
            isRevisionDue: true,
          },
        });
      }
    }

    // 4.3 Mistake Review & Remediation
    for (const m of recentMistakes) {
      candidateTasks.push({
        taskType: 'MISTAKE_REVIEW',
        title: `Error Book Analysis: ${m.concept?.name || m.chapter.title}`,
        description: `Analyze and correct previous error (${m.mistakeType})`,
        subjectCode: m.chapter.subject.code,
        chapterSlug: m.chapter.slug,
        chapterTitle: m.chapter.title,
        conceptId: m.conceptId || undefined,
        sourceType: 'MISTAKE',
        estimatedMinutes: Math.min(sessionLength, 30),
        routeUrl: `/error-book?questionId=${m.questionId}`,
        candidateInfo: {
          taskType: 'MISTAKE_REVIEW',
          subjectCode: m.chapter.subject.code,
          conceptId: m.conceptId || undefined,
          sourceType: 'MISTAKE',
          estimatedMinutes: 30,
          recentMistakeCount: m.mistakeCount,
          errorRate: 60,
        },
      });
    }

    // 4.4 Low Mastery Concept Remediation
    for (const wm of weakMasteries) {
      candidateTasks.push({
        taskType: 'CONCEPT_LEARNING',
        title: `Deep Concept Focus: ${wm.concept.name}`,
        description: `Targeted concept strengthening (current mastery: ${wm.masteryScore.toFixed(0)}%)`,
        subjectCode: wm.concept.chapter?.subject?.code || 'CHEMISTRY',
        chapterSlug: wm.concept.chapter?.slug,
        chapterTitle: wm.concept.chapter?.title,
        conceptId: wm.concept.id,
        sourceType: 'NCERT',
        estimatedMinutes: sessionLength,
        routeUrl: `/remediation?conceptId=${wm.concept.id}`,
        candidateInfo: {
          taskType: 'CONCEPT_LEARNING',
          subjectCode: wm.concept.chapter?.subject?.code || 'CHEMISTRY',
          conceptId: wm.concept.id,
          sourceType: 'NCERT',
          estimatedMinutes: sessionLength,
          masteryLevel: wm.masteryScore,
        },
      });
    }

    // 4.5 PYQ Practice session (if in PYQ or later phase)
    if (['PYQ_PHASE', 'MOCK_PHASE', 'FINAL_REVISION', 'EXAM_READY'].includes(currentStage)) {
      candidateTasks.push({
        taskType: 'PYQ',
        title: 'Authentic NEET PYQ Drill',
        description: 'Timed solving of past 10 years verified NEET exam questions',
        subjectCode: 'PHYSICS',
        sourceType: 'PYQ',
        estimatedMinutes: 45,
        routeUrl: `/practice?sourceType=PYQ`,
        candidateInfo: {
          taskType: 'PYQ',
          subjectCode: 'PHYSICS',
          sourceType: 'PYQ',
          estimatedMinutes: 45,
          hasPyqGap: true,
        },
      });
    }

    // 4.6 Standard Foundation / NCERT Reading
    if (candidateTasks.length < 3) {
      candidateTasks.push({
        taskType: 'NCERT_READ',
        title: 'NCERT In-Depth Textbook Study',
        description: 'Active reading of high-yield NCERT biology chapter lines',
        subjectCode: 'BIOLOGY',
        sourceType: 'NCERT',
        estimatedMinutes: 40,
        routeUrl: `/practice`,
        candidateInfo: {
          taskType: 'NCERT_READ',
          subjectCode: 'BIOLOGY',
          sourceType: 'NCERT',
          estimatedMinutes: 40,
        },
      });
      candidateTasks.push({
        taskType: 'PRACTICE',
        title: 'Adaptive Topic Practice',
        description: 'High-discrimination questions matching current proficiency level',
        subjectCode: 'CHEMISTRY',
        sourceType: 'NCERT',
        estimatedMinutes: 35,
        routeUrl: `/practice`,
        candidateInfo: {
          taskType: 'PRACTICE',
          subjectCode: 'CHEMISTRY',
          sourceType: 'NCERT',
          estimatedMinutes: 35,
        },
      });
    }

    // 5. Evaluate priorities with PlanPriorityEngine
    const prioritizedTasks = candidateTasks.map((t) => {
      const evaluation = PlanPriorityEngine.evaluatePriority(t.candidateInfo);
      return {
        ...t,
        priority: evaluation.priority,
        priorityScore: evaluation.priorityScore,
        priorityReasons: evaluation.priorityReasons,
        explanation: evaluation.explanation,
      };
    });

    // 6. Sort deterministically by priorityScore desc, preserving cognitive interleaving
    prioritizedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

    // 7. Strict Capacity Enforcement: Split into CORE, RECOMMENDED, OPTIONAL
    let accumulatedMinutes = 0;
    const finalTasks: Array<typeof prioritizedTasks[0] & { finalPriority: 'CORE' | 'RECOMMENDED' | 'OPTIONAL' }> = [];

    for (const task of prioritizedTasks) {
      const nextTotal = accumulatedMinutes + task.estimatedMinutes;

      if (task.priority === 'CORE') {
        // CORE tasks are always included in the plan
        accumulatedMinutes = nextTotal;
        finalTasks.push({ ...task, finalPriority: 'CORE' });
      } else if (nextTotal <= capacityMinutes) {
        // Fits within capacity
        accumulatedMinutes = nextTotal;
        finalTasks.push({ ...task, finalPriority: task.priority });
      } else {
        // Exceeds daily capacity -> downgrade to OPTIONAL or defer
        finalTasks.push({ ...task, finalPriority: 'OPTIONAL' });
      }
    }

    // 8. Persist DailyStudyPlan and Tasks
    const summaryNotes = `Plan generated for ${capacityMinutes}m capacity (${finalTasks.filter((t) => t.finalPriority === 'CORE').length} Core, ${finalTasks.filter((t) => t.finalPriority === 'RECOMMENDED').length} Recommended, ${finalTasks.filter((t) => t.finalPriority === 'OPTIONAL').length} Optional)`;

    const plan = await prisma.dailyStudyPlan.create({
      data: {
        userId,
        date,
        targetCapacityMinutes: capacityMinutes,
        plannedMinutes: accumulatedMinutes,
        status: 'PLANNED',
        preparationStage: currentStage,
        planVersion: nextVersion,
        summaryNotes,
        replanReason: existingPlan ? reason : undefined,
        tasks: {
          create: finalTasks.map((t, idx) => ({
            userId,
            date,
            taskType: t.taskType,
            title: t.title,
            description: t.description,
            subjectCode: t.subjectCode,
            chapterSlug: t.chapterSlug,
            chapterTitle: t.chapterTitle,
            conceptId: t.conceptId,
            sourceType: t.sourceType,
            estimatedMinutes: t.estimatedMinutes,
            priority: t.finalPriority,
            priorityScore: t.priorityScore,
            priorityReasons: JSON.stringify(t.priorityReasons),
            orderIndex: idx + 1,
            status: 'PENDING',
            routeUrl: t.routeUrl,
            metaJson: t.meta ? JSON.stringify(t.meta) : null,
            isMentorAssigned: Boolean(t.candidateInfo.isMentorAssigned),
            mentorNote: t.candidateInfo.mentorNote,
          })),
        },
      },
      include: {
        tasks: { orderBy: { orderIndex: 'asc' } },
        sessions: true,
      },
    });

    // 9. Record PlanVersion & PlanChange
    const versionRecord = await prisma.planVersion.create({
      data: {
        userId,
        date,
        versionNumber: nextVersion,
        reason,
        generatedBy,
        inputSnapshotJson: JSON.stringify({
          capacityMinutes,
          currentStage,
          tasksCount: finalTasks.length,
          dueRevisionsCount: dueRevisions.length,
          mistakesCount: recentMistakes.length,
        }),
        changesSummary: summaryNotes,
      },
    });

    for (const t of finalTasks) {
      await prisma.planChange.create({
        data: {
          planVersionId: versionRecord.id,
          changeType: 'TASK_ADDED',
          taskTitle: t.title,
          detailsJson: JSON.stringify({
            priority: t.finalPriority,
            estimatedMinutes: t.estimatedMinutes,
            reasons: t.priorityReasons,
          }),
        },
      });
    }

    return plan;
  }
}
