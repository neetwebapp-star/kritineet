import prisma from '../prisma';

export interface PYQCoverageMetrics {
  subject: string;
  totalAvailable: number;
  exposedCount: number;
  exposureRate: number; // 0.0 - 100.0
  accuracyRate: number; // 0.0 - 100.0
  masteryRate: number;  // 0.0 - 100.0
  byChapter: Record<string, { total: number; attempted: number; correct: number; exposure: number; accuracy: number }>;
}

export interface NCERTCoverageMetrics {
  totalConcepts: number;
  coveredConcepts: number;
  practicedConcepts: number;
  masteredConcepts: number;
  needsRevisionConcepts: number;
  coveragePercentage: number;
  masteryPercentage: number;
}

export interface FingertipsCoverageMetrics {
  totalAvailable: number;
  questionsExposed: number;
  questionsSolved: number;
  accuracyRate: number;
  repeatedMistakesCount: number;
  chaptersCoveredCount: number;
}

export type ContentStatus = 'UNSEEN' | 'INTRODUCED' | 'PRACTICED' | 'REVIEWED' | 'MASTERED';

export interface ChapterMatrixEntry {
  chapterId: string;
  chapterSlug: string;
  chapterTitle: string;
  subjectCode: string;
  coveragePercentage: number; // 0.0 - 100.0
  masteryPercentage: number;  // 0.0 - 100.0
  category: 'NOT_STUDIED' | 'STUDIED_BUT_WEAK' | 'DEVELOPING' | 'MASTERED';
}

export class CoverageTracker {
  /**
   * Calculates comprehensive PYQ Coverage separating Exposure, Accuracy, and Mastery
   */
  static async getPYQCoverage(userId: string): Promise<Record<string, PYQCoverageMetrics>> {
    // Total PYQs grouped by subject
    const pyqs = await prisma.question.findMany({
      where: {
        sourceType: 'PYQ',
        syllabusStatus: 'CURRENT',
      },
      select: {
        id: true,
        subject: { select: { code: true } },
        chapter: { select: { id: true, title: true } },
      },
    });

    // Student attempts on PYQs
    const attempts = await prisma.attemptEvent.findMany({
      where: {
        userId,
        sourceType: 'PYQ',
      },
      select: {
        questionId: true,
        isCorrect: true,
        chapterId: true,
      },
    });

    const attemptedMap = new Map<string, { isCorrect: boolean }>();
    attempts.forEach((att) => {
      // Keep best performance or last
      if (!attemptedMap.has(att.questionId) || att.isCorrect) {
        attemptedMap.set(att.questionId, { isCorrect: att.isCorrect });
      }
    });

    const result: Record<string, PYQCoverageMetrics> = {};
    const subjects = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY'];

    for (const sub of subjects) {
      result[sub] = {
        subject: sub,
        totalAvailable: 0,
        exposedCount: 0,
        exposureRate: 0.0,
        accuracyRate: 0.0,
        masteryRate: 0.0,
        byChapter: {},
      };
    }

    for (const q of pyqs) {
      const sub = q.subject.code;
      if (!result[sub]) {
        result[sub] = {
          subject: sub,
          totalAvailable: 0,
          exposedCount: 0,
          exposureRate: 0.0,
          accuracyRate: 0.0,
          masteryRate: 0.0,
          byChapter: {},
        };
      }

      result[sub].totalAvailable++;
      const chapId = q.chapter?.id || 'unknown';
      const chapTitle = q.chapter?.title || 'Unknown Chapter';

      if (!result[sub].byChapter[chapTitle]) {
        result[sub].byChapter[chapTitle] = {
          total: 0,
          attempted: 0,
          correct: 0,
          exposure: 0.0,
          accuracy: 0.0,
        };
      }
      result[sub].byChapter[chapTitle].total++;

      if (attemptedMap.has(q.id)) {
        result[sub].exposedCount++;
        result[sub].byChapter[chapTitle].attempted++;
        if (attemptedMap.get(q.id)!.isCorrect) {
          result[sub].byChapter[chapTitle].correct++;
        }
      }
    }

    // Compute rates
    for (const sub of Object.keys(result)) {
      const metric = result[sub];
      if (metric.totalAvailable > 0) {
        metric.exposureRate = Math.round((metric.exposedCount / metric.totalAvailable) * 1000) / 10;
        
        let totalCorrect = 0;
        Object.values(metric.byChapter).forEach((ch) => {
          totalCorrect += ch.correct;
          ch.exposure = ch.total > 0 ? Math.round((ch.attempted / ch.total) * 1000) / 10 : 0.0;
          ch.accuracy = ch.attempted > 0 ? Math.round((ch.correct / ch.attempted) * 1000) / 10 : 0.0;
        });

        metric.accuracyRate = metric.exposedCount > 0 ? Math.round((totalCorrect / metric.exposedCount) * 1000) / 10 : 0.0;
        // Composite mastery: 50% exposure + 50% accuracy
        metric.masteryRate = Math.round(((metric.exposureRate * 0.5) + (metric.accuracyRate * 0.5)) * 10) / 10;
      }
    }

    return result;
  }

  /**
   * Computes NCERT Concept coverage using actual DB concept and mastery entries
   */
  static async getNCERTCoverage(userId: string): Promise<NCERTCoverageMetrics> {
    const totalConcepts = await prisma.concept.count();

    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId },
      select: {
        masteryScore: true,
        status: true,
        attempts: true,
        nextReviewAt: true,
      },
    });

    const now = new Date();
    let coveredConcepts = masteries.length;
    let practicedConcepts = 0;
    let masteredConcepts = 0;
    let needsRevisionConcepts = 0;

    masteries.forEach((m) => {
      if (m.attempts >= 1) practicedConcepts++;
      if (m.masteryScore >= 75.0 || m.status === 'MASTERED') masteredConcepts++;
      if (m.status === 'REVIEW_DUE' || (m.nextReviewAt && m.nextReviewAt <= now)) {
        needsRevisionConcepts++;
      }
    });

    const coveragePercentage = totalConcepts > 0 ? Math.round((coveredConcepts / totalConcepts) * 1000) / 10 : 0.0;
    const masteryPercentage = totalConcepts > 0 ? Math.round((masteredConcepts / totalConcepts) * 1000) / 10 : 0.0;

    return {
      totalConcepts,
      coveredConcepts,
      practicedConcepts,
      masteredConcepts,
      needsRevisionConcepts,
      coveragePercentage,
      masteryPercentage,
    };
  }

  /**
   * Tracks Fingertips questions exposure and practice metrics
   */
  static async getFingertipsCoverage(userId: string): Promise<FingertipsCoverageMetrics> {
    const totalAvailable = await prisma.question.count({
      where: {
        sourceType: 'FINGERTIPS',
        syllabusStatus: 'CURRENT',
      },
    });

    const exposures = await prisma.attemptEvent.findMany({
      where: {
        userId,
        sourceType: 'FINGERTIPS',
      },
      select: {
        questionId: true,
        isCorrect: true,
        chapterId: true,
      },
    });

    const questionSet = new Set<string>();
    const chapterSet = new Set<string>();
    let correctCount = 0;

    exposures.forEach((e) => {
      questionSet.add(e.questionId);
      if (e.chapterId) chapterSet.add(e.chapterId);
      if (e.isCorrect) correctCount++;
    });

    const questionsExposed = questionSet.size;
    const questionsSolved = correctCount;
    const accuracyRate = exposures.length > 0 ? Math.round((correctCount / exposures.length) * 1000) / 10 : 0.0;

    const repeatedMistakesCount = await prisma.studentMistake.count({
      where: {
        userId,
        mistakeCount: { gt: 1 },
        question: { sourceType: 'FINGERTIPS' },
      },
    });

    return {
      totalAvailable,
      questionsExposed,
      questionsSolved,
      accuracyRate,
      repeatedMistakesCount,
      chaptersCoveredCount: chapterSet.size,
    };
  }

  /**
   * Evaluates content status for a chapter based on concrete evidence
   */
  static determineContentStatus(conceptsTotal: number, conceptsCovered: number, avgMastery: number, questionsAttempted: number): ContentStatus {
    if (questionsAttempted === 0 && conceptsCovered === 0) return 'UNSEEN';
    if (conceptsCovered < conceptsTotal * 0.3) return 'INTRODUCED';
    if (avgMastery < 70.0 || conceptsCovered < conceptsTotal * 0.7) return 'PRACTICED';
    if (avgMastery >= 75.0 && conceptsCovered >= conceptsTotal * 0.8) return 'MASTERED';
    return 'REVIEWED';
  }

  /**
   * Builds Mastery + Coverage Matrix across all chapters
   * Clearly distinguishes "I haven't studied it" from "I studied it but am weak"
   */
  static async getMasteryCoverageMatrix(userId: string): Promise<ChapterMatrixEntry[]> {
    const chapters = await prisma.chapter.findMany({
      where: {
        chapterNumber: { lte: 20 },
        unitId: { not: null },
      },
      include: {
        subject: { select: { code: true } },
        concepts: { select: { id: true } },
      },
    });

    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId },
      select: {
        conceptId: true,
        masteryScore: true,
      },
    });

    const masteryMap = new Map<string, number>();
    masteries.forEach((m) => masteryMap.set(m.conceptId, m.masteryScore));

    const matrix: ChapterMatrixEntry[] = [];

    for (const chap of chapters) {
      const totalConcepts = chap.concepts.length;
      if (totalConcepts === 0) continue;

      let coveredCount = 0;
      let totalMastery = 0;

      for (const concept of chap.concepts) {
        if (masteryMap.has(concept.id)) {
          coveredCount++;
          totalMastery += masteryMap.get(concept.id)!;
        }
      }

      const coveragePercentage = Math.round((coveredCount / totalConcepts) * 1000) / 10;
      const masteryPercentage = coveredCount > 0 ? Math.round((totalMastery / coveredCount) * 10) / 10 : 0.0;

      let category: 'NOT_STUDIED' | 'STUDIED_BUT_WEAK' | 'DEVELOPING' | 'MASTERED' = 'NOT_STUDIED';
      if (coveragePercentage < 30.0) {
        category = 'NOT_STUDIED';
      } else if (masteryPercentage < 50.0) {
        category = 'STUDIED_BUT_WEAK';
      } else if (masteryPercentage >= 75.0 && coveragePercentage >= 70.0) {
        category = 'MASTERED';
      } else {
        category = 'DEVELOPING';
      }

      matrix.push({
        chapterId: chap.id,
        chapterSlug: chap.slug,
        chapterTitle: chap.title,
        subjectCode: chap.subject.code,
        coveragePercentage,
        masteryPercentage,
        category,
      });
    }

    return matrix;
  }
}
