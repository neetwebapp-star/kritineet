import prisma from '../prisma';
import { MistakeClassifier } from './mistake-classifier';
import { ConceptMasteryEngine } from './concept-mastery-engine';
import { QuestionExposureEngine } from './question-exposure-engine';
import { TimeManagementAnalyzer } from '../exam/time-management-analyzer';
import { PostMockActionPlanEngine } from '../exam/post-mock-action-plan-engine';
import { PerformanceSnapshotEngine } from '../exam/performance-snapshot-engine';

export interface CreateTestOptions {
  title: string;
  description?: string;
  testType:
    | 'FULL_SYLLABUS'
    | 'CLASS_11'
    | 'CLASS_12'
    | 'SUBJECT'
    | 'CHAPTER'
    | 'TOPIC'
    | 'PYQ'
    | 'CUSTOM'
    | 'WEAK_TOPICS'
    | 'REVISION';
  durationMinutes?: number;
  totalQuestions?: number;
  positiveMarks?: number;
  negativeMarks?: number;
  subjectCode?: string;
  chapterSlug?: string;
  examYear?: number;
  userId?: string; // required for WEAK_TOPICS or REVISION
  templateType?: string;
}

export interface PostTestAnalysis {
  attemptId: string;
  status?: string;
  isSubmitted?: boolean;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  durationSeconds: number;
  subjectBreakdown: Record<string, { score: number; max: number; correct: number; incorrect: number }>;
  weakConcepts: Array<{ id: string; name: string; chapterTitle: string; count: number }>;
  mistakeBreakdown: Record<string, number>;
  recommendedActions: string[];
  results: Array<{
    questionId: string;
    questionText: string;
    selectedOption: string | null;
    correctOption: string;
    isCorrect: boolean;
    marksAwarded: number;
    explanation: string | null;
    mistakeType?: string;
    primaryConcept: { id: string; name: string } | null;
  }>;
}

export class CbtExamEngine {
  /**
   * CRITICAL INVARIANT: Only VERIFIED + PUBLISHED questions can ever enter a student test.
   */
  static async createTest(options: CreateTestOptions) {
    const questionCount = options.totalQuestions || 45;
    const positiveMarks = options.positiveMarks ?? 4.0;
    const negativeMarks = options.negativeMarks ?? 1.0;
    const durationMinutes = options.durationMinutes || 60;

    // Strict base filter: ONLY VERIFIED + PUBLISHED
    const baseWhere: any = {
      verificationStatus: 'VERIFIED',
      publicationStatus: 'PUBLISHED',
      duplicateOfId: null, // Deduplication invariant
      syllabusStatus: 'CURRENT', // Strict NEET syllabus constraint
    };

    if (options.testType === 'PYQ' && options.examYear) {
      baseWhere.sourceType = 'PYQ';
      baseWhere.examYear = options.examYear;
    } else if (options.testType === 'CHAPTER' && options.chapterSlug) {
      baseWhere.chapter = { slug: options.chapterSlug };
    } else if (options.testType === 'SUBJECT' && options.subjectCode) {
      baseWhere.subject = { code: options.subjectCode };
    } else if (options.testType === 'CLASS_11') {
      baseWhere.classLevel = { code: 'CLASS_11' };
    } else if (options.testType === 'CLASS_12') {
      baseWhere.classLevel = { code: 'CLASS_12' };
    } else if (options.testType === 'WEAK_TOPICS' && options.userId) {
      const mistakes = await prisma.studentMistake.findMany({
        where: { userId: options.userId, isResolved: false },
        take: questionCount,
        select: { questionId: true },
      });
      const qids = mistakes.map((m) => m.questionId);
      if (qids.length > 0) {
        baseWhere.id = { in: qids };
      }
    }

    // Query pool of eligible verified questions
    const eligibleQuestions = await prisma.question.findMany({
      where: baseWhere,
      take: questionCount * 2,
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
        primaryConcept: true,
        chapter: { include: { subject: true } },
      },
    });

    if (eligibleQuestions.length === 0) {
      throw new Error('No verified and published questions found matching the selected criteria.');
    }

    // Shuffle and pick target count
    const shuffled = eligibleQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);

    const test = await prisma.test.create({
      data: {
        title: options.title,
        description: options.description,
        testType: options.testType,
        templateType: options.templateType || 'NEET_FULL',
        durationMinutes,
        totalMarks: questionCount * positiveMarks,
        totalQuestions: selected.length,
        positiveMarks,
        negativeMarks,
        testQuestions: {
          create: selected.map((q, idx) => ({
            questionId: q.id,
            questionOrder: idx + 1,
            sectionName: q.chapter.subject.name || 'Section A',
          })),
        },
      },
    });

    return test;
  }

  /**
   * Initializes or continues an exam attempt with anti-loss state
   */
  static async startAttempt(testId: string, userId: string) {
    // Check if there is an existing in-progress attempt to resume
    const existing = await prisma.examAttempt.findFirst({
      where: {
        testId,
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        test: {
          include: {
            testQuestions: {
              orderBy: { questionOrder: 'asc' },
              include: {
                question: {
                  include: {
                    options: { orderBy: { orderIndex: 'asc' } },
                    figures: true,
                    chapter: { include: { subject: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existing) {
      return this.formatStudentAttemptView(existing);
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: {
              include: {
                options: { orderBy: { orderIndex: 'asc' } },
                figures: true,
                chapter: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    if (!test) throw new Error('Test not found');

    const totalSeconds = test.durationMinutes * 60;
    const expiresAt = new Date(Date.now() + test.durationMinutes * 60 * 1000);
    const questionSnapshot = test.testQuestions.map((tq) => ({
      order: tq.questionOrder,
      section: tq.sectionName,
      questionId: tq.question.id,
      text: tq.question.questionText,
      figures: tq.question.figures.map((f) => ({ assetPath: f.assetPath, caption: f.caption })),
      options: tq.question.options.map((o) => ({ label: o.label, text: o.text })),
    }));

    const attempt = await prisma.examAttempt.create({
      data: {
        testId: test.id,
        userId,
        status: 'IN_PROGRESS',
        activeQuestionIndex: 0,
        remainingSeconds: totalSeconds,
        expiresAt,
        version: test.version || 1,
        mode: test.mode || 'EXAM',
        snapshotData: JSON.stringify(questionSnapshot),
        templateType: test.templateType,
      },
      include: { test: true },
    });

    return {
      attemptId: attempt.id,
      status: attempt.status,
      test: {
        id: test.id,
        title: test.title,
        durationMinutes: test.durationMinutes,
        totalQuestions: test.totalQuestions,
        positiveMarks: test.positiveMarks,
        negativeMarks: test.negativeMarks,
      },
      activeQuestionIndex: 0,
      remainingSeconds: totalSeconds,
      expiresAt: expiresAt.toISOString(),
      answers: {},
      markedForReview: [],
      questions: questionSnapshot,
    };
  }

  /**
   * Anti-Loss State Autosave: Persists student test state to prevent data loss on refresh
   * Enforces server-authoritative timer: client cannot extend duration.
   */
  static async saveAttemptState(
    attemptId: string,
    userId: string,
    state: {
      activeQuestionIndex: number;
      remainingSeconds: number;
      answers: Record<string, string>;
      markedForReview: string[];
    }
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) throw new Error('Attempt not found');
    if (attempt.userId !== userId) throw new Error('Unauthorized');
    if (attempt.status !== 'IN_PROGRESS') return { saved: false, reason: 'Attempt already finalized' };

    const now = new Date();
    // Server-Authoritative Timer Check: If expired, automatically trigger submission
    if (attempt.expiresAt && now > attempt.expiresAt) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: 'EXPIRED' },
      });
      await this.submitAttempt(attemptId, userId);
      return { saved: false, reason: 'Test time has expired. Auto-submitted.' };
    }

    // Server-calculated remaining seconds prevents timer manipulation from client
    const serverRemainingSeconds = attempt.expiresAt
      ? Math.max(0, Math.round((attempt.expiresAt.getTime() - now.getTime()) / 1000))
      : state.remainingSeconds;

    const effectiveRemainingSeconds = Math.min(state.remainingSeconds, serverRemainingSeconds);

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        activeQuestionIndex: state.activeQuestionIndex,
        remainingSeconds: effectiveRemainingSeconds,
        answersJson: JSON.stringify(state.answers),
        markedForReviewJson: JSON.stringify(state.markedForReview),
        lastHeartbeatAt: now,
      },
    });

    // Also persist student responses for individual questions
    for (const [qid, option] of Object.entries(state.answers)) {
      if (option) {
        await prisma.studentResponse.upsert({
          where: {
            examAttemptId_questionId: {
              examAttemptId: attemptId,
              questionId: qid,
            },
          },
          update: {
            selectedOption: option,
            isMarkedForReview: state.markedForReview.includes(qid),
          },
          create: {
            examAttemptId: attemptId,
            questionId: qid,
            selectedOption: option,
            isMarkedForReview: state.markedForReview.includes(qid),
          },
        });
      }
    }

    return { saved: true };
  }

  /**
   * Records single response (compatible with Phase 2/3 and autosave API)
   */
  static async recordResponse(
    attemptId: string,
    questionId: string,
    selectedOption: string | null,
    isMarkedForReview: boolean = false,
    timeSpentSeconds: number = 0
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new Error('Attempt not found');

    const existingAnswers: Record<string, string> = attempt.answersJson ? JSON.parse(attempt.answersJson) : {};
    const existingMarked: string[] = attempt.markedForReviewJson ? JSON.parse(attempt.markedForReviewJson) : [];

    if (selectedOption) {
      existingAnswers[questionId] = selectedOption;
    } else {
      delete existingAnswers[questionId];
    }

    if (isMarkedForReview && !existingMarked.includes(questionId)) {
      existingMarked.push(questionId);
    } else if (!isMarkedForReview && existingMarked.includes(questionId)) {
      const idx = existingMarked.indexOf(questionId);
      existingMarked.splice(idx, 1);
    }

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answersJson: JSON.stringify(existingAnswers),
        markedForReviewJson: JSON.stringify(existingMarked),
      },
    });

    const response = await prisma.studentResponse.upsert({
      where: {
        examAttemptId_questionId: {
          examAttemptId: attemptId,
          questionId,
        },
      },
      update: {
        selectedOption,
        isMarkedForReview,
        timeSpentSeconds,
      },
      create: {
        examAttemptId: attemptId,
        questionId,
        selectedOption,
        isMarkedForReview,
        timeSpentSeconds,
      },
    });

    return response;
  }

  /**
   * Retrieves active attempt state for safe reconnection / refresh
   */
  static async getAttemptState(attemptId: string, userId: string) {
    let attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
      },
    });

    if (!attempt) throw new Error('Attempt not found');
    if (attempt.userId !== userId) throw new Error('Unauthorized: Access denied to other student attempts');

    const now = new Date();
    // Auto-expire and submit if timer has passed
    if (attempt.expiresAt && now > attempt.expiresAt && attempt.status === 'IN_PROGRESS') {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: 'EXPIRED' },
      });
      await this.submitAttempt(attemptId, userId);
      attempt = await prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: { test: true },
      }) as any;
      if (!attempt) throw new Error('Attempt not found after auto-submission');
    }

    const questions = attempt.snapshotData ? JSON.parse(attempt.snapshotData) : [];
    const answers = attempt.answersJson ? JSON.parse(attempt.answersJson) : {};
    const markedForReview = attempt.markedForReviewJson ? JSON.parse(attempt.markedForReviewJson) : [];

    const serverRemainingSeconds = attempt.expiresAt
      ? Math.max(0, Math.round((attempt.expiresAt.getTime() - now.getTime()) / 1000))
      : attempt.remainingSeconds;

    const remainingSeconds = Math.min(attempt.remainingSeconds, serverRemainingSeconds);

    return {
      attemptId: attempt.id,
      test: {
        id: attempt.test.id,
        title: attempt.test.title,
        durationMinutes: attempt.test.durationMinutes,
        totalQuestions: attempt.test.totalQuestions,
        positiveMarks: attempt.test.positiveMarks,
        negativeMarks: attempt.test.negativeMarks,
      },
      status: attempt.status,
      isSubmitted: attempt.isSubmitted,
      activeQuestionIndex: attempt.activeQuestionIndex,
      remainingSeconds,
      expiresAt: attempt.expiresAt?.toISOString() || null,
      answers,
      markedForReview,
      questions,
    };
  }

  /**
   * Finalizes Exam Attempt (Idempotent: safe against duplicate submissions)
   */
  static async submitAttempt(
    attemptId: string,
    userId?: string,
    submissionToken?: string
  ): Promise<PostTestAnalysis> {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            testQuestions: {
              orderBy: { questionOrder: 'asc' },
              include: {
                question: {
                  include: {
                    primaryConcept: {
                      include: {
                        chapter: { include: { subject: true } },
                      },
                    },
                    chapter: { include: { subject: true } },
                  },
                },
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!attempt) throw new Error('Exam attempt not found');

    // Security check: verify ownership if userId passed
    if (userId && attempt.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Idempotency: If already submitted or evaluated, return saved analytics
    if ((attempt.status === 'SUBMITTED' || attempt.status === 'EVALUATED') && attempt.analyticsJson) {
      return JSON.parse(attempt.analyticsJson);
    }

    const test = attempt.test;
    const answersMap: Record<string, string> = attempt.answersJson ? JSON.parse(attempt.answersJson) : {};
    const responseMap = new Map(attempt.responses.map((r) => [r.questionId, r]));

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const evaluatedResults: any[] = [];
    const subjectScores: Record<string, { score: number; max: number; correct: number; incorrect: number }> = {};
    const weakConceptMap = new Map<string, { name: string; chapterTitle: string; count: number }>();
    const mistakeBreakdown: Record<string, number> = {};

    for (const tq of test.testQuestions) {
      const q = tq.question;
      const subjectName = q.chapter?.subject?.name || 'General';

      if (!subjectScores[subjectName]) {
        subjectScores[subjectName] = { score: 0, max: 0, correct: 0, incorrect: 0 };
      }
      subjectScores[subjectName].max += test.positiveMarks;

      const selected = answersMap[q.id] || responseMap.get(q.id)?.selectedOption || null;
      let isCorrect = false;
      let marks = 0;
      let mistakeType = 'UNKNOWN';

      if (!selected) {
        unansweredCount++;
        marks = 0;
      } else if (selected.toUpperCase() === q.correctOption.toUpperCase()) {
        isCorrect = true;
        correctCount++;
        marks = test.positiveMarks;
        totalScore += marks;
        subjectScores[subjectName].score += marks;
        subjectScores[subjectName].correct++;

        // Update QuestionExposure
        await QuestionExposureEngine.recordExposure(attempt.userId, q.id, true, 45);

        // Update Concept Mastery
        if (q.primaryConceptId) {
          await ConceptMasteryEngine.updateMastery({
            userId: attempt.userId,
            conceptId: q.primaryConceptId,
            isCorrect: true,
            difficulty: (q.difficulty as any) || 'MEDIUM',
            timeSpentSeconds: 45,
            questionId: q.id,
          });
        }
      } else {
        incorrectCount++;
        marks = -test.negativeMarks;
        totalScore += marks;
        subjectScores[subjectName].score += marks;
        subjectScores[subjectName].incorrect++;

        // Classify mistake
        const classification = MistakeClassifier.classify({
          questionText: q.questionText,
          questionType: q.questionType,
          selectedOption: selected,
          correctOption: q.correctOption,
          timeSpentSeconds: 50,
          expectedTimeSeconds: 60,
          hasDiagram: false,
          explanation: q.explanation,
        });

        mistakeType = classification.mistakeType;
        mistakeBreakdown[mistakeType] = (mistakeBreakdown[mistakeType] || 0) + 1;

        // Record in StudentMistake notebook
        await prisma.studentMistake.upsert({
          where: {
            userId_questionId: {
              userId: attempt.userId,
              questionId: q.id,
            },
          },
          update: {
            mistakeCount: { increment: 1 },
            selectedOption: selected,
            correctOption: q.correctOption,
            lastMistakeAt: new Date(),
            isResolved: false,
            mistakeType,
            confidence: classification.confidence,
            evidence: classification.evidence,
          },
          create: {
            userId: attempt.userId,
            questionId: q.id,
            conceptId: q.primaryConceptId,
            chapterId: q.chapterId,
            selectedOption: selected,
            correctOption: q.correctOption,
            mistakeCount: 1,
            isResolved: false,
            mistakeType,
            confidence: classification.confidence,
            evidence: classification.evidence,
          },
        });

        // Track weak concept
        if (q.primaryConcept) {
          const existingWeak = weakConceptMap.get(q.primaryConcept.id) || {
            name: q.primaryConcept.name,
            chapterTitle: q.chapter.title,
            count: 0,
          };
          existingWeak.count += 1;
          weakConceptMap.set(q.primaryConcept.id, existingWeak);

          // Update Concept Mastery (Penalize)
          await ConceptMasteryEngine.updateMastery({
            userId: attempt.userId,
            conceptId: q.primaryConcept.id,
            isCorrect: false,
            difficulty: (q.difficulty as any) || 'MEDIUM',
            timeSpentSeconds: 50,
            questionId: q.id,
          });
        }

        // Record exposure
        await QuestionExposureEngine.recordExposure(attempt.userId, q.id, false, 50);
      }

      // Record immutable AttemptEvent for full auditing
      await prisma.attemptEvent.create({
        data: {
          userId: attempt.userId,
          questionId: q.id,
          selectedOption: selected,
          correctOption: q.correctOption,
          isCorrect,
          timeSpentSeconds: 50,
          sourceType: q.sourceType,
          examYear: q.examYear,
          chapterId: q.chapterId,
          conceptId: q.primaryConceptId,
          difficulty: q.difficulty,
          mistakeType: !isCorrect && selected ? mistakeType : null,
          sessionId: attempt.id,
          sourceContext: 'CBT',
        },
      });

      evaluatedResults.push({
        questionId: q.id,
        questionText: q.questionText,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect,
        marksAwarded: marks,
        explanation: q.explanation,
        chapterTitle: q.chapter?.title,
        subjectName: q.chapter?.subject?.name,
        mistakeType: !isCorrect && selected ? mistakeType : undefined,
        primaryConcept: q.primaryConcept ? { id: q.primaryConcept.id, name: q.primaryConcept.name } : null,
      });
    }

    const accuracy =
      correctCount + incorrectCount > 0
        ? Number(((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1))
        : 0;

    const durationSeconds = Math.round((new Date().getTime() - attempt.startedAt.getTime()) / 1000);

    const weakConcepts = Array.from(weakConceptMap.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      chapterTitle: info.chapterTitle,
      count: info.count,
    }));

    const recommendedActions: string[] = [];
    if (weakConcepts.length > 0) {
      recommendedActions.push(`Remediate top weak concept: ${weakConcepts[0].name}`);
    }
    if (incorrectCount > 0) {
      recommendedActions.push(`Reattempt ${incorrectCount} test mistakes in My Error Book`);
    }
    recommendedActions.push('Review step-by-step solutions for incorrect items');

    const analysis: any = {
      attemptId: attempt.id,
      status: 'SUBMITTED',
      isSubmitted: true,
      totalScore,
      maxScore: test.totalMarks,
      accuracy,
      attemptedCount: correctCount + incorrectCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      durationSeconds,
      subjectBreakdown: subjectScores,
      weakConcepts,
      mistakeBreakdown,
      recommendedActions,
      results: evaluatedResults,
    };

    // Finalize attempt with analyticsJson
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        isSubmitted: true,
        submittedAt: new Date(),
        totalScore,
        accuracy,
        durationSeconds,
        analyticsJson: JSON.stringify(analysis),
        submissionToken: submissionToken || attempt.submissionToken || undefined,
      },
    });

    // Update overall Student Profile metrics
    await prisma.studentProfile.updateMany({
      where: { userId: attempt.userId },
      data: {
        totalAttempted: { increment: correctCount + incorrectCount },
        totalCorrect: { increment: correctCount },
      },
    });

    // Trigger Phase 5 Analytics: Time Management, Action Plan, and Performance Snapshot
    try {
      const timeAnalysis = await TimeManagementAnalyzer.analyze(attempt.id);
      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: { timeAnalysisJson: JSON.stringify(timeAnalysis) },
      });
    } catch (e) {
      // Non-fatal telemetry warning
    }

    try {
      await PostMockActionPlanEngine.generateActionPlan(attempt.id);
    } catch (e) {
      // Non-fatal telemetry warning
    }

    try {
      await PerformanceSnapshotEngine.captureSnapshot(attempt.userId, 'POST_MOCK');
    } catch (e) {
      // Non-fatal telemetry warning
    }

    return analysis;
  }

  /**
   * Retrieves final evaluated result and scorecard for an attempt
   */
  static async getAttemptResult(attemptId: string, userId?: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { test: true },
    });
    if (!attempt) throw new Error('Exam attempt not found');
    if (userId && attempt.userId !== userId) throw new Error('Unauthorized');

    if (!attempt.analyticsJson) {
      return this.submitAttempt(attemptId, userId);
    }
    const data = JSON.parse(attempt.analyticsJson);
    return {
      status: attempt.status,
      isSubmitted: attempt.isSubmitted,
      ...data,
    };
  }

  private static formatStudentAttemptView(attempt: any) {
    const questions = attempt.snapshotData ? JSON.parse(attempt.snapshotData) : [];
    const answers = attempt.answersJson ? JSON.parse(attempt.answersJson) : {};
    const markedForReview = attempt.markedForReviewJson ? JSON.parse(attempt.markedForReviewJson) : [];

    return {
      attemptId: attempt.id,
      status: attempt.status,
      test: {
        id: attempt.test.id,
        title: attempt.test.title,
        durationMinutes: attempt.test.durationMinutes,
        totalQuestions: attempt.test.totalQuestions,
        positiveMarks: attempt.test.positiveMarks,
        negativeMarks: attempt.test.negativeMarks,
      },
      activeQuestionIndex: attempt.activeQuestionIndex || 0,
      remainingSeconds: attempt.remainingSeconds,
      answers,
      markedForReview,
      questions,
    };
  }
}
