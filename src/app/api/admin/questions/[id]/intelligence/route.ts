import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PsychometricsEngine } from '@/lib/assessment/psychometrics-engine';
import { AnomalyDetector } from '@/lib/assessment/anomaly-detector';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        chapter: true,
        options: {
          orderBy: { orderIndex: 'asc' },
        },
        assessmentProfile: true,
        optionPerformances: {
          orderBy: { optionLabel: 'asc' },
        },
        performanceSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        anomalies: {
          orderBy: { detectedAt: 'desc' },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        _count: {
          select: {
            studentResponses: true,
            exposures: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({
      question: {
        ...question,
        parsedOptions: question.options,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch question detail intelligence' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === 'RECALCULATE') {
      const profile = await PsychometricsEngine.calculateAndPersistProfile(id);
      const anomalies = await AnomalyDetector.scanQuestionAnomalies(id);
      return NextResponse.json({ success: true, profile, anomalies });
    }

    if (action === 'UPDATE_STATUS') {
      const { status } = body;
      if (!['ACTIVE', 'MONITORED', 'REVIEW_REQUIRED', 'TEMPORARILY_SUPPRESSED', 'RETIRED'].includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
      }
      const updated = await prisma.question.update({
        where: { id },
        data: { assessmentStatus: status },
      });
      return NextResponse.json({ success: true, question: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
