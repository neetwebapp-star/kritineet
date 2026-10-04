import prisma from '../prisma';

export interface GlobalSearchResult {
  query: string;
  concepts: Array<{
    id: string;
    name: string;
    definition: string | null;
    formula: string | null;
    chapterTitle: string;
    subjectName: string;
  }>;
  chapters: Array<{
    id: string;
    title: string;
    chapterNumber: number;
    subjectName: string;
    biologyCategory: string | null;
  }>;
  questions: Array<{
    id: string;
    questionText: string;
    sourceType: string;
    sourceBadge: string;
    examName?: string | null;
    examYear: number | null;
    difficulty: string;
    questionType: string;
    chapterTitle: string;
    conceptName?: string | null;
  }>;
  studentResults?: {
    weakConcepts?: Array<{ id: string; name: string; chapterTitle: string; masteryScore: number }>;
    myMistakes?: Array<{ id: string; questionText: string; mistakeCount: number; mistakeType: string }>;
    revisionsDue?: Array<{ id: string; questionText: string; nextRevisionAt: Date }>;
  };
}

export class GlobalSearchEngine {
  /**
   * Performs server-side indexed search across concepts, chapters, verified questions,
   * and personalized student queries (e.g. "weak physics concepts", "my mistakes", "revision due")
   */
  static async search(rawQuery: string, userId?: string): Promise<GlobalSearchResult> {
    const query = rawQuery.trim();
    if (!query || query.length < 2) {
      return { query, concepts: [], chapters: [], questions: [] };
    }

    const lower = query.toLowerCase();
    let studentResults: GlobalSearchResult['studentResults'] = undefined;

    // 1. Personalized Intent Recognition for Authenticated Student
    if (userId) {
      studentResults = {};

      if (lower.includes('weak') || lower.includes('struggl')) {
        let subjectCode: string | undefined = undefined;
        if (lower.includes('physic')) subjectCode = 'PHY';
        else if (lower.includes('chem')) subjectCode = 'CHE';
        else if (lower.includes('bio')) subjectCode = 'BIO';

        const weak = await prisma.studentConceptMastery.findMany({
          where: {
            userId,
            OR: [{ status: 'WEAK' }, { masteryScore: { lt: 55 } }],
            ...(subjectCode ? { concept: { chapter: { subject: { code: subjectCode } } } } : {}),
          },
          take: 8,
          include: { concept: { include: { chapter: true } } },
        });

        studentResults.weakConcepts = weak.map((w) => ({
          id: w.conceptId,
          name: w.concept.name,
          chapterTitle: w.concept.chapter.title,
          masteryScore: w.masteryScore,
        }));
      }

      if (lower.includes('mistake') || lower.includes('wrong') || lower.includes('error')) {
        const cleanTerm = query.replace(/\b(my|mistakes|mistake|wrong|error|in|on)\b/gi, '').trim();
        const mistakes = await prisma.studentMistake.findMany({
          where: {
            userId,
            isLearned: false,
            ...(cleanTerm.length > 2
              ? {
                  OR: [
                    { question: { questionText: { contains: cleanTerm } } },
                    { chapter: { title: { contains: cleanTerm } } },
                  ],
                }
              : {}),
          },
          take: 8,
          include: { question: true },
        });

        studentResults.myMistakes = mistakes.map((m) => ({
          id: m.id,
          questionText: m.question.questionText,
          mistakeCount: m.mistakeCount,
          mistakeType: m.mistakeType || 'UNKNOWN',
        }));
      }

      if (lower.includes('revision') || lower.includes('due') || lower.includes('today')) {
        const dueRevisions = await prisma.revisionSchedule.findMany({
          where: {
            userId,
            nextRevisionAt: { lte: new Date() },
            question: { isNot: null },
          },
          take: 8,
          include: { question: true },
        });

        studentResults.revisionsDue = dueRevisions.map((r) => ({
          id: r.id,
          questionText: r.question?.questionText || 'Concept review item',
          nextRevisionAt: r.nextRevisionAt,
        }));
      }
    }

    // 2. Search concepts (name, definition, formula, laws)
    const concepts = await prisma.concept.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { definition: { contains: query } },
          { formula: { contains: query } },
          { laws: { contains: query } },
        ],
      },
      take: 10,
      include: {
        chapter: { include: { subject: true } },
      },
    });

    // 3. Search chapters
    const chapters = await prisma.chapter.findMany({
      where: {
        title: { contains: query },
        chapterNumber: { lte: 20 },
        unitId: { not: null },
      },
      take: 8,
      include: { subject: true },
    });

    // 4. Search verified questions across PYQ, Fingertips, and NCERT
    const cleanSearch = query.replace(/\b(neet|pyq|pyqs|questions|from)\b/gi, '').trim() || query;
    const questions = await prisma.question.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
        syllabusStatus: 'CURRENT',
        OR: [
          { questionText: { contains: cleanSearch } },
          { explanation: { contains: cleanSearch } },
          { bookName: { contains: cleanSearch } },
        ],
      },
      take: 20,
      include: {
        chapter: true,
        primaryConcept: true,
      },
    });

    return {
      query,
      concepts: concepts.map((c) => ({
        id: c.id,
        name: c.name,
        definition: c.definition,
        formula: c.formula,
        chapterTitle: c.chapter.title,
        subjectName: c.chapter.subject.name,
      })),
      chapters: chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        subjectName: ch.subject.name,
        biologyCategory: ch.biologyCategory,
      })),
      questions: questions.map((q) => {
        let cleanBadge = 'NCERT';
        if (q.sourceType === 'PYQ') {
          cleanBadge = `${q.examName || 'NEET'} ${q.examYear || ''}`.trim();
        } else if (q.sourceType === 'FINGERTIPS') {
          cleanBadge = 'MTG Fingertips';
        }

        return {
          id: q.id,
          questionText: q.questionText,
          sourceType: q.sourceType,
          sourceBadge: cleanBadge,
          examName: q.examName,
          examYear: q.examYear,
          difficulty: q.difficulty,
          questionType: q.questionType,
          chapterTitle: q.chapter.title,
          conceptName: q.primaryConcept?.name || null,
        };
      }),
      studentResults:
        studentResults &&
        (studentResults.weakConcepts?.length ||
          studentResults.myMistakes?.length ||
          studentResults.revisionsDue?.length)
          ? studentResults
          : undefined,
    };
  }
}
