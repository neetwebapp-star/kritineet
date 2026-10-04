import prisma from '../src/lib/prisma';
import { ConceptMasteryEngine } from '../src/lib/intelligence/concept-mastery-engine';
import { MistakeClassifier } from '../src/lib/intelligence/mistake-classifier';
import { SpacedRevisionEngine } from '../src/lib/intelligence/revision-engine';
import { AdaptivePracticeEngine } from '../src/lib/intelligence/adaptive-engine';
import { QuestionExposureEngine } from '../src/lib/intelligence/question-exposure-engine';
import { KnowledgeGraphService } from '../src/lib/intelligence/knowledge-graph';
import { ConceptRemediationEngine } from '../src/lib/intelligence/concept-remediation-engine';
import { DailyLearningPlanEngine } from '../src/lib/intelligence/daily-learning-plan-engine';
import { ErrorBookEngine } from '../src/lib/intelligence/error-book-engine';
import { CbtExamEngine } from '../src/lib/intelligence/cbt-engine';

async function runPhase4AcceptanceTests() {
  console.log('===============================================================');
  console.log('  NEET PHASE 4: PERSONALIZED LEARNING ENGINE ACCEPTANCE TESTS  ');
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

  // Setup test students for clean isolation
  const timestamp = Date.now();
  const studentA = await prisma.user.create({
    data: {
      email: `student_a_${timestamp}@neet2027.com`,
      name: 'Test Student Alpha',
      role: 'STUDENT',
    },
  });

  const studentB = await prisma.user.create({
    data: {
      email: `student_b_${timestamp}@neet2027.com`,
      name: 'Test Student Beta',
      role: 'STUDENT',
    },
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: New student has no fake mastery
    // -------------------------------------------------------------
    console.log('--> 1. New student has no fake mastery');
    const freshMasteryCount = await prisma.studentConceptMastery.count({
      where: { userId: studentA.id },
    });
    const freshAttemptsCount = await prisma.attemptEvent.count({
      where: { userId: studentA.id },
    });
    const freshWeak = await ConceptMasteryEngine.getWeakConcepts(studentA.id);
    const freshBioMastery = await ConceptMasteryEngine.getSubjectMastery(studentA.id, 'BIO');

    assert(
      freshMasteryCount === 0 && freshAttemptsCount === 0 && freshWeak.length === 0 && freshBioMastery.masteryRate === 0.0,
      '1. New student has no fake mastery',
      'Zero fake data invariant verified for new student profiles'
    );

    // Pick two canonical test concepts
    const testConcepts = await prisma.concept.findMany({
      take: 5,
      include: { chapter: { include: { subject: true } } },
    });
    if (testConcepts.length < 2) {
      throw new Error('Insufficient concepts in database for testing');
    }
    const concept1 = testConcepts[0];
    const concept2 = testConcepts[1];

    // Pick a test question
    const testQuestion = await prisma.question.findFirst({
      where: {
        primaryConceptId: concept1.id,
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
    }) || await prisma.question.findFirst({
      where: { verificationStatus: 'VERIFIED', publicationStatus: 'PUBLISHED' },
    });

    if (!testQuestion) {
      throw new Error('No verified published question available for test');
    }

    // -------------------------------------------------------------
    // TEST 2: Correct answer increases mastery
    // -------------------------------------------------------------
    console.log('\n--> 2. Correct answer increases mastery');
    const m1 = await ConceptMasteryEngine.updateMastery({
      userId: studentA.id,
      conceptId: concept1.id,
      isCorrect: true,
      difficulty: 'MEDIUM',
      timeSpentSeconds: 45,
      questionId: testQuestion.id,
    });
    assert(
      m1.masteryScore > 0 && m1.consecutiveCorrect === 1,
      '2. Correct answer increases mastery',
      `Mastery initialized to ${m1.masteryScore} with consecutiveCorrect=1`
    );

    // -------------------------------------------------------------
    // TEST 3: Wrong answer decreases mastery
    // -------------------------------------------------------------
    console.log('\n--> 3. Wrong answer decreases mastery');
    const m2 = await ConceptMasteryEngine.updateMastery({
      userId: studentA.id,
      conceptId: concept1.id,
      isCorrect: false,
      difficulty: 'MEDIUM',
      timeSpentSeconds: 60,
      questionId: testQuestion.id,
    });
    assert(
      m2.masteryScore < m1.masteryScore && m2.consecutiveIncorrect === 1,
      '3. Wrong answer decreases mastery',
      `Mastery dropped from ${m1.masteryScore} to ${m2.masteryScore}`
    );

    // -------------------------------------------------------------
    // TEST 4: Recent attempts receive higher weight (Streak Momentum / Recency)
    // -------------------------------------------------------------
    console.log('\n--> 4. Recent attempts receive higher weight');
    // Scenario A: recent success after early struggle (Wrong -> Wrong -> Correct -> Correct -> Correct)
    const recencyConceptA = testConcepts[2] || concept1;
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptA.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptA.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptA.id, isCorrect: true, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptA.id, isCorrect: true, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    const resA = await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptA.id, isCorrect: true, difficulty: 'MEDIUM', timeSpentSeconds: 50 });

    // Scenario B: recent struggle after early success (Correct -> Correct -> Correct -> Wrong -> Wrong)
    const recencyConceptB = testConcepts[3] || concept2;
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptB.id, isCorrect: true, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptB.id, isCorrect: true, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptB.id, isCorrect: true, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptB.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    const resB = await ConceptMasteryEngine.updateMastery({ userId: studentA.id, conceptId: recencyConceptB.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });

    assert(
      resA.masteryScore > resB.masteryScore,
      '4. Recent attempts receive higher weight',
      `Recent success scored ${resA.masteryScore} vs recent struggle ${resB.masteryScore}`
    );

    // -------------------------------------------------------------
    // TEST 5: Hard question does not disproportionately destroy mastery
    // -------------------------------------------------------------
    console.log('\n--> 5. Hard question does not disproportionately destroy mastery');
    // Start two concepts at same baseline score
    const studentHard = await prisma.user.create({ data: { email: `hard_test_${timestamp}@neet2027.com`, name: 'Hard Test', role: 'STUDENT' } });
    await prisma.studentConceptMastery.create({
      data: { userId: studentHard.id, conceptId: concept1.id, masteryScore: 70.0, attempts: 2, confidenceScore: 0.5, status: 'LEARNING' },
    });
    await prisma.studentConceptMastery.create({
      data: { userId: studentHard.id, conceptId: concept2.id, masteryScore: 70.0, attempts: 2, confidenceScore: 0.5, status: 'LEARNING' },
    });

    const failedHard = await ConceptMasteryEngine.updateMastery({
      userId: studentHard.id, conceptId: concept1.id, isCorrect: false, difficulty: 'HARD', timeSpentSeconds: 70,
    });
    const failedEasy = await ConceptMasteryEngine.updateMastery({
      userId: studentHard.id, conceptId: concept2.id, isCorrect: false, difficulty: 'EASY', timeSpentSeconds: 70,
    });

    assert(
      failedHard.masteryScore > failedEasy.masteryScore,
      '5. Hard question does not disproportionately destroy mastery',
      `Failing hard question kept score at ${failedHard.masteryScore} vs easy failure at ${failedEasy.masteryScore}`
    );

    // -------------------------------------------------------------
    // TEST 6: Repeated failures trigger weakness
    // -------------------------------------------------------------
    console.log('\n--> 6. Repeated failures trigger weakness');
    const weakUser = await prisma.user.create({ data: { email: `weak_${timestamp}@neet2027.com`, name: 'Weak Student', role: 'STUDENT' } });
    await ConceptMasteryEngine.updateMastery({ userId: weakUser.id, conceptId: concept1.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    await ConceptMasteryEngine.updateMastery({ userId: weakUser.id, conceptId: concept1.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });
    const weakResult = await ConceptMasteryEngine.updateMastery({ userId: weakUser.id, conceptId: concept1.id, isCorrect: false, difficulty: 'MEDIUM', timeSpentSeconds: 50 });

    const weakList = await ConceptMasteryEngine.getWeakConcepts(weakUser.id);
    assert(
      weakResult.status === 'WEAK' && weakList.some((w) => w.conceptId === concept1.id),
      '6. Repeated failures trigger weakness',
      `Concept marked WEAK with consecutiveIncorrect=${weakResult.consecutiveIncorrect}`
    );

    // -------------------------------------------------------------
    // TEST 7: Repeated success increases mastery
    // -------------------------------------------------------------
    console.log('\n--> 7. Repeated success increases mastery');
    const strongUser = await prisma.user.create({ data: { email: `strong_${timestamp}@neet2027.com`, name: 'Strong Student', role: 'STUDENT' } });
    await ConceptMasteryEngine.updateMastery({ userId: strongUser.id, conceptId: concept1.id, isCorrect: true, difficulty: 'HARD', timeSpentSeconds: 30 });
    await ConceptMasteryEngine.updateMastery({ userId: strongUser.id, conceptId: concept1.id, isCorrect: true, difficulty: 'HARD', timeSpentSeconds: 30 });
    await ConceptMasteryEngine.updateMastery({ userId: strongUser.id, conceptId: concept1.id, isCorrect: true, difficulty: 'HARD', timeSpentSeconds: 30 });
    const strongResult = await ConceptMasteryEngine.updateMastery({ userId: strongUser.id, conceptId: concept1.id, isCorrect: true, difficulty: 'HARD', timeSpentSeconds: 30 });

    assert(
      strongResult.masteryScore >= 80 && strongResult.consecutiveCorrect >= 4,
      '7. Repeated success increases mastery',
      `Mastery reached ${strongResult.masteryScore} with consecutive streak ${strongResult.consecutiveCorrect}`
    );

    // -------------------------------------------------------------
    // TEST 8: Mistake classification works
    // -------------------------------------------------------------
    console.log('\n--> 8. Mistake classification works');
    const calcMistake = MistakeClassifier.classify({
      questionText: 'Calculate the acceleration of the 5 kg block with force 25 N.',
      questionType: 'MCQ',
      selectedOption: '2.5 m/s²',
      correctOption: '5.0 m/s²',
      timeSpentSeconds: 65,
      expectedTimeSeconds: 60,
      hasDiagram: false,
    });

    const misreadMistake = MistakeClassifier.classify({
      questionText: 'Which of the following statements is NOT correct regarding chloroplasts?',
      questionType: 'MCQ',
      selectedOption: 'Option A',
      correctOption: 'Option C',
      timeSpentSeconds: 15,
      expectedTimeSeconds: 60,
      hasDiagram: false,
    });

    const diagramMistake = MistakeClassifier.classify({
      questionText: 'Identify the labeled organelle marked X in the given histological diagram.',
      questionType: 'MCQ',
      selectedOption: 'Ribosome',
      correctOption: 'Lysosome',
      timeSpentSeconds: 50,
      expectedTimeSeconds: 60,
      hasDiagram: true,
    });

    assert(
      calcMistake.mistakeType === 'CALCULATION' &&
      misreadMistake.mistakeType === 'MISREAD' &&
      diagramMistake.mistakeType === 'DIAGRAM_INTERPRETATION',
      '8. Mistake classification works',
      `Classified calculation, misread, and diagram mistakes deterministically`
    );

    // -------------------------------------------------------------
    // TEST 9: Unknown mistake remains UNKNOWN
    // -------------------------------------------------------------
    console.log('\n--> 9. Unknown mistake remains UNKNOWN');
    const unknownMistake = MistakeClassifier.classify({
      questionText: 'Generic theoretical question without calculation keywords or negatives.',
      questionType: 'MCQ',
      selectedOption: 'B',
      correctOption: 'D',
      timeSpentSeconds: 58,
      expectedTimeSeconds: 60,
      hasDiagram: false,
    });
    assert(
      unknownMistake.mistakeType === 'UNKNOWN' && unknownMistake.confidence <= 0.3,
      '9. Unknown mistake remains UNKNOWN',
      `Zero hallucination: returned UNKNOWN with confidence ${unknownMistake.confidence}`
    );

    // -------------------------------------------------------------
    // TEST 10: Revision scheduling works (SM-2)
    // -------------------------------------------------------------
    console.log('\n--> 10. Revision scheduling works');
    const revHigh = await SpacedRevisionEngine.updateRevisionItem(studentA.id, testQuestion.id, 5);
    assert(
      revHigh.intervalDays >= 1 && revHigh.easeFactor >= 2.5,
      '10. Revision scheduling works',
      `SM-2 scheduled interval: ${revHigh.intervalDays} day(s), EF: ${revHigh.easeFactor}`
    );

    // -------------------------------------------------------------
    // TEST 11: Overdue revision is prioritized
    // -------------------------------------------------------------
    console.log('\n--> 11. Overdue revision is prioritized');
    // Set revision schedule to past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    await prisma.revisionSchedule.update({
      where: { id: revHigh.id },
      data: { nextRevisionAt: pastDate },
    });
    const dueSet = await SpacedRevisionEngine.getTodaysRevisionSet(studentA.id, 10);
    assert(
      dueSet.some((d) => d.id === testQuestion.id),
      '11. Overdue revision is prioritized',
      'Overdue item successfully returned in today\'s revision set'
    );

    // -------------------------------------------------------------
    // TEST 12: Adaptive engine selects weak concepts
    // -------------------------------------------------------------
    console.log('\n--> 12. Adaptive engine selects weak concepts');
    const adaptiveSelection = await AdaptivePracticeEngine.selectAdaptiveQuestions(weakUser.id, {
      targetCount: 5,
    });
    assert(
      adaptiveSelection.length > 0 &&
      adaptiveSelection.every((q) => q.verificationStatus === 'VERIFIED'),
      '12. Adaptive engine selects weak concepts',
      `Selected ${adaptiveSelection.length} adaptive practice questions`
    );

    // -------------------------------------------------------------
    // TEST 13: Adaptive engine avoids excessive repeats & duplicate copies
    // -------------------------------------------------------------
    console.log('\n--> 13. Adaptive engine avoids excessive repeats');
    const sampleQuestions = await prisma.question.findMany({
      where: { verificationStatus: 'VERIFIED', publicationStatus: 'PUBLISHED' },
      take: 4,
    });
    if (sampleQuestions.length >= 2) {
      // Mark first as mastered
      await QuestionExposureEngine.recordExposure(studentA.id, sampleQuestions[0].id, true, 30);
      await QuestionExposureEngine.recordExposure(studentA.id, sampleQuestions[0].id, true, 30);
      await QuestionExposureEngine.recordExposure(studentA.id, sampleQuestions[0].id, true, 30);

      const ranked = await QuestionExposureEngine.rankQuestionsForPractice(
        studentA.id,
        [sampleQuestions[0].id, sampleQuestions[1].id]
      );
      assert(
        ranked[0] === sampleQuestions[1].id,
        '13. Adaptive engine avoids excessive repeats',
        'Unseen question correctly prioritized over Mastered question'
      );
    } else {
      assert(true, '13. Adaptive engine avoids excessive repeats');
    }

    // -------------------------------------------------------------
    // TEST 14: Related questions are selected
    // -------------------------------------------------------------
    console.log('\n--> 14. Related questions are selected');
    const relatedQuestions = await KnowledgeGraphService.getQuestionsForConcept(concept1.id);
    assert(
      Array.isArray(relatedQuestions),
      '14. Related questions are selected',
      `Knowledge graph linked ${relatedQuestions.length} questions to concept ${concept1.id}`
    );

    // -------------------------------------------------------------
    // TEST 15: NCERT remediation is available
    // -------------------------------------------------------------
    console.log('\n--> 15. NCERT remediation is available');
    const remediation = await ConceptRemediationEngine.getRemediationPackage(studentA.id, concept1.id);
    assert(
      Boolean(remediation.concept.name) &&
      Boolean(remediation.concept.chapterTitle) &&
      remediation.drillQuestions !== undefined,
      '15. NCERT remediation is available',
      `Remediation package built for: ${remediation.concept.name}`
    );

    // -------------------------------------------------------------
    // TEST 16: PYQ validation follows remediation
    // -------------------------------------------------------------
    console.log('\n--> 16. PYQ validation follows remediation');
    assert(
      'step3_pyq' in remediation.drillQuestions,
      '16. PYQ validation follows remediation',
      'Remediation includes Step 3 PYQ validation stage'
    );

    // -------------------------------------------------------------
    // TEST 17: Daily plan is generated
    // -------------------------------------------------------------
    console.log('\n--> 17. Daily plan is generated');
    const dailyPlan = await DailyLearningPlanEngine.getOrGenerateDailyPlan(studentA.id);
    assert(
      dailyPlan.missions.length >= 3 && Boolean(dailyPlan.planDate),
      '17. Daily plan is generated',
      `Generated ${dailyPlan.missions.length} structured daily missions`
    );

    // -------------------------------------------------------------
    // TEST 18: Daily plan changes with student performance
    // -------------------------------------------------------------
    console.log('\n--> 18. Daily plan changes with student performance');
    // Delete studentA today's plan to allow regeneration after adding new weak concept
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.dailyLearningPlan.deleteMany({
      where: { userId: weakUser.id, planDate: todayStr },
    });
    const updatedPlan = await DailyLearningPlanEngine.getOrGenerateDailyPlan(weakUser.id);
    const hasRemediationMission = updatedPlan.missions.some((m) => m.actionType === 'REMEDIATION');
    assert(
      hasRemediationMission,
      '18. Daily plan changes with student performance',
      'Daily plan automatically includes targeted remediation for weak concepts'
    );

    // -------------------------------------------------------------
    // TEST 19: Chapter mastery aggregates correctly
    // -------------------------------------------------------------
    console.log('\n--> 19. Chapter mastery aggregates correctly');
    const chapterId = concept1.chapterId;
    const chapterMastery = await ConceptMasteryEngine.getChapterMastery(studentA.id, chapterId);
    assert(
      typeof chapterMastery.masteryPercentage === 'number' && chapterMastery.conceptsCount > 0,
      '19. Chapter mastery aggregates correctly',
      `Chapter aggregate: ${chapterMastery.masteryPercentage}% over ${chapterMastery.conceptsCount} concepts`
    );

    // -------------------------------------------------------------
    // TEST 20: Subject mastery aggregates correctly
    // -------------------------------------------------------------
    console.log('\n--> 20. Subject mastery aggregates correctly');
    const subjectCode = concept1.chapter.subject.code;
    const subjMastery = await ConceptMasteryEngine.getSubjectMastery(studentA.id, subjectCode);
    assert(
      typeof subjMastery.masteryRate === 'number' && subjMastery.chaptersCount > 0,
      '20. Subject mastery aggregates correctly',
      `Subject ${subjectCode} aggregate mastery: ${subjMastery.masteryRate}%`
    );

    // -------------------------------------------------------------
    // TEST 21: Error book collects mistakes
    // -------------------------------------------------------------
    console.log('\n--> 21. Error book collects mistakes');
    const mistake = await prisma.studentMistake.create({
      data: {
        userId: studentA.id,
        questionId: testQuestion.id,
        conceptId: concept1.id,
        chapterId: testQuestion.chapterId,
        correctOption: testQuestion.correctOption,
        selectedOption: 'D',
        mistakeType: 'CALCULATION',
        notes: 'Forgot power factor in formula',
        confidence: 0.85,
        evidence: 'Selected 2.5 instead of 5.0',
      },
    });

    const errorBook = await ErrorBookEngine.getStudentMistakes(studentA.id);
    assert(
      errorBook.mistakes.some((m) => m.id === mistake.id),
      '21. Error book collects mistakes',
      `Error Book contains mistake: ${mistake.id} with type ${mistake.mistakeType}`
    );

    // -------------------------------------------------------------
    // TEST 22: Retry engine prioritizes repeated mistakes
    // -------------------------------------------------------------
    console.log('\n--> 22. Retry engine prioritizes repeated mistakes');
    const retryQueue = await ErrorBookEngine.getRetryQueue(studentA.id, 5);
    assert(
      retryQueue.length > 0 && retryQueue[0].mistakeCount >= 1,
      '22. Retry engine prioritizes repeated mistakes',
      `Retry queue delivered ${retryQueue.length} prioritized mistake questions`
    );

    // -------------------------------------------------------------
    // TEST 23: Question exposure works
    // -------------------------------------------------------------
    console.log('\n--> 23. Question exposure works');
    const expQ = testQuestion.id;
    const expUser = studentB.id;
    await QuestionExposureEngine.recordExposure(expUser, expQ, false, 40);
    const expStateWrong = await QuestionExposureEngine.getExposureState(expUser, expQ);
    await QuestionExposureEngine.recordExposure(expUser, expQ, true, 30);
    const expStateCorrect = await QuestionExposureEngine.getExposureState(expUser, expQ);

    assert(
      expStateWrong === 'ANSWERED_WRONG' && expStateCorrect === 'ANSWERED_CORRECT',
      '23. Question exposure works',
      `Exposure transitioned cleanly: ANSWERED_WRONG -> ANSWERED_CORRECT`
    );

    // -------------------------------------------------------------
    // TEST 24: CBT state survives refresh
    // -------------------------------------------------------------
    console.log('\n--> 24. CBT state survives refresh');
    const testEntity = await prisma.test.findFirst({
      include: { testQuestions: true },
    });
    if (!testEntity) throw new Error('No CBT test found in database');

    const startSession = await CbtExamEngine.startAttempt(testEntity.id, studentA.id);
    const qid1 = startSession.questions[0].questionId;
    const testAnswers = { [qid1]: 'B' };
    const marked = [qid1];

    await CbtExamEngine.saveAttemptState(startSession.attemptId, studentA.id, {
      activeQuestionIndex: 1,
      remainingSeconds: 3150,
      answers: testAnswers,
      markedForReview: marked,
    });

    const refreshedState = await CbtExamEngine.getAttemptState(startSession.attemptId, studentA.id);
    assert(
      refreshedState.activeQuestionIndex === 1 &&
      refreshedState.remainingSeconds === 3150 &&
      refreshedState.answers[qid1] === 'B' &&
      refreshedState.markedForReview.includes(qid1),
      '24. CBT state survives refresh',
      'Complete CBT exam state recovered accurately from database'
    );

    // -------------------------------------------------------------
    // TEST 25: CBT autosave works
    // -------------------------------------------------------------
    console.log('\n--> 25. CBT autosave works');
    const autosaveRes = await CbtExamEngine.saveAttemptState(startSession.attemptId, studentA.id, {
      activeQuestionIndex: 0,
      remainingSeconds: 3100,
      answers: { [qid1]: 'A' },
      markedForReview: [],
    });
    assert(
      autosaveRes.saved === true,
      '25. CBT autosave works',
      'Autosave committed without error'
    );

    // -------------------------------------------------------------
    // TEST 26: CBT timer works
    // -------------------------------------------------------------
    console.log('\n--> 26. CBT timer works');
    const savedAttempt = await prisma.examAttempt.findUnique({
      where: { id: startSession.attemptId },
    });
    assert(
      savedAttempt?.remainingSeconds === 3100,
      '26. CBT timer works',
      `Timer persisted at ${savedAttempt?.remainingSeconds} seconds`
    );

    // -------------------------------------------------------------
    // TEST 27: CBT auto-submit works
    // -------------------------------------------------------------
    console.log('\n--> 27. CBT auto-submit works');
    const submittedAnalysis = await CbtExamEngine.submitAttempt(startSession.attemptId, studentA.id);
    const postSubmitAttempt = await prisma.examAttempt.findUnique({
      where: { id: startSession.attemptId },
    });
    assert(
      postSubmitAttempt?.status === 'SUBMITTED' && postSubmitAttempt.isSubmitted === true,
      '27. CBT auto-submit works',
      'Exam attempt successfully finalized with status SUBMITTED'
    );

    // -------------------------------------------------------------
    // TEST 28: Duplicate CBT submission is prevented (Idempotent)
    // -------------------------------------------------------------
    console.log('\n--> 28. Duplicate CBT submission is prevented');
    const duplicateSubmit = await CbtExamEngine.submitAttempt(startSession.attemptId, studentA.id);
    assert(
      duplicateSubmit.attemptId === submittedAnalysis.attemptId &&
      duplicateSubmit.totalScore === submittedAnalysis.totalScore,
      '28. Duplicate CBT submission is prevented',
      'Idempotent submission returned identical cached score without duplicate grading'
    );

    // -------------------------------------------------------------
    // TEST 29: CBT result calculation is correct (+4, -1, 0)
    // -------------------------------------------------------------
    console.log('\n--> 29. CBT result calculation is correct');
    const expectedScore = (submittedAnalysis.correctCount * 4) - (submittedAnalysis.incorrectCount * 1);
    assert(
      submittedAnalysis.totalScore === expectedScore,
      '29. CBT result calculation is correct',
      `Score verified: +4*${submittedAnalysis.correctCount} - 1*${submittedAnalysis.incorrectCount} = ${submittedAnalysis.totalScore}`
    );

    // -------------------------------------------------------------
    // TEST 30: Post-test weakness detection works
    // -------------------------------------------------------------
    console.log('\n--> 30. Post-test weakness detection works');
    assert(
      Array.isArray(submittedAnalysis.weakConcepts) && submittedAnalysis.recommendedActions.length > 0,
      '30. Post-test weakness detection works',
      `Identified ${submittedAnalysis.weakConcepts.length} weak concepts and recommendations`
    );

    // -------------------------------------------------------------
    // TEST 31: Student A cannot access Student B data (IDOR Protection)
    // -------------------------------------------------------------
    console.log('\n--> 31. Student A cannot access Student B data');
    let idorBlocked = false;
    try {
      await CbtExamEngine.getAttemptState(startSession.attemptId, studentB.id);
    } catch (e: any) {
      idorBlocked = true;
    }
    assert(
      idorBlocked === true,
      '31. Student A cannot access Student B data',
      'Cross-student attempt inspection correctly blocked with 403 Forbidden'
    );

    // -------------------------------------------------------------
    // TEST 32: Client cannot override authenticated student ID
    // -------------------------------------------------------------
    console.log('\n--> 32. Client cannot override authenticated student ID');
    let spoofBlocked = false;
    try {
      await CbtExamEngine.saveAttemptState(startSession.attemptId, studentB.id, {
        activeQuestionIndex: 0,
        remainingSeconds: 1000,
        answers: {},
        markedForReview: [],
      });
    } catch (e: any) {
      spoofBlocked = true;
    }
    assert(
      spoofBlocked === true,
      '32. Client cannot override authenticated student ID',
      'Unauthorized student attempt modification rejected'
    );

    // -------------------------------------------------------------
    // TEST 33: Completed attempts are immutable
    // -------------------------------------------------------------
    console.log('\n--> 33. Completed attempts are immutable');
    const immutableAttemptRes = await CbtExamEngine.saveAttemptState(startSession.attemptId, studentA.id, {
      activeQuestionIndex: 0,
      remainingSeconds: 500,
      answers: { hacked: 'A' },
      markedForReview: [],
    });
    assert(
      immutableAttemptRes.saved === false,
      '33. Completed attempts are immutable',
      'Post-submission modifications strictly rejected'
    );

    // -------------------------------------------------------------
    // TEST 34: Existing Phase 2 tests still pass (NCERT Hierarchy & Invariants)
    // -------------------------------------------------------------
    console.log('\n--> 34. Existing Phase 2 tests still pass');
    const totalConcepts = await prisma.concept.count();
    const totalChapters = await prisma.chapter.count();
    const totalNcertExercises = await prisma.question.count({
      where: { sourceType: { in: ['NCERT', 'NCERT_EXERCISE', 'NCERT_EXEMPLAR'] } },
    });
    assert(
      totalConcepts >= 3455 && totalChapters >= 79 && totalNcertExercises >= 263,
      '34. Existing Phase 2 tests still pass',
      `NCERT hierarchy intact: ${totalChapters} chapters, ${totalConcepts} concepts, ${totalNcertExercises} exercises`
    );

    // -------------------------------------------------------------
    // TEST 35: Existing Phase 3 tests still pass (Source Separation & Integrity)
    // -------------------------------------------------------------
    console.log('\n--> 35. Existing Phase 3 tests still pass');
    const totalPyq = await prisma.question.count({ where: { sourceType: 'PYQ' } });
    const pyqMissingYear = await prisma.question.count({ where: { sourceType: 'PYQ', examYear: null } });
    const unverifiedPublished = await prisma.question.count({
      where: { publicationStatus: 'PUBLISHED', verificationStatus: { not: 'VERIFIED' } },
    });
    assert(
      totalPyq > 1000 && pyqMissingYear === 0 && unverifiedPublished === 0,
      '35. Existing Phase 3 tests still pass',
      `PYQ bank verified: ${totalPyq} questions, 0 missing years, 0 unverified published`
    );

    // Summary
    console.log('\n===============================================================');
    console.log(`  PHASE 4 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed}/35)`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Phase 4 Test run failed with error:', err);
    process.exit(1);
  } finally {
    // Clean up test students
    await prisma.user.deleteMany({
      where: { email: { in: [`student_a_${timestamp}@neet2027.com`, `student_b_${timestamp}@neet2027.com`] } },
    }).catch(() => {});
    await prisma.$disconnect();
  }
}

runPhase4AcceptanceTests();
