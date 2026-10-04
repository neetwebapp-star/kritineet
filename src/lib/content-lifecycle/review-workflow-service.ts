/**
 * Phase 14: Content Review Workflow & Editorial SLA Service
 * Implements:
 * 1. Multi-state review workflow (OPEN, ASSIGNED, IN_REVIEW, APPROVED, CORRECTED, REJECTED, CLOSED)
 * 2. Granular reviewer permissions (CONTENT_VIEWER, CONTENT_REVIEWER, SCIENTIFIC_REVIEWER, CONTENT_ADMIN, SUPER_ADMIN)
 * 3. Immutable content correction (creates new version, never overwrites in place)
 * 4. Operational review SLA tracking (0-1d, 2-7d, 8-30d, 30d+)
 * 5. Bulk review action processing with per-item audit logging
 */

import prisma from '@/lib/prisma';
import { LifecycleEngine } from './lifecycle-engine';

export type ReviewStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_REVIEW'
  | 'NEEDS_MORE_EVIDENCE'
  | 'APPROVED'
  | 'CORRECTED'
  | 'REJECTED'
  | 'CLOSED';

export type ContentReviewerRole =
  | 'CONTENT_VIEWER'
  | 'CONTENT_REVIEWER'
  | 'SCIENTIFIC_REVIEWER'
  | 'CONTENT_ADMIN'
  | 'SUPER_ADMIN';

export class ReviewWorkflowService {
  /**
   * Enforces reviewer role capabilities
   */
  public static checkPermission(
    role: ContentReviewerRole,
    action: 'VIEW' | 'REVIEW' | 'APPROVE_SCIENTIFIC' | 'CORRECT' | 'ADMIN'
  ): boolean {
    switch (action) {
      case 'VIEW':
        return true;
      case 'REVIEW':
        return role !== 'CONTENT_VIEWER';
      case 'APPROVE_SCIENTIFIC':
        return role === 'SCIENTIFIC_REVIEWER' || role === 'CONTENT_ADMIN' || role === 'SUPER_ADMIN';
      case 'CORRECT':
      case 'ADMIN':
        return role === 'CONTENT_ADMIN' || role === 'SUPER_ADMIN';
      default:
        return false;
    }
  }

  /**
   * Assigns a review item to a specific reviewer
   */
  public static async assignReview(reviewId: string, reviewerId: string, assignedBy: string) {
    const updated = await prisma.contentReview.update({
      where: { id: reviewId },
      data: {
        assignedToId: reviewerId,
        status: 'ASSIGNED',
      },
    });

    await prisma.contentQualityEvent.create({
      data: {
        eventType: 'CONTENT_REVIEWED',
        contentId: updated.contentId,
        contentType: updated.contentType,
        actorId: assignedBy,
        metadataJson: JSON.stringify({ action: 'ASSIGNED', assignedTo: reviewerId }),
      },
    });

    return updated;
  }

  /**
   * Approves a content review item
   */
  public static async approveReview(reviewId: string, reviewerId: string, notes?: string) {
    const review = await prisma.contentReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new Error(`Review item ${reviewId} not found`);

    const updated = await prisma.contentReview.update({
      where: { id: reviewId },
      data: {
        status: 'APPROVED',
        actionTaken: 'APPROVED',
        resolvedAt: new Date(),
        reviewNotes: notes || review.reviewNotes,
      },
    });

    // Advance lifecycle status to APPROVED
    await LifecycleEngine.transitionStatus(review.contentId, 'APPROVED', notes, reviewerId);

    return updated;
  }

  /**
   * Rejects a content review item
   */
  public static async rejectReview(reviewId: string, reviewerId: string, rejectionReason: string) {
    const review = await prisma.contentReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new Error(`Review item ${reviewId} not found`);

    const updated = await prisma.contentReview.update({
      where: { id: reviewId },
      data: {
        status: 'REJECTED',
        actionTaken: 'REJECTED',
        resolvedAt: new Date(),
        reviewNotes: rejectionReason,
      },
    });

    await prisma.contentQualityEvent.create({
      data: {
        eventType: 'CONTENT_FLAGGED',
        contentId: review.contentId,
        contentType: review.contentType,
        actorId: reviewerId,
        metadataJson: JSON.stringify({ action: 'REJECTED', reason: rejectionReason }),
      },
    });

    return updated;
  }

  /**
   * Corrects content by creating a NEW version instead of mutating historically
   */
  public static async correctContent(input: {
    reviewId: string;
    correctedContent: string;
    reason: string;
    correctedBy: string;
  }) {
    const review = await prisma.contentReview.findUnique({
      where: { id: input.reviewId },
    });

    if (!review) throw new Error(`Review item ${input.reviewId} not found`);

    // 1. Create new version
    const newVersion = await LifecycleEngine.createNewVersion({
      contentId: review.contentId,
      newContent: input.correctedContent,
      changeType: 'REVISED',
      changeReason: input.reason,
      changedBy: input.correctedBy,
    });

    // 2. Mark review item as CORRECTED
    const updatedReview = await prisma.contentReview.update({
      where: { id: input.reviewId },
      data: {
        status: 'CORRECTED',
        actionTaken: 'CORRECTED',
        resolvedAt: new Date(),
        reviewNotes: `Correction created Version ${newVersion.versionNumber}: ${input.reason}`,
      },
    });

    return { review: updatedReview, newVersion };
  }

  /**
   * Calculates operational review queue backlog aging (SLA brackets)
   */
  public static async getReviewSLAStats() {
    const openReviews = await prisma.contentReview.findMany({
      where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_REVIEW', 'NEEDS_MORE_EVIDENCE'] } },
      select: { createdAt: true },
    });

    const now = Date.now();
    const stats = {
      bracket0to1Day: 0,
      bracket2to7Days: 0,
      bracket8to30Days: 0,
      bracket30PlusDays: 0,
      totalOpen: openReviews.length,
    };

    for (const r of openReviews) {
      const ageDays = (now - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays <= 1) stats.bracket0to1Day++;
      else if (ageDays <= 7) stats.bracket2to7Days++;
      else if (ageDays <= 30) stats.bracket8to30Days++;
      else stats.bracket30PlusDays++;
    }

    return stats;
  }

  /**
   * Executes bulk review actions with individual audit events
   */
  public static async executeBulkReview(
    reviewIds: string[],
    action: 'APPROVE' | 'REJECT',
    actorId: string,
    notes?: string
  ) {
    const results = [];
    for (const id of reviewIds) {
      try {
        if (action === 'APPROVE') {
          const res = await this.approveReview(id, actorId, notes);
          results.push({ id, status: 'SUCCESS', actionTaken: 'APPROVE' });
        } else {
          const res = await this.rejectReview(id, actorId, notes || 'Bulk rejection');
          results.push({ id, status: 'SUCCESS', actionTaken: 'REJECT' });
        }
      } catch (err: any) {
        results.push({ id, status: 'FAILED', error: err?.message });
      }
    }
    return results;
  }
}
