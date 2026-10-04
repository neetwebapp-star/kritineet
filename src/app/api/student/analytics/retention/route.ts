import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ConceptStabilityAndRetentionService } from '@/lib/student-intelligence/concept-stability-and-retention-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');
    const conceptId = searchParams.get('conceptId');

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

    if (conceptId) {
      const analysis = await ConceptStabilityAndRetentionService.analyzeRetention(studentId, conceptId);
      const stability = await ConceptStabilityAndRetentionService.evaluateStability({ studentId, conceptId });
      return NextResponse.json({
        success: true,
        conceptId,
        retention: analysis,
        stability,
      });
    }

    // Return stability profiles for all tracked concepts for this student
    const profiles = await prisma.conceptStabilityProfile.findMany({
      where: { studentId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      stabilityProfiles: profiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to retrieve retention analytics' }, { status: 500 });
  }
}
