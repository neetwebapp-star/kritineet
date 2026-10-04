import { NextRequest, NextResponse } from 'next/server';
import { ExamRegistry } from '@/lib/exam-intelligence/exam-registry';
import { ExamPatternVersionEngine } from '@/lib/exam-intelligence/exam-pattern-version-engine';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const year = Number(req.nextUrl.searchParams.get('year')) || 2027;
    const edition = await ExamRegistry.getOrCreateEdition(year);
    const countdown = ExamRegistry.calculateCountdown(edition);

    const rules = await prisma.examRule.findMany({
      where: { editionId: edition.id, verificationStatus: 'VERIFIED' },
    });

    const activePattern = await ExamPatternVersionEngine.getActivePatternVersion(edition.id);

    return NextResponse.json({
      edition: {
        id: edition.id,
        title: edition.title,
        editionYear: edition.editionYear,
        officialExamDate: edition.officialExamDate,
        status: edition.status,
        syllabusVersion: edition.syllabusVersion,
        patternVersion: edition.patternVersion,
      },
      countdown,
      rules,
      activePattern,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch exam edition' }, { status: 500 });
  }
}
