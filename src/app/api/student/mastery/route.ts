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
    const subject = searchParams.get('subject'); // BIO | PHY | CHE

    // Calculate Subject masteries
    const bioMastery = await ConceptMasteryEngine.getSubjectMastery(student.id, 'BIO');
    const phyMastery = await ConceptMasteryEngine.getSubjectMastery(student.id, 'PHY');
    const chemMastery = await ConceptMasteryEngine.getSubjectMastery(student.id, 'CHE');

    // Overall mastery score
    const totalAttemptedConcepts = bioMastery.attemptedConcepts + phyMastery.attemptedConcepts + chemMastery.attemptedConcepts;
    const overallMastery = totalAttemptedConcepts > 0
      ? Number(((bioMastery.masteryRate + phyMastery.masteryRate + chemMastery.masteryRate) / 3).toFixed(1))
      : 0.0;

    // Weak concepts
    const weakConcepts = await ConceptMasteryEngine.getWeakConcepts(student.id, 10);

    // Concept masteries list
    const masteries = await prisma.studentConceptMastery.findMany({
      where: {
        userId: student.id,
        ...(subject && subject !== 'ALL' ? { concept: { chapter: { subject: { code: subject } } } } : {}),
      },
      include: {
        concept: {
          include: {
            chapter: { include: { subject: true } },
          },
        },
      },
      orderBy: { masteryScore: 'asc' },
      take: 50,
    });

    return NextResponse.json({
      overallMastery,
      subjects: {
        biology: bioMastery,
        physics: phyMastery,
        chemistry: chemMastery,
      },
      weakConceptsCount: weakConcepts.length,
      weakConcepts: weakConcepts.map((w) => ({
        conceptId: w.conceptId,
        name: w.concept.name,
        chapterTitle: w.concept.chapter.title,
        subjectName: w.concept.chapter.subject.name,
        masteryScore: w.masteryScore,
        status: w.status,
        consecutiveIncorrect: w.consecutiveIncorrect,
      })),
      masteries: masteries.map((m) => ({
        conceptId: m.conceptId,
        name: m.concept.name,
        chapterTitle: m.concept.chapter.title,
        subjectName: m.concept.chapter.subject.name,
        masteryScore: m.masteryScore,
        accuracy: m.accuracy,
        attempts: m.attempts,
        status: m.status,
        nextReviewAt: m.nextReviewAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
