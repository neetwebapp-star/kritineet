import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MistakeIntelligenceService } from '@/lib/student-intelligence/mistake-intelligence-service';

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

    const [clusters, difficulty, questionTypes, sources] = await Promise.all([
      MistakeIntelligenceService.analyzeMistakeRecurrence(studentId),
      MistakeIntelligenceService.getDifficultyProfile(studentId),
      MistakeIntelligenceService.getQuestionTypeProfile(studentId),
      MistakeIntelligenceService.getSourceProfile(studentId),
    ]);

    return NextResponse.json({
      success: true,
      clusters,
      profiles: {
        difficulty,
        questionTypes,
        sources,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to retrieve mistake intelligence' }, { status: 500 });
  }
}
