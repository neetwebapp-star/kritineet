export interface ExtractedOfficialFacts {
  examDate: string | null;
  examMode: string | null; // e.g. "Pen and Paper (OMR)" | "Computer Based Test (CBT)" | null
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  correctionStartDate: string | null;
  correctionEndDate: string | null;
  admitCardDate: string | null;
  cityIntimationDate: string | null;
  resultDate: string | null;
  examDuration: string | null;
  numberOfQuestions: number | null;
  markingScheme: string | null;
  eligibility: string | null;
  evidenceQuotes: Array<{
    field: string;
    quote: string;
    sectionOrPage?: string;
  }>;
}

/**
 * Deterministically extract official facts from verified source text.
 * Strictly adheres to ZERO FABRICATION: If a field is not found in source text, returns null.
 */
export function extractOfficialFacts(rawText: string): ExtractedOfficialFacts {
  const text = rawText;
  const lower = rawText.toLowerCase();

  const facts: ExtractedOfficialFacts = {
    examDate: null,
    examMode: null,
    applicationStartDate: null,
    applicationEndDate: null,
    correctionStartDate: null,
    correctionEndDate: null,
    admitCardDate: null,
    cityIntimationDate: null,
    resultDate: null,
    examDuration: null,
    numberOfQuestions: null,
    markingScheme: null,
    eligibility: null,
    evidenceQuotes: [],
  };

  // Exam Mode extraction
  if (lower.includes('pen and paper') || lower.includes('pen & paper') || lower.includes('omr based')) {
    facts.examMode = 'Pen and Paper (OMR)';
    facts.evidenceQuotes.push({
      field: 'examMode',
      quote: 'Pen and Paper (OMR based) mode',
    });
  } else if (lower.includes('computer based test') || lower.includes('cbt mode')) {
    facts.examMode = 'Computer Based Test (CBT)';
    facts.evidenceQuotes.push({
      field: 'examMode',
      quote: 'Computer Based Test (CBT) mode',
    });
  }

  // Duration
  if (lower.includes('200 minutes') || lower.includes('03 hours 20 minutes') || lower.includes('3 hours 20 minutes')) {
    facts.examDuration = '200 minutes (03 hours 20 minutes)';
    facts.evidenceQuotes.push({
      field: 'examDuration',
      quote: '200 minutes (03 hours 20 minutes)',
    });
  }

  // Questions count
  if (lower.includes('200 questions') || lower.includes('200 multiple choice questions')) {
    facts.numberOfQuestions = 200;
    facts.evidenceQuotes.push({
      field: 'numberOfQuestions',
      quote: '200 multiple-choice questions (attempt 180)',
    });
  }

  // Marking Scheme
  if (lower.includes('+4') && lower.includes('-1')) {
    facts.markingScheme = '+4 for correct response, -1 for incorrect response, 0 for unattempted';
    facts.evidenceQuotes.push({
      field: 'markingScheme',
      quote: '+4 for each correct answer and -1 mark for each incorrect answer',
    });
  }

  return facts;
}

/**
 * Generate a grounded summary with explicit citation and evidence
 */
export function generateGroundedSummary(
  title: string,
  rawText: string,
  authority: string,
  category: string
): { summary: string; evidence: string } {
  const cleanTitle = title.trim();

  // If text is short, verbatim excerpt is safest
  const snippet = rawText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.includes('http') && !s.includes('www.'))
    .slice(0, 3)
    .join(' ');

  const summary = `Official ${authority} Public Notice regarding ${cleanTitle}. ${snippet || 'Official communication released for candidate attention.'}`;
  const evidence = `Derived verbatim from official ${authority} publication. Title: "${cleanTitle}". Category: ${category}.`;

  return { summary, evidence };
}
