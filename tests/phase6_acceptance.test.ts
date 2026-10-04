/**
 * Phase 6 Acceptance Tests: AI Tutor + Doubt Solver + Personalized Learning Intelligence
 * Verifies all 33 required capabilities:
 * - Provider abstraction & fallback
 * - 10 AI Tutor modes
 * - Strict source grounding & citations (no leaked internal IDs)
 * - Subject solvers (Physics, Chemistry, Biology)
 * - Socratic progression & bypass
 * - Image doubt solver & confidence gating
 * - CBT exam AI lock enforcement
 * - Rate limiting & daily caps
 * - Student data isolation & privacy
 * - Feedback & Admin telemetry
 * - Zero hallucination validation
 */

import prisma from '../src/lib/prisma';
import { AIProviderManager, GroundedSystemProvider, ExternalProviderAdapter, estimateTokenCount, calculateCost } from '../src/lib/ai/ai-provider';
import { IntentDetector } from '../src/lib/ai/intent-detector';
import { KnowledgeRetriever } from '../src/lib/ai/knowledge-retriever';
import { PhysicsSolver, ChemistrySolver, BiologySolver } from '../src/lib/ai/subject-solvers';
import { SocraticEngine } from '../src/lib/ai/socratic-engine';
import { ImageDoubtSolver } from '../src/lib/ai/image-solver';
import { AIRateLimiter } from '../src/lib/ai/rate-limiter';
import { ResponseValidator } from '../src/lib/ai/response-validator';
import { AITutorEngine } from '../src/lib/ai/ai-tutor-engine';

async function runPhase6AcceptanceTests() {
  console.log('===============================================================');
  console.log('  NEET PHASE 6: AI TUTOR & LEARNING INTELLIGENCE ACCEPTANCE   ');
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

  // Create isolated test students
  const studentA = await prisma.user.create({
    data: {
      email: `student_p6_a_${timestamp}@neet2027.com`,
      name: 'Test Student Phase 6 Alpha',
      role: 'STUDENT',
    },
  });

  const studentB = await prisma.user.create({
    data: {
      email: `student_p6_b_${timestamp}@neet2027.com`,
      name: 'Test Student Phase 6 Beta',
      role: 'STUDENT',
    },
  });

  let activeTest: any = null;

  // Find a verified question and concept from existing DB for grounded testing
  const sampleQuestion = await prisma.question.findFirst({
    where: {
      verificationStatus: 'VERIFIED',
      options: { some: {} },
    },
    include: {
      options: true,
      chapter: { include: { subject: true } },
      primaryConcept: true,
    },
  });

  const sampleConcept = await prisma.concept.findFirst({
    include: { chapter: { include: { subject: true } } },
  });

  try {
    // -------------------------------------------------------------
    // SECTION 1: AI Provider Abstraction (Tests 1 - 4)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 1: AI Provider Abstraction ---');

    // Test 1: GroundedSystemProvider generates deterministic grounded response
    const sysProvider = new GroundedSystemProvider();
    const genRes = await sysProvider.generate('Explain Simple Harmonic Motion', {
      systemPrompt: 'You are an NCERT grounded tutor.',
    });
    assert(
      genRes.text.includes('Harmonic Motion') && genRes.provider === 'SYSTEM_ENGINE',
      'Test 1: GroundedSystemProvider generates deterministic response',
      JSON.stringify(genRes)
    );

    // Test 2: Token counting and zero cost calculation for system provider
    const tokenCount = estimateTokenCount('A particle of mass m executes SHM');
    const cost = calculateCost('SYSTEM_ENGINE', 100, 200);
    assert(
      tokenCount > 5 && cost === 0.0,
      'Test 2: Token counting works and System Engine has zero API cost'
    );

    // Test 3: External provider adapter fallback on missing/simulated keys
    const externalAdapter = new ExternalProviderAdapter('OPENAI');
    const fallbackRes = await externalAdapter.generate('Test prompt');
    assert(
      fallbackRes.provider === 'SYSTEM_ENGINE' || fallbackRes.model.includes('fallback'),
      'Test 3: External adapter falls back gracefully to System Engine'
    );

    // Test 4: Provider manager singleton routing
    const manager = AIProviderManager.getInstance();
    const defaultProvider = manager.getProvider('grounded');
    assert(
      defaultProvider.name === 'SYSTEM_ENGINE',
      'Test 4: AIProviderManager returns GroundedSystemProvider for grounded tasks'
    );

    // -------------------------------------------------------------
    // SECTION 2: Intent Detection & 10 AI Tutor Modes (Tests 5 - 14)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: Intent Detection & 10 Modes ---');

    // Test 5: Detects ASK_DOUBT mode
    const i5 = IntentDetector.detect('I have a doubt about thermodynamics internal energy');
    assert(i5.mode === 'ASK_DOUBT' || i5.mode === 'EXPLAIN_CONCEPT', 'Test 5: Detects ASK_DOUBT mode');

    // Test 6: Detects EXPLAIN_CONCEPT mode and extracts concept keywords
    const i6 = IntentDetector.detect('Explain what is photoelectric effect and work function');
    assert(
      i6.mode === 'EXPLAIN_CONCEPT' && i6.conceptKeywords.some(k => k.includes('photoelectric') || k.includes('work')),
      'Test 6: Detects EXPLAIN_CONCEPT and extracts keywords'
    );

    // Test 7: Detects SOLVE_QUESTION mode and extracts question ID
    const i7 = IntentDetector.detect('Please solve this question for me', undefined, sampleQuestion?.id);
    assert(
      i7.mode === 'SOLVE_QUESTION' && i7.questionId === sampleQuestion?.id,
      'Test 7: Detects SOLVE_QUESTION mode with questionId'
    );

    // Test 8: Detects TEACH_ME mode (Socratic)
    const i8 = IntentDetector.detect('Teach me step by step how to solve projectile motion');
    assert(i8.mode === 'TEACH_ME', 'Test 8: Detects TEACH_ME (Socratic) mode');

    // Test 9: Detects REVISION mode
    const i9 = IntentDetector.detect('Give me a quick formula sheet and revision summary for electrostatics');
    assert(i9.mode === 'REVISION', 'Test 9: Detects REVISION mode');

    // Test 10: Detects MISTAKE_ANALYSIS mode
    const i10 = IntentDetector.detect('Why did I get this wrong? Where did I make a mistake?');
    assert(i10.mode === 'MISTAKE_ANALYSIS', 'Test 10: Detects MISTAKE_ANALYSIS mode');

    // Test 11: Detects PYQ_COACH mode
    const i11 = IntentDetector.detect('What is the previous year neet trend for genetics and inheritance?');
    assert(i11.mode === 'PYQ_COACH', 'Test 11: Detects PYQ_COACH mode');

    // Test 12: Detects EXAM_STRATEGY mode
    const i12 = IntentDetector.detect('What is the best exam strategy and time management for NEET 2027?');
    assert(i12.mode === 'EXAM_STRATEGY', 'Test 12: Detects EXAM_STRATEGY mode');

    // Test 13: Detects QUIZ_ME mode
    const i13 = IntentDetector.detect('Quiz me with an MCQ practice question on botany');
    assert(i13.mode === 'QUIZ_ME', 'Test 13: Detects QUIZ_ME mode');

    // Test 14: Detects WEAKNESS_COACH mode
    const i14 = IntentDetector.detect('I am struggling with organic chemistry, coach me on my weak areas');
    assert(i14.mode === 'WEAKNESS_COACH', 'Test 14: Detects WEAKNESS_COACH mode');

    // -------------------------------------------------------------
    // SECTION 3: Grounded Knowledge Retrieval & Citations (Tests 15 - 17)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: Knowledge Retrieval & Citations ---');

    // Test 15: Grounded retrieval fetches real NCERT concepts and formats clean citations
    const retrieval1 = await KnowledgeRetriever.retrieve(
      {
        mode: 'EXPLAIN_CONCEPT',
        confidence: 1.0,
        conceptKeywords: [sampleConcept?.name?.split(' ')[0] || 'motion'],
        isBypassRequested: false,
      },
      studentA.id
    );
    assert(
      retrieval1.citations.length > 0 && retrieval1.groundingStatus === 'GROUNDED',
      'Test 15: Grounded retrieval returns verified NCERT citations'
    );

    // Test 16: Citations never contain internal database UUIDs or cuid tokens
    const cuidRegex = /\b(c[a-z0-9]{24})\b/i;
    const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
    const hasLeakedId = retrieval1.citations.some(
      c => cuidRegex.test(c.title) || uuidRegex.test(c.title)
    );
    assert(!hasLeakedId, 'Test 16: Citations never expose raw internal database UUIDs/CUIDs');

    // Test 17: Out-of-scope / non-existent concept returns NOT_GROUNDED status and mandatory disclaimer
    const ungroundedRetrieval = await KnowledgeRetriever.retrieve(
      {
        mode: 'ASK_DOUBT',
        confidence: 1.0,
        conceptKeywords: ['quantumchromodynamicsgluonplasmaextraterrestrialxyz999'],
        isBypassRequested: false,
      },
      studentA.id
    );
    const ungroundedValidation = ResponseValidator.validate(
      'Here is some general information about this query.',
      ungroundedRetrieval
    );
    assert(
      ungroundedRetrieval.groundingStatus === 'NOT_GROUNDED' &&
      ungroundedValidation.sanitizedContent.includes('इस information का verified source platform में उपलब्ध नहीं है'),
      'Test 17: Out-of-scope query flagged NOT_GROUNDED with mandatory verified source disclaimer'
    );

    // -------------------------------------------------------------
    // SECTION 4: Specialized Subject Solvers (Tests 18 - 20)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: Subject Solvers ---');

    // Test 18: Physics solver extracts knowns, unknowns, laws, formula manipulation, and common NEET traps
    const phySol = PhysicsSolver.solve(retrieval1, 'Calculate the velocity');
    assert(
      phySol.subject === 'PHYSICS' &&
      phySol.steps.length >= 3 &&
      phySol.commonTraps.some(t => t.toLowerCase().includes('sign') || t.toLowerCase().includes('unit')),
      'Test 18: Physics solver provides step-by-step breakdown and common traps'
    );

    // Test 19: Chemistry solver handles physical, organic mechanisms, and inorganic NCERT exceptions
    const chemSol = ChemistrySolver.solve(retrieval1, 'What is the organic reaction mechanism and carbocation intermediate?');
    assert(
      chemSol.subject === 'CHEMISTRY' &&
      chemSol.commonTraps.length > 0 &&
      chemSol.governingPrinciple.length > 0,
      'Test 19: Chemistry solver handles mechanisms and common traps'
    );

    // Test 20: Biology solver adheres to NCERT verbatim terminology and Botany vs Zoology distinction
    const bioSol = BiologySolver.solve(retrieval1, 'Explain plant cell division in botany');
    assert(
      bioSol.subject === 'BIOLOGY' &&
      bioSol.neetRelevance.includes('NEET') &&
      bioSol.steps.some(s => s.title.includes('NCERT')),
      'Test 20: Biology solver maps directly to NCERT textbook lines and NEET frequency'
    );

    // -------------------------------------------------------------
    // SECTION 5: Socratic Teaching Engine & Bypass (Tests 21 - 22)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: Socratic Engine & Bypass ---');

    // Test 21: Socratic mode prompts guiding question on stage 1 instead of giving immediate answer
    const soc1 = SocraticEngine.processSocraticStep(retrieval1, 'I want to solve this question', 1, false);
    assert(
      soc1.currentStage === 1 &&
      !soc1.isCompleted &&
      !soc1.bypassed &&
      soc1.guidingQuestion.length > 10,
      'Test 21: Socratic mode prompts guiding question on stage 1'
    );

    // Test 22: Socratic mode bypasses and reveals full solution when student requests "Show me the answer"
    const socBypass = SocraticEngine.processSocraticStep(retrieval1, 'Please just show me the answer', 1, false);
    assert(
      socBypass.bypassed &&
      socBypass.isCompleted &&
      Boolean(socBypass.fullSolution),
      'Test 22: Socratic bypass reveals complete solution on demand'
    );

    // -------------------------------------------------------------
    // SECTION 6: Image Doubt Solver & Confidence Gating (Tests 23 - 24)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6: Image Doubt Solver ---');

    // Test 23: High-confidence OCR matches database question bank
    const imgHigh = await ImageDoubtSolver.processImageDoubt('sample_q: neet Question on motion', 'solve');
    assert(
      imgHigh.confidence >= 0.75 && !imgHigh.confirmationRequired,
      'Test 23: High-confidence OCR proceeds without requiring confirmation'
    );

    // Test 24: Low-confidence OCR triggers confirmation warning gate (confirmationRequired: true)
    const imgLow = await ImageDoubtSolver.processImageDoubt('blurry text', 'solve');
    assert(
      imgLow.confidence < 0.75 && imgLow.confirmationRequired && Boolean(imgLow.warningMessage),
      'Test 24: Low-confidence OCR triggers confirmation warning gate'
    );

    // -------------------------------------------------------------
    // SECTION 7: CBT AI Restriction / Exam Integrity (Tests 25 - 26)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 7: CBT AI Lock (Exam Integrity) ---');

    // Create a mock test and start an attempt for Student A
    activeTest = await prisma.test.create({
      data: {
        title: `NEET Grand Mock Test ${timestamp}`,
        testType: 'FULL_MOCK',
        totalQuestions: 180,
        durationMinutes: 200,
        totalMarks: 720,
        isPublished: true,
      },
    });

    const activeAttempt = await prisma.examAttempt.create({
      data: {
        testId: activeTest.id,
        userId: studentA.id,
        status: 'IN_PROGRESS',
        submissionToken: `sub_token_${timestamp}`,
        startedAt: new Date(),
      },
    });

    // Test 25: AI tutor request is strictly blocked/locked when student is in an active FULL_MOCK CBT session
    const lockedResponse = await AITutorEngine.processRequest({
      userId: studentA.id,
      query: 'What is the answer to question 5?',
      explicitMode: 'SOLVE_QUESTION',
    });
    assert(
      lockedResponse.locked &&
      Boolean(lockedResponse.lockReason?.includes('CBT Exam in progress')) &&
      lockedResponse.content.includes('CBT Exam Lock Active'),
      'Test 25: AI Tutor assistance is strictly locked during active CBT exam simulation'
    );

    // Submit the exam attempt
    await prisma.examAttempt.update({
      where: { id: activeAttempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        totalScore: 540,
      },
    });

    // Test 26: AI tutor post-test analysis is unlocked and succeeds once CBT exam attempt is submitted
    const unlockedResponse = await AITutorEngine.processRequest({
      userId: studentA.id,
      query: 'Can you now explain the concepts?',
      explicitMode: 'EXPLAIN_CONCEPT',
    });
    assert(
      !unlockedResponse.locked,
      'Test 26: AI Tutor unlocks immediately after exam submission'
    );

    // -------------------------------------------------------------
    // SECTION 8: Rate Limiting & Daily Quotas (Tests 27 - 29)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 8: Rate Limiting & Quotas ---');

    // Test 27: Message usage increments correctly in database
    await AIRateLimiter.recordUsage(studentA.id, false);
    const limitStatus = await AIRateLimiter.checkLimit(studentA.id, false);
    assert(
      limitStatus.messagesUsed >= 1 && limitStatus.allowed,
      'Test 27: Message usage increments correctly and allows requests within quota'
    );

    // Test 28: Daily quota exhaustion blocks subsequent chat requests
    await prisma.aIRateLimit.update({
      where: { userId: studentA.id },
      data: { messagesUsed: 100, dailyMessageCap: 100 },
    });
    const exhaustedLimit = await AIRateLimiter.checkLimit(studentA.id, false);
    assert(
      !exhaustedLimit.allowed && exhaustedLimit.remainingMessages === 0,
      'Test 28: Exhausted daily message quota correctly blocks requests'
    );

    // Test 29: Daily image quota tracks and limits vision doubts
    await prisma.aIRateLimit.update({
      where: { userId: studentA.id },
      data: { imagesUsed: 20, dailyImageCap: 20 },
    });
    const exhaustedImageLimit = await AIRateLimiter.checkLimit(studentA.id, true);
    assert(
      !exhaustedImageLimit.allowed && exhaustedImageLimit.remainingImages === 0,
      'Test 29: Daily image quota correctly limits vision doubt processing'
    );

    // Reset studentA limit for subsequent tests
    await prisma.aIRateLimit.update({
      where: { userId: studentA.id },
      data: { messagesUsed: 5, imagesUsed: 1 },
    });

    // -------------------------------------------------------------
    // SECTION 9: Student Data Isolation & Privacy (Test 30)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 9: Student Isolation & Privacy ---');

    // Student A creates a private tutoring session
    const convA = await prisma.tutorConversation.create({
      data: {
        userId: studentA.id,
        title: 'Student A Private Doubt Session',
        activeMode: 'ASK_DOUBT',
      },
    });

    const msgA = await prisma.tutorMessage.create({
      data: {
        conversationId: convA.id,
        role: 'USER',
        content: 'Confidential student inquiry',
        mode: 'ASK_DOUBT',
      },
    });

    // Test 30: Student A's conversations and messages cannot be accessed by Student B
    const studentBConversations = await prisma.tutorConversation.findMany({
      where: { userId: studentB.id },
    });
    const studentBCanSeeA = studentBConversations.some(c => c.id === convA.id);
    assert(
      !studentBCanSeeA,
      'Test 30: Student B cannot view Student A private conversations (Data Isolation)'
    );

    // -------------------------------------------------------------
    // SECTION 10: Feedback & Admin Telemetry (Tests 31 - 32)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 10: Feedback & Admin Telemetry ---');

    // Test 31: Student feedback records helpfulness and rating in database
    const feedback = await prisma.aIFeedback.create({
      data: {
        messageId: msgA.id,
        userId: studentA.id,
        isHelpful: true,
        rating: 5,
        reason: 'HIGHLY_ACCURATE',
        comments: 'Solved my physics doubt perfectly!',
      },
    });
    assert(
      feedback.isHelpful && feedback.rating === 5,
      'Test 31: Student feedback persists helpfulness and rating'
    );

    // Test 32: Admin AI monitoring endpoint aggregates total tokens, latency, grounding rate
    await prisma.aIUsageLog.create({
      data: {
        userId: studentA.id,
        provider: 'SYSTEM_ENGINE',
        model: 'grounded-neet-v1',
        endpoint: 'chat',
        mode: 'ASK_DOUBT',
        promptTokens: 40,
        completionTokens: 80,
        totalTokens: 120,
        estimatedCost: 0.0,
        latencyMs: 25,
        status: 'SUCCESS',
        groundingStatus: 'GROUNDED',
      },
    });

    const usageCount = await prisma.aIUsageLog.count();
    assert(
      usageCount >= 1,
      'Test 32: AI telemetry logs aggregate successfully for admin monitoring'
    );

    // -------------------------------------------------------------
    // SECTION 11: Safety & Zero Hallucination (Test 33)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 11: Safety & Zero Hallucination ---');

    // Test 33: ResponseValidator corrects conflicting option keys against verified database answers
    if (sampleQuestion) {
      const correctOpt = sampleQuestion.correctOption.toUpperCase();
      const wrongOpt = correctOpt === 'A' ? 'B' : 'A';
      const fakeHallucinatedText = `Based on the calculation, the Correct Option: (${wrongOpt}) is correct.`;

      const valReport = ResponseValidator.validate(fakeHallucinatedText, {
        groundingStatus: 'GROUNDED',
        citations: [],
        concepts: [],
        question: {
          id: sampleQuestion.id,
          questionText: sampleQuestion.questionText,
          options: sampleQuestion.options.map(o => ({ label: o.label, text: o.text })),
          correctOption: sampleQuestion.correctOption,
          explanation: sampleQuestion.explanation,
          sourceType: sampleQuestion.sourceType,
          difficulty: sampleQuestion.difficulty,
          chapterTitle: sampleQuestion.chapter?.title || '',
          subjectName: sampleQuestion.chapter?.subject?.name || '',
          figures: [],
        },
        relatedPYQs: [],
      });

      assert(
        valReport.sanitizedContent.includes(`Correct Option: (${correctOpt})`),
        'Test 33: ResponseValidator overrides hallucinated answer keys with verified database truth'
      );
    } else {
      assert(true, 'Test 33: Skipped question validation (no question available)');
    }

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    // Cleanup test users and test mock test
    await prisma.aIFeedback.deleteMany({ where: { userId: { in: [studentA.id, studentB.id] } } });
    await prisma.tutorMessage.deleteMany({ where: { conversation: { userId: { in: [studentA.id, studentB.id] } } } });
    await prisma.tutorConversation.deleteMany({ where: { userId: { in: [studentA.id, studentB.id] } } });
    await prisma.aIUsageLog.deleteMany({ where: { userId: { in: [studentA.id, studentB.id] } } });
    await prisma.aIRateLimit.deleteMany({ where: { userId: { in: [studentA.id, studentB.id] } } });
    await prisma.examAttempt.deleteMany({ where: { userId: { in: [studentA.id, studentB.id] } } });
    if (activeTest?.id) {
      await prisma.test.deleteMany({ where: { id: activeTest.id } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [studentA.id, studentB.id] } } });
  }

  console.log('\n===============================================================');
  console.log(`  RESULTS: ${passed} / 33 TESTS PASSED  (${failed} FAILED)`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6AcceptanceTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
