import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SpacedRevisionEngine } from '@/lib/intelligence/revision-engine';
import { ConceptMasteryEngine } from '@/lib/intelligence/concept-mastery-engine';
import { DailyLearningPlanEngine } from '@/lib/intelligence/daily-learning-plan-engine';
import { ErrorBookEngine } from '@/lib/intelligence/error-book-engine';
import { NextActionEngine } from '@/lib/study-os/next-action-engine';

export async function GET() {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
      include: { profile: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Parallel fetch of core student learning engine signals
    const [
      dailyPlan,
      bioMastery,
      phyMastery,
      chemMastery,
      weakConcepts,
      recentMistakes,
      revisionSummary,
      recentCbtAttempts,
      totalAttemptsCount,
      totalVerifiedQuestions,
      nextAction,
    ] = await Promise.all([
      DailyLearningPlanEngine.getOrGenerateDailyPlan(student.id),
      ConceptMasteryEngine.getSubjectMastery(student.id, 'BIO'),
      ConceptMasteryEngine.getSubjectMastery(student.id, 'PHY'),
      ConceptMasteryEngine.getSubjectMastery(student.id, 'CHE'),
      ConceptMasteryEngine.getWeakConcepts(student.id, 6),
      ErrorBookEngine.getErrorBook(student.id, { limit: 5 }),
      SpacedRevisionEngine.getRevisionSummary(student.id),
      prisma.examAttempt.findMany({
        where: { userId: student.id, status: 'SUBMITTED' },
        orderBy: { submittedAt: 'desc' },
        take: 4,
        include: { test: true },
      }),
      prisma.attemptEvent.count({ where: { userId: student.id } }),
      prisma.question.count({
        where: { verificationStatus: 'VERIFIED', publicationStatus: 'PUBLISHED' },
      }),
      NextActionEngine.getNextAction(student.id),
    ]);

    const totalAttemptedConcepts = bioMastery.attemptedConcepts + phyMastery.attemptedConcepts + chemMastery.attemptedConcepts;
    const overallMastery = totalAttemptedConcepts > 0
      ? Number(((bioMastery.masteryRate + phyMastery.masteryRate + chemMastery.masteryRate) / 3).toFixed(1))
      : 0.0;

    const hasData = totalAttemptsCount > 0 || (student.profile?.totalAttempted ?? 0) > 0;

    return NextResponse.json({
      hasData,
      student: {
        id: student.id,
        name: student.name,
        targetExamYear: student.profile?.targetExamYear ?? 2027,
        currentStreak: student.profile?.currentStreak ?? 0,
        totalAttempted: student.profile?.totalAttempted ?? 0,
        totalCorrect: student.profile?.totalCorrect ?? 0,
        accuracyRate: student.profile?.accuracyRate ?? 0,
        dailyTargetQuestions: student.profile?.dailyTargetQuestions ?? 50,
      },
      nextAction,
      dailyPlan,
      overallMastery,
      subjects: {
        biology: bioMastery,
        physics: phyMastery,
        chemistry: chemMastery,
      },
      weakConcepts: weakConcepts.map((w) => ({
        id: w.conceptId,
        name: w.concept.name,
        chapterTitle: w.concept.chapter.title,
        subjectName: w.concept.chapter.subject.name,
        subjectCode: w.concept.chapter.subject.code,
        masteryScore: w.masteryScore,
        status: w.status,
        consecutiveIncorrect: w.consecutiveIncorrect,
      })),
      recentMistakes,
      stats: {
        totalVerifiedQuestions,
        revisionSummary,
        recentAttempts: recentCbtAttempts.map((a) => ({
          id: a.id,
          testTitle: a.test.title,
          testType: a.test.testType,
          totalScore: a.totalScore,
          maxScore: a.test.totalMarks,
          accuracy: a.accuracy,
          submittedAt: a.submittedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
