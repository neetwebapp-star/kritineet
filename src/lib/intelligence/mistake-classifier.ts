export type MistakeType =
  | 'CONCEPTUAL'
  | 'CALCULATION'
  | 'MEMORY'
  | 'MISREAD'
  | 'SILLY'
  | 'TIME_PRESSURE'
  | 'OPTION_CONFUSION'
  | 'FORMULA'
  | 'DIAGRAM_INTERPRETATION'
  | 'GUESS'
  | 'UNKNOWN';

export interface MistakeClassificationInput {
  questionText: string;
  questionType: string;
  selectedOption: string | null;
  correctOption: string;
  timeSpentSeconds: number;
  expectedTimeSeconds?: number;
  consecutiveIncorrectOnConcept?: number;
  hasDiagram?: boolean;
  explanation?: string | null;
  optionChangedCount?: number;
}

export interface MistakeClassificationResult {
  mistakeType: MistakeType;
  confidence: number; // 0.0 to 1.0
  evidence: string;
  signals: string[];
}

export class MistakeClassifier {
  /**
   * Deterministically classifies student mistakes using structural and behavioral signals.
   * Invariant: Never pretends certainty; falls back to UNKNOWN if evidence is insufficient.
   */
  static classify(input: MistakeClassificationInput): MistakeClassificationResult {
    const signals: string[] = [];
    const expectedTime = input.expectedTimeSeconds || 60;
    const stemLower = input.questionText.toLowerCase();

    // 1. GUESS Signal: Extremely fast response (< 4 seconds) on non-trivial question
    if (input.timeSpentSeconds > 0 && input.timeSpentSeconds < 4 && input.questionText.length > 50) {
      signals.push(`Extremely short response time (${input.timeSpentSeconds}s < 4s threshold)`);
      return {
        mistakeType: 'GUESS',
        confidence: 0.85,
        evidence: `Response was entered in only ${input.timeSpentSeconds} seconds, indicating a rapid guess without reading the full stem.`,
        signals,
      };
    }

    // 2. TIME_PRESSURE Signal: Unusually prolonged response (> 2.5x expected) under test/practice conditions
    if (input.timeSpentSeconds > expectedTime * 2.5) {
      signals.push(`Time spent (${input.timeSpentSeconds}s) exceeded 2.5x expected time (${expectedTime}s)`);
      // Could be time pressure or conceptual struggle
      if ((input.consecutiveIncorrectOnConcept || 0) >= 2) {
        signals.push(`Repeated errors (${input.consecutiveIncorrectOnConcept}) on this concept`);
        return {
          mistakeType: 'CONCEPTUAL',
          confidence: 0.80,
          evidence: `Extended time spent (${input.timeSpentSeconds}s) combined with repeated errors on this concept indicates deep conceptual confusion.`,
          signals,
        };
      }
      return {
        mistakeType: 'TIME_PRESSURE',
        confidence: 0.70,
        evidence: `Spent ${input.timeSpentSeconds}s on this item, suggesting student got stuck or suffered pacing fatigue.`,
        signals,
      };
    }

    // 3. MISREAD Signal: Negative / Inverted stems ("NOT", "INCORRECT", "EXCEPT", "FALSE")
    const hasNegativeStem = /\b(not|incorrect|incorrectly|except|false|untrue|wrong)\b/i.test(input.questionText);
    if (hasNegativeStem) {
      signals.push(`Negative qualification in question stem: "NOT / INCORRECT / EXCEPT"`);
      return {
        mistakeType: 'MISREAD',
        confidence: 0.75,
        evidence: `Question contains a negative phrasing filter (NOT/INCORRECT/EXCEPT). Misreading such negative qualifiers is a common NEET trap.`,
        signals,
      };
    }

    // 4. DIAGRAM_INTERPRETATION Signal: Diagram-based or morphological recognition question
    if (input.hasDiagram || input.questionType === 'DIAGRAM_BASED' || /\b(diagram|figure|given graph|represented by|labelled|structure)\b/i.test(stemLower)) {
      signals.push('Question relies on graphical, anatomical, or diagrammatic interpretation');
      return {
        mistakeType: 'DIAGRAM_INTERPRETATION',
        confidence: 0.75,
        evidence: `Error occurred in interpreting the visual diagram, anatomical labels, or plotted curve.`,
        signals,
      };
    }

    // 5. CALCULATION Signal: Numerical calculation with arithmetic/magnitude expressions
    const hasMathOrNumerical = input.questionType === 'NUMERICAL' || 
      /[0-9\.\^]+\s*[\+\-\*\/\=]|calculate|determine the value|magnitude|ratio|frequency|velocity|mass|charge/i.test(stemLower);
    if (hasMathOrNumerical) {
      signals.push('Mathematical or numerical calculation detected in stem');
      // If student repeatedly errs on the concept, it's conceptual or formula
      if ((input.consecutiveIncorrectOnConcept || 0) >= 2) {
        return {
          mistakeType: 'FORMULA',
          confidence: 0.75,
          evidence: `Repeated numerical failure on this concept suggests applying the wrong formula or conversion factor.`,
          signals,
        };
      }
      return {
        mistakeType: 'CALCULATION',
        confidence: 0.70,
        evidence: `Calculation problem where student likely made an arithmetic, unit conversion, or power-of-10 error.`,
        signals,
      };
    }

    // 6. OPTION_CONFUSION Signal: Student toggled / changed option before submitting
    if ((input.optionChangedCount || 0) >= 2) {
      signals.push(`Option toggled ${input.optionChangedCount} times before submission`);
      return {
        mistakeType: 'OPTION_CONFUSION',
        confidence: 0.70,
        evidence: `Student hesitated and switched options multiple times, pointing to confusion between close distractors.`,
        signals,
      };
    }

    // 7. MEMORY / FACTUAL RECALL Signal: Direct botanical/zoological naming, discoverer, organelle, taxonomy
    const isDirectRecall = /\b(scientific name|discovered by|example of|phylum|family|order|hormone secreted|located in|organelle|coined the term)\b/i.test(stemLower);
    if (isDirectRecall) {
      signals.push('Factual recall / nomenclature question detected');
      return {
        mistakeType: 'MEMORY',
        confidence: 0.75,
        evidence: `Direct NCERT factual recall item where the specific terminology, taxon, or example was forgotten.`,
        signals,
      };
    }

    // 8. CONCEPTUAL Signal: Repeated failure on the concept
    if ((input.consecutiveIncorrectOnConcept || 0) >= 2) {
      signals.push(`Student has missed this concept ${input.consecutiveIncorrectOnConcept} times consecutively`);
      return {
        mistakeType: 'CONCEPTUAL',
        confidence: 0.85,
        evidence: `Repeated failure across multiple questions for this concept indicates fundamental concept gap requiring remediation.`,
        signals,
      };
    }

    // 9. SILLY Signal: Easy question with normal timing and single error
    if ((input as any).difficulty === 'EASY' && input.timeSpentSeconds > 15 && input.timeSpentSeconds < expectedTime && (input.consecutiveIncorrectOnConcept || 0) === 0) {
      signals.push('Standard response time on an isolated easy question');
      return {
        mistakeType: 'SILLY',
        confidence: 0.60,
        evidence: `Standard timing on an isolated question suggests an accidental slip or distractor trap rather than a deep knowledge void.`,
        signals,
      };
    }

    // Fallback: UNKNOWN (never hallucinate certainty)
    signals.push('Insufficient signals for definitive mistake classification');
    return {
      mistakeType: 'UNKNOWN',
      confidence: 0.20,
      evidence: `Ambiguous behavioral pattern. Needs further observational data.`,
      signals,
    };
  }
}
