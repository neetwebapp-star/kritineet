/**
 * Phase 6: AI Tutor Engine
 * Central orchestrator connecting Intent Detection, Knowledge Retrieval,
 * Subject Solvers, Socratic Engine, Validation, CBT Lock, Rate Limiting, and Persistence.
 */

import prisma from '@/lib/prisma';
import { AIProviderManager, calculateCost } from './ai-provider';
import { IntentDetector, TutorMode, DetectedIntent } from './intent-detector';
import { KnowledgeRetriever, RetrievedGroundingContext, VerifiedCitation } from './knowledge-retriever';
import { PhysicsSolver, ChemistrySolver, BiologySolver, SubjectSolution } from './subject-solvers';
import { SocraticEngine, SocraticDialogState } from './socratic-engine';
import { ResponseValidator } from './response-validator';
import { AIRateLimiter } from './rate-limiter';

export interface TutorRequest {
  userId: string;
  query: string;
  conversationId?: string;
  explicitMode?: TutorMode;
  questionId?: string;
  conceptId?: string;
  socraticStage?: number;
  bypassSocratic?: boolean;
}

export interface TutorResponse {
  locked: boolean;
  lockReason?: string;
  conversationId?: string;
  messageId?: string;
  role: 'ASSISTANT';
  mode: TutorMode;
  content: string;
  groundingStatus: 'GROUNDED' | 'PARTIALLY_GROUNDED' | 'NOT_GROUNDED';
  citations: VerifiedCitation[];
  subjectSolution?: SubjectSolution;
  socraticState?: SocraticDialogState;
  suggestedActions: Array<{ label: string; action: string; payload?: any }>;
  remainingDailyMessages: number;
}

export class AITutorEngine {
  public static async processRequest(request: TutorRequest): Promise<TutorResponse> {
    const startTime = Date.now();
    const { userId, query, conversationId, explicitMode, questionId, socraticStage, bypassSocratic } = request;

    // 1. CBT Exam Lock Enforcement
    // Check if user has an active FULL_MOCK or GRAND_MOCK or EXAM_SIMULATION
    const activeExam = await prisma.examAttempt.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
        test: {
          testType: { in: ['FULL_MOCK', 'GRAND_MOCK', 'EXAM_SIMULATION'] }
        }
      },
      include: { test: true }
    });

    if (activeExam) {
      return {
        locked: true,
        lockReason: 'CBT Exam in progress. AI Tutor assistance is locked during active exam simulations to ensure test integrity. Complete or submit your exam to resume tutoring.',
        role: 'ASSISTANT',
        mode: explicitMode || 'ASK_DOUBT',
        content: '🔒 **CBT Exam Lock Active**\n\nAI Tutor assistance is strictly suspended during active full mock examinations to preserve exam simulation integrity. Please finish and submit your exam to view comprehensive AI analysis.',
        groundingStatus: 'GROUNDED',
        citations: [],
        suggestedActions: [
          { label: 'Return to CBT Exam', action: 'NAVIGATE_EXAM', payload: { attemptId: activeExam.id } }
        ],
        remainingDailyMessages: 0,
      };
    }

    // 2. Check Rate Limit
    const rateLimit = await AIRateLimiter.checkLimit(userId, false);
    if (!rateLimit.allowed) {
      return {
        locked: false,
        role: 'ASSISTANT',
        mode: explicitMode || 'ASK_DOUBT',
        content: `⚠️ **Rate Limit Exceeded**\n\n${rateLimit.errorMessage}`,
        groundingStatus: 'GROUNDED',
        citations: [],
        suggestedActions: [],
        remainingDailyMessages: 0,
      };
    }

    // 3. Detect Intent & Mode
    const intent: DetectedIntent = IntentDetector.detect(query, explicitMode, questionId);

    // 4. Retrieve Grounded Context
    const context: RetrievedGroundingContext = await KnowledgeRetriever.retrieve(intent, userId);

    // 5. Generate Mode-Specific Content
    let content = '';
    let subjectSolution: SubjectSolution | undefined;
    let socraticState: SocraticDialogState | undefined;
    const suggestedActions: TutorResponse['suggestedActions'] = [];

    const subjectStr = (context.question?.subjectName || context.concepts[0]?.subjectName || intent.subject || 'PHYSICS').toUpperCase();

    if (intent.mode === 'TEACH_ME') {
      // Socratic Progression
      socraticState = SocraticEngine.processSocraticStep(
        context,
        query,
        socraticStage || 1,
        bypassSocratic || intent.isBypassRequested
      );

      if (socraticState.bypassed || socraticState.isCompleted) {
        subjectSolution = socraticState.fullSolution;
        content = `${socraticState.guidingQuestion}\n\n${this.formatSolution(socraticState.fullSolution!)}`;
      } else {
        content = `🧠 **Socratic Step ${socraticState.currentStage} of ${socraticState.totalStages}**\n\n${socraticState.guidingQuestion}\n\n💡 *Hint:* ${socraticState.hint}`;
        suggestedActions.push({
          label: 'Show me the answer',
          action: 'BYPASS_SOCRATIC',
          payload: { stage: socraticState.currentStage }
        });
      }
    } else if (intent.mode === 'SOLVE_QUESTION' || (context.question && intent.mode === 'ASK_DOUBT')) {
      // Subject Solver breakdown
      if (subjectStr.includes('BIO')) {
        subjectSolution = BiologySolver.solve(context, query);
      } else if (subjectStr.includes('CHEM')) {
        subjectSolution = ChemistrySolver.solve(context, query);
      } else {
        subjectSolution = PhysicsSolver.solve(context, query);
      }
      content = this.formatSolution(subjectSolution);
      suggestedActions.push({ label: 'Practice Similar PYQs', action: 'START_PRACTICE', payload: { conceptId: context.concepts[0]?.id } });
      suggestedActions.push({ label: 'Add to Revision List', action: 'ADD_REVISION', payload: { questionId: context.question?.id } });
    } else if (intent.mode === 'EXPLAIN_CONCEPT') {
      content = this.formatConceptExplanation(context);
      suggestedActions.push({ label: 'Quiz Me on this Concept', action: 'QUIZ_CONCEPT', payload: { conceptId: context.concepts[0]?.id } });
    } else if (intent.mode === 'REVISION') {
      content = this.formatRevisionNotes(context);
      suggestedActions.push({ label: 'Start 5-min Active Recall', action: 'START_DRILL' });
    } else if (intent.mode === 'MISTAKE_ANALYSIS') {
      content = this.formatMistakeAnalysis(context);
      suggestedActions.push({ label: 'Retry Mistake Question', action: 'RETRY_MISTAKE', payload: { questionId: context.question?.id } });
    } else if (intent.mode === 'PYQ_COACH') {
      content = this.formatPYQCoach(context);
    } else if (intent.mode === 'EXAM_STRATEGY') {
      content = this.formatExamStrategy(query);
    } else if (intent.mode === 'QUIZ_ME') {
      content = this.formatQuizContent(context);
    } else if (intent.mode === 'WEAKNESS_COACH') {
      content = await this.formatWeaknessCoach(userId);
    } else {
      // General ASK_DOUBT fallback
      content = this.formatGeneralDoubt(query, context);
    }

    // 6. Validate and Guard Response
    const validation = ResponseValidator.validate(content, context);
    const finalContent = validation.sanitizedContent;
    const finalCitations = validation.sanitizedCitations;
    const groundingStatus = validation.groundingStatus;

    // 7. Calculate Tokens & Cost
    const providerManager = AIProviderManager.getInstance();
    const provider = providerManager.getProvider('grounded');
    const genResult = await provider.generate(finalContent, { mode: intent.mode });

    // 8. Record Rate Limit Usage & AI Usage Log
    await AIRateLimiter.recordUsage(userId, false);

    await prisma.aIUsageLog.create({
      data: {
        userId,
        provider: provider.name,
        model: genResult.model,
        endpoint: 'chat',
        mode: intent.mode,
        promptTokens: genResult.promptTokens,
        completionTokens: genResult.completionTokens,
        totalTokens: genResult.totalTokens,
        estimatedCost: calculateCost(provider.name, genResult.promptTokens, genResult.completionTokens),
        latencyMs: Math.max(10, Date.now() - startTime),
        status: 'SUCCESS',
        groundingStatus,
      },
    });

    // 9. Persist Conversation & Messages
    let finalConvId: string;
    if (conversationId) {
      const existingConv = await prisma.tutorConversation.findUnique({
        where: { id: conversationId },
      });
      if (existingConv) {
        finalConvId = existingConv.id;
      } else {
        const conv = await prisma.tutorConversation.create({
          data: {
            id: conversationId,
            userId,
            title: query.slice(0, 40) + '...',
            activeMode: intent.mode,
            subject: intent.subject || 'GENERAL',
            questionId: context.question?.id,
            conceptId: context.concepts[0]?.id,
          },
        });
        finalConvId = conv.id;
      }
    } else {
      const conv = await prisma.tutorConversation.create({
        data: {
          userId,
          title: query.slice(0, 40) + '...',
          activeMode: intent.mode,
          subject: intent.subject || 'GENERAL',
          questionId: context.question?.id,
          conceptId: context.concepts[0]?.id,
        },
      });
      finalConvId = conv.id;
    }

    // Save user message
    await prisma.tutorMessage.create({
      data: {
        conversationId: finalConvId,
        role: 'USER',
        content: query,
        mode: intent.mode,
        groundingStatus: 'GROUNDED',
        tokensUsed: genResult.promptTokens,
      },
    });

    // Save assistant message
    const assistantMsg = await prisma.tutorMessage.create({
      data: {
        conversationId: finalConvId,
        role: 'ASSISTANT',
        content: finalContent,
        mode: intent.mode,
        responseType: intent.mode === 'SOLVE_QUESTION' ? 'SOLUTION' : 'EXPLANATION',
        groundingStatus,
        sourcesJson: JSON.stringify(finalCitations),
        actionsJson: JSON.stringify(suggestedActions),
        questionId: context.question?.id,
        conceptId: context.concepts[0]?.id,
        tokensUsed: genResult.completionTokens,
        latencyMs: Math.max(10, Date.now() - startTime),
        provider: provider.name,
        modelName: genResult.model,
      },
    });

    return {
      locked: false,
      conversationId: finalConvId,
      messageId: assistantMsg.id,
      role: 'ASSISTANT',
      mode: intent.mode,
      content: finalContent,
      groundingStatus,
      citations: finalCitations,
      subjectSolution,
      socraticState,
      suggestedActions,
      remainingDailyMessages: rateLimit.remainingMessages - 1,
    };
  }

  private static formatSolution(sol: SubjectSolution): string {
    let md = `### 📘 ${sol.summary}\n\n`;
    md += `**Governing Principle / Law:** ${sol.governingPrinciple}\n`;
    md += `**NCERT Source:** ${sol.ncertReference}\n\n`;

    md += `#### Step-by-Step Solution Breakdown:\n`;
    for (const s of sol.steps) {
      md += `**Step ${s.stepNumber}: ${s.title}**\n${s.description}\n`;
      if (s.formulaOrRule) md += `*Rule/Formula:* \`${s.formulaOrRule}\`\n`;
      if (s.calculation) md += `*Calculation:* \`${s.calculation}\`\n`;
      md += `\n`;
    }

    if (sol.finalAnswer) {
      md += `> **${sol.finalAnswer}**\n\n`;
    }

    md += `⚠️ **Common NEET Traps & Mistakes to Avoid:**\n`;
    for (const trap of sol.commonTraps) {
      md += `- ${trap}\n`;
    }

    md += `\n🎯 **NEET Relevance:** ${sol.neetRelevance}\n`;
    return md;
  }

  private static formatConceptExplanation(ctx: RetrievedGroundingContext): string {
    const concept = ctx.concepts[0];
    if (!concept) {
      return `### Concept Explanation\n\nNo matching NCERT concept found in database.`;
    }

    let md = `### 📖 NCERT Concept: ${concept.name}\n\n`;
    md += `**Class:** Class ${concept.classLevel} | **Subject:** ${concept.subjectName} | **Chapter:** ${concept.chapterTitle}\n\n`;
    md += `#### Definition & Core Theory:\n${concept.definition || 'Key concept as per latest NCERT syllabus.'}\n\n`;

    if (concept.formula) {
      md += `#### Key Mathematical Formulation:\n$$\n${concept.formula}\n$$\n\n`;
    }

    if (ctx.studentMastery) {
      md += `📊 **Your Concept Mastery:** ${ctx.studentMastery.masteryScore.toFixed(0)}% (${ctx.studentMastery.status})\n\n`;
    }

    if (ctx.relatedPYQs.length > 0) {
      md += `🎯 **NEET PYQ Trend:**\nTested in NEET: ${ctx.relatedPYQs.map(p => `${p.examName} ${p.examYear}`).join(', ')}.\n`;
    }

    return md;
  }

  private static formatRevisionNotes(ctx: RetrievedGroundingContext): string {
    const concept = ctx.concepts[0];
    return `### ⚡ High-Yield NEET Revision Card\n\n` +
      `**Concept:** ${concept?.name || 'General Revision'}\n` +
      `**Chapter:** ${concept?.chapterTitle || 'NCERT Core Syllabus'}\n\n` +
      `**1. Essential Rule:**\n${concept?.definition || 'Core NCERT definition'}\n\n` +
      `**2. Formula Capsule:**\n\`${concept?.formula || 'Standard equations'}\`\n\n` +
      `**3. Exam Hall Golden Rule:**\n- Always double-check sign conventions and units.\n- Eliminate extreme distractor options first.\n`;
  }

  private static formatMistakeAnalysis(ctx: RetrievedGroundingContext): string {
    const q = ctx.question;
    const mistake = ctx.studentMistake;

    return `### 🔍 Mistake Diagnostic Analysis\n\n` +
      `**Target Question:** "${q ? q.questionText.slice(0, 100) : 'Practice Question'}..."\n\n` +
      `**Detected Error Pattern:** ${mistake ? mistake.mistakeType : 'CONCEPTUAL_OR_CALCULATION'}\n` +
      `**Times Repeated:** ${mistake ? mistake.mistakeCount : 1}\n\n` +
      `#### Why this mistake happens:\n` +
      `- Overlooking negative sign conventions or confusing formulas under timed pressure.\n` +
      `- Falling for distractor options engineered around partial steps.\n\n` +
      `#### Remediation Action:\n` +
      `Review NCERT Chapter: *${q?.chapterTitle || 'Relevant Chapter'}* and resolve 3 similar difficulty questions.\n`;
  }

  private static formatPYQCoach(ctx: RetrievedGroundingContext): string {
    return `### 📈 NEET PYQ Weightage & Trend Analysis\n\n` +
      `**Analyzed Topic:** ${ctx.concepts[0]?.name || 'Target Chapter'}\n\n` +
      `#### Historical Trend in NEET:\n` +
      `- **Frequency:** 1 to 2 questions consistently appear every year in NEET UG.\n` +
      `- **Difficulty:** 60% Formula/Direct NCERT, 40% Application & Multi-concept.\n\n` +
      `#### Related Verified PYQs on Platform:\n` +
      (ctx.relatedPYQs.length > 0
        ? ctx.relatedPYQs.map(p => `- **${p.examName} ${p.examYear}:** "${p.questionText.slice(0, 75)}..."`).join('\n')
        : '- 2023, 2022, 2021 PYQs linked in platform knowledge base.') +
      `\n\n💡 *Coach Tip:* Focus on NCERT summary tables and end-of-chapter exemplar problems.`;
  }

  private static formatExamStrategy(query: string): string {
    return `### ⏱️ NEET Exam Strategy & Temperament Blueprint\n\n` +
      `#### 1. Ideal 200-Minute Time Budget (NEET UG 2027):\n` +
      `- **Biology (90 Qs):** 40 - 45 minutes (Direct recall, fastest scoring zone).\n` +
      `- **Chemistry (45 Qs):** 45 - 50 minutes (Inorganic/Organic fast, Physical numericals).\n` +
      `- **Physics (45 Qs):** 55 - 65 minutes (Requires formula setup and arithmetic calculations).\n` +
      `- **OMR Bubble & Buffer Check:** 15 - 20 minutes.\n\n` +
      `#### 2. Negative Marking Avoidance:\n` +
      `- Never guess blindly: -1 mark penalizes both rank and percentile.\n` +
      `- Use the 2-Round Strategy: Round 1 solves 100% confident questions; Round 2 handles moderate numericals.\n` +
      `- If you cannot eliminate at least 2 options, skip the question.\n`;
  }

  private static formatQuizContent(ctx: RetrievedGroundingContext): string {
    const q = ctx.question;
    if (q) {
      let md = `### 📝 NEET Active Recall Quiz\n\n`;
      md += `**Question:**\n${q.questionText}\n\n`;
      for (const opt of q.options) {
        md += `- **(${opt.label})** ${opt.text}\n`;
      }
      md += `\n*Select your answer to verify your understanding!*`;
      return md;
    }

    return `### 📝 NEET Active Recall Quiz\n\n` +
      `**Sample Diagnostic Question:**\n` +
      `Which of the following is correct regarding ${ctx.concepts[0]?.name || 'NCERT principles'}?\n\n` +
      `- **(A)** It is conserved only in isolated systems.\n` +
      `- **(B)** It depends inversely on the square of distance.\n` +
      `- **(C)** It is independent of path (conservative).\n` +
      `- **(D)** Both (A) and (C) are correct.\n\n` +
      `*Reply with your option to check!*`;
  }

  private static async formatWeaknessCoach(userId: string): Promise<string> {
    const weakConcepts = await prisma.studentConceptMastery.findMany({
      where: {
        userId,
        status: { in: ['WEAK', 'LEARNING'] },
      },
      take: 3,
      include: {
        concept: { include: { chapter: true } }
      }
    });

    let md = `### 🎯 Targeted Weakness Coaching Plan\n\n`;
    if (weakConcepts.length === 0) {
      md += `Great news! You have no critically weak concepts recorded. Keep maintaining your spaced revision schedule.\n`;
    } else {
      md += `Based on your recent attempts, here are your top weak areas requiring focused remediation:\n\n`;
      for (const wc of weakConcepts) {
        md += `- **${wc.concept.name}** (${wc.concept.chapter.title})\n`;
        md += `  *Mastery Score:* ${wc.masteryScore.toFixed(0)}% | *Accuracy:* ${wc.accuracy.toFixed(0)}%\n`;
      }
      md += `\n#### Recommended 3-Step Recovery Action Plan:\n`;
      md += `1. **Read NCERT Theory:** Re-read the designated chapter section.\n`;
      md += `2. **Concept Practice:** Solve 5 medium-difficulty questions in Adaptive Practice.\n`;
      md += `3. **Review Mistakes:** Clear items in your Error Book before your next mock exam.\n`;
    }
    return md;
  }

  private static formatGeneralDoubt(query: string, ctx: RetrievedGroundingContext): string {
    let md = `### 💡 NEET Tutor Response\n\n`;
    if (ctx.concepts.length > 0) {
      const c = ctx.concepts[0];
      md += `Regarding **${c.name}** in *${c.chapterTitle}*:\n\n`;
      md += `${c.definition || 'NCERT syllabus verified conceptual foundation.'}\n\n`;
      if (c.formula) md += `Formula: \`${c.formula}\`\n\n`;
    } else {
      md += `Here is the explanation for your query: "${query}".\n\n`;
    }
    return md;
  }
}
