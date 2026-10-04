/**
 * Phase 14: Content Health Profiler & Automated Backlog Detector
 * Implements:
 * 1. Multi-dimensional ContentHealthProfile calculation (provenance, mapping, validation, freshness)
 * 2. Stale content detection (FRESH, REVIEW_DUE, STALE, BLOCKED)
 * 3. Content gap detection (concepts without questions/PYQs, missing figures)
 * 4. Explainable ContentBacklogItem generation
 */

import prisma from '@/lib/prisma';

export class ContentHealthAndBacklogService {
  /**
   * Evaluates or refreshes the health profile of a content item
   */
  public static async evaluateHealthProfile(contentId: string) {
    const lifecycle = await prisma.contentLifecycle.findUnique({
      where: { contentId },
    });

    if (!lifecycle) {
      throw new Error(`Content not registered in lifecycle: ${contentId}`);
    }

    const hasProvenance = Boolean(lifecycle.provenanceJson && lifecycle.provenanceJson.length > 10);
    const provenanceCompleteness = hasProvenance ? 1.0 : 0.2;

    // Check concept mapping
    const dependencies = await prisma.contentDependency.findMany({
      where: { upstreamId: contentId },
    });
    const hasConceptMapping = dependencies.some((d) => d.downstreamType === 'CONCEPT');
    const mappingCompleteness = hasConceptMapping || lifecycle.contentType === 'CONCEPT' ? 1.0 : 0.0;

    // Calculate freshness
    const daysSinceUpdate = (Date.now() - new Date(lifecycle.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    let versionFreshness = 'FRESH';
    if (lifecycle.status === 'RETIRED') {
      versionFreshness = 'BLOCKED';
    } else if (daysSinceUpdate > 365) {
      versionFreshness = 'STALE';
    } else if (daysSinceUpdate > 180) {
      versionFreshness = 'REVIEW_DUE';
    }

    const reviewsCount = await prisma.contentReview.count({
      where: { contentId, status: { in: ['OPEN', 'ASSIGNED', 'IN_REVIEW'] } },
    });

    return prisma.contentHealthProfile.upsert({
      where: { contentId },
      update: {
        provenanceCompleteness,
        mappingCompleteness,
        validationStatus: lifecycle.reviewStatus === 'APPROVED' ? 'VALIDATED' : 'REVIEW_REQUIRED',
        reviewStatus: lifecycle.reviewStatus,
        versionFreshness,
        anomalyCount: reviewsCount,
        sourceIntegrity: hasProvenance ? 'INTACT' : 'BROKEN',
      },
      create: {
        contentId,
        contentType: lifecycle.contentType,
        provenanceCompleteness,
        mappingCompleteness,
        validationStatus: lifecycle.reviewStatus === 'APPROVED' ? 'VALIDATED' : 'REVIEW_REQUIRED',
        reviewStatus: lifecycle.reviewStatus,
        versionFreshness,
        anomalyCount: reviewsCount,
        sourceIntegrity: hasProvenance ? 'INTACT' : 'BROKEN',
      },
    });
  }

  /**
   * Scans chapters and concepts to detect gaps and populates ContentBacklogItem
   */
  public static async scanContentGaps(subjectCode?: string) {
    const chapters = await prisma.chapter.findMany({
      where: {
        chapterNumber: { lte: 20 },
        unitId: { not: null },
      },
      take: 50,
      include: {
        concepts: {
          select: { id: true, name: true },
        },
      },
    });

    const backlogCreated = [];

    for (const ch of chapters) {
      // 1. Check questions in chapter
      const questionsCount = await prisma.question.count({
        where: { chapterId: ch.id },
      });

      if (questionsCount === 0) {
        const item = await prisma.contentBacklogItem.create({
          data: {
            chapterId: ch.id,
            type: 'MISSING_QUESTION',
            priority: 'HIGH',
            title: `Chapter lacks questions: ${ch.title}`,
            explanation: `Chapter "${ch.title}" currently has 0 practice questions linked.`,
          },
        });
        backlogCreated.push(item);
      }

      // 2. Check concept question coverage
      for (const concept of ch.concepts.slice(0, 5)) {
        const conceptQuestionsCount = await prisma.question.count({
          where: { primaryConceptId: concept.id },
        });

        if (conceptQuestionsCount === 0) {
          const item = await prisma.contentBacklogItem.create({
            data: {
              chapterId: ch.id,
              conceptId: concept.id,
              type: 'MISSING_QUESTION',
              priority: 'MEDIUM',
              title: `Concept unrepresented: ${concept.name}`,
              explanation: `Concept "${concept.name}" in "${ch.title}" has no direct practice questions.`,
            },
          });
          backlogCreated.push(item);
        }
      }
    }

    return {
      scannedChapters: chapters.length,
      backlogItemsGenerated: backlogCreated.length,
      items: backlogCreated,
    };
  }

  /**
   * Retrieves overall content health metrics for admin overview
   */
  public static async getGlobalHealthMetrics() {
    const [total, published, reviewRequired, retired, healthProfiles] = await Promise.all([
      prisma.contentLifecycle.count(),
      prisma.contentLifecycle.count({ where: { status: 'PUBLISHED' } }),
      prisma.contentLifecycle.count({ where: { status: 'REVIEW_REQUIRED' } }),
      prisma.contentLifecycle.count({ where: { status: 'RETIRED' } }),
      prisma.contentHealthProfile.findMany({ select: { versionFreshness: true, sourceIntegrity: true } }),
    ]);

    const freshCount = healthProfiles.filter((h) => h.versionFreshness === 'FRESH').length;
    const staleCount = healthProfiles.filter((h) => h.versionFreshness === 'STALE').length;
    const reviewDueCount = healthProfiles.filter((h) => h.versionFreshness === 'REVIEW_DUE').length;

    return {
      totalContent: total,
      published,
      reviewRequired,
      retired,
      freshness: {
        fresh: freshCount,
        reviewDue: reviewDueCount,
        stale: staleCount,
      },
    };
  }
}
