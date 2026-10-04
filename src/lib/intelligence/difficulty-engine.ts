export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
export type DifficultySource = 'SOURCE' | 'DERIVED' | 'MANUAL';

export interface DifficultyEvaluation {
  difficulty: DifficultyLevel;
  difficultySource: DifficultySource;
  difficultyConfidence: number;
  signals: {
    stemLength: number;
    numericalComplexity: boolean;
    multiStepReasoning: boolean;
    statementCount: number;
    distractorSimilarity: boolean;
    questionTypeMultiplier: number;
  };
}

/**
 * Calculates normalized difficulty using objective structural and cognitive signals
 * when source difficulty is not explicitly given.
 */
export function evaluateDifficulty(
  stem: string,
  options: { label: string; text: string }[],
  questionType: string,
  explicitSourceDifficulty?: string | null
): DifficultyEvaluation {
  if (explicitSourceDifficulty && ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'].includes(explicitSourceDifficulty.toUpperCase())) {
    return {
      difficulty: explicitSourceDifficulty.toUpperCase() as DifficultyLevel,
      difficultySource: 'SOURCE',
      difficultyConfidence: 0.95,
      signals: {
        stemLength: stem.length,
        numericalComplexity: /[0-9\.\^]+\s*[\+\-\*\/\=]/.test(stem),
        multiStepReasoning: /calculate|determine|find the ratio|proportion|respectively/i.test(stem),
        statementCount: (stem.match(/\([i|v|x|a-d]+\)/gi) || []).length,
        distractorSimilarity: false,
        questionTypeMultiplier: 1.0,
      }
    };
  }

  // Derived Difficulty Signals
  let difficultyScore = 0; // 0 to 100

  // 1. Stem Length & Reading Load
  if (stem.length > 300) difficultyScore += 20;
  else if (stem.length > 150) difficultyScore += 10;
  else difficultyScore += 5;

  // 2. Numerical & Mathematical Complexity
  const hasMath = /[0-9\.\^]+\s*[\+\-\*\/\=]|sin|cos|tan|log|ln|sqrt|Δ|λ|μ|Ω/i.test(stem);
  if (hasMath) difficultyScore += 25;

  // 3. Multi-Statement / Assertion-Reason / Matching
  const isAssertionReason = questionType === 'ASSERTION_REASON' || /assertion|reason/i.test(stem);
  const isMatching = questionType === 'MATCHING' || /match column/i.test(stem);
  const isStatementBased = questionType === 'STATEMENT_BASED' || /which of the following statement/i.test(stem);

  if (isAssertionReason) difficultyScore += 30;
  else if (isMatching) difficultyScore += 25;
  else if (isStatementBased) difficultyScore += 20;

  // 4. Multi-Step Reasoning Indicators
  const multiStep = /calculate|determine|find the ratio|percentage increase|efficiency|revolve/i.test(stem);
  if (multiStep) difficultyScore += 15;

  // 5. Distractor Similarity (short similar numbers or closely matched chemical isomers)
  const optionLengths = options.map(o => o.text.trim().length);
  const avgLen = optionLengths.reduce((a, b) => a + b, 0) / (options.length || 1);
  const isSimilar = optionLengths.every(l => Math.abs(l - avgLen) < 4);
  if (isSimilar && options.length >= 4) difficultyScore += 10;

  let difficulty: DifficultyLevel = 'MEDIUM';
  if (difficultyScore >= 70) difficulty = 'VERY_HARD';
  else if (difficultyScore >= 50) difficulty = 'HARD';
  else if (difficultyScore >= 25) difficulty = 'MEDIUM';
  else difficulty = 'EASY';

  return {
    difficulty,
    difficultySource: 'DERIVED',
    difficultyConfidence: 0.88,
    signals: {
      stemLength: stem.length,
      numericalComplexity: hasMath,
      multiStepReasoning: multiStep,
      statementCount: (stem.match(/\([i|v|x|a-d]+\)/gi) || []).length,
      distractorSimilarity: isSimilar,
      questionTypeMultiplier: isAssertionReason ? 1.3 : (isMatching ? 1.2 : 1.0),
    }
  };
}
