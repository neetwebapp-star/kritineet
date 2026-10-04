/**
 * Phase 12: Final-Mile Configuration & Mode Management Service
 * Governs transitions across PreparationModes:
 * NORMAL_PREPARATION -> FINAL_MILE -> EXAM_SIMULATION -> EXAM_DAY -> POST_EXAM
 */

import { prisma } from '@/lib/prisma';

export type PreparationMode =
  | 'NORMAL_PREPARATION'
  | 'FINAL_MILE'
  | 'EXAM_SIMULATION'
  | 'EXAM_DAY'
  | 'POST_EXAM';

export interface FinalMileStatus {
  isActive: boolean;
  mode: PreparationMode;
  officialExamDate: string | null;
  officialExamDateDisplay: string;
  daysRemaining: number | null;
  activationReason: string | null;
  isDateAnnounced: boolean;
  syllabusCoverage: number;
  revisionCoverage: number;
  pyqCoverage: number;
}

export class FinalMileConfigService {
  /**
   * Get or initialize the FinalMileConfiguration for a student.
   */
  static async getOrCreateConfiguration(userId: string) {
    let config = await prisma.finalMileConfiguration.findUnique({
      where: { userId },
    });

    if (!config) {
      config = await prisma.finalMileConfiguration.create({
        data: {
          userId,
          isActive: false,
          mode: 'NORMAL_PREPARATION',
          syllabusCoverageThreshold: 70.0,
          revisionCoverageThreshold: 60.0,
          pyqCoverageThreshold: 50.0,
          freezeNewContent: true,
        },
      });
    }

    return config;
  }

  /**
   * Evaluates eligibility for Final-Mile mode activation using authoritative inputs.
   * Does NOT fabricate dates or trigger mode change based solely on guessed dates.
   */
  static async evaluateActivation(userId: string): Promise<FinalMileStatus> {
    const config = await this.getOrCreateConfiguration(userId);

    // 1. Fetch official exam edition from Phase 9
    const edition = await prisma.examEdition.findFirst({
      where: { isActive: true },
      orderBy: { editionYear: 'desc' },
    });

    const officialDate = edition?.officialExamDate || config.officialExamDate;
    let daysRemaining: number | null = null;
    let isDateAnnounced = false;
    let dateDisplay = 'Exam date not officially announced';

    if (officialDate) {
      const now = new Date();
      const diffMs = new Date(officialDate).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isDateAnnounced = true;
      dateDisplay = new Date(officialDate).toISOString().split('T')[0];
    }

    // 2. Fetch coverage metrics
    const totalConcepts = await prisma.concept.count();
    const masteredConcepts = await prisma.studentConceptMastery.count({
      where: { userId, status: 'MASTERED' },
    });
    const syllabusCoverage = totalConcepts > 0 ? (masteredConcepts / totalConcepts) * 100 : 0;

    const totalRevisions = await prisma.revisionSchedule.count({ where: { userId } });
    const completedRevisions = await prisma.revisionSchedule.count({
      where: { userId, category: 'MASTERED' },
    });
    const revisionCoverage = totalRevisions > 0 ? (completedRevisions / totalRevisions) * 100 : 0;

    const totalPyqs = await prisma.question.count({ where: { sourceType: 'PYQ' } });
    const attemptedPyqs = await prisma.questionExposure.count({
      where: { userId, question: { sourceType: 'PYQ' } },
    });
    const pyqCoverage = totalPyqs > 0 ? (attemptedPyqs / totalPyqs) * 100 : 0;

    // 3. Evaluate criteria
    let shouldActivate = config.isActive;
    let reason = config.activationReason;

    if (!config.isActive) {
      if (isDateAnnounced && daysRemaining !== null && daysRemaining <= 60) {
        shouldActivate = true;
        reason = `Activated based on authoritative official exam date (${daysRemaining} days remaining <= 60d window).`;
      } else if (
        syllabusCoverage >= config.syllabusCoverageThreshold &&
        revisionCoverage >= config.revisionCoverageThreshold
      ) {
        shouldActivate = true;
        reason = `Activated based on academic readiness: Syllabus coverage (${syllabusCoverage.toFixed(1)}% >= ${config.syllabusCoverageThreshold}%) and revision coverage (${revisionCoverage.toFixed(1)}% >= ${config.revisionCoverageThreshold}%).`;
      }
    }

    if (shouldActivate && !config.isActive) {
      await prisma.finalMileConfiguration.update({
        where: { id: config.id },
        data: {
          isActive: true,
          mode: 'FINAL_MILE',
          activatedAt: new Date(),
          activationReason: reason,
          officialExamDate: officialDate,
          daysRemaining: daysRemaining ?? undefined,
        },
      });

      // Update student profile preparation stage / mode
      await prisma.studentPreparationProfile.upsert({
        where: { userId },
        create: {
          userId,
          preparationMode: 'FINAL_MILE',
          finalMileActivatedAt: new Date(),
          finalMileReason: reason,
          currentPreparationStage: 'FINAL_REVISION',
        },
        update: {
          preparationMode: 'FINAL_MILE',
          finalMileActivatedAt: new Date(),
          finalMileReason: reason,
          currentPreparationStage: 'FINAL_REVISION',
        },
      });
    }

    const currentMode = (config.isActive || shouldActivate) ? (config.mode === 'NORMAL_PREPARATION' ? 'FINAL_MILE' : (config.mode as PreparationMode)) : 'NORMAL_PREPARATION';

    return {
      isActive: shouldActivate,
      mode: currentMode,
      officialExamDate: officialDate ? new Date(officialDate).toISOString() : null,
      officialExamDateDisplay: dateDisplay,
      daysRemaining,
      activationReason: reason,
      isDateAnnounced,
      syllabusCoverage: Number(syllabusCoverage.toFixed(1)),
      revisionCoverage: Number(revisionCoverage.toFixed(1)),
      pyqCoverage: Number(pyqCoverage.toFixed(1)),
    };
  }

  /**
   * Explicitly transition preparation mode with explainable reasoning.
   */
  static async setPreparationMode(
    userId: string,
    mode: PreparationMode,
    reason?: string
  ) {
    const config = await this.getOrCreateConfiguration(userId);
    const updated = await prisma.finalMileConfiguration.update({
      where: { id: config.id },
      data: {
        mode,
        isActive: mode !== 'NORMAL_PREPARATION',
        activationReason: reason || `Mode transitioned to ${mode}`,
        activatedAt: mode !== 'NORMAL_PREPARATION' ? (config.activatedAt || new Date()) : null,
      },
    });

    await prisma.studentPreparationProfile.upsert({
      where: { userId },
      create: {
        userId,
        preparationMode: mode,
        finalMileActivatedAt: new Date(),
        finalMileReason: reason,
      },
      update: {
        preparationMode: mode,
        finalMileActivatedAt: mode !== 'NORMAL_PREPARATION' ? new Date() : null,
        finalMileReason: reason,
      },
    });

    return updated;
  }

  /**
   * Mentor or Administrator explicit override with audit logging.
   */
  static async setMentorOverride(params: {
    userId: string;
    mentorId: string;
    mode: PreparationMode;
    reason: string;
  }) {
    const { userId, mentorId, mode, reason } = params;

    const previousConfig = await this.getOrCreateConfiguration(userId);

    const updated = await prisma.finalMileConfiguration.update({
      where: { id: previousConfig.id },
      data: {
        mode,
        isActive: mode !== 'NORMAL_PREPARATION',
        activationReason: `Mentor Override by ${mentorId}: ${reason}`,
        activatedAt: new Date(),
      },
    });

    await prisma.studentPreparationProfile.upsert({
      where: { userId },
      create: {
        userId,
        preparationMode: mode,
        finalMileActivatedAt: new Date(),
        finalMileReason: `Mentor Override: ${reason}`,
      },
      update: {
        preparationMode: mode,
        finalMileReason: `Mentor Override: ${reason}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: mentorId,
        action: 'MENTOR_FINAL_MILE_OVERRIDE',
        entityType: 'FinalMileConfiguration',
        entityId: updated.id,
        newValues: JSON.stringify({
          studentId: userId,
          previousMode: previousConfig.mode,
          newMode: mode,
          reason,
        }),
      },
    });

    return updated;
  }
}
