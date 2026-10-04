export type AnswerValidationStatus = 'VERIFIED' | 'CONFLICT' | 'NEEDS_REVIEW';

export interface AnswerValidationResult {
  status: AnswerValidationStatus;
  normalizedAnswer: string;
  hasValidOptions: boolean;
  explanationValid: boolean;
  warnings: string[];
}

/**
 * Validates answer keys against options, verifies option completeness and labels,
 * and checks explanation consistency to protect against OCR errors.
 */
export function validateAnswer(
  rawAnswer: string | null | undefined,
  options: { label: string; text: string }[],
  explanation?: string | null
): AnswerValidationResult {
  const warnings: string[] = [];

  // Normalize Answer Label (e.g. "1" -> "A", "b" -> "B", "(3)" -> "C", "[4]" -> "D")
  let normalized = (rawAnswer || '').trim().toUpperCase();
  const digitMatch = normalized.match(/\b([1-4])\b/);
  if (digitMatch) {
    const map: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
    normalized = map[digitMatch[1]];
  } else {
    const letterMatch = normalized.match(/\b([A-D])\b/);
    if (letterMatch) {
      normalized = letterMatch[1];
    }
  }

  // 1. Verify Options Presence
  if (!options || options.length < 2) {
    warnings.push(`Insufficient options found (${options?.length || 0}). Expected at least 2.`);
    return {
      status: 'NEEDS_REVIEW',
      normalizedAnswer: normalized || 'A',
      hasValidOptions: false,
      explanationValid: !!explanation && explanation.length > 10,
      warnings
    };
  }

  // 2. Check Option Labels
  const validLabels = new Set(['A', 'B', 'C', 'D']);
  const actualLabels = new Set(options.map(o => o.label.toUpperCase()));
  const missingLabels = Array.from(validLabels).filter(l => !actualLabels.has(l));

  if (options.length === 4 && missingLabels.length > 0) {
    warnings.push(`Non-standard option labels found: ${Array.from(actualLabels).join(', ')}`);
  }

  // 3. Check Empty Option Text
  const emptyOptions = options.filter(o => !o.text || o.text.trim().length === 0);
  if (emptyOptions.length > 0) {
    warnings.push(`${emptyOptions.length} options have empty text.`);
  }

  // 4. Validate Answer matches one of the options
  if (!normalized || !actualLabels.has(normalized)) {
    warnings.push(`Answer key '${rawAnswer}' (normalized '${normalized}') does not match any available option (${Array.from(actualLabels).join(', ')}).`);
    return {
      status: 'CONFLICT',
      normalizedAnswer: normalized || 'A',
      hasValidOptions: emptyOptions.length === 0,
      explanationValid: !!explanation && explanation.length > 10,
      warnings
    };
  }

  // 5. Cross-Check with Explanation if explanation mentions a different option
  if (explanation && explanation.length > 15) {
    const expMatch = explanation.match(/(?:correct\s+option\s+is|correct\s+answer\s+is|hence\s+option|option\s+is)\s*[\(\[]?([A-D1-4])[\)\]]?/i);
    if (expMatch) {
      let expOption = expMatch[1].toUpperCase();
      const numMap: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      if (numMap[expOption]) expOption = numMap[expOption];

      if (expOption !== normalized && actualLabels.has(expOption)) {
        warnings.push(`Potential conflict: Answer key is '${normalized}', but explanation indicates option '${expOption}'.`);
        return {
          status: 'CONFLICT',
          normalizedAnswer: normalized,
          hasValidOptions: emptyOptions.length === 0,
          explanationValid: true,
          warnings
        };
      }
    }
  }

  return {
    status: warnings.length === 0 ? 'VERIFIED' : 'NEEDS_REVIEW',
    normalizedAnswer: normalized,
    hasValidOptions: emptyOptions.length === 0,
    explanationValid: !!explanation && explanation.length > 10,
    warnings
  };
}
