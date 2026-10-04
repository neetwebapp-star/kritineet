import prisma from '../prisma';

export type NCERTProgressStatus = 'UNSEEN' | 'INTRODUCED' | 'PRACTICED' | 'REVIEWED' | 'MASTERED';

export interface ChapterCoverageDetail {
  chapterId: string;
  chapterTitle: string;
  chapterSlug: string;
  subjectCode: string;
  totalConcepts: number;
  unseenCount: number;
  introducedCount: number;
  practicedCount: number;
  reviewedCount: number;
  masteredCount: number;
  coveragePercentage: number;
  status: NCERTProgressStatus;
}

export class CoverageTracker {
  /**
   * Tracks student NCERT coverage derived purely from empirical learning activity
   */
  static async getNCERTCoverage(userId: string, subjectCode?: string): Promise<{
    overallCoverage: number;
    chapters: ChapterCoverageDetail[];
  }> {
    const chaptersWhere: any = {
      chapterNumber: { lte: 20 },
      unitId: { not: null },
    };
    if (subjectCode) {
      chaptersWhere.subject = { code: subjectCode };
    }

    const chapters = await prisma.chapter.findMany({
      where: chaptersWhere,
      include: {
        subject: { select: { code: true } },
        concepts: { select: { id: true } },
      },
      orderBy: { chapterNumber: 'asc' },
    });

    // Fetch user concept masteries
    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId },
    });
    const masteryMap = new Map<string, { attempted: number; mastery: number }>();
    for (const m of masteries) {
      masteryMap.set(m.conceptId, { attempted: m.attempts, mastery: m.masteryScore });
    }

    // Fetch user revision schedules
    const revisions = await prisma.revisionSchedule.findMany({
      where: { userId, category: 'MASTERED' },
      select: { conceptId: true },
    });
    const reviewedConcepts = new Set(revisions.map((r) => r.conceptId).filter(Boolean));

    let totalConceptsAll = 0;
    let masteredOrPracticedAll = 0;

    const chapterDetails: ChapterCoverageDetail[] = [];

    for (const chap of chapters) {
      const totalConcepts = chap.concepts.length;
      totalConceptsAll += totalConcepts;

      let unseen = 0;
      let introduced = 0;
      let practiced = 0;
      let reviewed = 0;
      let mastered = 0;

      for (const c of chap.concepts) {
        const m = masteryMap.get(c.id);
        const hasReviewed = reviewedConcepts.has(c.id);

        if (!m || m.attempted === 0) {
          unseen++;
        } else if (m.mastery >= 75.0) {
          mastered++;
          masteredOrPracticedAll++;
        } else if (hasReviewed) {
          reviewed++;
          masteredOrPracticedAll++;
        } else if (m.attempted >= 3) {
          practiced++;
          masteredOrPracticedAll++;
        } else {
          introduced++;
        }
      }

      const activeCount = practiced + reviewed + mastered;
      const coveragePercentage = totalConcepts > 0 ? (activeCount / totalConcepts) * 100 : 0;

      let status: NCERTProgressStatus = 'UNSEEN';
      if (coveragePercentage >= 80) status = 'MASTERED';
      else if (coveragePercentage >= 60) status = 'REVIEWED';
      else if (coveragePercentage >= 30) status = 'PRACTICED';
      else if (activeCount > 0 || introduced > 0) status = 'INTRODUCED';

      chapterDetails.push({
        chapterId: chap.id,
        chapterTitle: chap.title,
        chapterSlug: chap.slug,
        subjectCode: chap.subject.code,
        totalConcepts,
        unseenCount: unseen,
        introducedCount: introduced,
        practicedCount: practiced,
        reviewedCount: reviewed,
        masteredCount: mastered,
        coveragePercentage: Math.round(coveragePercentage * 10) / 10,
        status,
      });
    }

    const overallCoverage = totalConceptsAll > 0 ? (masteredOrPracticedAll / totalConceptsAll) * 100 : 0;

    return {
      overallCoverage: Math.round(overallCoverage * 10) / 10,
      chapters: chapterDetails,
    };
  }

  /**
   * Tracks authentic NEET PYQ coverage with filters (strictly separated from other sources)
   */
  static async getPYQCoverage(
    userId: string,
    filters?: {
      subjectCode?: string;
      chapterSlug?: string;
      examYear?: number;
      difficulty?: string;
    }
  ) {
    const where: any = {
      sourceType: 'PYQ',
      assessmentStatus: { in: ['ACTIVE', 'MONITORED'] },
    };

    if (filters?.subjectCode) where.subject = { code: filters.subjectCode };
    if (filters?.chapterSlug) where.chapter = { slug: filters.chapterSlug };
    if (filters?.examYear) where.examYear = filters.examYear;
    if (filters?.difficulty) where.difficulty = filters.difficulty;

    const [totalAvailable, exposures] = await Promise.all([
      prisma.question.count({ where }),
      prisma.questionExposure.findMany({
        where: {
          userId,
          question: where,
        },
        include: { question: { select: { id: true, difficulty: true } } },
      }),
    ]);

    const attemptedCount = exposures.length;
    let correctCount = 0;
    let repeatedCount = 0;

    for (const exp of exposures) {
      if (exp.correctCount > 0) correctCount++;
      if (exp.timesAttempted > 1) repeatedCount++;
    }

    const remainingCount = Math.max(0, totalAvailable - attemptedCount);
    const coverageRate = totalAvailable > 0 ? (attemptedCount / totalAvailable) * 100 : 0;
    const accuracyRate = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    return {
      sourceType: 'PYQ',
      totalAvailable,
      attemptedCount,
      correctCount,
      repeatedCount,
      remainingCount,
      coverageRate: Math.round(coverageRate * 10) / 10,
      accuracyRate: Math.round(accuracyRate * 10) / 10,
    };
  }

  /**
   * Tracks MTG Fingertips coverage strictly segregated from PYQs
   */
  static async getFingertipsCoverage(
    userId: string,
    filters?: {
      subjectCode?: string;
      chapterSlug?: string;
    }
  ) {
    const where: any = {
      sourceType: 'FINGERTIPS',
      assessmentStatus: { in: ['ACTIVE', 'MONITORED'] },
    };

    if (filters?.subjectCode) where.subject = { code: filters.subjectCode };
    if (filters?.chapterSlug) where.chapter = { slug: filters.chapterSlug };

    const [totalAvailable, exposures] = await Promise.all([
      prisma.question.count({ where }),
      prisma.questionExposure.findMany({
        where: {
          userId,
          question: where,
        },
      }),
    ]);

    const attemptedCount = exposures.length;
    let correctCount = 0;
    for (const exp of exposures) {
      if (exp.correctCount > 0) correctCount++;
    }

    const remainingCount = Math.max(0, totalAvailable - attemptedCount);
    const coverageRate = totalAvailable > 0 ? (attemptedCount / totalAvailable) * 100 : 0;

    return {
      sourceType: 'FINGERTIPS',
      totalAvailable,
      attemptedCount,
      correctCount,
      remainingCount,
      coverageRate: Math.round(coverageRate * 10) / 10,
    };
  }
}
