import prisma from '../prisma';

export interface ExamPatternVersionConfig {
  editionId: string;
  versionNumber: number;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  subjectConfiguration: Record<string, number>;
  sectionConfiguration?: Record<string, any>;
  instructions?: string;
  adminUserId?: string;
}

export class ExamPatternVersionEngine {
  /**
   * Initializes or creates an immutable ExamPatternVersion
   */
  static async createPatternVersion(config: ExamPatternVersionConfig) {
    const existing = await prisma.examPatternVersion.findUnique({
      where: {
        editionId_versionNumber: {
          editionId: config.editionId,
          versionNumber: config.versionNumber,
        },
      },
    });

    if (existing) {
      throw new Error(`Pattern version ${config.versionNumber} for this edition already exists and is immutable.`);
    }

    // Set other versions for this edition to SUPERSEDED
    await prisma.examPatternVersion.updateMany({
      where: {
        editionId: config.editionId,
        status: 'ACTIVE',
      },
      data: {
        status: 'SUPERSEDED',
      },
    });

    const patternVersion = await prisma.examPatternVersion.create({
      data: {
        editionId: config.editionId,
        versionNumber: config.versionNumber,
        durationMinutes: config.durationMinutes,
        totalQuestions: config.totalQuestions,
        totalMarks: config.totalMarks,
        positiveMarks: config.positiveMarks,
        negativeMarks: config.negativeMarks,
        subjectConfigJson: JSON.stringify(config.subjectConfiguration),
        sectionConfigJson: config.sectionConfiguration ? JSON.stringify(config.sectionConfiguration) : null,
        instructions: config.instructions || null,
        status: 'ACTIVE',
      },
    });

    // Update Edition patternVersion pointer
    await prisma.examEdition.update({
      where: { id: config.editionId },
      data: { patternVersion: config.versionNumber },
    });

    await prisma.auditLog.create({
      data: {
        userId: config.adminUserId || null,
        action: 'CREATE_EXAM_PATTERN_VERSION',
        entityType: 'ExamPatternVersion',
        entityId: patternVersion.id,
        newValues: JSON.stringify({
          versionNumber: config.versionNumber,
          duration: config.durationMinutes,
          totalQuestions: config.totalQuestions,
        }),
      },
    });

    return patternVersion;
  }

  /**
   * Gets the active pattern version for an edition
   */
  static async getActivePatternVersion(editionId: string) {
    const pattern = await prisma.examPatternVersion.findFirst({
      where: {
        editionId,
        status: 'ACTIVE',
      },
      orderBy: { versionNumber: 'desc' },
    });

    if (!pattern) return null;

    return {
      ...pattern,
      subjectConfiguration: JSON.parse(pattern.subjectConfigJson),
      sectionConfiguration: pattern.sectionConfigJson ? JSON.parse(pattern.sectionConfigJson) : null,
    };
  }

  /**
   * Gets a specific historical pattern version
   */
  static async getPatternVersion(editionId: string, versionNumber: number) {
    const pattern = await prisma.examPatternVersion.findUnique({
      where: {
        editionId_versionNumber: {
          editionId,
          versionNumber,
        },
      },
    });

    if (!pattern) return null;

    return {
      ...pattern,
      subjectConfiguration: JSON.parse(pattern.subjectConfigJson),
      sectionConfiguration: pattern.sectionConfigJson ? JSON.parse(pattern.sectionConfigJson) : null,
    };
  }
}
