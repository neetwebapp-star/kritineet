/**
 * Phase 14: Content Lifecycle, Provenance & Versioning Engine
 * Implements:
 * 1. Strict lifecycle status transitions (DISCOVERED -> ... -> PUBLISHED -> MONITORED -> RETIRED)
 * 2. Immutable provenance tracking (drive ID, archive, document, page, section, hashes)
 * 3. Hashing engine (contentHash, normalizedHash, semanticHash)
 * 4. Content versioning with historical snapshot preservation
 */

import prisma from '@/lib/prisma';
import crypto from 'crypto';

export type LifecycleStatus =
  | 'DISCOVERED'
  | 'INGESTED'
  | 'EXTRACTED'
  | 'STRUCTURED'
  | 'MAPPED'
  | 'VALIDATING'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'MONITORED'
  | 'SUPERSEDED'
  | 'RETIRED';

export type ContentType =
  | 'NCERT'
  | 'PYQ'
  | 'FINGERTIPS'
  | 'QUESTION'
  | 'CONCEPT'
  | 'TOPIC'
  | 'CHAPTER'
  | 'FIGURE'
  | 'TABLE'
  | 'EXPLANATION'
  | 'SOLUTION'
  | 'REVISION_NOTE'
  | 'AI_GENERATED_CONTENT'
  | 'AI_GENERATED_QUESTION';

export interface ContentProvenance {
  sourceType: string;
  sourceReference: string;
  sourceVersion?: string;
  sourceDocument?: string;
  sourcePage?: number;
  sourceSection?: string;
  sourceDriveFileId?: string;
  sourceArchive?: string;
  sourceFilename?: string;
  documentId?: string;
  pageNumber?: number;
  extractionMethod?: string;
}

export class LifecycleEngine {
  /**
   * Allowed lifecycle state transitions
   */
  private static ALLOWED_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
    DISCOVERED: ['INGESTED', 'RETIRED'],
    INGESTED: ['EXTRACTED', 'REVIEW_REQUIRED', 'RETIRED'],
    EXTRACTED: ['STRUCTURED', 'REVIEW_REQUIRED', 'RETIRED'],
    STRUCTURED: ['MAPPED', 'REVIEW_REQUIRED', 'RETIRED'],
    MAPPED: ['VALIDATING', 'REVIEW_REQUIRED', 'RETIRED'],
    VALIDATING: ['APPROVED', 'REVIEW_REQUIRED', 'RETIRED'],
    REVIEW_REQUIRED: ['APPROVED', 'VALIDATING', 'RETIRED'],
    APPROVED: ['PUBLISHED', 'REVIEW_REQUIRED', 'RETIRED'],
    PUBLISHED: ['MONITORED', 'REVIEW_REQUIRED', 'SUPERSEDED', 'RETIRED'],
    MONITORED: ['PUBLISHED', 'REVIEW_REQUIRED', 'SUPERSEDED', 'RETIRED'],
    SUPERSEDED: ['RETIRED', 'MONITORED'],
    RETIRED: ['DISCOVERED', 'REVIEW_REQUIRED'], // Can be restored for review
  };

  /**
   * Generates cryptographic hashes for content integrity
   */
  public static computeHashes(content: string) {
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');

    // Normalized: lowercased, stripped punctuation, normalized whitespace
    const normalizedText = content
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    const normalizedHash = crypto.createHash('sha256').update(normalizedText).digest('hex');

    // Semantic: captures core token sequence
    const tokens = normalizedText.split(/\s+/).filter(Boolean).sort().join(' ');
    const semanticHash = crypto.createHash('sha256').update(tokens).digest('hex');

    return { contentHash, normalizedHash, semanticHash };
  }

  /**
   * Initializes or fetches a ContentLifecycle record
   */
  public static async registerContent(input: {
    contentId: string;
    contentType: ContentType;
    sourceType: string;
    content: string;
    provenance?: ContentProvenance;
    initialStatus?: LifecycleStatus;
  }) {
    const { contentHash } = this.computeHashes(input.content);

    const existing = await prisma.contentLifecycle.findUnique({
      where: { contentId: input.contentId },
    });

    if (existing) {
      return existing;
    }

    const lifecycle = await prisma.contentLifecycle.create({
      data: {
        contentId: input.contentId,
        contentType: input.contentType,
        status: input.initialStatus || 'DISCOVERED',
        currentVersion: 1,
        sourceType: input.sourceType,
        provenanceJson: input.provenance ? JSON.stringify(input.provenance) : null,
        contentHash,
        isPublished: input.initialStatus === 'PUBLISHED',
        isEligibleForAI: input.initialStatus === 'PUBLISHED',
      },
    });

    // Create Initial Version 1
    await prisma.contentVersion.create({
      data: {
        contentId: input.contentId,
        contentType: input.contentType,
        versionNumber: 1,
        contentSnapshot: input.content,
        sourceSnapshot: input.provenance ? JSON.stringify(input.provenance) : null,
        contentHash,
        changeType: 'CREATED',
        changeReason: 'Initial content ingestion and lifecycle creation',
        changedBy: 'SYSTEM',
      },
    });

    // Record Event
    await prisma.contentQualityEvent.create({
      data: {
        eventType: 'CONTENT_INGESTED',
        contentId: input.contentId,
        contentType: input.contentType,
        actorId: 'SYSTEM',
        metadataJson: JSON.stringify({ version: 1, status: lifecycle.status }),
      },
    });

    return lifecycle;
  }

  /**
   * Controls transition between lifecycle states
   */
  public static async transitionStatus(
    contentId: string,
    targetStatus: LifecycleStatus,
    reason?: string,
    actorId?: string
  ) {
    const lifecycle = await prisma.contentLifecycle.findUnique({
      where: { contentId },
    });

    if (!lifecycle) {
      throw new Error(`ContentLifecycle record not found for: ${contentId}`);
    }

    const currentStatus = lifecycle.status as LifecycleStatus;
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      throw new Error(`Invalid lifecycle transition from ${currentStatus} to ${targetStatus}`);
    }

    // Publication Gate: cannot publish if not APPROVED or already PUBLISHED/MONITORED
    if (targetStatus === 'PUBLISHED' && currentStatus !== 'APPROVED' && currentStatus !== 'MONITORED') {
      throw new Error(`Publication gate rejection: Content must be in APPROVED state before PUBLISHED.`);
    }

    const isPublished = targetStatus === 'PUBLISHED' || targetStatus === 'MONITORED';
    const isEligibleForAI = isPublished && lifecycle.licenseStatus !== 'LICENSE_RESTRICTED';

    const updated = await prisma.contentLifecycle.update({
      where: { contentId },
      data: {
        status: targetStatus,
        isPublished,
        isEligibleForAI,
      },
    });

    // Audit quality event
    await prisma.contentQualityEvent.create({
      data: {
        eventType: targetStatus === 'PUBLISHED' ? 'CONTENT_PUBLISHED' : targetStatus === 'RETIRED' ? 'CONTENT_RETIRED' : 'CONTENT_CHANGED',
        contentId,
        contentType: lifecycle.contentType,
        actorId: actorId || 'SYSTEM',
        metadataJson: JSON.stringify({ from: currentStatus, to: targetStatus, reason }),
      },
    });

    return updated;
  }

  /**
   * Creates a new immutable content version without overwriting historical versions
   */
  public static async createNewVersion(input: {
    contentId: string;
    newContent: string;
    changeType: 'MODIFIED' | 'REVISED' | 'RETIRED' | 'RESTORED';
    changeReason: string;
    changedBy: string;
    provenanceUpdate?: ContentProvenance;
  }) {
    const lifecycle = await prisma.contentLifecycle.findUnique({
      where: { contentId: input.contentId },
    });

    if (!lifecycle) {
      throw new Error(`Content not registered in lifecycle: ${input.contentId}`);
    }

    const newVersionNumber = lifecycle.currentVersion + 1;
    const { contentHash } = this.computeHashes(input.newContent);

    // Write new immutable ContentVersion record
    const version = await prisma.contentVersion.create({
      data: {
        contentId: input.contentId,
        contentType: lifecycle.contentType,
        versionNumber: newVersionNumber,
        contentSnapshot: input.newContent,
        sourceSnapshot: input.provenanceUpdate ? JSON.stringify(input.provenanceUpdate) : lifecycle.provenanceJson,
        contentHash,
        changeType: input.changeType,
        changeReason: input.changeReason,
        changedBy: input.changedBy,
      },
    });

    // Update ContentLifecycle currentVersion and contentHash
    await prisma.contentLifecycle.update({
      where: { contentId: input.contentId },
      data: {
        currentVersion: newVersionNumber,
        contentHash,
        provenanceJson: input.provenanceUpdate ? JSON.stringify(input.provenanceUpdate) : undefined,
      },
    });

    // Audit quality event
    await prisma.contentQualityEvent.create({
      data: {
        eventType: 'CONTENT_CHANGED',
        contentId: input.contentId,
        contentType: lifecycle.contentType,
        actorId: input.changedBy,
        metadataJson: JSON.stringify({
          version: newVersionNumber,
          changeType: input.changeType,
          reason: input.changeReason,
        }),
      },
    });

    return version;
  }

  /**
   * Retrieves full version history for a content item
   */
  public static async getVersionHistory(contentId: string) {
    return prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { versionNumber: 'desc' },
    });
  }
}
