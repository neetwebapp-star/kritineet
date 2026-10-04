/**
 * Phase 6: Socratic Teaching Engine
 * Orchestrates progressive, multi-step guiding dialogs rather than spoon-feeding
 * immediate solutions, with an explicit bypass option ("Show me the answer").
 */

import { RetrievedGroundingContext } from './knowledge-retriever';
import { PhysicsSolver, ChemistrySolver, BiologySolver, SubjectSolution } from './subject-solvers';

export interface SocraticDialogState {
  currentStage: number; // 1 to 4
  totalStages: number;
  guidingQuestion: string;
  hint: string;
  isCompleted: boolean;
  bypassed: boolean;
  fullSolution?: SubjectSolution;
}

export class SocraticEngine {
  public static processSocraticStep(
    context: RetrievedGroundingContext,
    userMessage: string,
    currentStage: number = 1,
    explicitBypass: boolean = false
  ): SocraticDialogState {
    const text = userMessage.toLowerCase().trim();

    // Check for explicit bypass request
    const wantsBypass =
      explicitBypass ||
      text.includes('show answer') ||
      text.includes('show me the answer') ||
      text.includes('tell me the answer') ||
      text.includes('give me the answer') ||
      text.includes('give answer') ||
      text.includes('just solve it') ||
      text.includes('i give up') ||
      text.includes('skip') ||
      /show\s+(me\s+)?(the\s+)?answer/i.test(text);

    // Generate full solution in case of bypass or final completion
    let fullSolution: SubjectSolution | undefined;
    const subjectName = (context.question?.subjectName || context.concepts[0]?.subjectName || 'PHYSICS').toUpperCase();

    if (subjectName.includes('BIO')) {
      fullSolution = BiologySolver.solve(context, userMessage);
    } else if (subjectName.includes('CHEM')) {
      fullSolution = ChemistrySolver.solve(context, userMessage);
    } else {
      fullSolution = PhysicsSolver.solve(context, userMessage);
    }

    if (wantsBypass) {
      return {
        currentStage: 4,
        totalStages: 4,
        guidingQuestion: 'You requested the complete solution. Here is the comprehensive verified breakdown:',
        hint: 'Review each step carefully to see how the governing concept applies to this question.',
        isCompleted: true,
        bypassed: true,
        fullSolution
      };
    }

    const q = context.question;
    const concept = context.concepts[0];

    // Progressive 4-stage inquiry
    switch (currentStage) {
      case 1:
        return {
          currentStage: 1,
          totalStages: 4,
          guidingQuestion: `Let's break this down together! First, what are the key given values in this problem, and what specific quantity is the question asking you to find?`,
          hint: q ? `Read the question carefully: "${q.questionText.slice(0, 80)}...". Identify the given variables and their units.` : 'Identify the primary variables and target outcome.',
          isCompleted: false,
          bypassed: false
        };

      case 2:
        return {
          currentStage: 2,
          totalStages: 4,
          guidingQuestion: `Great observation! Now, which NCERT concept or formula relates these given variables to the unknown?`,
          hint: concept ? `Think about the core formula in ${concept.chapterTitle}: ${concept.name}.` : 'Recall the fundamental equation linking these quantities.',
          isCompleted: false,
          bypassed: false
        };

      case 3:
        return {
          currentStage: 3,
          totalStages: 4,
          guidingQuestion: `Spot on! If you substitute the values into this formula, what does your algebraic equation look like? (Watch out for SI units!)`,
          hint: 'Remember to check sign conventions and standard units (e.g. meters instead of centimeters).',
          isCompleted: false,
          bypassed: false
        };

      case 4:
      default:
        return {
          currentStage: 4,
          totalStages: 4,
          guidingQuestion: `Excellent work! You arrived at the solution. Let's compare your result with the verified NCERT solution:`,
          hint: 'Notice how systematically isolating the variables prevents calculation traps under timed exam pressure.',
          isCompleted: true,
          bypassed: false,
          fullSolution
        };
    }
  }
}
