import prisma from '../prisma';

export interface CreateUpdateParams {
  editionId: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  sourceHierarchy?: string;
  updateType: 'SYLLABUS_CHANGE' | 'DATE_ANNOUNCEMENT' | 'PATTERN_CHANGE' | 'ELIGIBILITY_CHANGE' | 'REGISTRATION' | 'GENERAL_NOTIFICATION';
  impactLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  impactSummary?: string;
  previousValue?: string;
  newValue?: string;
  effectiveDate?: Date;
  verificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'SUPERSEDED' | 'ARCHIVED';
  verifiedBy?: string;
  adminUserId?: string;
}

export class ExamUpdatesEngine {
  /**
   * Creates an exam update. Defaults to UNVERIFIED unless explicitly verified by admin.
   */
  static async createUpdate(params: CreateUpdateParams) {
    const isExplicitlyVerified = params.verificationStatus === 'VERIFIED';
    
    const update = await prisma.examUpdate.create({
      data: {
        editionId: params.editionId,
        title: params.title,
        sourceName: params.sourceName,
        sourceUrl: params.sourceUrl,
        sourceHierarchy: params.sourceHierarchy || 'OFFICIAL_SOURCE',
        updateType: params.updateType,
        impactLevel: params.impactLevel || 'MEDIUM',
        impactSummary: params.impactSummary || null,
        previousValue: params.previousValue || null,
        newValue: params.newValue || null,
        effectiveDate: params.effectiveDate || null,
        verificationStatus: params.verificationStatus || 'UNVERIFIED',
        verifiedAt: isExplicitlyVerified ? new Date() : null,
        verifiedBy: isExplicitlyVerified ? (params.verifiedBy || params.adminUserId) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: params.adminUserId || null,
        action: 'CREATE_EXAM_UPDATE',
        entityType: 'ExamUpdate',
        entityId: update.id,
        newValues: JSON.stringify(update),
      },
    });

    if (isExplicitlyVerified) {
      await this.runUpdateImpactWorkflow(update.id, params.adminUserId);
    }

    return update;
  }

  /**
   * Verifies an update, marks superseded prior updates if applicable, and runs impact workflow.
   */
  static async verifyUpdate(updateId: string, adminUserId: string) {
    const existing = await prisma.examUpdate.findUnique({
      where: { id: updateId },
      include: { edition: true },
    });
    if (!existing) throw new Error('Update not found');

    // If this is a date announcement or pattern change, supersede prior verified updates of the same type for this edition
    if (['DATE_ANNOUNCEMENT', 'PATTERN_CHANGE', 'SYLLABUS_CHANGE'].includes(existing.updateType)) {
      await prisma.examUpdate.updateMany({
        where: {
          editionId: existing.editionId,
          updateType: existing.updateType,
          verificationStatus: 'VERIFIED',
          id: { not: updateId },
        },
        data: {
          verificationStatus: 'SUPERSEDED',
        },
      });
    }

    const verified = await prisma.examUpdate.update({
      where: { id: updateId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'VERIFY_EXAM_UPDATE',
        entityType: 'ExamUpdate',
        entityId: updateId,
        oldValues: JSON.stringify({ verificationStatus: existing.verificationStatus }),
        newValues: JSON.stringify({ verificationStatus: 'VERIFIED', verifiedBy: adminUserId }),
      },
    });

    // Execute impact analysis and notify active students
    const impactResult = await this.runUpdateImpactWorkflow(updateId, adminUserId);

    return {
      update: verified,
      impact: impactResult,
    };
  }

  /**
   * Analyzes the impact of a verified exam update on curriculum, pattern, and student plans.
   */
  static async runUpdateImpactWorkflow(updateId: string, adminUserId?: string) {
    const update = await prisma.examUpdate.findUnique({
      where: { id: updateId },
      include: { edition: true },
    });
    if (!update) throw new Error('Update not found');

    const affectedEntities: {
      updateType: string;
      editionTitle: string;
      affectedPlansCount: number;
      affectedQuestionsCount: number;
      actionsTaken: string[];
    } = {
      updateType: update.updateType,
      editionTitle: update.edition.title,
      affectedPlansCount: 0,
      affectedQuestionsCount: 0,
      actionsTaken: [],
    };

    // If update announced an official exam date, update ExamEdition officialExamDate
    if (update.updateType === 'DATE_ANNOUNCEMENT' && update.newValue) {
      const parsedDate = new Date(update.newValue);
      if (!isNaN(parsedDate.getTime())) {
        await prisma.examEdition.update({
          where: { id: update.editionId },
          data: {
            officialExamDate: parsedDate,
            status: 'CONFIRMED',
          },
        });
        affectedEntities.actionsTaken.push(`Updated ExamEdition officialExamDate to ${parsedDate.toISOString()}`);
      }
    }

    // Identify affected active student plans
    const activePlans = await prisma.preparationPlan.findMany({
      where: {
        status: 'ACTIVE',
        editionId: update.editionId,
      },
      select: { id: true, userId: true },
    });

    affectedEntities.affectedPlansCount = activePlans.length;

    // Dispatch update notifications to active students
    if (activePlans.length > 0) {
      const notificationsData = activePlans.map((plan) => ({
        updateId: update.id,
        userId: plan.userId,
        title: `Official NEET Update: ${update.title}`,
        message: update.impactSummary || `Official update published by ${update.sourceName}. Effective date: ${update.effectiveDate ? update.effectiveDate.toLocaleDateString() : 'Immediate'}.`,
        impactSummary: update.impactSummary,
      }));

      await prisma.examUpdateNotification.createMany({
        data: notificationsData,
      });
      affectedEntities.actionsTaken.push(`Notified ${activePlans.length} active students regarding official update`);
    }

    // Save affected entities summary
    await prisma.examUpdate.update({
      where: { id: updateId },
      data: {
        affectedEntitiesJson: JSON.stringify(affectedEntities),
      },
    });

    return affectedEntities;
  }

  /**
   * Retrieves verified updates for students.
   * If none exist, returns empty list with explicit official empty message.
   */
  static async getStudentVerifiedUpdates(editionId?: string) {
    const whereClause: any = {
      verificationStatus: 'VERIFIED',
    };
    if (editionId) {
      whereClause.editionId = editionId;
    }

    const updates = await prisma.examUpdate.findMany({
      where: whereClause,
      orderBy: { publicationDate: 'desc' },
      include: {
        edition: {
          select: { title: true, editionYear: true },
        },
      },
    });

    return {
      count: updates.length,
      updates,
      message: updates.length === 0 ? 'Official information not yet published.' : null,
    };
  }

  /**
   * Archives an update
   */
  static async archiveUpdate(updateId: string, adminUserId: string) {
    const updated = await prisma.examUpdate.update({
      where: { id: updateId },
      data: { verificationStatus: 'ARCHIVED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'ARCHIVE_EXAM_UPDATE',
        entityType: 'ExamUpdate',
        entityId: updateId,
        newValues: JSON.stringify(updated),
      },
    });

    return updated;
  }
}
