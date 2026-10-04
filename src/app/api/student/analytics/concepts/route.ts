import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ConceptStabilityAndRetentionService } from '@/lib/student-intelligence/concept-stability-and-retention-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');
    const chapterId = searchParams.get('chapterId');

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

    const concepts = await prisma.concept.findMany({
      where: chapterId ? { chapterId } : undefined,
      select: {
        id: true,
        name: true,
        chapterId: true,
        chapter: { select: { title: true, subject: { select: { code: true } } } },
      },
      take: 50,
    });

    const evaluated = await Promise.all(
      concepts.map(async (c) => {
        const stability = await ConceptStabilityAndRetentionService.evaluateStability({
          studentId: studentId!,
          conceptId: c.id,
        });
        return {
          id: c.id,
          name: c.name,
          chapterTitle: c.chapter?.title,
          subject: c.chapter?.subject?.code,
          stability: stability.state,
          lastAccuracy: stability.lastAttemptAccuracy,
          sampleSize: stability.sampleSize,
        };
      })
    );

    return NextResponse.json({
      success: true,
      concepts: evaluated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to retrieve concept intelligence' }, { status: 500 });
  }
}
