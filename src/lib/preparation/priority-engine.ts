import prisma from '../prisma';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface ChapterPriority {
  chapterId: string;
  chapterTitle: string;
  subjectCode: string;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  evidence: string[];
  recommendation: string;
}

export class PreparationPriorityEngine {
  /**
   * Computes deterministic, explainable preparation priorities for a student across all chapters.
   */
  static async computeChapterPriorities(userId: string): Promise<ChapterPriority[]> {
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

    // Student mistakes per chapter
    const mistakes = await prisma.studentMistake.findMany({
      where: { userId },
      select: {
        chapterId: true,
        mistakeCount: true,
        isResolved: true,
      },
    });

    const mistakeMap = new Map<string, { total: number; repeated: number }>();
    mistakes.forEach((m) => {
      const cur = mistakeMap.get(m.chapterId) || { total: 0, repeated: 0 };
      cur.total++;
      if (m.mistakeCount > 1 && !m.isResolved) cur.repeated++;
      mistakeMap.set(m.chapterId, cur);
    });

    // Student concept masteries
    const masteries = await prisma.studentConceptMastery.findMany({
      where: { userId },
      select: {
        conceptId: true,
        masteryScore: true,
        status: true,
        nextReviewAt: true,
      },
    });

    const masteryMap = new Map<string, { score: number; isOverdue: boolean }>();
    const now = new Date();
    masteries.forEach((m) => {
      const isOverdue = m.status === 'REVIEW_DUE' || (m.nextReviewAt !== null && m.nextReviewAt <= now);
      masteryMap.set(m.conceptId, { score: m.masteryScore, isOverdue });
    });

    // PYQs available per chapter
    const pyqs = await prisma.question.findMany({
      where: { sourceType: 'PYQ', syllabusStatus: 'CURRENT' },
      select: { id: true, chapterId: true },
    });
    const pyqCountMap = new Map<string, number>();
    pyqs.forEach((q) => {
      pyqCountMap.set(q.chapterId, (pyqCountMap.get(q.chapterId) || 0) + 1);
    });

    const results: ChapterPriority[] = [];

    for (const chap of chapters) {
      const totalConcepts = chap.concepts.length;
      if (totalConcepts === 0) continue;

      let coveredCount = 0;
      let totalMastery = 0;
      let overdueCount = 0;

      for (const concept of chap.concepts) {
        if (masteryMap.has(concept.id)) {
          coveredCount++;
          const m = masteryMap.get(concept.id)!;
          totalMastery += m.score;
          if (m.isOverdue) overdueCount++;
        }
      }

      const coverageRate = Math.round((coveredCount / totalConcepts) * 1000) / 10;
      const avgMastery = coveredCount > 0 ? Math.round((totalMastery / coveredCount) * 10) / 10 : 0.0;
      const mistakeInfo = mistakeMap.get(chap.id) || { total: 0, repeated: 0 };
      const pyqCount = pyqCountMap.get(chap.id) || 0;

      // Deterministic priority calculation
      let score = 0;
      const evidence: string[] = [];

      // 1. Mastery deficiency
      if (coveredCount > 0 && avgMastery < 50.0) {
        score += 35;
        evidence.push(`Low concept mastery at ${avgMastery}% (below 50% threshold)`);
      } else if (coveredCount > 0 && avgMastery < 70.0) {
        score += 20;
        evidence.push(`Moderate concept mastery at ${avgMastery}%`);
      } else if (coveredCount === 0) {
        score += 25;
        evidence.push('Chapter is completely unstudied (0% coverage)');
      }

      // 2. Repeated mistakes
      if (mistakeInfo.repeated > 0) {
        score += Math.min(30, mistakeInfo.repeated * 10);
        evidence.push(`${mistakeInfo.repeated} repeated conceptual mistakes recorded`);
      } else if (mistakeInfo.total > 0) {
        score += 10;
        evidence.push(`${mistakeInfo.total} unrepeated mistakes detected`);
      }

      // 3. Spaced revision overdue
      if (overdueCount > 0) {
        score += Math.min(25, overdueCount * 8);
        evidence.push(`${overdueCount} concepts currently overdue for spaced revision`);
      }

      // 4. PYQ exposure availability
      if (pyqCount > 0 && coveredCount > 0) {
        score += 10;
        evidence.push(`${pyqCount} NEET PYQs available for targeted practice`);
      }

      let priorityLevel: PriorityLevel = 'LOW';
      let recommendation = 'Maintain regular revision schedule.';

      if (score >= 70) {
        priorityLevel = 'CRITICAL';
        recommendation = 'Urgent remediation needed: schedule concept remediation and mistake analysis block.';
      } else if (score >= 45) {
        priorityLevel = 'HIGH';
        recommendation = 'High priority: allocate dedicated practice block and clear overdue revisions.';
      } else if (score >= 25) {
        priorityLevel = 'NORMAL';
        recommendation = 'Standard preparation: complete remaining concepts and solve available PYQs.';
      } else {
        priorityLevel = 'LOW';
        recommendation = 'Strong foundation: periodic light revision sufficient.';
      }

      results.push({
        chapterId: chap.id,
        chapterTitle: chap.title,
        subjectCode: chap.subject.code,
        priorityLevel,
        priorityScore: score,
        evidence,
        recommendation,
      });
    }

    // Sort by priorityScore descending
    results.sort((a, b) => b.priorityScore - a.priorityScore);
    return results;
  }
}
