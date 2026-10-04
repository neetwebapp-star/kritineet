import prisma from '../prisma';

export type PreparationStage = 
  | 'FOUNDATION'
  | 'SYLLABUS_COMPLETION'
  | 'FIRST_REVISION'
  | 'PYQ_PHASE'
  | 'MOCK_PHASE'
  | 'FINAL_REVISION'
  | 'EXAM_READY';

export interface StudyCapacity {
  weekdayDailyHours: number;
  weekendDailyHours: number;
  totalWeeklyHours: number;
}

export interface StageGateRequirement {
  stage: PreparationStage;
  minCoverageRate: number; // 0.0 - 100.0
  minMasteryRate: number;  // 0.0 - 100.0
  minPyqExposure: number;  // 0.0 - 100.0
  minMockTests: number;
}

export const CANONICAL_STAGE_GATES: Record<PreparationStage, StageGateRequirement> = {
  FOUNDATION: {
    stage: 'FOUNDATION',
    minCoverageRate: 0.0,
    minMasteryRate: 0.0,
    minPyqExposure: 0.0,
    minMockTests: 0,
  },
  SYLLABUS_COMPLETION: {
    stage: 'SYLLABUS_COMPLETION',
    minCoverageRate: 25.0,
    minMasteryRate: 20.0,
    minPyqExposure: 10.0,
    minMockTests: 0,
  },
  FIRST_REVISION: {
    stage: 'FIRST_REVISION',
    minCoverageRate: 60.0,
    minMasteryRate: 50.0,
    minPyqExposure: 25.0,
    minMockTests: 1,
  },
  PYQ_PHASE: {
    stage: 'PYQ_PHASE',
    minCoverageRate: 75.0,
    minMasteryRate: 60.0,
    minPyqExposure: 40.0,
    minMockTests: 3,
  },
  MOCK_PHASE: {
    stage: 'MOCK_PHASE',
    minCoverageRate: 85.0,
    minMasteryRate: 65.0,
    minPyqExposure: 60.0,
    minMockTests: 6,
  },
  FINAL_REVISION: {
    stage: 'FINAL_REVISION',
    minCoverageRate: 90.0,
    minMasteryRate: 75.0,
    minPyqExposure: 75.0,
    minMockTests: 10,
  },
  EXAM_READY: {
    stage: 'EXAM_READY',
    minCoverageRate: 95.0,
    minMasteryRate: 80.0,
    minPyqExposure: 85.0,
    minMockTests: 15,
  },
};

export class CapacityPlanner {
  /**
   * Retrieves or initializes student's study capacity and target dates configuration
   */
  static async getOrCreateStudentConfig(userId: string) {
    let config = await prisma.studentPlanningConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      config = await prisma.studentPlanningConfig.create({
        data: {
          userId,
          weekdayDailyHours: 3.0,
          weekendDailyHours: 6.0,
          targetIntensity: 'BALANCED',
          currentStage: 'FOUNDATION',
        },
      });
    }

    const totalWeeklyHours = (config.weekdayDailyHours * 5) + (config.weekendDailyHours * 2);

    return {
      config,
      capacity: {
        weekdayDailyHours: config.weekdayDailyHours,
        weekendDailyHours: config.weekendDailyHours,
        totalWeeklyHours,
      } as StudyCapacity,
    };
  }

  /**
   * Updates student's study capacity and planning target date
   */
  static async updateStudentCapacity(userId: string, data: {
    weekdayDailyHours?: number;
    weekendDailyHours?: number;
    studentPlanningDate?: Date | null;
    targetIntensity?: string;
  }) {
    const updated = await prisma.studentPlanningConfig.upsert({
      where: { userId },
      update: {
        ...(data.weekdayDailyHours !== undefined && { weekdayDailyHours: data.weekdayDailyHours }),
        ...(data.weekendDailyHours !== undefined && { weekendDailyHours: data.weekendDailyHours }),
        ...(data.studentPlanningDate !== undefined && { studentPlanningDate: data.studentPlanningDate }),
        ...(data.targetIntensity !== undefined && { targetIntensity: data.targetIntensity }),
      },
      create: {
        userId,
        weekdayDailyHours: data.weekdayDailyHours ?? 3.0,
        weekendDailyHours: data.weekendDailyHours ?? 6.0,
        studentPlanningDate: data.studentPlanningDate ?? null,
        targetIntensity: data.targetIntensity ?? 'BALANCED',
      },
    });

    return updated;
  }

  /**
   * Validates if student meets gate requirements to advance to target stage
   */
  static evaluateStageEligibility(
    targetStage: PreparationStage,
    currentMetrics: { coverageRate: number; masteryRate: number; pyqExposure: number; mockTestsCount: number }
  ): { eligible: boolean; requirement: StageGateRequirement; missingCriteria: string[] } {
    const req = CANONICAL_STAGE_GATES[targetStage];
    const missingCriteria: string[] = [];

    if (currentMetrics.coverageRate < req.minCoverageRate) {
      missingCriteria.push(`Syllabus coverage ${currentMetrics.coverageRate}% is below required ${req.minCoverageRate}%`);
    }
    if (currentMetrics.masteryRate < req.minMasteryRate) {
      missingCriteria.push(`Concept mastery ${currentMetrics.masteryRate}% is below required ${req.minMasteryRate}%`);
    }
    if (currentMetrics.pyqExposure < req.minPyqExposure) {
      missingCriteria.push(`PYQ exposure ${currentMetrics.pyqExposure}% is below required ${req.minPyqExposure}%`);
    }
    if (currentMetrics.mockTestsCount < req.minMockTests) {
      missingCriteria.push(`Mock tests taken (${currentMetrics.mockTestsCount}) below required ${req.minMockTests}`);
    }

    return {
      eligible: missingCriteria.length === 0,
      requirement: req,
      missingCriteria,
    };
  }

  /**
   * Enforces capacity-aware workload allocation.
   * If total planned hours exceed available capacity, prioritizes:
   * 1. Weak concepts
   * 2. Overdue revision
   * 3. Incomplete high-value syllabus coverage
   * 4. PYQ exposure
   * 5. Test practice
   */
  static scheduleCapacityAwareBlocks(
    availableWeeklyHours: number,
    candidateBlocks: Array<{
      id: string;
      category: 'WEAK_CONCEPT' | 'OVERDUE_REVISION' | 'SYLLABUS_COVERAGE' | 'PYQ_PRACTICE' | 'TEST_PRACTICE';
      title: string;
      estimatedHours: number;
    }>
  ) {
    const priorityWeights: Record<string, number> = {
      WEAK_CONCEPT: 100,
      OVERDUE_REVISION: 80,
      SYLLABUS_COVERAGE: 60,
      PYQ_PRACTICE: 40,
      TEST_PRACTICE: 20,
    };

    // Sort blocks by category priority descending
    const sorted = [...candidateBlocks].sort((a, b) => priorityWeights[b.category] - priorityWeights[a.category]);

    const scheduledBlocks = [];
    const deferredBlocks = [];
    let allocatedHours = 0;

    for (const block of sorted) {
      if (allocatedHours + block.estimatedHours <= availableWeeklyHours) {
        scheduledBlocks.push(block);
        allocatedHours += block.estimatedHours;
      } else {
        deferredBlocks.push(block);
      }
    }

    const totalRequestedHours = candidateBlocks.reduce((acc, b) => acc + b.estimatedHours, 0);
    const isOverloaded = totalRequestedHours > availableWeeklyHours;

    return {
      availableWeeklyHours,
      totalRequestedHours,
      allocatedHours,
      isOverloaded,
      workloadWarning: isOverloaded
        ? `Your planned workload (${totalRequestedHours}h) exceeds available study time (${availableWeeklyHours}h). Lower priority items were deferred.`
        : null,
      scheduledBlocks,
      deferredBlocks,
    };
  }
}
