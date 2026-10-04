import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LearningTrendEngine } from '@/lib/student-intelligence/learning-trend-engine';
import { StudentBaselineService } from '@/lib/student-intelligence/student-baseline-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');

    if (!studentId) {
      const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        select: { id: true },
      });
      studentId = student?.id || null;
    }

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required or student session not found' }, { status: 400 });
    }

    const subjects = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY'];

    const profiles = await Promise.all(
      subjects.map(async (subj) => {
        const [trend, baseline, responseCount] = await Promise.all([
          LearningTrendEngine.evaluateTrend({ studentId: studentId!, domain: 'SUBJECT', entityId: subj }),
          StudentBaselineService.calculateBaseline({ studentId: studentId!, metricType: 'SUBJECT_ACCURACY', scopeEntity: subj }),
          prisma.attemptEvent.count({
            where: {
              userId: studentId!,
              question: { subject: { code: subj } },
            },
          }),
        ]);

        return {
          subject: subj,
          accuracy: baseline.baselineValue,
          trend: trend.direction,
          trendDelta: trend.deltaValue,
          confidence: trend.confidence,
          totalQuestionsAttempted: responseCount,
          evidenceText: trend.evidenceText,
        };
      })
    );

    return NextResponse.json({
      success: true,
      subjects: profiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to retrieve subject intelligence' }, { status: 500 });
  }
}
