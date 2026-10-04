import crypto from 'crypto';

export interface QuestionIdentityResult {
  normalizedHash: string;
  semanticHash: string;
  isDuplicate: boolean;
  duplicateOfId?: string;
}

/**
 * Normalizes question stem and options to create a deterministic fingerprint
 * that identifies identical questions across different books, PYQs, and editions.
 */
export function generateQuestionFingerprint(stem: string, options: { label?: string; text: string }[]): string {
  // Strip whitespace, punctuation, LaTeX wrappers, and lowercase
  const cleanStem = stem
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const cleanOptions = options
    .map(o => o.text.toLowerCase().replace(/[^a-z0-9]/g, '').trim())
    .sort()
    .join('|');

  return crypto.createHash('sha256').update(`${cleanStem}:::${cleanOptions}`).digest('hex');
}

/**
 * Generates a semantic stem hash to identify question variations or same concept stems.
 */
export function generateSemanticStemHash(stem: string): string {
  const words = stem
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'which', 'following', 'statement', 'correct', 'incorrect', 'given'].includes(w))
    .slice(0, 10)
    .sort()
    .join('_');

  return crypto.createHash('sha256').update(words).digest('hex');
}

/**
 * Evaluates duplicate candidate relationship between two questions.
 */
export function evaluateDeduplication(
  newStem: string,
  newOptions: { label?: string; text: string }[],
  existingQuestions: { id: string; fingerprint: string | null; stem: string }[]
): { isDuplicate: boolean; existingQuestionId?: string; similarityScore: number } {
  const newFp = generateQuestionFingerprint(newStem, newOptions);

  for (const eq of existingQuestions) {
    if (eq.fingerprint && eq.fingerprint === newFp) {
      return { isDuplicate: true, existingQuestionId: eq.id, similarityScore: 1.0 };
    }
  }

  // Token-based Jaccard similarity fallback
  const newTokens = new Set(newStem.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  for (const eq of existingQuestions) {
    const eqTokens = new Set(eq.stem.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    let intersection = 0;
    for (const t of newTokens) {
      if (eqTokens.has(t)) intersection++;
    }
    const union = new Set([...newTokens, ...eqTokens]).size;
    const jaccard = union > 0 ? intersection / union : 0;
    if (jaccard > 0.85) {
      return { isDuplicate: true, existingQuestionId: eq.id, similarityScore: jaccard };
    }
  }

  return { isDuplicate: false, similarityScore: 0 };
}
