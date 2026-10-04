/**
 * Phase 6: AI Intent Detector
 * Classifies student queries into one of the 10 canonical AI Tutor Modes,
 * extracts targeted subject (Biology, Physics, Chemistry), chapter, concept keywords,
 * and question identifiers.
 */

export type TutorMode =
  | 'ASK_DOUBT'
  | 'EXPLAIN_CONCEPT'
  | 'SOLVE_QUESTION'
  | 'TEACH_ME'
  | 'REVISION'
  | 'MISTAKE_ANALYSIS'
  | 'PYQ_COACH'
  | 'EXAM_STRATEGY'
  | 'QUIZ_ME'
  | 'WEAKNESS_COACH';

export interface DetectedIntent {
  mode: TutorMode;
  confidence: number;
  subject?: 'BIOLOGY' | 'PHYSICS' | 'CHEMISTRY';
  biologyCategory?: 'BOTANY' | 'ZOOLOGY';
  chapterHint?: string;
  conceptKeywords: string[];
  questionId?: string;
  isBypassRequested: boolean;
}

export class IntentDetector {
  public static detect(query: string, explicitMode?: TutorMode, questionId?: string): DetectedIntent {
    const text = query.trim().toLowerCase();

    // Check for explicit bypass (e.g. Socratic bypass)
    const isBypassRequested =
      text.includes('show answer') ||
      text.includes('tell me the answer') ||
      text.includes('give me the answer') ||
      text.includes('just solve it') ||
      text.includes('skip socratic') ||
      text.includes('i give up');

    // If explicit mode passed and valid, use it
    if (explicitMode) {
      const parsed = this.extractEntities(text, questionId);
      return {
        mode: explicitMode,
        confidence: 1.0,
        subject: parsed.subject,
        biologyCategory: parsed.biologyCategory,
        chapterHint: parsed.chapterHint,
        conceptKeywords: parsed.conceptKeywords,
        questionId: questionId || parsed.questionId,
        isBypassRequested,
      };
    }

    // Pattern-based mode classification
    let detectedMode: TutorMode = 'ASK_DOUBT';
    let confidence = 0.7;

    if (text.includes('quiz') || text.includes('test me') || text.includes('ask me a question') || text.includes('mcq practice')) {
      detectedMode = 'QUIZ_ME';
      confidence = 0.95;
    } else if (text.includes('revis') || text.includes('summary') || text.includes('cheat sheet') || text.includes('quick recap') || text.includes('formula sheet')) {
      detectedMode = 'REVISION';
      confidence = 0.92;
    } else if (text.includes('mistake') || text.includes('why did i get this wrong') || text.includes('my error') || text.includes('where did i go wrong') || text.includes('silly error')) {
      detectedMode = 'MISTAKE_ANALYSIS';
      confidence = 0.95;
    } else if (text.includes('strategy') || text.includes('time management') || text.includes('negative marking') || text.includes('score 650') || text.includes('how to attempt') || text.includes('exam pattern')) {
      detectedMode = 'EXAM_STRATEGY';
      confidence = 0.93;
    } else if (text.includes('pyq') || text.includes('previous year') || text.includes('neet trend') || (text.includes('neet 20') && !text.includes('neet 2027')) || text.includes('past paper')) {
      detectedMode = 'PYQ_COACH';
      confidence = 0.92;
    } else if (text.includes('teach me') || text.includes('guide me') || text.includes('step by step help') || text.includes('walk me through')) {
      detectedMode = 'TEACH_ME';
      confidence = 0.9;
    } else if (text.includes('weak') || text.includes('struggling with') || text.includes('improve my score in') || text.includes('remedial') || text.includes('low score')) {
      detectedMode = 'WEAKNESS_COACH';
      confidence = 0.9;
    } else if (text.includes('solve') || text.includes('solution') || text.includes('how to calculate') || questionId) {
      detectedMode = 'SOLVE_QUESTION';
      confidence = questionId ? 0.95 : 0.85;
    } else if (text.includes('explain') || text.includes('what is') || text.includes('define') || text.includes('difference between') || text.includes('mechanism of')) {
      detectedMode = 'EXPLAIN_CONCEPT';
      confidence = 0.88;
    }

    const entities = this.extractEntities(text, questionId);

    return {
      mode: detectedMode,
      confidence,
      subject: entities.subject,
      biologyCategory: entities.biologyCategory,
      chapterHint: entities.chapterHint,
      conceptKeywords: entities.conceptKeywords,
      questionId: questionId || entities.questionId,
      isBypassRequested,
    };
  }

  private static extractEntities(text: string, existingQuestionId?: string) {
    let subject: 'BIOLOGY' | 'PHYSICS' | 'CHEMISTRY' | undefined;
    let biologyCategory: 'BOTANY' | 'ZOOLOGY' | undefined;

    if (text.includes('botany') || text.includes('plant') || text.includes('photosynthesis') || text.includes('flower') || text.includes('angiosperm') || text.includes('chloroplast') || text.includes('mitosis')) {
      subject = 'BIOLOGY';
      biologyCategory = 'BOTANY';
    } else if (text.includes('zoology') || text.includes('animal') || text.includes('human') || text.includes('heart') || text.includes('digestion') || text.includes('kidney') || text.includes('hormone') || text.includes('neuron')) {
      subject = 'BIOLOGY';
      biologyCategory = 'ZOOLOGY';
    } else if (text.includes('biology') || text.includes('bio') || text.includes('cell') || text.includes('genetics') || text.includes('dna') || text.includes('ecology')) {
      subject = 'BIOLOGY';
    } else if (text.includes('physics') || text.includes('phy') || text.includes('velocity') || text.includes('acceleration') || text.includes('force') || text.includes('shm') || text.includes('optics') || text.includes('thermodynamics') || text.includes('current') || text.includes('flux')) {
      subject = 'PHYSICS';
    } else if (text.includes('chemistry') || text.includes('chem') || text.includes('reaction') || text.includes('mole') || text.includes('orbital') || text.includes('acid') || text.includes('organic') || text.includes('inorganic') || text.includes('equilibrium')) {
      subject = 'CHEMISTRY';
    }

    // Extract potential question ID (e.g. "q_123", "cmu...", or standard id)
    let questionId = existingQuestionId;
    if (!questionId) {
      const qMatch = text.match(/\b(q-[a-z0-9]+|cmu[a-z0-9]+)\b/i);
      if (qMatch) {
        questionId = qMatch[1];
      }
    }

    // Extract concept keywords (words with length > 4 that aren't stop words)
    const stopWords = new Set([
      'explain', 'solve', 'question', 'doubt', 'please', 'help', 'teach', 'about',
      'concept', 'what', 'which', 'where', 'when', 'there', 'their', 'would', 'could',
      'should', 'physics', 'chemistry', 'biology', 'botany', 'zoology', 'neet', '2027', 'chapter'
    ]);

    const words = text
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w));

    return {
      subject,
      biologyCategory,
      chapterHint: words[0] || undefined,
      conceptKeywords: words.slice(0, 5),
      questionId,
    };
  }
}
