import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LearningTrendEngine } from '@/lib/student-intelligence/learning-trend-engine';
import { MistakeIntelligenceService } from '@/lib/student-intelligence/mistake-intelligence-service';
import { StudyActivityAndConsistencyService } from '@/lib/student-intelligence/study-activity-and-consistency-service';
import { PersonalizationEngine } from '@/lib/student-intelligence/personalization-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        learningProfile: true,
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const [trend, clusters, consistency, bottlenecks, recommendations] = await Promise.all([
      LearningTrendEngine.evaluateTrend({ studentId: id, domain: 'OVERALL', windowDays: 30 }),
      MistakeIntelligenceService.analyzeMistakeRecurrence(id),
      StudyActivityAndConsistencyService.evaluateConsistency(id, 14),
      PersonalizationEngine.detectBottlenecks(id),
      PersonalizationEngine.generatePersonalizedRecommendations(id),
    ]);

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        learningProfile: student.learningProfile,
      },
      analytics: {
        overallTrend: trend,
        mistakeClusters: clusters,
        studyConsistency: consistency,
        bottlenecks,
        recommendedInterventions: recommendations,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to retrieve student analytics' }, { status: 500 });
  }
}
