/**
 * Phase 14: License-Aware Content Gating & AI Retrieval Eligibility Service
 * Implements:
 * 1. Strict source boundaries (PYQ ≠ FINGERTIPS ≠ NCERT ≠ AI_GENERATED)
 * 2. License gating policies (PRIVATE_SOURCE, LICENSE_ALLOWED, LICENSE_RESTRICTED, LICENSE_UNKNOWN)
 * 3. AI Retrieval eligibility (ELIGIBLE, REVIEW_REQUIRED, BLOCKED, LICENSE_RESTRICTED, RETIRED)
 * 4. Search and export restrictions
 */

import prisma from '@/lib/prisma';

export type LicenseStatus =
  | 'PRIVATE_SOURCE'
  | 'LICENSE_ALLOWED'
  | 'LICENSE_RESTRICTED'
  | 'LICENSE_UNKNOWN';

export type RetrievalStatus =
  | 'ELIGIBLE'
  | 'REVIEW_REQUIRED'
  | 'BLOCKED'
  | 'LICENSE_RESTRICTED'
  | 'RETIRED';

export class LicensingAndEligibilityService {
  /**
   * Evaluates if content can be served publicly, retrieved by AI, or exported
   */
  public static async evaluateAccess(contentId: string): Promise<{
    canServeToStudents: boolean;
    canRetrieveForAI: boolean;
    canExport: boolean;
    licenseStatus: LicenseStatus;
    retrievalStatus: RetrievalStatus;
    reason?: string;
  }> {
    const lifecycle = await prisma.contentLifecycle.findUnique({
      where: { contentId },
    });

    if (!lifecycle) {
      return {
        canServeToStudents: false,
        canRetrieveForAI: false,
        canExport: false,
        licenseStatus: 'LICENSE_UNKNOWN',
        retrievalStatus: 'BLOCKED',
        reason: 'Content not registered in lifecycle',
      };
    }

    const licensePolicy = await prisma.contentLicensePolicy.findUnique({
      where: { sourceType: lifecycle.sourceType },
    });

    const licenseStatus = (licensePolicy?.licenseStatus || lifecycle.licenseStatus || 'LICENSE_UNKNOWN') as LicenseStatus;

    // Check RetrievalEligibility record if present
    const eligibilityRecord = await prisma.retrievalEligibility.findUnique({
      where: { contentId },
    });

    let retrievalStatus: RetrievalStatus = 'ELIGIBLE';

    if (lifecycle.status === 'RETIRED') {
      retrievalStatus = 'RETIRED';
    } else if (licenseStatus === 'LICENSE_RESTRICTED') {
      retrievalStatus = 'LICENSE_RESTRICTED';
    } else if (lifecycle.status !== 'PUBLISHED' && lifecycle.status !== 'MONITORED') {
      retrievalStatus = 'REVIEW_REQUIRED';
    } else if (eligibilityRecord) {
      retrievalStatus = eligibilityRecord.status as RetrievalStatus;
    }

    const canServeToStudents =
      (lifecycle.status === 'PUBLISHED' || lifecycle.status === 'MONITORED') &&
      licenseStatus !== 'LICENSE_RESTRICTED';

    const canRetrieveForAI =
      canServeToStudents &&
      retrievalStatus === 'ELIGIBLE' &&
      licenseStatus === 'LICENSE_ALLOWED';

    const canExport =
      canServeToStudents &&
      licensePolicy?.exportAllowed === true;

    return {
      canServeToStudents,
      canRetrieveForAI,
      canExport,
      licenseStatus,
      retrievalStatus,
      reason: !canServeToStudents ? `Content status is ${lifecycle.status} or license is ${licenseStatus}` : undefined,
    };
  }

  /**
   * Sets or updates license policy for a source type
   */
  public static async setLicensePolicy(input: {
    sourceType: string;
    licenseStatus: LicenseStatus;
    allowedUse?: string;
    allowedAudience?: string;
    redistributionAllowed?: boolean;
    exportAllowed?: boolean;
    publicServingAllowed?: boolean;
    expiresAt?: Date | null;
  }) {
    return prisma.contentLicensePolicy.upsert({
      where: { sourceType: input.sourceType },
      update: {
        licenseStatus: input.licenseStatus,
        allowedUse: input.allowedUse || 'STUDY_AND_ASSESSMENT',
        allowedAudience: input.allowedAudience || 'ENROLLED_STUDENTS',
        redistributionAllowed: input.redistributionAllowed ?? false,
        exportAllowed: input.exportAllowed ?? false,
        publicServingAllowed: input.publicServingAllowed ?? true,
        expiresAt: input.expiresAt,
      },
      create: {
        sourceType: input.sourceType,
        licenseStatus: input.licenseStatus,
        allowedUse: input.allowedUse || 'STUDY_AND_ASSESSMENT',
        allowedAudience: input.allowedAudience || 'ENROLLED_STUDENTS',
        redistributionAllowed: input.redistributionAllowed ?? false,
        exportAllowed: input.exportAllowed ?? false,
        publicServingAllowed: input.publicServingAllowed ?? true,
        expiresAt: input.expiresAt,
      },
    });
  }

  /**
   * Updates AI retrieval eligibility explicitly
   */
  public static async updateRetrievalEligibility(contentId: string, status: RetrievalStatus, reason?: string) {
    const lifecycle = await prisma.contentLifecycle.findUnique({
      where: { contentId },
    });

    return prisma.retrievalEligibility.upsert({
      where: { contentId },
      update: {
        status,
        reason,
        lastRefreshedAt: new Date(),
      },
      create: {
        contentId,
        contentType: lifecycle?.contentType || 'UNKNOWN',
        status,
        reason,
        lastRefreshedAt: new Date(),
      },
    });
  }

  /**
   * Filters a list of content items for student search or AI retrieval
   */
  public static async filterEligibleItems<T extends { id: string }>(items: T[]): Promise<T[]> {
    const results: T[] = [];
    for (const item of items) {
      const access = await this.evaluateAccess(item.id);
      if (access.canServeToStudents && access.retrievalStatus !== 'BLOCKED' && access.retrievalStatus !== 'RETIRED') {
        results.push(item);
      }
    }
    return results;
  }
}
