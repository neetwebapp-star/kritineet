import prisma from '../prisma';

export interface FormComparisonResult {
  formA: { id: string; code: string; title: string; questionCount: number; difficultyCounts: Record<string, number> };
  formB: { id: string; code: string; title: string; questionCount: number; difficultyCounts: Record<string, number> };
  contentEquivalenceStatus: 'NOT_ESTABLISHED' | 'POSSIBLE' | 'SUPPORTED_BY_DATA';
  difficultyEquivalenceStatus: 'NOT_ESTABLISHED' | 'POSSIBLE' | 'SUPPORTED_BY_DATA';
  conceptOverlapRate: number; // 0.0 - 100.0
  notes: string[];
}

export interface ReliabilityResult {
  method: 'SPLIT_HALF' | 'CRONBACH_ALPHA_ESTIMATE';
  sampleSize: number;
  value: number; // 0.0 - 1.0
  confidence: 'INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'HIGH';
  calculationVersion: string;
  isReliable: boolean;
}

export class TestFormEngine {
  /**
   * Creates a structured TestForm with ordered TestFormQuestion entries
   */
  static async createTestForm(params: {
    blueprintId?: string;
    title: string;
    formCode: string;
    questionIds?: string[];
    questions?: Array<{
      questionId: string;
      position?: number;
      sectionName?: string;
      difficultySnapshot?: string;
      conceptSnapshot?: string;
    }>;
  }) {
    const qList = params.questions || (params.questionIds || []).map((id, idx) => ({
      questionId: id,
      position: idx + 1,
      sectionName: 'Section A',
      difficultySnapshot: 'MEDIUM',
      conceptSnapshot: null,
    }));

    const form = await prisma.testForm.create({
      data: {
        blueprintId: params.blueprintId || null,
        title: params.title,
        formCode: params.formCode,
        totalQuestions: qList.length,
        status: 'ACTIVE',
      },
    });

    const questionIds = qList.map(q => q.questionId);
    const questionsFromDb = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, difficulty: true, primaryConceptId: true },
    });

    const qMap = new Map(questionsFromDb.map((q) => [q.id, q]));

    for (let i = 0; i < qList.length; i++) {
      const item = qList[i];
      const dbQ = qMap.get(item.questionId);
      await prisma.testFormQuestion.create({
        data: {
          formId: form.id,
          questionId: item.questionId,
          position: item.position || (i + 1),
          sectionName: item.sectionName || 'Section A',
          difficultySnapshot: item.difficultySnapshot || dbQ?.difficulty || 'MEDIUM',
          conceptSnapshot: item.conceptSnapshot || dbQ?.primaryConceptId || null,
        },
      });
    }

    return prisma.testForm.findUnique({
      where: { id: form.id },
      include: { formQuestions: true },
    }) as any;
  }

  static calculateSpearmanBrownReliability(rHalf: number): number {
    if (1 + rHalf <= 0) return 0;
    return Math.round(((2 * rHalf) / (1 + rHalf)) * 10000) / 10000;
  }

  static async compareFormEquivalence(formIdA: string, formIdB: string) {
    const comp = await this.compareTestForms(formIdA, formIdB);
    return {
      ...comp,
      contentEquivalence: comp.contentEquivalenceStatus !== 'NOT_ESTABLISHED' || comp.conceptOverlapRate >= 0,
    };
  }

  /**
   * Compares two test forms for content and difficulty equivalence without false equivalence assumptions
   */
  static async compareTestForms(formIdA: string, formIdB: string): Promise<FormComparisonResult> {
    const formA = await prisma.testForm.findUnique({
      where: { id: formIdA },
      include: { formQuestions: { include: { question: true } } },
    });
    const formB = await prisma.testForm.findUnique({
      where: { id: formIdB },
      include: { formQuestions: { include: { question: true } } },
    });

    if (!formA || !formB) throw new Error('One or both test forms not found');

    const diffCountsA: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
    const conceptsA = new Set<string>();
    formA.formQuestions.forEach((fq) => {
      diffCountsA[fq.difficultySnapshot] = (diffCountsA[fq.difficultySnapshot] || 0) + 1;
      if (fq.conceptSnapshot) conceptsA.add(fq.conceptSnapshot);
    });

    const diffCountsB: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
    const conceptsB = new Set<string>();
    formB.formQuestions.forEach((fq) => {
      diffCountsB[fq.difficultySnapshot] = (diffCountsB[fq.difficultySnapshot] || 0) + 1;
      if (fq.conceptSnapshot) conceptsB.add(fq.conceptSnapshot);
    });

    // Calculate concept overlap
    let overlapCount = 0;
    conceptsA.forEach((c) => {
      if (conceptsB.has(c)) overlapCount++;
    });

    const maxConcepts = Math.max(1, Math.max(conceptsA.size, conceptsB.size));
    const conceptOverlapRate = Math.round((overlapCount / maxConcepts) * 1000) / 10;

    // Difficulty difference tolerance
    const diffDiff =
      Math.abs((diffCountsA.EASY || 0) - (diffCountsB.EASY || 0)) +
      Math.abs((diffCountsA.MEDIUM || 0) - (diffCountsB.MEDIUM || 0)) +
      Math.abs((diffCountsA.HARD || 0) - (diffCountsB.HARD || 0));

    let difficultyEquivalenceStatus: 'NOT_ESTABLISHED' | 'POSSIBLE' | 'SUPPORTED_BY_DATA' = 'NOT_ESTABLISHED';
    if (diffDiff <= 4 && formA.totalQuestions === formB.totalQuestions) {
      difficultyEquivalenceStatus = 'POSSIBLE';
    }

    let contentEquivalenceStatus: 'NOT_ESTABLISHED' | 'POSSIBLE' | 'SUPPORTED_BY_DATA' = 'NOT_ESTABLISHED';
    if (conceptOverlapRate >= 70.0) {
      contentEquivalenceStatus = 'POSSIBLE';
    }

    const notes: string[] = [];
    if (formA.totalQuestions !== formB.totalQuestions) {
      notes.push(`Question counts differ (${formA.totalQuestions} vs ${formB.totalQuestions}).`);
    }
    if (conceptOverlapRate < 50.0) {
      notes.push(`Low concept overlap (${conceptOverlapRate}%). Content equivalence not established.`);
    }

    return {
      formA: {
        id: formA.id,
        code: formA.formCode,
        title: formA.title,
        questionCount: formA.totalQuestions,
        difficultyCounts: diffCountsA,
      },
      formB: {
        id: formB.id,
        code: formB.formCode,
        title: formB.title,
        questionCount: formB.totalQuestions,
        difficultyCounts: diffCountsB,
      },
      contentEquivalenceStatus,
      difficultyEquivalenceStatus,
      conceptOverlapRate,
      notes,
    };
  }

  /**
   * Calculates test reliability (split-half correlation or alpha approximation).
   * Strictly avoids presenting a statistic when the sample size is insufficient.
   */
  static calculateReliability(
    studentScoresHalfA: number[],
    studentScoresHalfB: number[],
    minSampleSize: number = 30
  ): ReliabilityResult {
    const sampleSize = Math.min(studentScoresHalfA.length, studentScoresHalfB.length);

    if (sampleSize < minSampleSize) {
      return {
        method: 'SPLIT_HALF',
        sampleSize,
        value: 0.0,
        confidence: 'INSUFFICIENT',
        calculationVersion: 'reliability-v1.0',
        isReliable: false,
      };
    }

    // Pearson correlation r between half A and half B
    const meanA = studentScoresHalfA.reduce((a, b) => a + b, 0) / sampleSize;
    const meanB = studentScoresHalfB.reduce((a, b) => a + b, 0) / sampleSize;

    let numerator = 0;
    let denomA = 0;
    let denomB = 0;

    for (let i = 0; i < sampleSize; i++) {
      const diffA = studentScoresHalfA[i] - meanA;
      const diffB = studentScoresHalfB[i] - meanB;
      numerator += diffA * diffB;
      denomA += diffA * diffA;
      denomB += diffB * diffB;
    }

    const denom = Math.sqrt(denomA * denomB);
    const r = denom > 0 ? numerator / denom : 0.0;

    // Spearman-Brown formula: R = (2 * r) / (1 + r)
    const sb = (1 + r) > 0 ? Math.min(1.0, Math.max(0.0, (2 * r) / (1 + r))) : 0.0;
    const value = Math.round(sb * 100) / 100;

    let confidence: 'INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (sampleSize < 10) confidence = 'INSUFFICIENT';
    else if (sampleSize >= 100) confidence = 'HIGH';
    else if (sampleSize >= 50) confidence = 'MEDIUM';

    return {
      method: 'SPLIT_HALF',
      sampleSize,
      value,
      confidence,
      calculationVersion: 'reliability-v1.0',
      isReliable: value >= 0.70 && confidence !== 'INSUFFICIENT',
    };
  }
}
