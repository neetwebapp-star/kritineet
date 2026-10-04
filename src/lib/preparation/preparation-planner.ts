import prisma from '../prisma';
import { CoverageTracker } from './coverage-tracker';
import { PreparationPriorityEngine, ChapterPriority } from './priority-engine';
import { CapacityPlanner, PreparationStage } from './capacity-planner';

export interface CalendarDayBlock {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isRestDay: boolean;
  totalPlannedMinutes: number;
  tasks: Array<{
    id: string;
    type: 'STUDY' | 'REVISION' | 'PRACTICE' | 'TEST' | 'MOCK' | 'ASSIGNMENT' | 'MILESTONE';
    title: string;
    subject?: string;
    chapterTitle?: string;
    durationMinutes: number;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
    status: 'PENDING' | 'COMPLETED' | 'MISSED';
    metadata?: Record<string, any>;
  }>;
}

export interface MonthlyRoadmapTarget {
  monthKey: string; // YYYY-MM
  monthName: string;
  stage: PreparationStage;
  targetChaptersToComplete: string[];
  revisionMilestones: string[];
  pyqTargetCount: number;
  mockTestsScheduled: number;
}

export class PreparationPlanner {
  /**
   * Generates or recalculates a versioned Preparation Plan for a student.
   * Preserves historical completed work and only adapts future schedules.
   */
  static async generatePlan(userId: string, editionId?: string, adminOrSystemReason?: string) {
    // 1. Fetch student planning configuration & study capacity
    const { config, capacity } = await CapacityPlanner.getOrCreateStudentConfig(userId);

    // 2. Resolve target exam date: Official exam date takes precedence, then studentPlanningDate
    let officialDate: Date | null = null;
    let targetExamEdition = null;

    if (editionId || config.targetExamEditionId) {
      targetExamEdition = await prisma.examEdition.findUnique({
        where: { id: editionId || config.targetExamEditionId! },
      });
      if (targetExamEdition && targetExamEdition.officialExamDate) {
        officialDate = targetExamEdition.officialExamDate;
      }
    }

    const effectiveTargetDate = officialDate || config.studentPlanningDate || new Date('2027-05-02T09:00:00.000Z');

    // 3. Compute student's actual metrics: Coverage, Priorities, Overdue Revisions
    const ncertCoverage = await CoverageTracker.getNCERTCoverage(userId);
    const pyqCoverage = await CoverageTracker.getPYQCoverage(userId);
    const chapterPriorities = await PreparationPriorityEngine.computeChapterPriorities(userId);

    // 4. Overdue and due revisions from Phase 4 RevisionSchedule
    const now = new Date();
    const activeRevisions = await prisma.revisionSchedule.findMany({
      where: { userId },
      include: {
        concept: { select: { id: true, name: true } },
      },
      take: 20,
    });

    const overdueRevisions = activeRevisions.filter((r) => r.nextRevisionAt <= now);
    const upcomingRevisions = activeRevisions.filter((r) => r.nextRevisionAt > now);

    // 5. Determine Current Stage based on actual coverage & mastery
    let currentStage: PreparationStage = 'FOUNDATION';
    if (ncertCoverage.coveragePercentage >= 90.0 && ncertCoverage.masteryPercentage >= 75.0) {
      currentStage = 'FINAL_REVISION';
    } else if (ncertCoverage.coveragePercentage >= 80.0) {
      currentStage = 'MOCK_PHASE';
    } else if (ncertCoverage.coveragePercentage >= 65.0) {
      currentStage = 'PYQ_PHASE';
    } else if (ncertCoverage.coveragePercentage >= 40.0) {
      currentStage = 'FIRST_REVISION';
    } else if (ncertCoverage.coveragePercentage >= 15.0) {
      currentStage = 'SYLLABUS_COMPLETION';
    }

    // 6. Build progressive mock test plan
    // Topic tests -> Chapter tests -> Subject tests -> Partial mocks -> Full mocks
    let mockTypeToSchedule = 'CHAPTER_TEST';
    if (ncertCoverage.coveragePercentage >= 75.0) {
      mockTypeToSchedule = 'FULL_MOCK';
    } else if (ncertCoverage.coveragePercentage >= 50.0) {
      mockTypeToSchedule = 'SUBJECT_TEST';
    }

    // 7. Generate next 14 days calendar blocks deterministically
    const calendarDays: CalendarDayBlock[] = [];
    const today = new Date();
    let totalPlannedHours = 0;

    for (let i = 0; i < 14; i++) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + i);
      const dateStr = dayDate.toISOString().split('T')[0];
      const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
      const isSunday = dayDate.getDay() === 0;

      const dailyCapacityHours = isWeekend ? capacity.weekendDailyHours : capacity.weekdayDailyHours;
      const dailyCapacityMinutes = dailyCapacityHours * 60;

      const tasks: CalendarDayBlock['tasks'] = [];
      let dayMinutes = 0;

      // 1. Revision task (top priority)
      if (i === 0 && overdueRevisions.length > 0) {
        tasks.push({
          id: `rev_overdue_${dateStr}`,
          type: 'REVISION',
          title: `Clear ${Math.min(5, overdueRevisions.length)} Overdue Spaced Revisions`,
          durationMinutes: 45,
          priority: 'CRITICAL',
          status: 'PENDING',
        });
        dayMinutes += 45;
      } else if (upcomingRevisions.length > 0) {
        tasks.push({
          id: `rev_due_${dateStr}`,
          type: 'REVISION',
          title: 'Daily Spaced Concept Revision Block',
          durationMinutes: 30,
          priority: 'HIGH',
          status: 'PENDING',
        });
        dayMinutes += 30;
      } else {
        tasks.push({
          id: `rev_foundational_${dateStr}`,
          type: 'REVISION',
          title: 'High-Yield Concept Spaced Retention Block',
          durationMinutes: 30,
          priority: 'HIGH',
          status: 'PENDING',
        });
        dayMinutes += 30;
      }

      // 2. High Priority Chapter Study / Remediation
      const priorityChap = chapterPriorities[i % chapterPriorities.length];
      if (priorityChap && dayMinutes + 60 <= dailyCapacityMinutes) {
        tasks.push({
          id: `study_${priorityChap.chapterId}_${dateStr}`,
          type: 'STUDY',
          title: `${priorityChap.chapterTitle} Mastery & Concept Remediation`,
          subject: priorityChap.subjectCode,
          chapterTitle: priorityChap.chapterTitle,
          durationMinutes: 60,
          priority: priorityChap.priorityLevel,
          status: 'PENDING',
        });
        dayMinutes += 60;
      }

      // 3. PYQ or Practice block
      if (dayMinutes + 45 <= dailyCapacityMinutes) {
        tasks.push({
          id: `pyq_${priorityChap ? priorityChap.chapterId : 'general'}_${dateStr}`,
          type: 'PRACTICE',
          title: `Targeted PYQ Exposure: ${priorityChap ? priorityChap.chapterTitle : 'High Yield Concepts'}`,
          subject: priorityChap ? priorityChap.subjectCode : 'PHYSICS',
          durationMinutes: 45,
          priority: 'NORMAL',
          status: 'PENDING',
        });
        dayMinutes += 45;
      }

      // 4. Weekend Mock / Diagnostic Test
      if (isSunday && dayMinutes + 90 <= dailyCapacityMinutes) {
        tasks.push({
          id: `mock_${mockTypeToSchedule}_${dateStr}`,
          type: 'MOCK',
          title: `Progressive Evaluation: ${mockTypeToSchedule.replace('_', ' ')}`,
          durationMinutes: 90,
          priority: 'HIGH',
          status: 'PENDING',
        });
        dayMinutes += 90;
      }

      totalPlannedHours += dayMinutes / 60;

      calendarDays.push({
        date: dateStr,
        dayOfWeek,
        isRestDay: isSunday && dayMinutes <= 60,
        totalPlannedMinutes: dayMinutes,
        tasks,
      });
    }

    const weeklyCapacity = capacity.totalWeeklyHours;
    const weeklyPlanned = totalPlannedHours / 2; // average per week over 14 days
    const isOverloaded = weeklyPlanned > weeklyCapacity;

    // 8. Generate Monthly Roadmap
    const monthlyRoadmap: MonthlyRoadmapTarget[] = [
      {
        monthKey: '2026-10',
        monthName: 'October 2026',
        stage: currentStage,
        targetChaptersToComplete: chapterPriorities.slice(0, 3).map((c) => c.chapterTitle),
        revisionMilestones: ['Complete Class 11 Mechanics Revisions', 'Cell Structure & Function Refinement'],
        pyqTargetCount: 150,
        mockTestsScheduled: 2,
      },
      {
        monthKey: '2026-11',
        monthName: 'November 2026',
        stage: 'FIRST_REVISION',
        targetChaptersToComplete: chapterPriorities.slice(3, 6).map((c) => c.chapterTitle),
        revisionMilestones: ['Organic Chemistry Foundations', 'Plant Physiology Mastery'],
        pyqTargetCount: 200,
        mockTestsScheduled: 3,
      },
      {
        monthKey: '2027-04',
        monthName: 'April 2027',
        stage: 'FINAL_REVISION',
        targetChaptersToComplete: ['All Chapters Syllabus Locked'],
        revisionMilestones: ['Rapid High-Yield Formula Flashcards', 'Top 500 Frequent PYQ Blitz'],
        pyqTargetCount: 400,
        mockTestsScheduled: 8,
      },
    ];

    // 9. Versioning: Supersede previous active plan and create new plan version
    const previousPlan = await prisma.preparationPlan.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
    });

    const newVersion = previousPlan ? previousPlan.version + 1 : 1;

    if (previousPlan) {
      await prisma.preparationPlan.update({
        where: { id: previousPlan.id },
        data: { status: 'SUPERSEDED' },
      });
    }

    const newPlan = await prisma.preparationPlan.create({
      data: {
        userId,
        editionId: targetExamEdition?.id || null,
        version: newVersion,
        status: 'ACTIVE',
        targetExamDate: effectiveTargetDate,
        currentStage,
        weeklyCapacityHours: weeklyCapacity,
        plannedWorkloadHours: Math.round(weeklyPlanned * 10) / 10,
        isOverloaded,
        roadmapJson: JSON.stringify(monthlyRoadmap),
        calendarJson: JSON.stringify(calendarDays),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GENERATE_PREPARATION_PLAN',
        entityType: 'PreparationPlan',
        entityId: newPlan.id,
        newValues: JSON.stringify({
          version: newVersion,
          stage: currentStage,
          plannedWeeklyHours: weeklyPlanned,
          reason: adminOrSystemReason || 'Deterministic recalculation',
        }),
      },
    });

    return {
      plan: newPlan,
      calendar: calendarDays,
      roadmap: monthlyRoadmap,
      currentStage,
      isOverloaded,
      workloadWarning: isOverloaded
        ? `Planned weekly study (${Math.round(weeklyPlanned)}h) exceeds available capacity (${weeklyCapacity}h).`
        : null,
    };
  }

  /**
   * Applies an explicit mentor override with full audit trail
   */
  static async applyMentorOverride(params: {
    planId: string;
    mentorId: string;
    studentId: string;
    reason: string;
    affectedDates: string[];
    adjustmentDetails: Record<string, any>;
  }) {
    const plan = await prisma.preparationPlan.findUnique({
      where: { id: params.planId },
    });
    if (!plan) throw new Error('Plan not found');

    const override = await prisma.mentorPlanOverride.create({
      data: {
        planId: params.planId,
        mentorId: params.mentorId,
        studentId: params.studentId,
        reason: params.reason,
        affectedDatesJson: JSON.stringify(params.affectedDates),
        adjustmentDetailsJson: JSON.stringify(params.adjustmentDetails),
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: params.mentorId,
        action: 'MENTOR_PLAN_OVERRIDE',
        entityType: 'PreparationPlan',
        entityId: params.planId,
        newValues: JSON.stringify({
          overrideId: override.id,
          reason: params.reason,
          affectedDates: params.affectedDates,
        }),
      },
    });

    return override;
  }
}
