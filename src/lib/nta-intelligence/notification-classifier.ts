export interface ClassificationResult {
  isNeetRelevant: boolean;
  authority: 'NTA' | 'NMC' | 'UGMEB';
  category: string;
  alertLevel: 'INFO' | 'IMPORTANT' | 'ACTION_REQUIRED' | 'CRITICAL';
  examYear: number | null;
  isHistorical: boolean;
  relevanceConfidence: number;
}

const NEET_KEYWORDS = [
  'neet',
  'neet (ug)',
  'neet ug',
  'national eligibility cum entrance test',
  'undergraduate medical',
  'mbbs',
  'bds',
  'ugmeb',
];

export function classifyOfficialNotice(
  title: string,
  rawText: string = '',
  sourceAuthority: string = 'NTA'
): ClassificationResult {
  const fullText = `${title} ${rawText}`.toLowerCase();

  // 1. NEET Relevance
  const hasKeyword = NEET_KEYWORDS.some((kw) => fullText.includes(kw));
  if (!hasKeyword && sourceAuthority !== 'NEET_PORTAL') {
    return {
      isNeetRelevant: false,
      authority: sourceAuthority === 'NMC' ? 'NMC' : 'NTA',
      category: 'OTHER_OFFICIAL',
      alertLevel: 'INFO',
      examYear: null,
      isHistorical: false,
      relevanceConfidence: 0.1,
    };
  }

  // 2. Determine Authority
  let authority: 'NTA' | 'NMC' | 'UGMEB' = 'NTA';
  if (fullText.includes('ugmeb') || fullText.includes('under graduate medical education board')) {
    authority = 'UGMEB';
  } else if (fullText.includes('nmc') || fullText.includes('national medical commission')) {
    authority = 'NMC';
  } else {
    authority = 'NTA';
  }

  // 3. Determine Exam Year (Strict detection, NO GUESSING)
  let examYear: number | null = null;
  let isHistorical = false;

  if (fullText.includes('2027') || fullText.includes('neet-2027') || fullText.includes('neet (ug) 2027')) {
    examYear = 2027;
    isHistorical = false;
  } else if (fullText.includes('2026') || fullText.includes('neet-2026') || fullText.includes('neet (ug) 2026')) {
    examYear = 2026;
    isHistorical = true; // Historical/Reference relative to 2027
  } else if (fullText.includes('2025') || fullText.includes('neet-2025')) {
    examYear = 2025;
    isHistorical = true;
  } else if (fullText.includes('2024') || fullText.includes('neet-2024')) {
    examYear = 2024;
    isHistorical = true;
  } else {
    examYear = null; // UNKNOWN - Never guess!
  }

  // 4. Determine Category
  let category = 'OTHER_NEET_OFFICIAL';
  let alertLevel: 'INFO' | 'IMPORTANT' | 'ACTION_REQUIRED' | 'CRITICAL' = 'INFO';

  if (fullText.includes('corrigendum') || fullText.includes('addendum')) {
    category = 'CORRIGENDUM';
    alertLevel = 'IMPORTANT';
  } else if (fullText.includes('syllabus') || fullText.includes('curriculum')) {
    category = fullText.includes('change') || fullText.includes('revised') ? 'SYLLABUS_CHANGE' : 'SYLLABUS';
    alertLevel = 'CRITICAL';
  } else if (fullText.includes('exam date') || fullText.includes('date of examination') || fullText.includes('examination schedule')) {
    category = 'EXAM_DATE';
    alertLevel = 'CRITICAL';
  } else if (fullText.includes('mode of examination') || fullText.includes('cbt') || fullText.includes('pen and paper') || fullText.includes('omr based')) {
    category = 'EXAM_MODE';
    alertLevel = 'CRITICAL';
  } else if (fullText.includes('admit card') || fullText.includes('hall ticket')) {
    category = 'ADMIT_CARD';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('advance intimation of examination city') || fullText.includes('city intimation')) {
    category = 'CITY_INTIMATION';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('correction window') || fullText.includes('correction in particulars')) {
    category = 'APPLICATION_CORRECTION';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('extension') && fullText.includes('application')) {
    category = 'APPLICATION_EXTENSION';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('online application') || fullText.includes('inviting online applications') || fullText.includes('registration')) {
    category = 'APPLICATION';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('answer key') && (fullText.includes('challenge') || fullText.includes('objection'))) {
    category = 'ANSWER_KEY_CHALLENGE';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('answer key') || fullText.includes('provisional answer')) {
    category = 'ANSWER_KEY';
    alertLevel = 'IMPORTANT';
  } else if (fullText.includes('omr answer sheet') || fullText.includes('recorded response')) {
    category = 'OMR';
    alertLevel = 'ACTION_REQUIRED';
  } else if (fullText.includes('declaration of result') || fullText.includes('score card') || fullText.includes('result')) {
    category = 'RESULT';
    alertLevel = 'IMPORTANT';
  } else if (fullText.includes('re-examination') || fullText.includes('retest')) {
    category = 'RE_EXAMINATION';
    alertLevel = 'CRITICAL';
  } else if (fullText.includes('information bulletin')) {
    category = 'INFORMATION_BULLETIN';
    alertLevel = 'CRITICAL';
  } else if (fullText.includes('counselling') || fullText.includes('mcc') || fullText.includes('admission')) {
    category = 'COUNSELLING_RELATED';
    alertLevel = 'IMPORTANT';
  } else if (fullText.includes('security advisory') || fullText.includes('unfair means') || fullText.includes('impersonation')) {
    category = 'SECURITY_ADVISORY';
    alertLevel = 'CRITICAL';
  } else if (fullText.includes('advisory') || fullText.includes('guidelines') || fullText.includes('instructions for candidate')) {
    category = 'IMPORTANT_ADVISORY';
    alertLevel = 'IMPORTANT';
  } else if (fullText.includes('faq') || fullText.includes('frequently asked questions')) {
    category = 'FAQ';
    alertLevel = 'INFO';
  }

  return {
    isNeetRelevant: true,
    authority,
    category,
    alertLevel,
    examYear,
    isHistorical,
    relevanceConfidence: 0.95,
  };
}
