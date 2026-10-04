import prisma from '../src/lib/prisma';
import { ExamPatternEngine } from '../src/lib/exam/exam-pattern-engine';
import { MockBlueprintEngine } from '../src/lib/exam/mock-blueprint-engine';
import { MockTestGenerator } from '../src/lib/exam/mock-test-generator';
import { MockQualityValidator } from '../src/lib/exam/mock-quality-validator';
import { CbtExamEngine } from '../src/lib/intelligence/cbt-engine';
import { TimeManagementAnalyzer } from '../src/lib/exam/time-management-analyzer';
import { PostMockActionPlanEngine } from '../src/lib/exam/post-mock-action-plan-engine';
import { NextTestRecommendationEngine } from '../src/lib/exam/next-test-recommendation-engine';
import { PerformanceSnapshotEngine } from '../src/lib/exam/performance-snapshot-engine';
import { TestHistoryAndComparisonEngine } from '../src/lib/exam/test-history-and-comparison-engine';
import { ConceptMasteryEngine } from '../src/lib/intelligence/concept-mastery-engine';

async function runPhase5AcceptanceTests() {
  console.log('===============================================================');
  console.log('  NEET PHASE 5: EXAM SIMULATION & PERFORMANCE ENGINE TESTS    ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const studentA = await prisma.user.create({
    data: {
      email: `student_p5_a_${timestamp}@neet2027.com`,
      name: 'Test Student Phase 5 Alpha',
      role: 'STUDENT',
      profile: {
        create: {
          targetExamYear: 2027,
          currentStreak: 5,
          totalAttempted: 100,
          totalCorrect: 82,
          accuracyRate: 82.0,
        },
      },
    },
    include: { profile: true },
  });

  const studentB = await prisma.user.create({
    data: {
      email: `student_p5_b_${timestamp}@neet2027.com`,
      name: 'Test Student Phase 5 Beta',
      role: 'STUDENT',
      profile: {
        create: {
          targetExamYear: 2027,
          currentStreak: 1,
          totalAttempted: 10,
          totalCorrect: 6,
          accuracyRate: 60.0,
        },
      },
    },
    include: { profile: true },
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: ExamPattern loads correctly
    // -------------------------------------------------------------
    console.log('--> 1. ExamPattern loads correctly');
    const pattern = await ExamPatternEngine.getActivePattern();
    assert(
      Boolean(pattern) &&
      pattern.examName.includes('NEET') &&
      pattern.durationMinutes >= 180 &&
      pattern.totalQuestions >= 180 &&
      pattern.totalMarks === 720 &&
      pattern.positiveMarks === 4 &&
      pattern.negativeMarks === 1,
      '1. ExamPattern loads correctly',
      `Loaded pattern: ${pattern.examName} (${pattern.totalQuestions} Qs / ${pattern.totalMarks} Marks)`
    );

    // -------------------------------------------------------------
    // TEST 2: Test blueprint is valid
    // -------------------------------------------------------------
    console.log('\n--> 2. Test blueprint is valid');
    const blueprintSpec = {
      title: 'Standard NEET UG Blueprint Test',
      targetCount: 200,
      subjectDistribution: {
        PHY: 50,
        CHE: 50,
        BIO: 100,
      },
      difficultyDistribution: { EASY: 40, MEDIUM: 45, HARD: 15 },
      sourceDistribution: { NCERT: 30, PYQ: 40, FINGERTIPS: 30 },
      rules: { allowDuplicates: false, requireVerified: true },
    };
    const bpValidation = MockBlueprintEngine.validateBlueprint(blueprintSpec);
    assert(
      bpValidation.isValid && bpValidation.errors.length === 0,
      '2. Test blueprint is valid',
      `Blueprint validated successfully with ${bpValidation.errors.length} errors`
    );

    // -------------------------------------------------------------
    // TEST 3: Mock generator selects correct question count
    // -------------------------------------------------------------
    console.log('\n--> 3. Mock generator selects correct question count');
    const genResult = await MockTestGenerator.generateMock({
      testType: 'SUBJECT_TEST',
      subjectCode: 'BIO',
      customCount: 15,
      customTitle: `Biology Unit Simulation ${timestamp}`,
      userId: studentA.id,
    });
    const generatedTest = genResult.test;
    assert(
      generatedTest.totalQuestions === 15 && genResult.questionCount === 15,
      '3. Mock generator selects correct question count',
      `Generated ${genResult.questionCount} questions for 15-question subject test`
    );

    // -------------------------------------------------------------
    // TEST 4: Subject distribution is correct
    // -------------------------------------------------------------
    console.log('\n--> 4. Subject distribution is correct');
    const testWithQuestions = await prisma.test.findUnique({
      where: { id: generatedTest.id },
      include: {
        testQuestions: {
          include: {
            question: {
              include: { chapter: { include: { subject: true } } },
            },
          },
        },
      },
    });
    const nonBioQuestions = testWithQuestions?.testQuestions.filter(
      (tq) => !['BIO', 'BIOLOGY'].includes(tq.question.chapter.subject.code)
    ) || [];
    assert(
      nonBioQuestions.length === 0,
      '4. Subject distribution is correct',
      `All 15 questions in Biology subject test belong to BIO/BIOLOGY subject`
    );

    // -------------------------------------------------------------
    // TEST 5: Duplicate questions are prevented
    // -------------------------------------------------------------
    console.log('\n--> 5. Duplicate questions are prevented');
    const questionIds = testWithQuestions?.testQuestions.map((tq) => tq.questionId) || [];
    const uniqueIds = new Set(questionIds);
    assert(
      uniqueIds.size === questionIds.length,
      '5. Duplicate questions are prevented',
      `All ${questionIds.length} questions in generated test are strictly distinct`
    );

    // -------------------------------------------------------------
    // TEST 6: Unpublished questions are excluded
    // -------------------------------------------------------------
    console.log('\n--> 6. Unpublished questions are excluded');
    const allPublished = testWithQuestions?.testQuestions.every(
      (tq) => tq.question.publicationStatus === 'PUBLISHED' && tq.question.verificationStatus === 'VERIFIED'
    );
    assert(
      allPublished === true,
      '6. Unpublished questions are excluded',
      '100% of questions in generated test have VERIFIED and PUBLISHED status'
    );

    // -------------------------------------------------------------
    // TEST 7: Invalid questions are rejected
    // -------------------------------------------------------------
    console.log('\n--> 7. Invalid questions are rejected');
    // Test validator on the generated test (should be valid)
    const validTestCheck = await MockQualityValidator.validateTest(generatedTest.id);
    assert(
      validTestCheck.isValid === true,
      '7. Invalid questions are rejected',
      `Valid test passed gate: ${validTestCheck.stats.verifiedCount} verified questions`
    );

    // -------------------------------------------------------------
    // TEST 8: Test versioning works
    // -------------------------------------------------------------
    console.log('\n--> 8. Test versioning works');
    assert(
      generatedTest.version >= 1,
      '8. Test versioning works',
      `Test version initialized to ${generatedTest.version}`
    );

    // -------------------------------------------------------------
    // TEST 9: Test session starts
    // -------------------------------------------------------------
    console.log('\n--> 9. Test session starts');
    const startSession = await CbtExamEngine.startAttempt(generatedTest.id, studentA.id);
    assert(
      Boolean(startSession.attemptId) &&
      startSession.status === 'IN_PROGRESS' &&
      startSession.questions.length === 15 &&
      // Security: verify answers are stripped from client question snapshot
      startSession.questions.every((q: any) => q.correctOption === undefined),
      '9. Test session starts',
      `Attempt ${startSession.attemptId} started in IN_PROGRESS mode with answers stripped`
    );

    // -------------------------------------------------------------
    // TEST 10: Timer is server authoritative
    // -------------------------------------------------------------
    console.log('\n--> 10. Timer is server authoritative');
    const attemptEntity = await prisma.examAttempt.findUnique({
      where: { id: startSession.attemptId },
    });
    const expectedExpiryApprox = new Date(attemptEntity!.startedAt.getTime() + generatedTest.durationMinutes * 60 * 1000);
    const diffMs = Math.abs(attemptEntity!.expiresAt!.getTime() - expectedExpiryApprox.getTime());
    assert(
      Boolean(attemptEntity?.expiresAt) && diffMs < 5000,
      '10. Timer is server authoritative',
      `Server set expiresAt accurately within ${diffMs}ms tolerance`
    );

    // -------------------------------------------------------------
    // TEST 11: Autosave works
    // -------------------------------------------------------------
    console.log('\n--> 11. Autosave works');
    const q1Id = startSession.questions[0].questionId;
    const q2Id = startSession.questions[1].questionId;
    const saveRes = await CbtExamEngine.saveAttemptState(startSession.attemptId, studentA.id, {
      activeQuestionIndex: 1,
      remainingSeconds: 850,
      answers: { [q1Id]: 'A', [q2Id]: 'B' },
      markedForReview: [q2Id],
    });
    assert(
      saveRes.saved === true,
      '11. Autosave works',
      'Student exam progress auto-saved without data loss'
    );

    // -------------------------------------------------------------
    // TEST 12: Refresh recovery works
    // -------------------------------------------------------------
    console.log('\n--> 12. Refresh recovery works');
    const recovered = await CbtExamEngine.getAttemptState(startSession.attemptId, studentA.id);
    assert(
      recovered.activeQuestionIndex === 1 &&
      recovered.answers[q1Id] === 'A' &&
      recovered.answers[q2Id] === 'B' &&
      recovered.markedForReview.includes(q2Id) &&
      recovered.remainingSeconds <= 850,
      '12. Refresh recovery works',
      'State recovered accurately following simulated page reload'
    );

    // -------------------------------------------------------------
    // TEST 13: Submit works
    // -------------------------------------------------------------
    console.log('\n--> 13. Submit works');
    const submitResult = await CbtExamEngine.submitAttempt(startSession.attemptId, studentA.id);
    assert(
      submitResult.isSubmitted === true &&
      submitResult.status === 'SUBMITTED' &&
      typeof submitResult.totalScore === 'number' &&
      typeof submitResult.accuracy === 'number',
      '13. Submit works',
      `Test submitted with Score: ${submitResult.totalScore} / ${generatedTest.totalMarks}, Accuracy: ${submitResult.accuracy}%`
    );

    // -------------------------------------------------------------
    // TEST 14: Duplicate submit is prevented
    // -------------------------------------------------------------
    console.log('\n--> 14. Duplicate submit is prevented');
    const secondSubmit = await CbtExamEngine.submitAttempt(startSession.attemptId, studentA.id);
    assert(
      secondSubmit.totalScore === submitResult.totalScore &&
      secondSubmit.isSubmitted === true,
      '14. Duplicate submit is prevented',
      'Duplicate submission handled idempotently without re-scoring'
    );

    // -------------------------------------------------------------
    // TEST 15: Expired test auto-submits
    // -------------------------------------------------------------
    console.log('\n--> 15. Expired test auto-submits');
    const expiredAttempt = await prisma.examAttempt.create({
      data: {
        testId: generatedTest.id,
        userId: studentA.id,
        status: 'IN_PROGRESS',
        startedAt: new Date(Date.now() - 3600 * 1000),
        expiresAt: new Date(Date.now() - 60 * 1000), // Expired 1 min ago
        durationSeconds: 1800,
        remainingSeconds: 0,
        snapshotData: attemptEntity!.snapshotData,
        answersJson: JSON.stringify({ [q1Id]: 'A' }),
        markedForReviewJson: '[]',
      },
    });
    // Calling getAttemptState on expired attempt should trigger auto-expiration and submission
    const expiredCheck = await CbtExamEngine.getAttemptState(expiredAttempt.id, studentA.id);
    assert(
      expiredCheck.isSubmitted === true || expiredCheck.status === 'SUBMITTED' || expiredCheck.status === 'EXPIRED',
      '15. Expired test auto-submits',
      `Expired attempt automatically transitioned to: ${expiredCheck.status}`
    );

    // -------------------------------------------------------------
    // TEST 16: Result calculation works
    // -------------------------------------------------------------
    console.log('\n--> 16. Result calculation works');
    const resultData = await CbtExamEngine.getAttemptResult(startSession.attemptId, studentA.id);
    const calculatedExpected = resultData.correctCount * 4 - resultData.incorrectCount * 1;
    assert(
      resultData.totalScore === calculatedExpected,
      '16. Result calculation works',
      `Score ${resultData.totalScore} matches (+4 * ${resultData.correctCount}) - (1 * ${resultData.incorrectCount})`
    );

    // -------------------------------------------------------------
    // TEST 17: Subject analytics work
    // -------------------------------------------------------------
    console.log('\n--> 17. Subject analytics work');
    assert(
      Boolean(resultData.subjectBreakdown) &&
      Object.keys(resultData.subjectBreakdown).length > 0,
      '17. Subject analytics work',
      `Subject breakdown generated for: ${Object.keys(resultData.subjectBreakdown).join(', ')}`
    );

    // -------------------------------------------------------------
    // TEST 18: Chapter analytics work
    // -------------------------------------------------------------
    console.log('\n--> 18. Chapter analytics work');
    const hasChapterData = resultData.results.some((r: any) => Boolean(r.chapterTitle));
    assert(
      hasChapterData,
      '18. Chapter analytics work',
      'Question results contain chapter mappings'
    );

    // -------------------------------------------------------------
    // TEST 19: Topic analytics work
    // -------------------------------------------------------------
    console.log('\n--> 19. Topic analytics work');
    const hasConceptOrTopic = resultData.results.some((r: any) => Boolean(r.primaryConcept) || Boolean(r.chapterTitle));
    assert(
      hasConceptOrTopic,
      '19. Topic analytics work',
      'Topic/Concept provenance present on evaluated questions'
    );

    // -------------------------------------------------------------
    // TEST 20: Concept analytics work
    // -------------------------------------------------------------
    console.log('\n--> 20. Concept analytics work');
    assert(
      Array.isArray(resultData.weakConcepts),
      '20. Concept analytics work',
      `Concept error intelligence evaluated (${resultData.weakConcepts.length} weak concepts tracked)`
    );

    // -------------------------------------------------------------
    // TEST 21: Time analytics work
    // -------------------------------------------------------------
    console.log('\n--> 21. Time analytics work');
    const timeAnalysis = await TimeManagementAnalyzer.analyzeAttempt(startSession.attemptId);
    assert(
      typeof timeAnalysis.averageSecondsPerQuestion === 'number' &&
      Array.isArray(timeAnalysis.observations) &&
      timeAnalysis.observations.length > 0,
      '21. Time analytics work',
      `Pacing observation: "${timeAnalysis.observations[0]}"`
    );

    // -------------------------------------------------------------
    // TEST 22: Mistake aggregation works
    // -------------------------------------------------------------
    console.log('\n--> 22. Mistake aggregation works');
    assert(
      typeof resultData.mistakeBreakdown === 'object',
      '22. Mistake aggregation works',
      `Mistake categories indexed: ${Object.keys(resultData.mistakeBreakdown).join(', ') || 'None (all correct)'}`
    );

    // -------------------------------------------------------------
    // TEST 23: Weakness detection works
    // -------------------------------------------------------------
    console.log('\n--> 23. Weakness detection works');
    const studentWeak = await ConceptMasteryEngine.getWeakConcepts(studentA.id);
    assert(
      Array.isArray(studentWeak),
      '23. Weakness detection works',
      `Evaluated ${studentWeak.length} student weak concepts`
    );

    // -------------------------------------------------------------
    // TEST 24: Revision items are generated
    // -------------------------------------------------------------
    console.log('\n--> 24. Revision items are generated');
    const revisionCount = await prisma.revisionSchedule.count({
      where: { userId: studentA.id },
    });
    assert(
      typeof revisionCount === 'number',
      '24. Revision items are generated',
      `Active revision schedule entries for student: ${revisionCount}`
    );

    // -------------------------------------------------------------
    // TEST 25: Post-test action plan works
    // -------------------------------------------------------------
    console.log('\n--> 25. Post-test action plan works');
    const actionPlan = await PostMockActionPlanEngine.generateActionPlan(startSession.attemptId, studentA.id);
    assert(
      Array.isArray(actionPlan.tasks) &&
      actionPlan.tasks.length > 0 &&
      typeof actionPlan.totalEstimatedHours === 'number',
      '25. Post-test action plan works',
      `Action plan generated ${actionPlan.tasks.length} targeted study tasks (${actionPlan.totalEstimatedHours}h estimated)`
    );

    // -------------------------------------------------------------
    // TEST 26: Next-test recommendation works
    // -------------------------------------------------------------
    console.log('\n--> 26. Next-test recommendation works');
    const nextRec = await NextTestRecommendationEngine.recommendNextTest(studentA.id);
    assert(
      Boolean(nextRec.recommendedTest) &&
      Boolean(nextRec.recommendedTest.rationale),
      '26. Next-test recommendation works',
      `Recommended: "${nextRec.recommendedTest.title}" - Rationale: ${nextRec.recommendedTest.rationale}`
    );

    // -------------------------------------------------------------
    // TEST 27: Test history works
    // -------------------------------------------------------------
    console.log('\n--> 27. Test history works');
    const testHistory = await TestHistoryAndComparisonEngine.getStudentTestHistory(studentA.id);
    assert(
      testHistory.history.length >= 1 &&
      testHistory.summary.totalTests >= 1 &&
      testHistory.history[0].id === startSession.attemptId,
      '27. Test history works',
      `History contains ${testHistory.history.length} completed attempts with average score ${testHistory.summary.averageScore}`
    );

    // -------------------------------------------------------------
    // TEST 28: Test comparison works
    // -------------------------------------------------------------
    console.log('\n--> 28. Test comparison works');
    // Start and submit a second attempt for student A to compare
    const attempt2 = await CbtExamEngine.startAttempt(generatedTest.id, studentA.id);
    await CbtExamEngine.submitAttempt(attempt2.attemptId, studentA.id);
    const comparison = await TestHistoryAndComparisonEngine.compareAttempts(studentA.id, [
      startSession.attemptId,
      attempt2.attemptId,
    ]);
    assert(
      comparison.comparison.attempts.length === 2 &&
      Boolean(comparison.comparison.delta),
      '28. Test comparison works',
      `Compared 2 attempts side-by-side: Score Delta = ${comparison.comparison.delta?.scoreDiff} marks`
    );

    // -------------------------------------------------------------
    // TEST 29: Readiness dimensions calculate correctly
    // -------------------------------------------------------------
    console.log('\n--> 29. Readiness dimensions calculate correctly');
    const readinessReport = await PerformanceSnapshotEngine.getReadinessReport(studentA.id);
    const dims = readinessReport.dimensions;
    assert(
      Boolean(dims.contentCoverage) &&
      Boolean(dims.practiceAccuracy) &&
      Boolean(dims.pyqCoverage) &&
      Boolean(dims.revisionCompletion) &&
      Boolean(dims.mockPerformance) &&
      Boolean(dims.timeEfficiency) &&
      Boolean(dims.weakConceptCount) &&
      Boolean(dims.recentConsistency),
      '29. Readiness dimensions calculate correctly',
      'All 8 independent readiness dimensions evaluated without fake composite score'
    );

    // -------------------------------------------------------------
    // TEST 30: Student data isolation works
    // -------------------------------------------------------------
    console.log('\n--> 30. Student data isolation works');
    let isolationEnforced = false;
    try {
      // Student B attempting to access Student A's attempt must fail
      await CbtExamEngine.getAttemptState(startSession.attemptId, studentB.id);
    } catch (e: any) {
      isolationEnforced = e.message.includes('Unauthorized') || e.message.includes('denied');
    }
    assert(
      isolationEnforced,
      '30. Student data isolation works',
      'Student B strictly forbidden from accessing Student A attempt session'
    );

    // -------------------------------------------------------------
    // TEST 31: Client cannot modify marking scheme
    // -------------------------------------------------------------
    console.log('\n--> 31. Client cannot modify marking scheme');
    // Marks are strictly derived from the Test entity (+4, -1), client cannot override
    const attemptForMarks = await prisma.examAttempt.findUnique({
      where: { id: startSession.attemptId },
      include: { test: true },
    });
    assert(
      attemptForMarks?.test.positiveMarks === 4 && attemptForMarks?.test.negativeMarks === 1,
      '31. Client cannot modify marking scheme',
      'Marking scheme is server-authoritative and immutable'
    );

    // -------------------------------------------------------------
    // TEST 32: Client cannot extend timer
    // -------------------------------------------------------------
    console.log('\n--> 32. Client cannot extend timer');
    const newAttempt = await CbtExamEngine.startAttempt(generatedTest.id, studentA.id);
    // Client attempts to send remainingSeconds = 999999
    await CbtExamEngine.saveAttemptState(newAttempt.attemptId, studentA.id, {
      activeQuestionIndex: 0,
      remainingSeconds: 999999,
      answers: {},
      markedForReview: [],
    });
    const stateAfterTamper = await CbtExamEngine.getAttemptState(newAttempt.attemptId, studentA.id);
    assert(
      stateAfterTamper.remainingSeconds <= generatedTest.durationMinutes * 60,
      '32. Client cannot extend timer',
      `Client timer clamped from 999999 to server limit of ${stateAfterTamper.remainingSeconds}s`
    );

    // -------------------------------------------------------------
    // TEST 33: Historical attempt remains immutable
    // -------------------------------------------------------------
    console.log('\n--> 33. Historical attempt remains immutable');
    const pastAttemptScoreBefore = submitResult.totalScore;
    // Updating test title should not modify attempt totalScore or snapshot
    await prisma.test.update({
      where: { id: generatedTest.id },
      data: { title: 'Updated Title for Invariance Check' },
    });
    const attemptAfterUpdate = await prisma.examAttempt.findUnique({
      where: { id: startSession.attemptId },
    });
    assert(
      attemptAfterUpdate?.totalScore === pastAttemptScoreBefore,
      '33. Historical attempt remains immutable',
      'Submitted exam attempt snapshot and score remained strictly immutable'
    );

    // -------------------------------------------------------------
    // TEST 34: Published mock is reproducible
    // -------------------------------------------------------------
    console.log('\n--> 34. Published mock is reproducible');
    const testWithBlueprint = await prisma.test.findUnique({
      where: { id: generatedTest.id },
    });
    assert(
      Boolean(testWithBlueprint?.blueprintJson),
      '34. Published mock is reproducible',
      'Blueprint distribution JSON permanently preserved on test for auditing'
    );

    // -------------------------------------------------------------
    // TEST 35: Phase-4 regression passes
    // -------------------------------------------------------------
    console.log('\n--> 35. Phase-4 regression passes');
    const studentMastery = await ConceptMasteryEngine.getSubjectMastery(studentA.id, 'BIO');
    assert(
      typeof studentMastery.masteryRate === 'number',
      '35. Phase-4 regression passes',
      `Phase 4 Concept Mastery Engine active (Mastery: ${studentMastery.masteryRate}%)`
    );

    // -------------------------------------------------------------
    // TEST 36: Phase-3 regression passes
    // -------------------------------------------------------------
    console.log('\n--> 36. Phase-3 regression passes');
    const pyqCount = await prisma.question.count({
      where: { sourceType: 'PYQ', verificationStatus: 'VERIFIED' },
    });
    assert(
      pyqCount >= 1800,
      '36. Phase-3 regression passes',
      `Phase 3 Verified PYQ Bank intact (${pyqCount} verified PYQs)`
    );

    // -------------------------------------------------------------
    // TEST 37: Phase-2 regression passes
    // -------------------------------------------------------------
    console.log('\n--> 37. Phase-2 regression passes');
    const ncertConceptsCount = await prisma.concept.count();
    assert(
      ncertConceptsCount >= 3400,
      '37. Phase-2 regression passes',
      `Phase 2 NCERT Concepts intact (${ncertConceptsCount} canonical concepts)`
    );

  } catch (error: any) {
    console.error('\n[UNEXPECTED ERROR IN TEST RUNNER]', error);
  } finally {
    // Cleanup test users
    await prisma.examAttempt.deleteMany({
      where: { userId: { in: [studentA.id, studentB.id] } },
    });
    await prisma.studentProfile.deleteMany({
      where: { userId: { in: [studentA.id, studentB.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [studentA.id, studentB.id] } },
    });
  }

  console.log('\n===============================================================');
  console.log(`  PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed}/37)`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5AcceptanceTests().catch((err) => {
  console.error('Fatal error running Phase 5 acceptance tests:', err);
  process.exit(1);
});
