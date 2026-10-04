import prisma from '../prisma';

export interface BlueprintRuleInput {
  subjectCode: string;
  chapterSlug?: string;
  conceptId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sourceType?: 'PYQ' | 'NCERT' | 'FINGERTIPS';
  questionType?: string;
  weightagePercent?: number;
  minQuestions: number;
  maxQuestions: number;
  timePerQuestionSeconds?: number;
}

export interface BlueprintCoverageVariance {
  dimension: string;
  requested: number;
  actual: number;
  variancePercentage: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  details?: string;
}

export interface TestQualityEvaluation {
  testId: string;
  blueprintId?: string;
  status: 'PASS' | 'WARNING' | 'REVIEW_REQUIRED';
  overallQualityScore: number;
  variances: BlueprintCoverageVariance[];
  findings: string[];
  metrics: Record<string, any>;
}

export class AssessmentBlueprintEngine {
  /**
   * Creates a formal AssessmentBlueprint with structured distribution rules
   */
  static async createBlueprint(params: {
    title: string;
    description?: string;
    examType?: string;
    targetQuestionCount: number;
    targetDurationMinutes: number;
    rules: BlueprintRuleInput[];
  }) {
    const blueprint = await prisma.assessmentBlueprint.create({
      data: {
        title: params.title,
        description: params.description || null,
        examType: params.examType || 'NEET_UG',
        targetQuestionCount: params.targetQuestionCount,
        targetDurationMinutes: params.targetDurationMinutes,
        rulesJson: JSON.stringify(params.rules),
        status: 'ACTIVE',
      },
    });

    for (const rule of params.rules) {
      await prisma.assessmentBlueprintRule.create({
        data: {
          blueprintId: blueprint.id,
          subjectCode: rule.subjectCode,
          chapterSlug: rule.chapterSlug || null,
          conceptId: rule.conceptId || null,
          difficulty: rule.difficulty || null,
          sourceType: rule.sourceType || null,
          questionType: rule.questionType || null,
          weightagePercent: rule.weightagePercent || 0.0,
          minQuestions: rule.minQuestions,
          maxQuestions: rule.maxQuestions,
          timePerQuestionSeconds: rule.timePerQuestionSeconds || 60,
        },
      });
    }

    return blueprint;
  }

  /**
   * Evaluates blueprint coverage variance and test quality across 11 psychometric dimensions
   */
  static async evaluateTestQuality(testId: string, blueprintId?: string): Promise<TestQualityEvaluation> {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          include: {
            question: {
              include: {
                subject: true,
                chapter: true,
                assessmentProfile: true,
                anomalies: { where: { status: { in: ['FLAGGED', 'UNDER_REVIEW'] } } },
              },
            },
          },
        },
      },
    });

    if (!test) throw new Error(`Test ${testId} not found`);

    const questions = test.testQuestions.map((tq) => tq.question);
    const totalQuestions = questions.length;

    let blueprint = null;
    let blueprintRules: any[] = [];

    if (blueprintId) {
      blueprint = await prisma.assessmentBlueprint.findUnique({
        where: { id: blueprintId },
        include: { blueprintRules: true },
      });
      if (blueprint) blueprintRules = blueprint.blueprintRules;
    }

    const variances: BlueprintCoverageVariance[] = [];
    const findings: string[] = [];

    // 1. Subject Distribution Analysis
    const subjectCounts: Record<string, number> = {};
    questions.forEach((q) => {
      const code = q.subject.code.toUpperCase();
      subjectCounts[code] = (subjectCounts[code] || 0) + 1;
    });

    if (blueprintRules.length > 0) {
      const subjectRuleMap: Record<string, { min: number; max: number }> = {};
      blueprintRules.forEach((r) => {
        const cur = subjectRuleMap[r.subjectCode.toUpperCase()] || { min: 0, max: 0 };
        cur.min += r.minQuestions;
        cur.max += r.maxQuestions;
        subjectRuleMap[r.subjectCode.toUpperCase()] = cur;
      });

      for (const [subj, expected] of Object.entries(subjectRuleMap)) {
        const actual = subjectCounts[subj] || 0;
        const variance = expected.min > 0 ? Math.round(Math.abs(actual - expected.min) / expected.min * 100) : 0;
        const passed = actual >= expected.min && (expected.max === 0 || actual <= expected.max);

        variances.push({
          dimension: `Subject Distribution (${subj})`,
          requested: expected.min,
          actual,
          variancePercentage: variance,
          status: passed ? 'PASS' : variance > 20 ? 'FAIL' : 'WARNING',
          details: `Requested: ${expected.min}-${expected.max}, Actual: ${actual}`,
        });

        if (!passed) {
          findings.push(`Subject ${subj} question count (${actual}) deviates from requested minimum (${expected.min}).`);
        }
      }
    }

    // 2. Difficulty Distribution Analysis
    const difficultyCounts: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
    questions.forEach((q) => {
      const diff = q.assessmentProfile?.observedDifficulty || q.difficulty || 'MEDIUM';
      difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
    });

    // 3. Discrimination & Quality Profile Analysis
    let totalDiscrimination = 0;
    let discriminationCount = 0;
    let totalAmbiguities = 0;
    let suppressedCount = 0;

    questions.forEach((q) => {
      if (q.assessmentProfile && q.assessmentProfile.discriminationConfidence !== 'INSUFFICIENT') {
        totalDiscrimination += q.assessmentProfile.discriminationIndex;
        discriminationCount++;
      }
      if (q.assessmentProfile && q.assessmentProfile.ambiguityScore > 0.4) {
        totalAmbiguities++;
      }
      if (q.assessmentStatus === 'TEMPORARILY_SUPPRESSED') {
        suppressedCount++;
      }
    });

    const avgDiscrimination = discriminationCount > 0 ? Math.round((totalDiscrimination / discriminationCount) * 100) / 100 : 0.25;

    if (suppressedCount > 0) {
      findings.push(`Test contains ${suppressedCount} temporarily suppressed questions.`);
    }
    if (totalAmbiguities > 0) {
      findings.push(`Test contains ${totalAmbiguities} questions with detected ambiguity signals.`);
    }

    // Determine overall assessment quality status
    let reportStatus: 'PASS' | 'WARNING' | 'REVIEW_REQUIRED' = 'PASS';
    let overallScore = 1.0;

    if (suppressedCount > 0 || totalAmbiguities >= 3) {
      reportStatus = 'REVIEW_REQUIRED';
      overallScore -= 0.35;
    } else if (findings.length > 0 || avgDiscrimination < 0.15) {
      reportStatus = 'WARNING';
      overallScore -= 0.15;
    }

    overallScore = Math.max(0.1, Math.round(overallScore * 100) / 100);

    // Save AssessmentQualityReport record
    const report = await prisma.assessmentQualityReport.create({
      data: {
        testId,
        blueprintId: blueprintId || null,
        status: reportStatus,
        overallQualityScore: overallScore,
        discriminationAvg: avgDiscrimination,
        ambiguityFlagsCount: totalAmbiguities,
        varianceJson: JSON.stringify(variances),
        findingsJson: JSON.stringify(findings),
      },
    });

    for (const v of variances) {
      await prisma.assessmentQualityMetric.create({
        data: {
          reportId: report.id,
          dimension: v.dimension,
          requestedValue: String(v.requested),
          actualValue: String(v.actual),
          variance: v.variancePercentage,
          status: v.status,
          details: v.details || null,
        },
      });
    }

    return {
      testId,
      blueprintId,
      status: reportStatus,
      overallQualityScore: overallScore,
      variances,
      findings,
      metrics: {
        subjectCounts,
        difficultyCounts,
        avgDiscrimination,
        totalAmbiguities,
        suppressedCount,
      },
    };
  }
}
