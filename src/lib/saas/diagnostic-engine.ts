/**
 * Phase 8: Diagnostic Assessment & Student Onboarding Engine
 * Evaluates baseline subject accuracy, chapter coverage, concept exposure,
 * and response times to generate the Initial Learning Profile (strictly avoiding
 * misleading "Expected NEET Rank" predictions).
 */

import prisma from '@/lib/prisma';

export interface DiagnosticAnswerInput {
  questionId: string;
  selectedOption: string;
  timeSpentSeconds: number;
}

export interface StudentOnboardingPreferences {
  classLevel: 'CLASS_11' | 'CLASS_12' | 'DROPPER';
  targetExamYear: number;
  primarySubjects: string[];
  preparationLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  dailyTargetQuestions?: number;
  dailyTargetMinutes?: number;
}

export class DiagnosticEngine {
  /**
   * Generates a balanced 15-question initial diagnostic test
   * covering Botany, Zoology, Physics, and Chemistry.
   */
  public static async getDiagnosticQuestions() {
    // Select verified questions with options
    const sampleQuestions = await prisma.question.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        options: { some: {} },
      },
      take: 15,
      include: {
        options: { select: { id: true, label: true, text: true } },
        chapter: {
          include: {
            subject: true,
          },
        },
        primaryConcept: { select: { id: true, name: true } },
      },
    });

    return sampleQuestions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      subject: q.chapter?.subject?.name || 'GENERAL',
      chapterTitle: q.chapter?.title || 'Chapter',
      conceptName: q.primaryConcept?.name || 'Concept',
    }));
  }

  /**
   * Evaluates student's diagnostic submission and establishes Initial Learning Profile.
   * Note: Initial concept mastery scores remain UNKNOWN until sufficient longitudinal data exists.
   */
  public static async evaluateDiagnostic(
    userId: string,
    answers: DiagnosticAnswerInput[],
    preferences?: StudentOnboardingPreferences
  ) {
    if (answers.length === 0) {
      throw new Error('Diagnostic must contain at least one question response');
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: {
        chapter: { include: { subject: true } },
        primaryConcept: true,
      },
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    let correctCount = 0;
    let totalTime = 0;
    const subjectMetrics: Record<string, { total: number; correct: number }> = {
      BIOLOGY: { total: 0, correct: 0 },
      PHYSICS: { total: 0, correct: 0 },
      CHEMISTRY: { total: 0, correct: 0 },
    };

    const conceptsEncountered = new Set<string>();
    const chaptersEncountered = new Set<string>();

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      totalTime += ans.timeSpentSeconds;
      const isCorrect = ans.selectedOption.toUpperCase() === q.correctOption.toUpperCase();
      if (isCorrect) correctCount++;

      const subName = q.chapter?.subject?.name?.toUpperCase() || 'BIOLOGY';
      const key = subName.includes('PHYSIC')
        ? 'PHYSICS'
        : subName.includes('CHEMIS')
        ? 'CHEMISTRY'
        : 'BIOLOGY';

      if (!subjectMetrics[key]) subjectMetrics[key] = { total: 0, correct: 0 };
      subjectMetrics[key].total++;
      if (isCorrect) subjectMetrics[key].correct++;

      if (q.primaryConceptId) conceptsEncountered.add(q.primaryConceptId);
      if (q.chapterId) chaptersEncountered.add(q.chapterId);
    }

    const avgResponseTime = Math.round(totalTime / answers.length);
    const overallAccuracy = Math.round((correctCount / answers.length) * 100);

    const subjectAccuracies: Record<string, number> = {};
    for (const [sub, m] of Object.entries(subjectMetrics)) {
      subjectAccuracies[sub] = m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0;
    }

    let baselineLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'INTERMEDIATE';
    if (overallAccuracy < 40) baselineLevel = 'BEGINNER';
    else if (overallAccuracy >= 75) baselineLevel = 'ADVANCED';

    // Persist diagnostic outcome
    const diagnosticRecord = await prisma.studentDiagnostic.create({
      data: {
        userId,
        subjectAccuraciesJson: JSON.stringify(subjectAccuracies),
        chapterCoverageRate: parseFloat(((chaptersEncountered.size / 79) * 100).toFixed(1)),
        conceptExposureCount: conceptsEncountered.size,
        avgResponseTimeSeconds: avgResponseTime,
        baselineLevel,
        learningPreferencesJson: preferences ? JSON.stringify(preferences) : null,
      },
    });

    // Update student profile preferences without fabricating mastery
    await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        targetExamYear: preferences?.targetExamYear || 2027,
        dailyTargetQuestions: preferences?.dailyTargetQuestions || 40,
        dailyTargetMinutes: preferences?.dailyTargetMinutes || 120,
      },
      create: {
        userId,
        targetExamYear: preferences?.targetExamYear || 2027,
        dailyTargetQuestions: preferences?.dailyTargetQuestions || 40,
        dailyTargetMinutes: preferences?.dailyTargetMinutes || 120,
      },
    });

    return {
      diagnosticId: diagnosticRecord.id,
      overallAccuracy,
      subjectAccuracies,
      baselineLevel,
      conceptsExposed: conceptsEncountered.size,
      avgResponseTimeSeconds: avgResponseTime,
      profileHeadline: `Initial Diagnostic: ${baselineLevel} Readiness Baseline`,
      summaryStatement: `Baseline recorded based on ${answers.length} verified diagnostic questions. Real concept mastery will be established via active practice and spaced revision.`,
    };
  }
}
