import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AnomalyDetector } from '@/lib/assessment/anomaly-detector';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const anomalyType = searchParams.get('anomalyType') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const questionId = searchParams.get('questionId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = {};
    if (status) where.status = status;
    if (anomalyType) where.anomalyType = anomalyType;
    if (severity) where.severity = severity;
    if (questionId) where.questionId = questionId;

    const [anomalies, total] = await Promise.all([
      prisma.questionAnomaly.findMany({
        where,
        include: {
          question: {
            select: {
              id: true,
              questionText: true,
              subject: { select: { name: true, code: true } },
              chapter: { select: { title: true } },
              sourceType: true,
              difficulty: true,
              assessmentStatus: true,
            },
          },
        },
        orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.questionAnomaly.count({ where }),
    ]);

    return NextResponse.json({
      anomalies,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch question anomalies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'RUN_SCAN') {
      const result = await AnomalyDetector.scanAllQuestions();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'SCAN_QUESTION') {
      const { questionId } = body;
      if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });
      const anomalies = await AnomalyDetector.scanQuestionAnomalies(questionId);
      return NextResponse.json({ success: true, anomalies });
    }

    if (action === 'UPDATE_STATUS') {
      const { anomalyId, status, resolutionNotes, resolvedBy } = body;
      if (!anomalyId || !status) {
        return NextResponse.json({ error: 'anomalyId and status are required' }, { status: 400 });
      }

      const updated = await prisma.questionAnomaly.update({
        where: { id: anomalyId },
        data: {
          status,
          resolution: resolutionNotes || undefined,
          reviewer: resolvedBy || undefined,
          resolvedAt: ['RESOLVED', 'IGNORED'].includes(status) ? new Date() : undefined,
        },
      });

      return NextResponse.json({ success: true, anomaly: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
