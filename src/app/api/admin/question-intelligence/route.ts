import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PsychometricsEngine } from '@/lib/assessment/psychometrics-engine';
import { AnomalyDetector } from '@/lib/assessment/anomaly-detector';
import { QuestionSearchV2 } from '@/lib/assessment/question-search-v2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const chapterId = searchParams.get('chapterId') || undefined;
    const status = searchParams.get('status') as any || undefined;
    const confidence = searchParams.get('confidence') as any || undefined;
    const hasAnomalies = searchParams.get('hasAnomalies') ? searchParams.get('hasAnomalies') === 'true' : undefined;
    const anomalyType = searchParams.get('anomalyType') as any || undefined;
    const minDiscrimination = searchParams.get('minDiscrimination') ? parseFloat(searchParams.get('minDiscrimination')!) : undefined;
    const maxDiscrimination = searchParams.get('maxDiscrimination') ? parseFloat(searchParams.get('maxDiscrimination')!) : undefined;
    const minAccuracy = searchParams.get('minAccuracy') ? parseFloat(searchParams.get('minAccuracy')!) : undefined;
    const maxAccuracy = searchParams.get('maxAccuracy') ? parseFloat(searchParams.get('maxAccuracy')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const searchResults = await QuestionSearchV2.searchQuestions({
      query,
      subjectId,
      chapterId,
      status,
      confidence,
      hasAnomalies,
      anomalyType,
      minDiscrimination,
      maxDiscrimination,
      minAccuracy,
      maxAccuracy,
      limit,
      offset,
    });

    const [
      totalQuestions,
      statusBreakdown,
      confidenceBreakdown,
      openAnomaliesCount,
      anomaliesByType,
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
      prisma.questionAnomaly.count({ where: { status: 'OPEN' } }),
      prisma.questionAnomaly.groupBy({
        by: ['anomalyType'],
        where: { status: 'OPEN' },
        _count: { _all: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of statusBreakdown) {
      statusCounts[s.assessmentStatus] = s._count._all;
    }

    const confidenceCounts: Record<string, number> = {};
    for (const c of confidenceBreakdown) {
      confidenceCounts[c.difficultyConfidence] = c._count._all;
    }

    return NextResponse.json({
      ...searchResults,
      aggregations: {
        totalQuestions,
        statusCounts: {
          ACTIVE: statusCounts['ACTIVE'] || 0,
          MONITORED: statusCounts['MONITORED'] || 0,
          REVIEW_REQUIRED: statusCounts['REVIEW_REQUIRED'] || 0,
          TEMPORARILY_SUPPRESSED: statusCounts['TEMPORARILY_SUPPRESSED'] || 0,
          RETIRED: statusCounts['RETIRED'] || 0,
        },
        confidenceCounts: {
          INSUFFICIENT: confidenceCounts['INSUFFICIENT'] || 0,
          LOW: confidenceCounts['LOW'] || 0,
          MEDIUM: confidenceCounts['MEDIUM'] || 0,
          HIGH: confidenceCounts['HIGH'] || 0,
        },
        openAnomaliesCount,
        anomaliesByType: anomaliesByType.map(a => ({ type: a.anomalyType, count: a._count._all })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch question intelligence' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CALCULATE_PROFILE') {
      const { questionId } = body;
      if (!questionId) {
        return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
      }
      const profile = await PsychometricsEngine.calculateAndPersistProfile(questionId);
      return NextResponse.json({ success: true, profile });
    }

    if (action === 'SCAN_ANOMALIES') {
      const { questionId } = body;
      if (questionId) {
        const anomalies = await AnomalyDetector.scanQuestionAnomalies(questionId);
        return NextResponse.json({ success: true, count: anomalies.length, anomalies });
      } else {
        const result = await AnomalyDetector.scanAllQuestions();
        return NextResponse.json({ success: true, ...result });
      }
    }

    if (action === 'BATCH_CALCULATE') {
      const { limit = 100 } = body;
      const questions = await prisma.question.findMany({
        take: limit,
        select: { id: true },
      });
      let calculated = 0;
      for (const q of questions) {
        await PsychometricsEngine.calculateAndPersistProfile(q.id);
        calculated++;
      }
      return NextResponse.json({ success: true, calculated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
