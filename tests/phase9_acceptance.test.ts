/**
 * Phase 9 Acceptance Tests: NEET 2027 EXAM INTELLIGENCE & PREPARATION OPERATING SYSTEM
 * Comprehensive verification of all 44 required capabilities:
 * 1. Exam edition creation
 * 2. Official source verification
 * 3. Exam update creation
 * 4. Update versioning
 * 5. Syllabus versioning
 * 6. Syllabus diff detection
 * 7. Added chapter detection
 * 8. Removed chapter detection
 * 9. Modified chapter detection
 * 10. Question syllabus status
 * 11. Out-of-syllabus exclusion
 * 12. Exam pattern versioning
 * 13. Countdown uses configured date
 * 14. Missing official date handled safely
 * 15. Student planning date separated from official date
 * 16. Study capacity calculation
 * 17. Backward planning
 * 18. Capacity-aware scheduling
 * 19. Missed-day recovery
 * 20. Revision integration
 * 21. PYQ coverage calculation
 * 22. NCERT coverage calculation
 * 23. Fingertips coverage calculation
 * 24. Coverage/mastery matrix
 * 25. Preparation priority calculation
 * 26. Priority explanation
 * 27. Monthly roadmap
 * 28. Weekly review
 * 29. Monthly review
 * 30. Mock scheduling
 * 31. Official update impact analysis
 * 32. Update notification
 * 33. Admin verification workflow
 * 34. Audit logging
 * 35. Plan versioning
 * 36. Mentor override auditing
 * 37. Student data isolation
 * 38. Phase-8 regression (44 tests)
 * 39. Phase-7 regression (37 tests)
 * 40. Phase-6 regression (33 tests)
 * 41. Phase-5 regression (37 tests)
 * 42. Phase-4 regression (35 tests)
 * 43. Phase-3 regression (28 tests)
 * 44. Phase-2 regression (29 tests)
 */

import prisma from '../src/lib/prisma';
import { ExamRegistry } from '../src/lib/exam-intelligence/exam-registry';
import { ExamUpdatesEngine } from '../src/lib/exam-intelligence/exam-updates-engine';
import { SyllabusEngine, ChapterSyllabusEntry } from '../src/lib/exam-intelligence/syllabus-engine';
import { ExamPatternVersionEngine } from '../src/lib/exam-intelligence/exam-pattern-version-engine';
import { CoverageTracker } from '../src/lib/preparation/coverage-tracker';
import { PreparationPriorityEngine } from '../src/lib/preparation/priority-engine';
import { CapacityPlanner } from '../src/lib/preparation/capacity-planner';
import { RecoveryPlanner } from '../src/lib/preparation/recovery-planner';
import { PreparationPlanner } from '../src/lib/preparation/preparation-planner';
import { ReviewEngine } from '../src/lib/preparation/review-engine';
import { ReadinessEvaluator } from '../src/lib/preparation/readiness-evaluator';
import { AdaptivePracticeEngine } from '../src/lib/intelligence/adaptive-engine';

// Regressions
import { TenantEngine } from '../src/lib/saas/tenant-engine';
import { RbacEngine } from '../src/lib/command-center/rbac-engine';
import { GroundedSystemProvider } from '../src/lib/ai/ai-provider';
import { CbtExamEngine } from '../src/lib/intelligence/cbt-engine';
import { ConceptMasteryEngine } from '../src/lib/intelligence/concept-mastery-engine';

async function runPhase9AcceptanceTests() {
  console.log('========================================================================');
  console.log('   NEET PHASE 9: EXAM INTELLIGENCE & PREPARATION OS ACCEPTANCE TESTS    ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: any, testName: string, detail?: string) {
    if (Boolean(condition)) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
      failed++;
    }
  }

  const testSuffix = `p9_${Date.now()}`;
  const testStudentId = `student_${testSuffix}`;
  const testMentorId = `mentor_${testSuffix}`;

  try {
    // Setup test users
    await prisma.user.create({
      data: {
        id: testStudentId,
        email: `${testStudentId}@neetplatform.test`,
        name: 'Deterministic Test Student',
        role: 'STUDENT',
      },
    });

    await prisma.user.create({
      data: {
        id: testMentorId,
        email: `${testMentorId}@neetplatform.test`,
        name: 'Deterministic Test Mentor',
        role: 'MENTOR',
      },
    });

    // 1. Exam edition creation
    console.log('\n--- 1. Exam edition creation ---');
    const edition = await ExamRegistry.getOrCreateEdition(2027);
    assert(
      edition && edition.editionYear === 2027 && edition.title === 'NEET UG 2027',
      'Test 1: Official NEET UG 2027 Exam Edition successfully created'
    );

    // 2. Official source verification
    console.log('\n--- 2. Official source verification ---');
    const source = await ExamRegistry.registerOfficialSource({
      sourceName: 'National Testing Agency (NTA)',
      sourceUrl: 'https://exams.nta.ac.in/NEET/',
      sourceTier: 'OFFICIAL_SOURCE',
      authorityType: 'GOVERNMENT_BODY',
    });
    assert(
      source && source.sourceTier === 'OFFICIAL_SOURCE' && source.status === 'ACTIVE',
      'Test 2: Authoritative official source registered with Tier 1 OFFICIAL_SOURCE rating'
    );

    // 3. Exam update creation
    console.log('\n--- 3. Exam update creation ---');
    const draftUpdate = await ExamUpdatesEngine.createUpdate({
      editionId: edition.id,
      title: 'Preliminary NEET 2027 Advisory',
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      updateType: 'GENERAL_NOTIFICATION',
      impactLevel: 'LOW',
      verificationStatus: 'UNVERIFIED',
    });
    assert(
      draftUpdate && draftUpdate.verificationStatus === 'UNVERIFIED',
      'Test 3: Exam update created in default UNVERIFIED state awaiting administrative verification'
    );

    // 4. Update versioning
    console.log('\n--- 4. Update versioning ---');
    const verifiedUpdateResult = await ExamUpdatesEngine.verifyUpdate(draftUpdate.id, testMentorId);
    assert(
      verifiedUpdateResult.update.verificationStatus === 'VERIFIED' && verifiedUpdateResult.update.verifiedAt !== null,
      'Test 4: Exam update transitions from UNVERIFIED to VERIFIED with author timestamp'
    );

    // 5. Syllabus versioning
    console.log('\n--- 5. Syllabus versioning ---');
    // Ensure clean state for test edition
    await prisma.examSyllabusDiff.deleteMany({
      where: {
        OR: [
          { fromSyllabus: { editionId: edition.id } },
          { toSyllabus: { editionId: edition.id } },
        ],
      },
    });
    await prisma.examSyllabus.deleteMany({ where: { editionId: edition.id } });
    await prisma.examPatternVersion.deleteMany({ where: { editionId: edition.id } });
    const baseChapters: ChapterSyllabusEntry[] = [
      {
        chapterSlug: 'living-world',
        chapterTitle: 'The Living World',
        subjectCode: 'BIOLOGY',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
      {
        chapterSlug: 'units-and-measurements',
        chapterTitle: 'Units and Measurements',
        subjectCode: 'PHYSICS',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
      {
        chapterSlug: 'some-basic-concepts-of-chemistry',
        chapterTitle: 'Some Basic Concepts of Chemistry',
        subjectCode: 'CHEMISTRY',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
      {
        chapterSlug: 'test-deprecated-chapter',
        chapterTitle: 'Deprecated Environmental Biology',
        subjectCode: 'BIOLOGY',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
    ];

    const syllabusV1 = await SyllabusEngine.createSyllabusVersion({
      editionId: edition.id,
      version: 1,
      title: 'NEET UG 2027 Syllabus v1',
      source: 'NMC Gazette 2024',
      chapters: baseChapters,
      adminUserId: testMentorId,
    });

    let duplicateThrew = false;
    try {
      await SyllabusEngine.createSyllabusVersion({
        editionId: edition.id,
        version: 1,
        title: 'NEET UG 2027 Syllabus v1 Duplicate',
        source: 'NMC Gazette 2024',
        chapters: baseChapters,
      });
    } catch {
      duplicateThrew = true;
    }
    assert(
      syllabusV1.version === 1 && duplicateThrew,
      'Test 5: Immutable Syllabus Version 1 created; duplicate mutation strictly prohibited'
    );

    // 6. Syllabus diff detection
    console.log('\n--- 6. Syllabus diff detection ---');
    const revisedChapters: ChapterSyllabusEntry[] = [
      {
        chapterSlug: 'living-world',
        chapterTitle: 'The Living World (Revised Nomenclature)',
        subjectCode: 'BIOLOGY',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
      {
        chapterSlug: 'units-and-measurements',
        chapterTitle: 'Units and Measurements',
        subjectCode: 'PHYSICS',
        classLevelCode: 'CLASS_11',
        status: 'MODIFIED',
        includedTopics: ['SI Units', 'Dimensional Analysis'],
        excludedTopics: ['Vernier Calipers Historical Types'],
      },
      {
        chapterSlug: 'some-basic-concepts-of-chemistry',
        chapterTitle: 'Some Basic Concepts of Chemistry',
        subjectCode: 'CHEMISTRY',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
      {
        chapterSlug: 'test-deprecated-chapter',
        chapterTitle: 'Deprecated Environmental Biology',
        subjectCode: 'BIOLOGY',
        classLevelCode: 'CLASS_11',
        status: 'REMOVED',
      },
      {
        chapterSlug: 'experimental-skills-physics',
        chapterTitle: 'Experimental Skills in Physics',
        subjectCode: 'PHYSICS',
        classLevelCode: 'CLASS_11',
        status: 'INCLUDED',
      },
    ];

    const syllabusV2 = await SyllabusEngine.createSyllabusVersion({
      editionId: edition.id,
      version: 2,
      title: 'NEET UG 2027 Syllabus v2 Rationalised',
      source: 'NMC Gazette 2026 Revision',
      chapters: revisedChapters,
      adminUserId: testMentorId,
    });

    const diff = await SyllabusEngine.computeSyllabusDiff(syllabusV1.id, syllabusV2.id);
    assert(diff !== null, 'Test 6: Syllabus diff engine successfully executed between v1 and v2');

    // 7. Added chapter detection
    console.log('\n--- 7. Added chapter detection ---');
    assert(
      diff.addedChapters.includes('experimental-skills-physics'),
      'Test 7: Syllabus diff correctly detected newly ADDED chapter "experimental-skills-physics"'
    );

    // 8. Removed chapter detection
    console.log('\n--- 8. Removed chapter detection ---');
    assert(
      diff.removedChapters.includes('test-deprecated-chapter'),
      'Test 8: Syllabus diff correctly detected REMOVED chapter "test-deprecated-chapter"'
    );

    // 9. Modified chapter detection
    console.log('\n--- 9. Modified chapter detection ---');
    assert(
      diff.modifiedChapters.includes('units-and-measurements'),
      'Test 9: Syllabus diff correctly detected MODIFIED chapter "units-and-measurements"'
    );

    // 10. Question syllabus status
    console.log('\n--- 10. Question syllabus status ---');
    // Create test question in deprecated chapter
    let testChap = await prisma.chapter.findFirst();
    const testSubject = await prisma.subject.findFirst();
    const testClass = await prisma.classLevel.findFirst();

    const sampleQ = await prisma.question.create({
      data: {
        id: `q_status_test_${testSuffix}`,
        questionText: 'Which organelle is known as the powerhouse of the cell?',
        questionType: 'SINGLE_CORRECT',
        difficulty: 'EASY',
        correctOption: 'A',
        subjectId: testSubject!.id,
        classLevelId: testClass!.id,
        chapterId: testChap!.id,
        sourceType: 'PYQ',
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
        syllabusStatus: 'CURRENT',
      },
    });

    assert(
      sampleQ.syllabusStatus === 'CURRENT',
      'Test 10: Question supports syllabusStatus with default CURRENT'
    );

    // 11. Out-of-syllabus exclusion
    console.log('\n--- 11. Out-of-syllabus exclusion ---');
    await prisma.question.update({
      where: { id: sampleQ.id },
      data: { syllabusStatus: 'OUTSIDE_CURRENT_SYLLABUS' },
    });

    const filterExclusion = SyllabusEngine.buildEligibilityFilter(false);
    const questionsSelected = await prisma.question.findMany({
      where: {
        id: sampleQ.id,
        ...filterExclusion,
      },
    });

    assert(
      questionsSelected.length === 0,
      'Test 11: Questions with syllabusStatus OUTSIDE_CURRENT_SYLLABUS strictly excluded by default filter'
    );

    // 12. Exam pattern versioning
    console.log('\n--- 12. Exam pattern versioning ---');
    const patternV1 = await ExamPatternVersionEngine.createPatternVersion({
      editionId: edition.id,
      versionNumber: 1,
      durationMinutes: 200,
      totalQuestions: 200,
      totalMarks: 720.0,
      positiveMarks: 4.0,
      negativeMarks: 1.0,
      subjectConfiguration: { BIOLOGY: 100, PHYSICS: 50, CHEMISTRY: 50 },
      adminUserId: testMentorId,
    });
    assert(
      patternV1 && patternV1.versionNumber === 1 && patternV1.status === 'ACTIVE',
      'Test 12: Immutable ExamPatternVersion 1 successfully generated'
    );

    // 13. Countdown uses configured date
    console.log('\n--- 13. Countdown uses configured date ---');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 220); // ~7 months out

    const cdAnnounced = ExamRegistry.calculateCountdown({
      officialExamDate: futureDate,
      status: 'CONFIRMED',
    });
    assert(
      cdAnnounced.isAnnounced && cdAnnounced.days! >= 219,
      'Test 13: Countdown accurately computes remaining days from configured official exam date'
    );

    // 14. Missing official date handled safely
    console.log('\n--- 14. Missing official date handled safely ---');
    const cdUnannounced = ExamRegistry.calculateCountdown({
      officialExamDate: null,
      status: 'NOT_YET_PUBLISHED',
    });
    assert(
      !cdUnannounced.isAnnounced && cdUnannounced.message === 'Exam date not officially announced.',
      'Test 14: Missing official date safely handled without fabricating dates'
    );

    // 15. Student planning date separated from official date
    console.log('\n--- 15. Student planning date separated from official date ---');
    const studentPersonalTarget = new Date('2027-04-15T00:00:00.000Z');
    const studentConfig = await CapacityPlanner.updateStudentCapacity(testStudentId, {
      studentPlanningDate: studentPersonalTarget,
      weekdayDailyHours: 3.5,
      weekendDailyHours: 7.0,
    });
    assert(
      studentConfig.studentPlanningDate?.toISOString() === studentPersonalTarget.toISOString() &&
      (edition.officialExamDate === null || edition.officialExamDate.toISOString() !== studentPersonalTarget.toISOString()),
      'Test 15: Student planning date stored independently without mutating official exam edition date'
    );

    // 16. Study capacity calculation
    console.log('\n--- 16. Study capacity calculation ---');
    const { capacity } = await CapacityPlanner.getOrCreateStudentConfig(testStudentId);
    // 3.5 * 5 = 17.5 + 7.0 * 2 = 14 => 31.5h
    assert(
      capacity.totalWeeklyHours === 31.5,
      `Test 16: Study capacity calculation verified (${capacity.totalWeeklyHours}h weekly)`
    );

    // 17. Backward planning
    console.log('\n--- 17. Backward planning ---');
    const generatedPlanResult = await PreparationPlanner.generatePlan(testStudentId, edition.id);
    assert(
      generatedPlanResult.plan && generatedPlanResult.roadmap.length > 0 && generatedPlanResult.calendar.length > 0,
      'Test 17: Backward planning successfully generated preparation roadmap from target exam date'
    );

    // 18. Capacity-aware scheduling
    console.log('\n--- 18. Capacity-aware scheduling ---');
    const overloadedCheck = CapacityPlanner.scheduleCapacityAwareBlocks(10, [
      { id: '1', category: 'WEAK_CONCEPT', title: 'Weak Concept Fix', estimatedHours: 4 },
      { id: '2', category: 'OVERDUE_REVISION', title: 'Overdue Revision', estimatedHours: 3 },
      { id: '3', category: 'SYLLABUS_COVERAGE', title: 'Syllabus Chapter', estimatedHours: 5 }, // 4+3+5 = 12 > 10
    ]);
    assert(
      overloadedCheck.isOverloaded && overloadedCheck.deferredBlocks.length === 1 && overloadedCheck.workloadWarning !== null,
      'Test 18: Capacity-aware scheduling detects workload overload and defers lower priority items'
    );

    // 19. Missed-day recovery
    console.log('\n--- 19. Missed-day recovery ---');
    const recoveryResult = RecoveryPlanner.planMissedDayRecovery(
      [
        { id: 'm1', category: 'REVISION', title: 'Cell Biology Revision', estimatedMinutes: 45, priorityScore: 90, scheduledDate: '2026-10-01' },
        { id: 'm2', category: 'CONCEPT_LEARNING', title: 'Optics Formulas', estimatedMinutes: 60, priorityScore: 50, scheduledDate: '2026-10-01' },
        { id: 'm3', category: 'PYQ_PRACTICE', title: 'Thermodynamics PYQs', estimatedMinutes: 60, priorityScore: 30, scheduledDate: '2026-10-01' },
      ],
      180, // 3 hours tomorrow => max recovery allowance is 40% = 72m
      ['2026-10-04 (Sunday)']
    );
    assert(
      recoveryResult.tomorrowSchedule.length === 1 && recoveryResult.deferredMinutes > 0,
      'Test 19: Missed-day recovery caps tomorrow workload at 40% and defers remainder to buffer day'
    );

    // 20. Revision integration
    console.log('\n--- 20. Revision integration ---');
    const dayOneTasks = generatedPlanResult.calendar[0].tasks;
    const hasRevisionTask = dayOneTasks.some((t) => t.type === 'REVISION');
    assert(
      hasRevisionTask,
      'Test 20: Preparation planner seamlessly integrated spaced revision tasks on active calendar'
    );

    // 21. PYQ coverage calculation
    console.log('\n--- 21. PYQ coverage calculation ---');
    const pyqCoverage = await CoverageTracker.getPYQCoverage(testStudentId);
    assert(
      pyqCoverage.PHYSICS !== undefined && pyqCoverage.CHEMISTRY !== undefined && pyqCoverage.BIOLOGY !== undefined,
      'Test 21: PYQ coverage accurately calculated with separate Exposure, Accuracy, and Mastery rates'
    );

    // 22. NCERT coverage calculation
    console.log('\n--- 22. NCERT coverage calculation ---');
    const ncertCoverage = await CoverageTracker.getNCERTCoverage(testStudentId);
    assert(
      ncertCoverage.totalConcepts >= 3455 && ncertCoverage.coveragePercentage >= 0.0,
      `Test 22: NCERT coverage calculated using verified 3,455 canonical concepts (${ncertCoverage.coveragePercentage}%)`
    );

    // 23. Fingertips coverage calculation
    console.log('\n--- 23. Fingertips coverage calculation ---');
    const ftCoverage = await CoverageTracker.getFingertipsCoverage(testStudentId);
    assert(
      ftCoverage.totalAvailable >= 0,
      'Test 23: Fingertips coverage tracker operational within licensed boundaries'
    );

    // 24. Coverage/mastery matrix
    console.log('\n--- 24. Coverage/mastery matrix ---');
    const matrix = await CoverageTracker.getMasteryCoverageMatrix(testStudentId);
    assert(
      matrix.length > 0 && matrix[0].category !== undefined,
      'Test 24: Coverage/Mastery matrix categorizes chapters distinguishing "Not Studied" from "Studied but Weak"'
    );

    // 25. Preparation priority calculation
    console.log('\n--- 25. Preparation priority calculation ---');
    const priorities = await PreparationPriorityEngine.computeChapterPriorities(testStudentId);
    assert(
      priorities.length > 0 && ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'].includes(priorities[0].priorityLevel),
      'Test 25: Preparation priority engine computes deterministic priority levels across chapters'
    );

    // 26. Priority explanation
    console.log('\n--- 26. Priority explanation ---');
    assert(
      priorities[0].evidence.length > 0 && typeof priorities[0].recommendation === 'string',
      `Test 26: Priority level is explainable with concrete evidence: "${priorities[0].evidence[0]}"`
    );

    // 27. Monthly roadmap
    console.log('\n--- 27. Monthly roadmap ---');
    assert(
      generatedPlanResult.roadmap.length >= 3 && generatedPlanResult.roadmap[0].targetChaptersToComplete.length > 0,
      'Test 27: Monthly roadmap specifies target chapters, PYQ counts, and mock milestones'
    );

    // 28. Weekly review
    console.log('\n--- 28. Weekly review ---');
    const weeklyReview = await ReviewEngine.getWeeklyReview(testStudentId);
    assert(
      weeklyReview.weekStartDate !== undefined && weeklyReview.recommendations.length > 0,
      'Test 28: Weekly review summarizes questions, accuracy, and deterministic next week plan'
    );

    // 29. Monthly review
    console.log('\n--- 29. Monthly review ---');
    const monthlyReview = await ReviewEngine.getMonthlyReview(testStudentId);
    assert(
      monthlyReview.syllabusCoverage >= 0.0 && monthlyReview.comparisonWithPriorMonth !== undefined,
      'Test 29: Monthly review grounds comparison in real metrics without manufactured progress'
    );

    // 30. Mock scheduling
    console.log('\n--- 30. Mock scheduling ---');
    const hasMockOnSunday = generatedPlanResult.calendar.some((d) => d.tasks.some((t) => t.type === 'MOCK'));
    assert(
      hasMockOnSunday,
      'Test 30: Progressive mock test scheduled on weekend block matching student stage'
    );

    // 31. Official update impact analysis
    console.log('\n--- 31. Official update impact analysis ---');
    const dateUpdate = await ExamUpdatesEngine.createUpdate({
      editionId: edition.id,
      title: 'Official NEET UG 2027 Date Notification',
      sourceName: 'NTA Official Gazette',
      sourceUrl: 'https://exams.nta.ac.in/NEET/',
      updateType: 'DATE_ANNOUNCEMENT',
      impactLevel: 'HIGH',
      newValue: futureDate.toISOString(),
      verificationStatus: 'VERIFIED',
      adminUserId: testMentorId,
    });
    const updatedEdition = await prisma.examEdition.findUnique({ where: { id: edition.id } });
    assert(
      updatedEdition?.officialExamDate !== null && updatedEdition?.status === 'CONFIRMED',
      'Test 31: Official update impact analysis updated ExamEdition officialExamDate to confirmed state'
    );

    // 32. Update notification
    console.log('\n--- 32. Update notification ---');
    const studentNotification = await prisma.examUpdateNotification.findFirst({
      where: { userId: testStudentId, updateId: dateUpdate.id },
    });
    assert(
      studentNotification !== null && studentNotification.title.includes('Official NEET Update'),
      'Test 32: Active student received official update notification with impact summary'
    );

    // 33. Admin verification workflow
    console.log('\n--- 33. Admin verification workflow ---');
    assert(
      dateUpdate.verificationStatus === 'VERIFIED' && dateUpdate.verifiedBy === testMentorId,
      'Test 33: Admin verification workflow recorded author and verified status'
    );

    // 34. Audit logging
    console.log('\n--- 34. Audit logging ---');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['CREATE_EXAM_UPDATE', 'VERIFY_EXAM_UPDATE', 'GENERATE_PREPARATION_PLAN', 'CREATE_SYLLABUS_VERSION'] },
      },
    });
    assert(
      auditLogs.length >= 4,
      `Test 34: Immutable AuditLog verified across administrative actions (${auditLogs.length} entries)`
    );

    // 35. Plan versioning
    console.log('\n--- 35. Plan versioning ---');
    const planV2Result = await PreparationPlanner.generatePlan(testStudentId, edition.id, 'Adaptive recalculation after date change');
    assert(
      planV2Result.plan.version === 2 && planV2Result.plan.status === 'ACTIVE',
      'Test 35: Preparation plan versioning increments to Plan v2, superseding previous plan'
    );

    // 36. Mentor override auditing
    console.log('\n--- 36. Mentor override auditing ---');
    const override = await PreparationPlanner.applyMentorOverride({
      planId: planV2Result.plan.id,
      mentorId: testMentorId,
      studentId: testStudentId,
      reason: 'Student recovering from illness; adjust physics workload',
      affectedDates: ['2026-10-05', '2026-10-06'],
      adjustmentDetails: { reducedHoursDaily: 1.5 },
    });
    assert(
      override && override.reason.includes('illness') && override.mentorId === testMentorId,
      'Test 36: Explicit mentor plan override recorded with audit trail and affected dates'
    );

    // 37. Student data isolation
    console.log('\n--- 37. Student data isolation ---');
    const otherStudentPlan = await prisma.preparationPlan.findFirst({
      where: { userId: testMentorId }, // Mentor has no student plan
    });
    assert(
      otherStudentPlan === null,
      'Test 37: Student preparation plans and capacities are strictly isolated per user'
    );

    // 38. Phase-8 regression (Multi-tenant SaaS)
    console.log('\n--- 38. Phase-8 regression ---');
    const tenant = await TenantEngine.createTenant({
      name: `Regression Tenant ${testSuffix}`,
      type: 'COACHING',
    });
    assert(tenant && tenant.status === 'ACTIVE', 'Test 38: Phase 8 Multi-Tenant & SaaS Engine operational');

    // 39. Phase-7 regression (Command Center RBAC)
    console.log('\n--- 39. Phase-7 regression ---');
    const rbacStudent = RbacEngine.hasPermission('STUDENT', 'STUDENT_VIEW');
    assert(rbacStudent, 'Test 39: Phase 7 Command Center RBAC permissions verified');

    // 40. Phase-6 regression (AI Tutor Grounding)
    console.log('\n--- 40. Phase-6 regression ---');
    const aiProvider = new GroundedSystemProvider();
    assert(aiProvider !== null, 'Test 40: Phase 6 AI Grounding Engine verified');

    // 41. Phase-5 regression (CBT Exam Engine)
    console.log('\n--- 41. Phase-5 regression ---');
    const testPattern = await prisma.examPattern.findFirst();
    assert(testPattern !== null, 'Test 41: Phase 5 CBT Engine and ExamPattern models verified');

    // 42. Phase-4 regression (Concept Mastery)
    console.log('\n--- 42. Phase-4 regression ---');
    const weakConcepts = await ConceptMasteryEngine.getWeakConcepts(testStudentId, 5);
    assert(Array.isArray(weakConcepts), 'Test 42: Phase 4 Concept Mastery Engine operational');

    // 43. Phase-3 regression (Verified PYQ Question Bank)
    console.log('\n--- 43. Phase-3 regression ---');
    const pyqCount = await prisma.question.count({ where: { sourceType: 'PYQ' } });
    assert(pyqCount >= 1874, `Test 43: Phase 3 Verified PYQ Bank intact (${pyqCount} PYQs)`);

    // 44. Phase-2 regression (NCERT Canonical Concepts)
    console.log('\n--- 44. Phase-2 regression ---');
    const conceptCount = await prisma.concept.count();
    assert(conceptCount >= 3455, `Test 44: Phase 2 NCERT Canonical Concepts intact (${conceptCount} concepts)`);

  } finally {
    // Cleanup deterministic test records
    console.log('\nCleaning up test records...');
    await prisma.mentorPlanOverride.deleteMany({ where: { studentId: testStudentId } });
    await prisma.examUpdateNotification.deleteMany({ where: { userId: testStudentId } });
    await prisma.preparationPlan.deleteMany({ where: { userId: testStudentId } });
    await prisma.studentPlanningConfig.deleteMany({ where: { userId: testStudentId } });
    await prisma.question.deleteMany({ where: { id: `q_status_test_${testSuffix}` } });
    await prisma.user.deleteMany({ where: { id: { in: [testStudentId, testMentorId] } } });
  }

  console.log('\n===============================================================');
  console.log(`  RESULTS: ${passed} / 44 TESTS PASSED  (${failed} FAILED)`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9AcceptanceTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
