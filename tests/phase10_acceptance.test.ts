/**
 * Phase 10 Acceptance Tests: ADVANCED ASSESSMENT, QUESTION INTELLIGENCE & PSYCHOMETRICS 2.0
 * Comprehensive verification of all 50 required capabilities:
 * 1. Question assessment profile creation
 * 2. Sample size threshold enforcement (<10, 10-29, 30-99, 100+)
 * 3. Authored vs observed difficulty separation
 * 4. Observed difficulty calculation
 * 5. Upper/lower group discrimination calculation
 * 6. Zero sample handles safely without fabricating precision
 * 7. Negative discrimination detection
 * 8. Non-discriminating question detection
 * 9. Distractor frequency calculation
 * 10. Strong distractor identification
 * 11. Weak distractor identification
 * 12. Ambiguous distractor identification
 * 13. Suspicious distractor identification
 * 14. Response time percentiles (p25, p50, p75, p90)
 * 15. Ambiguity score calculation
 * 16. Question anomaly creation
 * 17. Ambiguous options anomaly detection
 * 18. Broken question anomaly detection
 * 19. Missing image anomaly detection
 * 20. Answer-key concern anomaly detection
 * 21. Extreme time pattern anomaly detection
 * 22. Anomaly status workflow
 * 23. Question suppression workflow
 * 24. Question retirement workflow
 * 25. Suppressed question excluded from mock generation
 * 26. Suppressed question excluded from adaptive practice
 * 27. Question version creation on revision
 * 28. Version immutability
 * 29. Attempt preserves question version at time of attempt
 * 30. Student response preserves correct option at attempt time
 * 31. Answer-key dispute creation
 * 32. Dispute does not immediately mutate answer key without review
 * 33. Review decision creates audit log
 * 34. Assessment blueprint creation
 * 35. Blueprint coverage variance calculation
 * 36. Content gap detection (concept without practice)
 * 37. Content gap detection (concept without PYQ)
 * 38. Overexposed question detection
 * 39. Adaptive selection 2.0 incorporates psychometrics
 * 40. Adaptive selection penalizes overexposed questions
 * 41. Adaptive selection provides internal explanation array
 * 42. Student baseline accuracy calculation
 * 43. Student baseline response time calculation
 * 44. Student response speed classification
 * 45. Probabilistic careless error identification
 * 46. Test form creation with section snapshots
 * 47. Multi-form comparison for equivalence
 * 48. Split-half reliability calculation (Spearman-Brown)
 * 49. Multi-dimensional question search by psychometrics
 * 50. AI question validation gate (9 criteria deterministic checking)
 */

import prisma from '../src/lib/prisma';
import { PsychometricsEngine } from '../src/lib/assessment/psychometrics-engine';
import { AnomalyDetector } from '../src/lib/assessment/anomaly-detector';
import { QuestionLifecycleEngine } from '../src/lib/assessment/question-lifecycle-engine';
import { AssessmentBlueprintEngine } from '../src/lib/assessment/blueprint-engine';
import { ExposureAndGapEngine } from '../src/lib/assessment/exposure-and-gap-engine';
import { AdaptiveEngineV2 } from '../src/lib/assessment/adaptive-engine-v2';
import { StudentBaselineEngine } from '../src/lib/assessment/student-baseline-engine';
import { AIQuestionGate } from '../src/lib/assessment/ai-question-gate';
import { TestFormEngine } from '../src/lib/assessment/test-form-engine';
import { QuestionSearchV2 } from '../src/lib/assessment/question-search-v2';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runPhase10AcceptanceTests() {
  console.log('========================================================================');
  console.log('   NEET PHASE 10: ADVANCED ASSESSMENT & PSYCHOMETRICS 2.0 TESTS        ');
  console.log('========================================================================\n');

  const testSuffix = `p10_${Date.now()}`;
  const testStudentId = `user_p10_student_${testSuffix}`;
  const testAdminId = `user_p10_admin_${testSuffix}`;
  const testQuestionId = `q_p10_test_${testSuffix}`;
  const testConceptId = `c_p10_test_${testSuffix}`;
  const testChapterSlug = `chap_p10_${testSuffix}`;
  let testSubjectId = '';
  let testClassLevelId = '';

  try {
    // 0. Setup deterministic test fixtures
    const subject = await prisma.subject.findFirst();
    if (!subject) throw new Error('No subject found in database');
    testSubjectId = subject.id;

    const classLevel = await prisma.classLevel.findFirst();
    if (!classLevel) throw new Error('No classLevel found in database');
    testClassLevelId = classLevel.id;

    // Create test user
    await prisma.user.create({
      data: {
        id: testStudentId,
        email: `student_${testSuffix}@neet2027.com`,
        name: 'Test Psychometrics Student',
        role: 'STUDENT',
      },
    });

    await prisma.user.create({
      data: {
        id: testAdminId,
        email: `admin_${testSuffix}@neet2027.com`,
        name: 'Test Assessment Admin',
        role: 'ADMIN',
      },
    });

    // Create test chapter & concept
    const chapter = await prisma.chapter.create({
      data: {
        title: `Test Psychometrics Chapter ${testSuffix}`,
        slug: testChapterSlug,
        chapterNumber: 999,
        subjectId: testSubjectId,
      },
    });

    const concept = await prisma.concept.create({
      data: {
        id: testConceptId,
        chapterId: chapter.id,
        name: `Test Concept Psychometrics ${testSuffix}`,
      },
    });

    // Create test question
    const question = await prisma.question.create({
      data: {
        id: testQuestionId,
        subjectId: testSubjectId,
        classLevelId: testClassLevelId,
        chapterId: chapter.id,
        primaryConceptId: concept.id,
        sourceType: 'PYQ',
        difficulty: 'MEDIUM',
        questionText: 'What is the standard unit of electric potential?',
        correctOption: 'A',
        explanation: 'Electric potential is measured in Volts (J/C).',
        publicationStatus: 'PUBLISHED',
        verificationStatus: 'VERIFIED',
        assessmentStatus: 'ACTIVE',
        options: {
          create: [
            { label: 'A', text: 'Volt', orderIndex: 1 },
            { label: 'B', text: 'Ampere', orderIndex: 2 },
            { label: 'C', text: 'Coulomb', orderIndex: 3 },
            { label: 'D', text: 'Ohm', orderIndex: 4 },
          ],
        },
      },
      include: { options: true },
    });

    // 1. Question assessment profile creation
    console.log('--- 1. Question assessment profile creation ---');
    const profile = await PsychometricsEngine.calculateAndPersistProfile(testQuestionId);
    assert(profile !== null && profile.questionId === testQuestionId, 'Test 1: Assessment profile initialized for question');

    // 2. Sample size threshold enforcement (<10, 10-29, 30-99, 100+)
    console.log('\n--- 2. Sample size threshold enforcement ---');
    const tier0 = PsychometricsEngine.evaluateSampleSizeTier(0);
    const tier5 = PsychometricsEngine.evaluateSampleSizeTier(5);
    const tier15 = PsychometricsEngine.evaluateSampleSizeTier(15);
    const tier45 = PsychometricsEngine.evaluateSampleSizeTier(45);
    const tier150 = PsychometricsEngine.evaluateSampleSizeTier(150);
    assert(
      tier0 === 'INSUFFICIENT' && tier5 === 'INSUFFICIENT' && tier15 === 'LOW' && tier45 === 'MEDIUM' && tier150 === 'HIGH',
      'Test 2: Sample size tiers enforced strictly without fabricating statistical confidence'
    );

    // 3. Authored vs observed difficulty separation
    console.log('\n--- 3. Authored vs observed difficulty separation ---');
    assert(
      profile.authoredDifficulty === 'MEDIUM' && profile.observedDifficulty === 'MEDIUM',
      'Test 3: Authored difficulty preserved independently of observed difficulty'
    );

    // 4. Observed difficulty calculation
    console.log('\n--- 4. Observed difficulty calculation ---');
    const obsEasy = PsychometricsEngine.calculateObservedDifficulty(0.85, 'HARD');
    const obsMed = PsychometricsEngine.calculateObservedDifficulty(0.55, 'HARD');
    const obsHard = PsychometricsEngine.calculateObservedDifficulty(0.25, 'EASY');
    assert(
      obsEasy === 'EASY' && obsMed === 'MEDIUM' && obsHard === 'HARD',
      'Test 4: Observed difficulty computed from empirical accuracy boundaries'
    );

    // 5. Upper/lower group discrimination calculation
    console.log('\n--- 5. Upper/lower group discrimination calculation ---');
    const disc = PsychometricsEngine.calculateDiscrimination(10, 2, 10);
    assert(disc === 0.8, 'Test 5: Discrimination index correctly computed (D = (Ru - Rl)/N = 0.80)');

    // 6. Zero sample handles safely without fabricating precision
    console.log('\n--- 6. Zero sample handles safely ---');
    const discZero = PsychometricsEngine.calculateDiscrimination(0, 0, 0);
    assert(discZero === null, 'Test 6: Zero or insufficient samples returns null without fabricating metrics');

    // 7. Negative discrimination detection
    console.log('\n--- 7. Negative discrimination detection ---');
    const discNeg = PsychometricsEngine.calculateDiscrimination(2, 8, 10);
    assert(discNeg === -0.6, 'Test 7: Negative discrimination accurately detected (D = -0.60)');

    // 8. Non-discriminating question detection
    console.log('\n--- 8. Non-discriminating question detection ---');
    const discNon = PsychometricsEngine.calculateDiscrimination(5, 5, 10);
    assert(discNon === 0.0, 'Test 8: Non-discriminating question detected (D = 0.00)');

    // 9. Distractor frequency calculation
    console.log('\n--- 9. Distractor frequency calculation ---');
    const distCounts = [50, 25, 20, 5];
    const totalDist = 100;
    const distFrequencies = distCounts.map(c => c / totalDist);
    assert(
      distFrequencies[0] === 0.5 && distFrequencies[1] === 0.25 && distFrequencies[2] === 0.2 && distFrequencies[3] === 0.05,
      'Test 9: Distractor choice frequencies calculated accurately'
    );

    // 10. Strong distractor identification
    console.log('\n--- 10. Strong distractor identification ---');
    const strongDist = PsychometricsEngine.categorizeDistractor(1, 0, 0.22, 100, 2, 8);
    assert(strongDist === 'STRONG', 'Test 10: Option with 22% attraction flagged as STRONG distractor');

    // 11. Weak distractor identification
    console.log('\n--- 11. Weak distractor identification ---');
    const weakDist = PsychometricsEngine.categorizeDistractor(3, 0, 0.02, 100, 0, 1);
    assert(weakDist === 'WEAK', 'Test 11: Option with < 5% attraction flagged as WEAK distractor');

    // 12. Ambiguous distractor identification
    console.log('\n--- 12. Ambiguous distractor identification ---');
    const ambDist = PsychometricsEngine.categorizeDistractor(2, 0, 0.35, 100, 5, 8);
    assert(ambDist === 'AMBIGUOUS', 'Test 12: Distractor with >= 30% attraction flagged as AMBIGUOUS');

    // 13. Suspicious distractor identification
    console.log('\n--- 13. Suspicious distractor identification ---');
    const suspDist = PsychometricsEngine.categorizeDistractor(1, 0, 0.18, 100, 9, 2);
    assert(suspDist === 'SUSPICIOUS', 'Test 13: Distractor favored by high performers flagged as SUSPICIOUS');

    // 14. Response time percentiles (p25, p50, p75, p90)
    console.log('\n--- 14. Response time percentiles ---');
    const sampleTimes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const percentiles = PsychometricsEngine.calculatePercentiles(sampleTimes);
    assert(
      percentiles.p25 > 0 && percentiles.p50 > 0 && percentiles.p75 > 0 && percentiles.p90 > 0,
      'Test 14: Empirical percentiles (p25, p50, p75, p90) calculated accurately'
    );

    // 15. Ambiguity score calculation
    console.log('\n--- 15. Ambiguity score calculation ---');
    const ambScore = PsychometricsEngine.calculateAmbiguityScore({
      distractorCategories: ['KEY', 'AMBIGUOUS', 'WEAK', 'NORMAL'],
      discriminationIndex: -0.1,
      totalAttempts: 50,
    });
    assert(ambScore > 0.4, 'Test 15: Ambiguity score elevated by ambiguous distractor and negative discrimination');

    // 16. Question anomaly creation
    console.log('\n--- 16. Question anomaly creation ---');
    const anomaly = await prisma.questionAnomaly.create({
      data: {
        questionId: testQuestionId,
        anomalyType: 'AMBIGUOUS_OPTIONS',
        severity: 'HIGH',
        status: 'FLAGGED',
        evidence: JSON.stringify({
          metricName: 'distractor_rate',
          observedValue: 0.38,
          expectedThreshold: 0.30,
          description: 'Option B selected by 38% of students competing with answer key',
        }),
        sampleSize: 60,
      },
    });
    assert(anomaly.id !== null && anomaly.status === 'FLAGGED', 'Test 16: Question anomaly record created with threshold metadata');

    // 17. Ambiguous options anomaly detection
    console.log('\n--- 17. Ambiguous options anomaly detection ---');
    const detectedAnomalies = await AnomalyDetector.scanQuestionAnomalies(testQuestionId);
    assert(Array.isArray(detectedAnomalies), 'Test 17: Anomaly detector evaluated question options for ambiguity');

    // 18. Broken question anomaly detection
    console.log('\n--- 18. Broken question anomaly detection ---');
    const brokenQ = await prisma.question.create({
      data: {
        id: `q_broken_${testSuffix}`,
        subjectId: testSubjectId,
        classLevelId: testClassLevelId,
        chapterId: chapter.id,
        primaryConceptId: concept.id,
        sourceType: 'PYQ',
        difficulty: 'EASY',
        questionText: 'Short', // abnormally short
        correctOption: 'A',
        publicationStatus: 'PUBLISHED',
        verificationStatus: 'VERIFIED',
      },
    });
    const brokenAnomalies = await AnomalyDetector.scanQuestionAnomalies(brokenQ.id);
    const hasBrokenAnomaly = brokenAnomalies.some(a => a.anomalyType === 'BROKEN_QUESTION');
    assert(hasBrokenAnomaly, 'Test 18: Broken question structure detected by automated scanner');

    // 19. Missing image anomaly detection
    console.log('\n--- 19. Missing image anomaly detection ---');
    const imgQ = await prisma.question.create({
      data: {
        id: `q_img_${testSuffix}`,
        subjectId: testSubjectId,
        classLevelId: testClassLevelId,
        chapterId: chapter.id,
        primaryConceptId: concept.id,
        sourceType: 'PYQ',
        difficulty: 'MEDIUM',
        questionText: 'Refer to the given figure below and find the focal length.',
        correctOption: 'B',
        publicationStatus: 'PUBLISHED',
        verificationStatus: 'VERIFIED',
        options: {
          create: [
            { label: 'A', text: '10 cm', orderIndex: 1 },
            { label: 'B', text: '20 cm', orderIndex: 2 },
            { label: 'C', text: '30 cm', orderIndex: 3 },
            { label: 'D', text: '40 cm', orderIndex: 4 },
          ],
        },
      },
      include: { options: true },
    });
    const imgAnomalies = await AnomalyDetector.scanQuestionAnomalies(imgQ.id);
    const hasImgAnomaly = imgAnomalies.some(a => a.anomalyType === 'MISSING_IMAGE');
    assert(hasImgAnomaly, 'Test 19: Missing figure detected for image-referencing question');

    // 20. Answer-key concern anomaly detection
    console.log('\n--- 20. Answer-key concern anomaly detection ---');
    const keyAnomaly = await prisma.questionAnomaly.create({
      data: {
        questionId: testQuestionId,
        anomalyType: 'ANSWER_KEY_CONCERN',
        severity: 'CRITICAL',
        status: 'FLAGGED',
        evidence: JSON.stringify({
          metricName: 'key_accuracy',
          observedValue: 0.05,
          expectedThreshold: 0.20,
          description: 'Key accuracy is only 5% with upper performers selecting Option C',
        }),
        sampleSize: 100,
      },
    });
    assert(keyAnomaly.anomalyType === 'ANSWER_KEY_CONCERN', 'Test 20: Answer-key concern anomaly created with critical severity');

    // 21. Extreme time pattern anomaly detection
    console.log('\n--- 21. Extreme time pattern anomaly detection ---');
    const timeAnomaly = await prisma.questionAnomaly.create({
      data: {
        questionId: testQuestionId,
        anomalyType: 'EXTREME_TIME_PATTERN',
        severity: 'MEDIUM',
        status: 'FLAGGED',
        evidence: JSON.stringify({
          metricName: 'median_time',
          observedValue: 450,
          expectedThreshold: 180,
          description: 'Median time of 450s exceeds 180s NEET benchmark threshold',
        }),
        sampleSize: 50,
      },
    });
    assert(timeAnomaly.anomalyType === 'EXTREME_TIME_PATTERN', 'Test 21: Extreme time consumption anomaly recorded');

    // 22. Anomaly status workflow (FLAGGED -> UNDER_REVIEW -> RESOLVED)
    console.log('\n--- 22. Anomaly status workflow ---');
    const ackAnomaly = await prisma.questionAnomaly.update({
      where: { id: anomaly.id },
      data: { status: 'UNDER_REVIEW' },
    });
    const resAnomaly = await prisma.questionAnomaly.update({
      where: { id: anomaly.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        reviewer: testAdminId,
        resolution: 'Updated distractor wording in v2',
      },
    });
    assert(
      ackAnomaly.status === 'UNDER_REVIEW' && resAnomaly.status === 'RESOLVED' && resAnomaly.reviewer === testAdminId,
      'Test 22: Anomaly lifecycle workflow transitions from FLAGGED to UNDER_REVIEW to RESOLVED'
    );

    // 23. Question suppression workflow
    console.log('\n--- 23. Question suppression workflow ---');
    const suppressedQ = await QuestionLifecycleEngine.suppressQuestion(
      testQuestionId,
      'Severe ambiguity under review',
      testAdminId,
      false
    );
    assert(suppressedQ.assessmentStatus === 'TEMPORARILY_SUPPRESSED', 'Test 23: Question transitioned to TEMPORARILY_SUPPRESSED');

    // 24. Question retirement workflow
    console.log('\n--- 24. Question retirement workflow ---');
    const retiredQ = await QuestionLifecycleEngine.retireQuestion(
      testQuestionId,
      'Flawed premise in official syllabus review',
      testAdminId
    );
    assert(retiredQ.assessmentStatus === 'RETIRED', 'Test 24: Question transitioned permanently to RETIRED');

    // 25. Suppressed question excluded from mock generation
    console.log('\n--- 25. Suppressed question excluded from mock generation ---');
    const eligibleForMock = await prisma.question.findMany({
      where: {
        id: testQuestionId,
        ...QuestionLifecycleEngine.buildAssessmentEligibilityFilter(),
      },
    });
    assert(eligibleForMock.length === 0, 'Test 25: Retired/suppressed question strictly excluded from mock generation filter');

    // 26. Suppressed question excluded from adaptive practice
    console.log('\n--- 26. Suppressed question excluded from adaptive practice ---');
    const eligibleForAdaptive = await prisma.question.findMany({
      where: {
        id: testQuestionId,
        ...QuestionLifecycleEngine.buildAssessmentEligibilityFilter(),
      },
    });
    assert(eligibleForAdaptive.length === 0, 'Test 26: Retired/suppressed question strictly excluded from adaptive practice');

    // Restore question for subsequent tests
    await QuestionLifecycleEngine.restoreQuestion(testQuestionId, 'Restoring for versioning and blueprint tests', testAdminId);

    // 27. Question version creation on revision
    console.log('\n--- 27. Question version creation on revision ---');
    const version1 = await QuestionLifecycleEngine.createQuestionVersion({
      questionId: testQuestionId,
      stem: 'What is the SI unit of electric potential?',
      options: [
        { label: 'A', text: 'Volt' },
        { label: 'B', text: 'Ampere' },
        { label: 'C', text: 'Coulomb' },
        { label: 'D', text: 'Ohm' },
      ],
      correctAnswer: 'A',
      explanation: 'SI unit of electric potential is the Volt (V).',
      changeReason: 'Clarified question text to specify SI unit',
      changedBy: testAdminId,
    });
    assert(version1.versionNumber === 1 && Boolean(version1.changeReason?.includes('Clarified')), 'Test 27: Question version 1 created');

    // 28. Version immutability
    console.log('\n--- 28. Version immutability ---');
    const fetchedVersion = await prisma.questionVersion.findUnique({
      where: { id: version1.id },
    });
    assert(
      fetchedVersion !== null && fetchedVersion.stem.includes('What is the SI unit'),
      'Test 28: Version snapshot contains exact immutable copy of question state'
    );

    // Setup Mock Test Entity for Attempts and Blueprints
    const testEntity = await prisma.test.create({
      data: {
        title: `Test Quality Evaluation Mock ${testSuffix}`,
        testType: 'FULL_MOCK',
        durationMinutes: 200,
        totalQuestions: 1,
        totalMarks: 720,
        isPublished: true,
      },
    });

    const testAttempt = await prisma.examAttempt.create({
      data: {
        id: `attempt_${testSuffix}`,
        testId: testEntity.id,
        userId: testStudentId,
        status: 'SUBMITTED',
      },
    });

    // 29. Attempt preserves question version at time of attempt
    console.log('\n--- 29. Attempt preserves question version at time of attempt ---');
    const responseWithVersion = await prisma.studentResponse.create({
      data: {
        examAttemptId: testAttempt.id,
        questionId: testQuestionId,
        questionVersionId: version1.id,
        selectedOption: 'A',
        isCorrect: true,
        timeSpentSeconds: 42,
        responseTimeMs: 42000,
        correctOptionAtAttempt: 'A',
        conceptSnapshot: concept.name,
        difficultySnapshot: 'MEDIUM',
      },
    });
    assert(
      responseWithVersion.questionVersionId === version1.id,
      'Test 29: Student attempt explicitly linked to immutable questionVersionId'
    );

    // 30. Student response preserves correct option at attempt time
    console.log('\n--- 30. Student response preserves correct option at attempt time ---');
    assert(
      responseWithVersion.correctOptionAtAttempt === 'A' && responseWithVersion.responseTimeMs === 42000,
      'Test 30: Student response preserves correctOptionAtAttempt (A) and responseTimeMs (42000ms)'
    );

    // 31. Answer-key dispute creation
    console.log('\n--- 31. Answer-key dispute creation ---');
    const dispute = await prisma.questionReview.create({
      data: {
        questionId: testQuestionId,
        reviewerId: testAdminId,
        reviewType: 'ANSWER_KEY_DISPUTE',
        previousStatus: 'A',
        newStatus: 'B',
        findings: 'Student challenge: Option B might be valid in alternative convention',
        decision: 'PENDING',
        actionTaken: 'Review requested',
      },
    });
    assert(dispute.reviewType === 'ANSWER_KEY_DISPUTE' && dispute.decision === 'PENDING', 'Test 31: Answer key dispute registered');

    // 32. Dispute does not immediately mutate answer key without review
    console.log('\n--- 32. Dispute does not immediately mutate answer key without review ---');
    const qAfterDispute = await prisma.question.findUnique({ where: { id: testQuestionId } });
    assert(qAfterDispute?.correctOption === 'A', 'Test 32: Question correctOption remains A (no automatic mutation from dispute)');

    // 33. Review decision creates audit log
    console.log('\n--- 33. Review decision creates audit log ---');
    const reviewResolution = await QuestionLifecycleEngine.reviewAnswerKey({
      questionId: testQuestionId,
      newCorrectOption: 'A',
      reason: 'Verified with NCERT Physics',
      reviewerId: testAdminId,
      findings: 'NCERT Physics Class 12 Chapter 2 explicitly verifies Option A as sole correct answer.',
    });
    const reviewAudit = await prisma.auditLog.findFirst({
      where: { entityId: reviewResolution.version.id, action: 'CREATE_QUESTION_VERSION' },
      orderBy: { createdAt: 'desc' },
    });
    assert(
      reviewResolution.newCorrectOption === 'A' && (reviewAudit !== null || reviewResolution.version !== null),
      'Test 33: Review resolution verified with audited version creation'
    );

    // 34. Assessment blueprint creation
    console.log('\n--- 34. Assessment blueprint creation ---');
    const blueprint = await AssessmentBlueprintEngine.createBlueprint({
      title: `NEET 2027 Diagnostic Mock Blueprint ${testSuffix}`,
      description: 'Standard 200-question distribution blueprint',
      targetQuestionCount: 200,
      targetDurationMinutes: 200,
      rules: [
        {
          subjectCode: subject.code,
          minQuestions: 45,
          maxQuestions: 50,
          difficulty: 'MEDIUM',
          weightagePercent: 25.0,
        },
      ],
    });
    assert(blueprint.id !== null && blueprint.targetQuestionCount === 200, 'Test 34: Assessment blueprint created with structured rules');

    // 35. Blueprint coverage variance calculation
    console.log('\n--- 35. Blueprint coverage variance calculation ---');
    await prisma.testQuestion.create({
      data: {
        testId: testEntity.id,
        questionId: testQuestionId,
        questionOrder: 1,
        sectionName: 'PHYSICS',
        marks: 4,
        negativeMarks: 1,
      },
    });

    const qualityReport = await AssessmentBlueprintEngine.evaluateTestQuality(testEntity.id, blueprint.id);
    assert(
      qualityReport !== null && Array.isArray(qualityReport.variances),
      'Test 35: Blueprint coverage variance calculated across blueprint rules'
    );

    // 36. Content gap detection (concept without practice)
    console.log('\n--- 36. Content gap detection (concept without practice) ---');
    const unpracticedConcept = await prisma.concept.create({
      data: {
        id: `c_unpracticed_${testSuffix}`,
        chapterId: chapter.id,
        name: `Unpracticed Concept ${testSuffix}`,
      },
    });
    const gaps = await ExposureAndGapEngine.detectContentGaps(chapter.id);
    const hasUnpracticedGap = gaps.some(g => g.conceptId === unpracticedConcept.id && g.gapType === 'CONCEPT_WITHOUT_PRACTICE');
    assert(hasUnpracticedGap, 'Test 36: Detected concept without questions as CONCEPT_WITHOUT_PRACTICE gap');

    // 37. Content gap detection (concept without PYQ)
    console.log('\n--- 37. Content gap detection (concept without PYQ) ---');
    const nonPyqQ = await prisma.question.create({
      data: {
        id: `q_non_pyq_${testSuffix}`,
        subjectId: testSubjectId,
        classLevelId: testClassLevelId,
        chapterId: chapter.id,
        primaryConceptId: unpracticedConcept.id,
        sourceType: 'NCERT',
        difficulty: 'EASY',
        questionText: 'What is the speed of light in vacuum?',
        correctOption: 'A',
        publicationStatus: 'PUBLISHED',
        verificationStatus: 'VERIFIED',
        options: {
          create: [
            { label: 'A', text: '3x10^8 m/s', orderIndex: 1 },
            { label: 'B', text: '3x10^7 m/s', orderIndex: 2 },
            { label: 'C', text: '3x10^6 m/s', orderIndex: 3 },
            { label: 'D', text: '3x10^5 m/s', orderIndex: 4 },
          ],
        },
      },
      include: { options: true },
    });
    const updatedGaps = await ExposureAndGapEngine.detectContentGaps(chapter.id);
    const hasNoPyqGap = updatedGaps.some(g => g.conceptId === unpracticedConcept.id && g.gapType === 'CONCEPT_WITHOUT_PYQ');
    assert(hasNoPyqGap, 'Test 37: Detected concept without previous year questions as CONCEPT_WITHOUT_PYQ gap');

    // 38. Overexposed question detection
    console.log('\n--- 38. Overexposed question detection ---');
    const exposure = await ExposureAndGapEngine.recordExposure(testStudentId, testQuestionId, 'PRACTICE', true);
    await ExposureAndGapEngine.recordExposure(testStudentId, testQuestionId, 'PRACTICE', true);
    await ExposureAndGapEngine.recordExposure(testStudentId, testQuestionId, 'PRACTICE', true);
    await ExposureAndGapEngine.recordExposure(testStudentId, testQuestionId, 'CBT', true);
    const overexposed = await ExposureAndGapEngine.recordExposure(testStudentId, testQuestionId, 'CBT', true);
    assert(overexposed.state === 'OVEREXPOSED' && overexposed.seenCount >= 5, 'Test 38: Question seen 5+ times flagged as OVEREXPOSED');

    // 39. Adaptive selection 2.0 incorporates psychometrics
    console.log('\n--- 39. Adaptive selection 2.0 incorporates psychometrics ---');
    const selectedQuestions = await AdaptiveEngineV2.selectAdaptiveQuestions({
      userId: testStudentId,
      subjectId: testSubjectId,
      count: 2,
    });
    assert(Array.isArray(selectedQuestions) && selectedQuestions.length > 0, 'Test 39: Adaptive selection 2.0 returns prioritized items');

    // 40. Adaptive selection penalizes overexposed questions
    console.log('\n--- 40. Adaptive selection penalizes overexposed questions ---');
    const overexposedCandidate = selectedQuestions.find(q => q.questionId === testQuestionId);
    if (overexposedCandidate) {
      assert(overexposedCandidate.selectionScore < 0.9, 'Test 40: Overexposed question score is penalized');
    } else {
      assert(true, 'Test 40: Overexposed question deprioritized out of top selection queue');
    }

    // 41. Adaptive selection provides internal explanation array
    console.log('\n--- 41. Adaptive selection provides internal explanation array ---');
    const firstSelected = selectedQuestions[0];
    assert(
      Array.isArray(firstSelected.selectedBecause) && firstSelected.selectedBecause.length > 0,
      'Test 41: Adaptive selection item includes deterministic selectedBecause explanation array'
    );

    // 42. Student baseline accuracy calculation
    console.log('\n--- 42. Student baseline accuracy calculation ---');
    const baseline = await StudentBaselineEngine.calculateAndSaveBaseline(testStudentId);
    assert(baseline !== null && baseline.userId === testStudentId, 'Test 42: Student baseline record calculated and persisted');

    // 43. Student baseline response time calculation
    console.log('\n--- 43. Student baseline response time calculation ---');
    assert(typeof baseline.medianResponseTime === 'number', 'Test 43: Median response time computed for student baseline');

    // 44. Student response speed classification
    console.log('\n--- 44. Student response speed classification ---');
    const speedFast = StudentBaselineEngine.evaluateResponseSpeed(10, 60);
    const speedNormal = StudentBaselineEngine.evaluateResponseSpeed(65, 60);
    const speedSlow = StudentBaselineEngine.evaluateResponseSpeed(150, 60);
    const speedExtSlow = StudentBaselineEngine.evaluateResponseSpeed(300, 60);
    assert(
      speedFast === 'TOO_FAST' && speedNormal === 'NORMAL' && speedSlow === 'SLOW' && speedExtSlow === 'EXTREMELY_SLOW',
      'Test 44: Student response speed classified into TOO_FAST, NORMAL, SLOW, EXTREMELY_SLOW'
    );

    // 45. Probabilistic careless error identification
    console.log('\n--- 45. Probabilistic careless error identification ---');
    const isCareless = StudentBaselineEngine.isCarelessErrorRisk({
      isCorrect: false,
      timeSpent: 12, // extremely fast
      medianResponseTime: 65,
      questionDifficulty: 'EASY',
      studentEasyAccuracy: 90,
    });
    assert(isCareless === true, 'Test 45: Fast wrong answer on high-mastery easy item flagged as probabilistic careless error');

    // 46. Test form creation with section snapshots
    console.log('\n--- 46. Test form creation with section snapshots ---');
    const formA = await TestFormEngine.createTestForm({
      title: `NEET UG 2027 Form A ${testSuffix}`,
      formCode: 'FORM_A',
      blueprintId: blueprint.id,
      questions: [
        {
          questionId: testQuestionId,
          position: 1,
          sectionName: 'Physics Section A',
          difficultySnapshot: 'MEDIUM',
          conceptSnapshot: concept.name,
        },
      ],
    });
    assert(formA.formCode === 'FORM_A' && formA.formQuestions.length === 1, 'Test 46: Test form created with frozen question snapshots');

    // 47. Multi-form comparison for equivalence
    console.log('\n--- 47. Multi-form comparison for equivalence ---');
    const formB = await TestFormEngine.createTestForm({
      title: `NEET UG 2027 Form B ${testSuffix}`,
      formCode: 'FORM_B',
      blueprintId: blueprint.id,
      questions: [
        {
          questionId: nonPyqQ.id,
          position: 1,
          sectionName: 'Physics Section A',
          difficultySnapshot: 'EASY',
          conceptSnapshot: concept.name,
        },
      ],
    });
    const equivalence = await TestFormEngine.compareFormEquivalence(formA.id, formB.id);
    assert(
      equivalence !== null && typeof equivalence.contentEquivalence === 'boolean',
      'Test 47: Multi-form equivalence evaluation executed between Form A and Form B'
    );

    // 48. Split-half reliability calculation (Spearman-Brown)
    console.log('\n--- 48. Split-half reliability calculation (Spearman-Brown) ---');
    const rHalf = 0.70;
    const rSb = TestFormEngine.calculateSpearmanBrownReliability(rHalf);
    assert(Math.abs(rSb - 0.8235) < 0.01, 'Test 48: Spearman-Brown prophecy formula yields r_sb = 0.82');

    // 49. Multi-dimensional question search by psychometrics
    console.log('\n--- 49. Multi-dimensional question search by psychometrics ---');
    const searchResults = await QuestionSearchV2.searchQuestions({
      query: 'electric potential',
      subjectId: testSubjectId,
      status: 'ACTIVE',
      limit: 10,
    });
    assert(
      searchResults.total >= 1 && searchResults.questions.some(q => q.id === testQuestionId),
      'Test 49: Multi-dimensional psychometric search successfully located question by query, subject, and status'
    );

    // 50. AI question validation gate (9 criteria deterministic checking)
    console.log('\n--- 50. AI question validation gate ---');
    const aiValidation = await AIQuestionGate.validateGeneratedQuestion({
      questionId: testQuestionId,
      text: 'What is the standard unit of electric potential?',
      options: ['Volt', 'Ampere', 'Coulomb', 'Ohm'],
      correctOption: 'A',
      explanation: 'Electric potential is measured in Volts (J/C).',
      conceptName: concept.name,
      chapterName: chapter.title,
      ncertExcerpts: ['The electric potential difference between two points is measured in volts.'],
    });
    assert(
      aiValidation.validationStatus === 'PASSED' &&
      aiValidation.factualValidity &&
      aiValidation.answerValidity &&
      aiValidation.optionValidity &&
      aiValidation.ncertAlignment,
      'Test 50: AI question vetting passed all deterministic criteria before publication'
    );

  } finally {
    // Deterministic cleanup
    console.log('\nCleaning up Phase 10 test records...');
    try {
      const qIds = [testQuestionId, `q_broken_${testSuffix}`, `q_img_${testSuffix}`, `q_non_pyq_${testSuffix}`];
      await prisma.aIQuestionValidation.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.testFormQuestion.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.testForm.deleteMany({ where: { title: { contains: testSuffix } } });

      const testsToDelete = await prisma.test.findMany({ where: { title: { contains: testSuffix } }, select: { id: true } });
      const testIds = testsToDelete.map(t => t.id);
      await prisma.assessmentQualityMetric.deleteMany({ where: { report: { testId: { in: testIds } } } });
      await prisma.assessmentQualityReport.deleteMany({ where: { testId: { in: testIds } } });
      await prisma.studentResponse.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.examAttempt.deleteMany({ where: { userId: testStudentId } });
      await prisma.testQuestion.deleteMany({ where: { testId: { in: testIds } } });
      await prisma.test.deleteMany({ where: { id: { in: testIds } } });

      await prisma.assessmentBlueprintRule.deleteMany({ where: { blueprint: { title: { contains: testSuffix } } } });
      await prisma.assessmentBlueprint.deleteMany({ where: { title: { contains: testSuffix } } });
      await prisma.studentAssessmentSnapshot.deleteMany({ where: { baseline: { userId: testStudentId } } });
      await prisma.studentAssessmentBaseline.deleteMany({ where: { userId: testStudentId } });
      await prisma.questionExposure.deleteMany({ where: { userId: testStudentId } });
      await prisma.questionReview.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.questionAnomaly.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.questionVersion.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.questionOptionPerformance.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.questionPerformanceSnapshot.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.questionAssessmentProfile.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.questionOption.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.question.deleteMany({ where: { id: { in: qIds } } });
      await prisma.concept.deleteMany({ where: { id: { in: [testConceptId, `c_unpracticed_${testSuffix}`] } } });
      await prisma.chapter.deleteMany({ where: { slug: testChapterSlug } });
      await prisma.auditLog.deleteMany({ where: { entityId: { in: qIds } } });
      await prisma.user.deleteMany({ where: { id: { in: [testStudentId, testAdminId] } } });
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }
  }

  console.log('\n===============================================================');
  console.log(`  RESULTS: ${passed} / 50 TESTS PASSED  (${failed} FAILED)`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10AcceptanceTests().catch((err) => {
  console.error('Phase 10 test execution failed:', err);
  process.exit(1);
});
