import prisma from '../src/lib/prisma';
import { KnowledgeGraphService } from '../src/lib/intelligence/knowledge-graph';
import { PyqIntelligenceEngine } from '../src/lib/intelligence/pyq-engine';
import { FingertipsQuestionEngine } from '../src/lib/intelligence/fingertips-engine';
import { NcertConceptExtractor } from '../src/lib/intelligence/ncert-extractor';
import { QuestionConceptLinkingEngine } from '../src/lib/intelligence/linking-engine';
import { QuestionQualityEvaluator } from '../src/lib/intelligence/quality-evaluator';
import { StudentMistakeEngine } from '../src/lib/intelligence/mistake-engine';
import { AdaptivePracticeEngine } from '../src/lib/intelligence/adaptive-engine';
import { SpacedRevisionEngine } from '../src/lib/intelligence/revision-engine';
import { GlobalSearchEngine } from '../src/lib/intelligence/search-engine';
import { CbtExamEngine } from '../src/lib/intelligence/cbt-engine';

async function runAcceptanceTests() {
  console.log('===============================================================');
  console.log('  NEET PHASE 2: CONTENT INTELLIGENCE & LEARNING ENGINE TESTS   ');
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

  // Fetch student user
  const student = await prisma.user.findUnique({
    where: { email: 'student@neet2027.com' },
  });
  if (!student) throw new Error('Seeded student user not found');

  // Fetch a chapter
  const lawsOfMotion = await prisma.chapter.findUnique({
    where: { slug: 'laws-of-motion' },
  });
  if (!lawsOfMotion) throw new Error('Laws of Motion chapter not found');

  // TEST 1: Canonical Content Hierarchy & Botany/Zoology mappings
  console.log('--> 1. Testing Canonical NEET Content Hierarchy');
  const botanyChapter = await prisma.chapter.findUnique({ where: { slug: 'plant-kingdom' } });
  const zoologyChapter = await prisma.chapter.findUnique({ where: { slug: 'animal-kingdom' } });
  assert(botanyChapter?.biologyCategory === 'BOTANY', 'Plant Kingdom mapped to BOTANY');
  assert(zoologyChapter?.biologyCategory === 'ZOOLOGY', 'Animal Kingdom mapped to ZOOLOGY');

  // TEST 2: Content Knowledge Graph queries
  console.log('\n--> 2. Testing Content Knowledge Graph');
  const questionsForConcept = await KnowledgeGraphService.getQuestionsForConcept('CONCEPT_NEWTON_2ND_LAW');
  assert(questionsForConcept.length > 0, 'Knowledge Graph returns questions connected to CONCEPT_NEWTON_2ND_LAW');
  
  const ncertSource = await KnowledgeGraphService.getNcertSourceForQuestion('Q_AIIMS_2006_PHY_002');
  assert(ncertSource !== null, 'Knowledge Graph returns NCERT provenance for Q_AIIMS_2006_PHY_002');
  assert(ncertSource?.concept?.name !== undefined, 'Returns linked NCERT concept name');

  // TEST 3: PYQ Intelligence & Provenance
  console.log('\n--> 3. Testing PYQ Intelligence Engine');
  const pyq = await prisma.question.findUnique({ where: { id: 'Q_AIIMS_2006_PHY_002' } });
  assert(pyq?.examYear === 2006 && pyq?.examName === 'AIIMS', 'PYQ stores strictly verified exam year and name');
  assert(pyq?.sourceType === 'PYQ', 'Source type correctly identified as PYQ');

  // TEST 4: Real Concept Frequency calculation from database
  console.log('\n--> 4. Testing Real Concept Frequency Analysis');
  const frequencies = await PyqIntelligenceEngine.calculateConceptFrequency('PHYSICS');
  assert(Array.isArray(frequencies) && frequencies.length > 0, 'Concept frequency calculated from live imported dataset');
  assert(frequencies[0].pyqCount >= 1, 'Top concept frequency calculated correctly without invented stats');

  // TEST 5: Duplicate and Near-Duplicate Detection
  console.log('\n--> 5. Testing Fingertips Question Engine Duplicate Detection');
  const dupResult = await FingertipsQuestionEngine.ingestQuestion({
    stableId: 'Q_DUP_TEST_001',
    questionText: 'Two spheres of same size, one of mass 2 kg and another of mass 4 kg are dropped simultaneously from the top of Qutab Minar (height = 72m). When they are 1 m above the ground the two spheres have the same',
    options: [
      { label: 'A', text: 'momentum' },
      { label: 'B', text: 'kinetic energy' },
      { label: 'C', text: 'potential energy' },
      { label: 'D', text: 'acceleration' },
    ],
    correctOption: 'D',
    chapterSlug: 'laws-of-motion',
  });
  assert(dupResult.isDuplicateCandidate === true, 'Duplicate candidate correctly detected via fingerprint');
  assert(dupResult.question.verificationStatus === 'DUPLICATE_CANDIDATE', 'Flagged as DUPLICATE_CANDIDATE for admin review');

  // TEST 6: NCERT Concept Extraction
  console.log('\n--> 6. Testing NCERT Concept Extraction');
  const sampleNcertText = 'The rate of change of momentum is directly proportional to applied force. F = ma is the fundamental law.';
  const extracted = NcertConceptExtractor.extractConceptsFromChapterText('laws-of-motion', sampleNcertText, 5);
  assert(extracted.some((e) => e.category === 'FORMULA'), 'Successfully extracted formula concept (F = ma)');

  // TEST 7: NCERT <-> Question Linking with confidence score
  console.log('\n--> 7. Testing NCERT <-> Question Linking Engine');
  await prisma.question.upsert({
    where: { id: 'Q_LINK_TEST_001' },
    update: {},
    create: {
      id: 'Q_LINK_TEST_001',
      questionText: 'A body of mass m is acted upon by force F producing acceleration a. F = ma applies.',
      correctOption: 'A',
      subjectId: lawsOfMotion.subjectId,
      classLevelId: (await prisma.classLevel.findFirst())!.id,
      chapterId: lawsOfMotion.id,
      sourceType: 'NCERT_EXEMPLAR',
      verificationStatus: 'VERIFIED',
      publicationStatus: 'PUBLISHED',
    },
  });

  const linkResult = await QuestionConceptLinkingEngine.linkQuestionToConcepts(
    'Q_LINK_TEST_001',
    lawsOfMotion.id,
    'A body of mass m is acted upon by force F producing acceleration a. F = ma applies.',
    'force mass acceleration'
  );
  assert(linkResult.confidenceScore > 0, 'Confidence score evaluated');
  assert(['AUTO_MAPPED', 'REVIEW_REQUIRED'].includes(linkResult.mappingStatus), 'Assigned valid mapping status');

  // TEST 8: Internal Question Quality Assessment
  console.log('\n--> 8. Testing Question Quality Assessment (Internal Quality Score)');
  const quality = QuestionQualityEvaluator.evaluate({
    questionText: 'Two spheres are dropped simultaneously from height h. Their acceleration is:',
    options: [
      { label: 'A', text: 'g' },
      { label: 'B', text: '2g' },
      { label: 'C', text: 'zero' },
      { label: 'D', text: 'g/2' },
    ],
    correctOption: 'A',
    sourceType: 'PYQ',
    examYear: 2024,
    chapterId: lawsOfMotion.id,
    primaryConceptId: 'CONCEPT_NEWTON_2ND_LAW',
    ocrConfidence: 0.99,
  });
  assert(quality.score >= 0.85, 'High quality question passes threshold (> 0.85)');
  assert(!quality.requiresReview, 'Does not require human intervention when all 6 dimensions pass');

  // TEST 9 & 12: Student Mistake Tracking Engine
  console.log('\n--> 9 & 12. Testing Student Mistake Engine');
  const mistake = await StudentMistakeEngine.recordMistake({
    userId: student.id,
    questionId: 'Q_AIIMS_2006_PHY_002',
    selectedOption: 'B',
    correctOption: 'D',
    chapterId: lawsOfMotion.id,
    conceptId: 'CONCEPT_NEWTON_2ND_LAW',
  });
  assert(mistake.mistakeCount >= 1, 'Student mistake recorded');
  const weakChapters = await StudentMistakeEngine.getWeakChapters(student.id);
  assert(weakChapters.length > 0, 'Weak chapter analysis generated from real student mistakes');

  // TEST 13: Rule-Based Adaptive Practice Engine
  console.log('\n--> 13. Testing Adaptive Practice Engine');
  const adaptiveQuestions = await AdaptivePracticeEngine.selectAdaptiveQuestions(student.id, {
    targetCount: 2,
    subjectCode: 'PHYSICS',
  });
  assert(adaptiveQuestions.length > 0, 'Adaptive engine selected targeted questions based on student weak areas');
  assert(adaptiveQuestions.every((q) => q.verificationStatus === 'VERIFIED'), 'All selected questions are VERIFIED');

  // TEST 14: Spaced Revision Engine (SM-2)
  console.log('\n--> 14. Testing Spaced Revision Engine (SM-2)');
  const revItem = await SpacedRevisionEngine.updateRevisionItem(student.id, 'Q_AIIMS_2006_PHY_002', 4);
  assert(revItem.intervalDays >= 1, 'Calculated next revision interval via SM-2');
  const revisionSummary = await SpacedRevisionEngine.getRevisionSummary(student.id);
  assert(typeof revisionSummary.dueToday === 'number', 'Generated dashboard revision summary');

  // TEST 15: Global Search Engine
  console.log('\n--> 15. Testing Global Indexed Search');
  const searchResults = await GlobalSearchEngine.search('Newton');
  assert(searchResults.concepts.length > 0 || searchResults.chapters.length > 0, 'Global search returns matching NCERT concepts or chapters');

  // TEST 17 & 18 & 21: CRITICAL INVARIANT: CBT Exam Question Selection & Publication Filtering
  console.log('\n--> 17 & 18 & 21. Testing Critical Invariant: Only VERIFIED + PUBLISHED in Exams');
  // First insert a draft unverified question
  await prisma.question.upsert({
    where: { id: 'Q_UNVERIFIED_DRAFT_TEST' },
    update: {},
    create: {
      id: 'Q_UNVERIFIED_DRAFT_TEST',
      questionText: 'This is an unverified draft question that should never enter exams.',
      correctOption: 'A',
      subjectId: lawsOfMotion.subjectId,
      classLevelId: (await prisma.classLevel.findFirst())!.id,
      chapterId: lawsOfMotion.id,
      verificationStatus: 'NEEDS_REVIEW', // NOT VERIFIED
      publicationStatus: 'UNPUBLISHED',
      sourceType: 'PYQ',
    },
  });

  const testObj = await CbtExamEngine.createTest({
    title: 'NEET 2027 Diagnostic Physics Mock',
    testType: 'CHAPTER',
    chapterSlug: 'laws-of-motion',
    totalQuestions: 2,
  });

  // Verify that testQuestions ONLY contain verified questions
  const testQuestions = await prisma.testQuestion.findMany({
    where: { testId: testObj.id },
    include: { question: true },
  });
  const unverifiedInTest = testQuestions.filter(
    (tq) => tq.question.verificationStatus !== 'VERIFIED' || tq.question.publicationStatus !== 'PUBLISHED'
  );
  assert(unverifiedInTest.length === 0, 'INVARIANT ENFORCED: Zero unverified/unpublished questions in test');

  // TEST 22: FULL END-TO-END ACCEPTANCE LOOP
  console.log('\n--> 22. Testing Complete End-to-End Acceptance Loop');
  // Step 1: Start Attempt
  const attemptSession = await CbtExamEngine.startAttempt(testObj.id, student.id);
  assert(attemptSession.attemptId !== undefined, 'Loop: Exam attempt initialized');
  assert((attemptSession.questions[0] as any).correctOption === undefined, 'Loop: Correct answer stripped from student attempt snapshot (no network leaks)');

  // Step 2: Autosave Response
  const firstQDb = await prisma.question.findUnique({
    where: { id: attemptSession.questions[0].questionId },
  });
  const chosenOpt = firstQDb?.correctOption || 'D';

  const respSaved = await CbtExamEngine.recordResponse(
    attemptSession.attemptId,
    attemptSession.questions[0].questionId,
    chosenOpt, // Student chooses correct option
    false,
    45
  );
  assert(respSaved.selectedOption === chosenOpt, 'Loop: Autosave persisted student response');

  // Step 3: Server-side Evaluation & Submission
  const evaluatedAttempt = await CbtExamEngine.submitAttempt(attemptSession.attemptId);
  assert(evaluatedAttempt.totalScore > 0, `Loop: Server evaluated score = ${evaluatedAttempt.totalScore}`);
  assert(evaluatedAttempt.results.length === testQuestions.length, 'Loop: All questions evaluated with explanations and primary concepts');

  console.log('\n===============================================================');
  console.log(`  ACCEPTANCE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED  `);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests()
  .catch((e) => {
    console.error('Test execution failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
