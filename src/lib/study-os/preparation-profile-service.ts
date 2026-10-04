import prisma from '../prisma';

export type PreparationStage =
  | 'FOUNDATION'
  | 'SYLLABUS_COMPLETION'
  | 'FIRST_REVISION'
  | 'PYQ_PHASE'
  | 'MOCK_PHASE'
  | 'FINAL_REVISION'
  | 'EXAM_READY';

export interface StageEvaluationResult {
  currentStage: PreparationStage;
  recommendedStage: PreparationStage;
  shouldTransition: boolean;
  evidence: string[];
}

export class PreparationProfileService {
  /**
   * Retrieves or creates a student's preparation profile
   */
  static async getOrCreateProfile(userId: string) {
    let profile = await prisma.studentPreparationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.studentPreparationProfile.create({
        data: {
          userId,
          dailyStudyCapacityMinutes: 180,
          weeklyStudyCapacityMinutes: 1260,
          preferredStudyWindows: JSON.stringify(['MORNING', 'EVENING']),
          preferredSessionLength: 45,
          preferredSubjects: JSON.stringify(['BIOLOGY', 'PHYSICS', 'CHEMISTRY']),
          currentPreparationStage: 'FOUNDATION',
          stageTransitionReason: 'Initial setup on Foundation stage',
          planningMode: 'BALANCED',
          revisionPreference: 'SPACED',
          mockFrequency: 'WEEKLY',
          planVersion: 1,
        },
      });
    }

    return profile;
  }

  /**
   * Updates student's study preferences and capacities
   */
  static async updateProfile(
    userId: string,
    updates: {
      dailyStudyCapacityMinutes?: number;
      weeklyStudyCapacityMinutes?: number;
      preferredStudyWindows?: string[];
      preferredSessionLength?: number;
      preferredSubjects?: string[];
      planningMode?: string;
      revisionPreference?: string;
      mockFrequency?: string;
      targetDate?: Date;
      targetExamEditionId?: string;
    }
  ) {
    const data: any = {};
    if (updates.dailyStudyCapacityMinutes != null) data.dailyStudyCapacityMinutes = updates.dailyStudyCapacityMinutes;
    if (updates.weeklyStudyCapacityMinutes != null) data.weeklyStudyCapacityMinutes = updates.weeklyStudyCapacityMinutes;
    if (updates.preferredStudyWindows != null) data.preferredStudyWindows = JSON.stringify(updates.preferredStudyWindows);
    if (updates.preferredSessionLength != null) data.preferredSessionLength = updates.preferredSessionLength;
    if (updates.preferredSubjects != null) data.preferredSubjects = JSON.stringify(updates.preferredSubjects);
    if (updates.planningMode != null) data.planningMode = updates.planningMode;
    if (updates.revisionPreference != null) data.revisionPreference = updates.revisionPreference;
    if (updates.mockFrequency != null) data.mockFrequency = updates.mockFrequency;
    if (updates.targetDate != null) data.targetDate = updates.targetDate;
    if (updates.targetExamEditionId != null) data.targetExamEditionId = updates.targetExamEditionId;

    return prisma.studentPreparationProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }

  /**
   * Evaluates evidence to determine if student should transition to next stage
   */
  static async evaluateStageTransition(userId: string): Promise<StageEvaluationResult> {
    const profile = await this.getOrCreateProfile(userId);
    const currentStage = profile.currentPreparationStage as PreparationStage;

    // Gather empirical progress metrics
    const [
      totalCanonicalConcepts,
      masteredConceptsCount,
      practicedConceptsCount,
      totalPYQs,
      attemptedPYQsCount,
      completedMocksCount,
    ] = await Promise.all([
      prisma.concept.count(),
      prisma.studentConceptMastery.count({
        where: { userId, masteryScore: { gte: 70.0 } },
      }),
      prisma.studentConceptMastery.count({
        where: { userId, attempts: { gte: 3 } },
      }),
      prisma.question.count({
        where: { sourceType: 'PYQ', assessmentStatus: { in: ['ACTIVE', 'MONITORED'] } },
      }),
      prisma.questionExposure.count({
        where: {
          userId,
          question: { sourceType: 'PYQ' },
        },
      }),
      prisma.examAttempt.count({
        where: { userId, status: { in: ['SUBMITTED', 'EVALUATED'] } },
      }),
    ]);

    const conceptCoveragePercent = totalCanonicalConcepts > 0 ? (practicedConceptsCount / totalCanonicalConcepts) * 100 : 0;
    const masteryPercent = totalCanonicalConcepts > 0 ? (masteredConceptsCount / totalCanonicalConcepts) * 100 : 0;
    const pyqCoveragePercent = totalPYQs > 0 ? (attemptedPYQsCount / totalPYQs) * 100 : 0;

    let recommendedStage: PreparationStage = currentStage;
    const evidence: string[] = [
      `Practiced concepts coverage: ${conceptCoveragePercent.toFixed(1)}% (${practicedConceptsCount}/${totalCanonicalConcepts})`,
      `High-mastery concepts: ${masteryPercent.toFixed(1)}% (${masteredConceptsCount}/${totalCanonicalConcepts})`,
      `PYQ coverage: ${pyqCoveragePercent.toFixed(1)}% (${attemptedPYQsCount}/${totalPYQs})`,
      `Completed full mocks: ${completedMocksCount}`,
    ];

    // Stage transition heuristics based on hard evidence
    if (currentStage === 'FOUNDATION') {
      if (conceptCoveragePercent >= 30) {
        recommendedStage = 'SYLLABUS_COMPLETION';
        evidence.push('Over 30% of syllabus concepts introduced and practiced.');
      }
    } else if (currentStage === 'SYLLABUS_COMPLETION') {
      if (conceptCoveragePercent >= 70) {
        recommendedStage = 'FIRST_REVISION';
        evidence.push('Over 70% of syllabus completed; ready for systematic First Revision cycle.');
      }
    } else if (currentStage === 'FIRST_REVISION') {
      if (conceptCoveragePercent >= 80 && pyqCoveragePercent >= 40) {
        recommendedStage = 'PYQ_PHASE';
        evidence.push('Syllabus revision initiated and at least 40% PYQs solved.');
      }
    } else if (currentStage === 'PYQ_PHASE') {
      if (pyqCoveragePercent >= 70 && completedMocksCount >= 3) {
        recommendedStage = 'MOCK_PHASE';
        evidence.push('PYQ coverage crossed 70% and baseline mocks established; entering intensive Mock Phase.');
      }
    } else if (currentStage === 'MOCK_PHASE') {
      if (completedMocksCount >= 10 && masteryPercent >= 60) {
        recommendedStage = 'FINAL_REVISION';
        evidence.push('Over 10 full-length mocks completed with high mastery; entering Final Revision.');
      }
    } else if (currentStage === 'FINAL_REVISION') {
      if (completedMocksCount >= 15 && masteryPercent >= 75) {
        recommendedStage = 'EXAM_READY';
        evidence.push('Excellence across all assessment dimensions achieved; student is Exam Ready.');
      }
    }

    const shouldTransition = recommendedStage !== currentStage;

    if (shouldTransition) {
      await prisma.studentPreparationProfile.update({
        where: { userId },
        data: {
          currentPreparationStage: recommendedStage,
          stageTransitionReason: evidence.join('; '),
        },
      });
    }

    return {
      currentStage,
      recommendedStage,
      shouldTransition,
      evidence,
    };
  }
}
