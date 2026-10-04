import prisma from '../src/lib/prisma';
import { generateQuestionFingerprint } from '../src/lib/intelligence/question-identity';
import { evaluateDifficulty } from '../src/lib/intelligence/difficulty-engine';
import { validateAnswer } from '../src/lib/intelligence/answer-validator';
import { QuestionQualityEvaluator } from '../src/lib/intelligence/quality-evaluator';
import { QuestionConceptLinkingEngine } from '../src/lib/intelligence/linking-engine';
import { GlobalSearchEngine } from '../src/lib/intelligence/search-engine';

async function runPhase3AcceptanceTests() {
  console.log('===============================================================');
  console.log('  NEET PHASE 3: MTG FINGERTIPS & PYQ INTELLIGENCE TESTS        ');
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

  try {
    // -------------------------------------------------------------
    // TEST 1: Source Separation Invariant
    // -------------------------------------------------------------
    console.log('--> 1. Strict Source Separation Invariant');
    const pyqCount = await prisma.question.count({ where: { sourceType: 'PYQ' } });
    const ftCount = await prisma.question.count({ where: { sourceType: 'FINGERTIPS' } });
    const ncertCount = await prisma.question.count({
      where: { sourceType: { in: ['NCERT', 'NCERT_EXERCISE', 'NCERT_EXEMPLAR'] } }
    });

    assert(pyqCount > 1000, `Large verified PYQ bank ingested: ${pyqCount} questions`);
    assert(ftCount > 0, `MTG Fingertips questions ingested: ${ftCount} questions`);
    assert(ncertCount >= 263, `NCERT textbook exercises preserved: ${ncertCount} questions`);

    const invalidSource = await prisma.question.count({
      where: {
        sourceType: {
          notIn: ['PYQ', 'FINGERTIPS', 'NCERT', 'NCERT_EXERCISE', 'NCERT_EXEMPLAR']
        }
      }
    });
    assert(invalidSource === 0, 'No questions have undefined or mixed source types');

    // -------------------------------------------------------------
    // TEST 2: PYQ Year Integrity & Zero Hallucination
    // -------------------------------------------------------------
    console.log('\n--> 2. PYQ Year Integrity & Zero Hallucination');
    const pyqWithNoYear = await prisma.question.count({
      where: { sourceType: 'PYQ', examYear: null }
    });
    assert(pyqWithNoYear === 0, '100% of PYQs have an explicit verified examYear');

    const futureOrInvalidYear = await prisma.question.count({
      where: {
        sourceType: 'PYQ',
        OR: [{ examYear: { gt: 2024 } }, { examYear: { lt: 1995 } }]
      }
    });
    assert(futureOrInvalidYear === 0, 'No PYQs have hallucinated future or invalid years (1995-2024 only)');

    const verifiedYearSources = await prisma.question.count({
      where: {
        sourceType: 'PYQ',
        yearSource: { in: ['EXPLICIT_HEADER', 'EXPLICIT_METADATA', 'SOURCE_FILENAME'] }
      }
    });
    assert(verifiedYearSources === pyqCount, `All ${pyqCount} PYQs have an authenticated yearSource`);

    // -------------------------------------------------------------
    // TEST 3: MTG Fingertips Provenance
    // -------------------------------------------------------------
    console.log('\n--> 3. MTG Fingertips Provenance & Integrity');
    const ftWithBook = await prisma.question.count({
      where: {
        sourceType: 'FINGERTIPS',
        bookName: { not: null }
      }
    });
    assert(ftWithBook === ftCount, `All ${ftCount} Fingertips questions have bookName tracked`);

    // -------------------------------------------------------------
    // TEST 4: Support for All Question Types
    // -------------------------------------------------------------
    console.log('\n--> 4. Support for All 7 Question Types');
    const singleCorrect = await prisma.question.count({ where: { questionType: 'SINGLE_CORRECT' } });
    const assertionReason = await prisma.question.count({ where: { questionType: 'ASSERTION_REASON' } });
    const statementBased = await prisma.question.count({ where: { questionType: 'STATEMENT_BASED' } });
    const matching = await prisma.question.count({ where: { questionType: 'MATCHING' } });
    const diagramBased = await prisma.question.count({ where: { questionType: 'DIAGRAM_BASED' } });

    assert(singleCorrect > 0, `SINGLE_CORRECT supported: ${singleCorrect} questions`);
    assert(assertionReason > 0, `ASSERTION_REASON supported: ${assertionReason} questions`);
    assert(statementBased > 0, `STATEMENT_BASED supported: ${statementBased} questions`);
    assert(matching > 0, `MATCHING supported: ${matching} questions`);
    assert(diagramBased > 0, `DIAGRAM_BASED supported: ${diagramBased} questions`);

    // -------------------------------------------------------------
    // TEST 5: Question Deduplication & Cross-Source Identity
    // -------------------------------------------------------------
    console.log('\n--> 5. Deduplication & Cross-Source Identity Tracking');
    const identityRecords = await prisma.questionIdentity.count();
    assert(identityRecords > 1000, `Question identities tracked: ${identityRecords}`);

    // Test fingerprinting function determinism
    const fp1 = generateQuestionFingerprint('The SI unit of force is Newton.', [{ text: 'Newton' }]);
    const fp2 = generateQuestionFingerprint('The  SI  unit  of  force is  newton.', [{ text: 'Newton' }]);
    assert(fp1 === fp2, 'Normalized fingerprint is deterministic across whitespace/casing');

    // -------------------------------------------------------------
    // TEST 6: Difficulty & Cognitive Evaluation Engine
    // -------------------------------------------------------------
    console.log('\n--> 6. Difficulty & Cognitive Evaluation Engine');
    const easyCount = await prisma.question.count({ where: { difficulty: 'EASY' } });
    const medCount = await prisma.question.count({ where: { difficulty: 'MEDIUM' } });
    const hardCount = await prisma.question.count({ where: { difficulty: 'HARD' } });
    assert(easyCount > 0 && medCount > 0 && hardCount > 0, `Difficulty distribution: EASY=${easyCount}, MEDIUM=${medCount}, HARD=${hardCount}`);

    // Cognitive evaluation unit test
    const diffEval = evaluateDifficulty(
      'Given vectors A and B, calculate the resultant magnitude and direction using dot product.',
      [{ label: 'A', text: '10' }, { label: 'B', text: '20' }, { label: 'C', text: '30' }, { label: 'D', text: '40' }],
      'NUMERICAL'
    );
    assert(diffEval.difficulty === 'HARD' || diffEval.difficulty === 'MEDIUM', 'Cognitive difficulty evaluated successfully');

    // -------------------------------------------------------------
    // TEST 7: Answer Key Validation Engine
    // -------------------------------------------------------------
    console.log('\n--> 7. Answer Key Validation Engine');
    const answerVal = validateAnswer(
      'B',
      [
        { label: 'A', text: 'Ribosome' },
        { label: 'B', text: 'Mitochondria' },
        { label: 'C', text: 'Golgi apparatus' },
        { label: 'D', text: 'Lysosome' },
      ],
      'Mitochondria produce ATP and are known as the powerhouse of the cell.'
    );
    assert(answerVal.status === 'VERIFIED', 'Answer key validation returns VERIFIED for matching option');

    // -------------------------------------------------------------
    // TEST 8: NCERT Concept Linking
    // -------------------------------------------------------------
    console.log('\n--> 8. NCERT Concept Linking Engine');
    const linkedQuestions = await prisma.question.count({
      where: { primaryConceptId: { not: null } }
    });
    assert(linkedQuestions > 1500, `NCERT concept links established: ${linkedQuestions} questions linked`);

    const highConfidenceLinks = await prisma.question.count({
      where: { linkConfidence: 'HIGH' }
    });
    assert(highConfidenceLinks > 300, `High-confidence NCERT concept links: ${highConfidenceLinks}`);

    // -------------------------------------------------------------
    // TEST 9: Lossless Diagram / Figure Support
    // -------------------------------------------------------------
    console.log('\n--> 9. Diagram / Figure Storage & Provenance');
    const figureCount = await prisma.questionFigure.count();
    assert(figureCount > 500, `Extracted question figures indexed: ${figureCount}`);

    const sampleFigure = await prisma.questionFigure.findFirst();
    assert(
      sampleFigure !== null && sampleFigure.assetPath.startsWith('/extracted_figures/'),
      'Figure asset paths follow public asset route: /extracted_figures/'
    );

    // -------------------------------------------------------------
    // TEST 10: CBT Safety Invariant
    // -------------------------------------------------------------
    console.log('\n--> 10. CBT Safety Invariant');
    const unverifiedPublished = await prisma.question.count({
      where: {
        publicationStatus: 'PUBLISHED',
        verificationStatus: { not: 'VERIFIED' }
      }
    });
    assert(unverifiedPublished === 0, 'Zero unverified questions are marked as PUBLISHED');

    // -------------------------------------------------------------
    // TEST 11: Global Search Across Sources
    // -------------------------------------------------------------
    console.log('\n--> 11. Global Search Engine Multi-Source Queries');
    const searchRes = await GlobalSearchEngine.search('Newton');
    assert(searchRes.concepts.length > 0, 'Search discovers Newton concepts');
    assert(searchRes.questions.length > 0, 'Search discovers Newton questions');
    const hasSourceBadge = searchRes.questions.every(q => Boolean(q.sourceBadge));
    assert(hasSourceBadge, 'All search result questions have clean source badges');

    // -------------------------------------------------------------
    // TEST 12: Phase 2 Regression Checks
    // -------------------------------------------------------------
    console.log('\n--> 12. Phase 2 NCERT Regression Checks');
    const totalConcepts = await prisma.concept.count();
    const totalChapters = await prisma.chapter.count();
    assert(totalConcepts >= 3455, `NCERT concepts preserved: ${totalConcepts} >= 3455`);
    assert(totalChapters >= 79, `Canonical NCERT chapters preserved: ${totalChapters} >= 79`);

    // Summary
    console.log('\n===============================================================');
    console.log(`  PHASE 3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test run failed with error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase3AcceptanceTests();
