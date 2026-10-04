import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const [
      totalQuestions,
      statusCounts,
      confidenceCounts,
      profiles,
      anomaliesByType,
      optionPerformanceStats,
      totalResponses,
      studentBaselinesCount,
      blueprintsCount,
      testQualityReports,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.question.groupBy({
        by: ['assessmentStatus'],
        _count: { _all: true },
      }),
      prisma.questionAssessmentProfile.groupBy({
        by: ['difficultyConfidence'],
        _count: { _all: true },
      }),
      prisma.questionAssessmentProfile.findMany({
        select: {
          authoredDifficulty: true,
          observedDifficulty: true,
          discriminationIndex: true,
          ambiguityScore: true,
          qualityScore: true,
          attemptCount: true,
          difficultyConfidence: true,
        },
      }),
      prisma.questionAnomaly.groupBy({
        by: ['anomalyType', 'status'],
        _count: { _all: true },
      }),
      prisma.questionOptionPerformance.groupBy({
        by: ['distractorCategory'],
        _count: { _all: true },
      }),
      prisma.studentResponse.count(),
      prisma.studentAssessmentBaseline.count(),
      prisma.assessmentBlueprint.count(),
      prisma.assessmentQualityReport.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    // Compute discrimination distribution
    const discriminationDistribution = {
      excellent: 0,   // >= 0.40
      good: 0,        // 0.30 - 0.39
      marginal: 0,    // 0.20 - 0.29
      poor: 0,        // 0.00 - 0.19
      negative: 0,    // < 0.00
      uncalibrated: 0,// null or insufficient sample
    };

    let totalQualityScore = 0;
    let qualityScoreCount = 0;

    for (const p of profiles) {
      if (p.qualityScore != null) {
        totalQualityScore += p.qualityScore;
        qualityScoreCount++;
      }
      if (p.difficultyConfidence === 'INSUFFICIENT' || p.discriminationIndex === null) {
        discriminationDistribution.uncalibrated++;
      } else {
        const d = p.discriminationIndex;
        if (d >= 0.40) discriminationDistribution.excellent++;
        else if (d >= 0.30) discriminationDistribution.good++;
        else if (d >= 0.20) discriminationDistribution.marginal++;
        else if (d >= 0.00) discriminationDistribution.poor++;
        else discriminationDistribution.negative++;
      }
    }

    const avgAssessmentQuality = qualityScoreCount > 0 ? totalQualityScore / qualityScoreCount : null;

    // Difficulty migration: compare authored vs observed
    const difficultyMigration = {
      easierThanAuthored: 0,
      asAuthored: 0,
      harderThanAuthored: 0,
    };

    const diffMap: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
    for (const p of profiles) {
      if (p.difficultyConfidence !== 'INSUFFICIENT' && p.observedDifficulty) {
        const aVal = diffMap[p.authoredDifficulty] || 2;
        const oVal = diffMap[p.observedDifficulty] || 2;
        if (oVal < aVal) difficultyMigration.easierThanAuthored++;
        else if (oVal > aVal) difficultyMigration.harderThanAuthored++;
        else difficultyMigration.asAuthored++;
      }
    }

    return NextResponse.json({
      summary: {
        totalQuestions,
        totalResponses,
        totalProfiles: profiles.length,
        studentBaselinesCount,
        blueprintsCount,
        avgAssessmentQuality,
      },
      statusDistribution: statusCounts.reduce((acc, curr) => {
        acc[curr.assessmentStatus] = curr._count._all;
        return acc;
      }, {} as Record<string, number>),
      confidenceDistribution: confidenceCounts.reduce((acc, curr) => {
        acc[curr.difficultyConfidence] = curr._count._all;
        return acc;
      }, {} as Record<string, number>),
      discriminationDistribution,
      difficultyMigration,
      distractorDistribution: optionPerformanceStats.reduce((acc, curr) => {
        acc[curr.distractorCategory] = curr._count._all;
        return acc;
      }, {} as Record<string, number>),
      anomalies: anomaliesByType.map(a => ({
        type: a.anomalyType,
        status: a.status,
        count: a._count._all,
      })),
      testQualityDistribution: testQualityReports.reduce((acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch assessment intelligence' }, { status: 500 });
  }
}
