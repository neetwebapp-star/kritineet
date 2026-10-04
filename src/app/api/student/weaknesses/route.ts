import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ConceptMasteryEngine } from '@/lib/intelligence/concept-mastery-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const weakConcepts = await ConceptMasteryEngine.getWeakConcepts(student.id, limit);

    return NextResponse.json({
      count: weakConcepts.length,
      weaknesses: weakConcepts.map((w) => ({
        conceptId: w.conceptId,
        name: w.concept.name,
        definition: w.concept.definition,
        formula: w.concept.formula,
        chapterTitle: w.concept.chapter.title,
        subjectName: w.concept.chapter.subject.name,
        subjectCode: w.concept.chapter.subject.code,
        masteryScore: w.masteryScore,
        accuracy: w.accuracy,
        consecutiveIncorrect: w.consecutiveIncorrect,
        status: w.status,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
