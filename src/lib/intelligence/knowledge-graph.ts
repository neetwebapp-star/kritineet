import prisma from '../prisma';

export interface ConceptGraphNode {
  id: string;
  name: string;
  definition: string | null;
  formula: string | null;
  laws: string | null;
  chapter: {
    id: string;
    title: string;
    chapterNumber: number;
    biologyCategory: string | null;
    subject: {
      name: string;
      code: string;
    };
  };
  pyqCount: number;
  fingertipsCount: number;
  totalQuestionsCount: number;
  relatedPyqs: Array<{
    id: string;
    examName: string | null;
    examYear: number | null;
    questionText: string;
    difficulty: string;
  }>;
}

export interface StudentWeakAreaReport {
  conceptId: string;
  conceptName: string;
  chapterTitle: string;
  subjectName: string;
  mistakeCount: number;
  lastMistakeAt: Date;
  unresolvedCount: number;
}

/**
 * Content Knowledge Graph Service
 * Connects NCERT Chapters, Concepts, PYQs, Fingertips, Practice Questions & Student Performance
 */
export class KnowledgeGraphService {
  /**
   * "Show every question connected to this NCERT concept."
   */
  static async getQuestionsForConcept(conceptId: string, verifiedOnly = true) {
    const whereClause: any = {
      primaryConceptId: conceptId,
    };

    if (verifiedOnly) {
      whereClause.verificationStatus = 'VERIFIED';
      whereClause.publicationStatus = 'PUBLISHED';
    }

    return prisma.question.findMany({
      where: whereClause,
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        chapter: { select: { title: true, chapterNumber: true, biologyCategory: true } },
        subject: { select: { name: true, code: true } },
      },
    });
  }

  /**
   * "Show the NCERT source for this question."
   */
  static async getNcertSourceForQuestion(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        primaryConcept: {
          include: {
            chapter: {
              include: { subject: true },
            },
          },
        },
        sourceDocument: true,
      },
    });

    if (!question) return null;

    let ncertRef = null;
    if (question.primaryConcept?.ncertReference) {
      try {
        ncertRef = JSON.parse(question.primaryConcept.ncertReference);
      } catch {
        ncertRef = { raw: question.primaryConcept.ncertReference };
      }
    }

    return {
      questionId: question.id,
      questionText: question.questionText,
      sourceType: question.sourceType,
      examYear: question.examYear,
      examName: question.examName,
      sourceDocument: question.sourceDocument?.title ?? question.sourceDocumentId,
      sourcePage: question.sourcePage,
      originalQuestionNumber: question.originalQuestionNumber,
      concept: question.primaryConcept
        ? {
            id: question.primaryConcept.id,
            name: question.primaryConcept.name,
            definition: question.primaryConcept.definition,
            formula: question.primaryConcept.formula,
            ncertChapter: question.primaryConcept.chapter.title,
            subject: question.primaryConcept.chapter.subject.name,
            ncertRef,
          }
        : null,
    };
  }

  /**
   * "Show PYQs related to this topic or chapter."
   */
  static async getPyqsForChapter(chapterId: string, verifiedOnly = true) {
    const whereClause: any = {
      chapterId,
      sourceType: 'PYQ',
    };

    if (verifiedOnly) {
      whereClause.verificationStatus = 'VERIFIED';
      whereClause.publicationStatus = 'PUBLISHED';
    }

    return prisma.question.findMany({
      where: whereClause,
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        primaryConcept: { select: { id: true, name: true } },
      },
      orderBy: [{ examYear: 'desc' }, { originalQuestionNumber: 'asc' }],
    });
  }

  /**
   * "Show concepts where this student repeatedly makes mistakes."
   */
  static async getStudentMistakeConcepts(userId: string): Promise<StudentWeakAreaReport[]> {
    const mistakes = await prisma.studentMistake.findMany({
      where: { userId, isResolved: false },
      include: {
        concept: {
          include: {
            chapter: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: [{ mistakeCount: 'desc' }, { lastMistakeAt: 'desc' }],
    });

    // Aggregate by concept
    const conceptMap = new Map<string, StudentWeakAreaReport>();

    for (const m of mistakes) {
      if (!m.concept) continue;
      const cid = m.concept.id;
      if (!conceptMap.has(cid)) {
        conceptMap.set(cid, {
          conceptId: cid,
          conceptName: m.concept.name,
          chapterTitle: m.concept.chapter.title,
          subjectName: m.concept.chapter.subject.name,
          mistakeCount: m.mistakeCount,
          lastMistakeAt: m.lastMistakeAt,
          unresolvedCount: 1,
        });
      } else {
        const item = conceptMap.get(cid)!;
        item.mistakeCount += m.mistakeCount;
        item.unresolvedCount += 1;
        if (m.lastMistakeAt > item.lastMistakeAt) {
          item.lastMistakeAt = m.lastMistakeAt;
        }
      }
    }

    return Array.from(conceptMap.values()).sort((a, b) => b.mistakeCount - a.mistakeCount);
  }

  /**
   * Complete Knowledge Graph Node Details with calculated counts
   */
  static async getConceptGraphNode(conceptId: string): Promise<ConceptGraphNode | null> {
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        chapter: {
          include: { subject: true },
        },
        primaryQuestions: {
          where: { verificationStatus: 'VERIFIED', publicationStatus: 'PUBLISHED' },
          select: {
            id: true,
            sourceType: true,
            examName: true,
            examYear: true,
            questionText: true,
            difficulty: true,
          },
        },
      },
    });

    if (!concept) return null;

    const pyqs = concept.primaryQuestions.filter((q) => q.sourceType === 'PYQ');
    const fingertips = concept.primaryQuestions.filter((q) => q.sourceType === 'FINGERTIPS');

    return {
      id: concept.id,
      name: concept.name,
      definition: concept.definition,
      formula: concept.formula,
      laws: concept.laws,
      chapter: {
        id: concept.chapter.id,
        title: concept.chapter.title,
        chapterNumber: concept.chapter.chapterNumber,
        biologyCategory: concept.chapter.biologyCategory,
        subject: {
          name: concept.chapter.subject.name,
          code: concept.chapter.subject.code,
        },
      },
      pyqCount: pyqs.length,
      fingertipsCount: fingertips.length,
      totalQuestionsCount: concept.primaryQuestions.length,
      relatedPyqs: pyqs.map((p) => ({
        id: p.id,
        examName: p.examName,
        examYear: p.examYear,
        questionText: p.questionText,
        difficulty: p.difficulty,
      })),
    };
  }

  /**
   * "Show all questions testing this weak concept."
   */
  static async getQuestionsForWeakConcept(userId: string, conceptId: string) {
    const mastery = await prisma.studentConceptMastery.findUnique({
      where: { userId_conceptId: { userId, conceptId } },
    });

    const questions = await prisma.question.findMany({
      where: {
        primaryConceptId: conceptId,
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
        chapter: { include: { subject: true } },
      },
      orderBy: { difficulty: 'asc' },
    });

    return {
      conceptId,
      currentMastery: mastery?.masteryScore || 0,
      status: mastery?.status || 'UNSEEN',
      questions,
    };
  }

  /**
   * "Show all PYQs related to this concept."
   */
  static async getPyqsForConcept(conceptId: string) {
    return prisma.question.findMany({
      where: {
        primaryConceptId: conceptId,
        sourceType: 'PYQ',
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
      },
      orderBy: { examYear: 'desc' },
    });
  }

  /**
   * "Show Fingertips drills for this PYQ."
   * Looks up questions sharing the same canonical concept or cross-source link
   */
  static async getFingertipsForPyq(pyqQuestionId: string) {
    const pyq = await prisma.question.findUnique({
      where: { id: pyqQuestionId },
      include: { primaryConcept: true },
    });

    if (!pyq) return [];

    // First check exact cross-source link
    const directLinks = await prisma.question.findMany({
      where: {
        sameQuestionAsId: pyqQuestionId,
        sourceType: 'FINGERTIPS',
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
      },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        figures: true,
      },
    });

    if (directLinks.length > 0) return directLinks;

    // Fall back to same concept Fingertips drills
    if (pyq.primaryConceptId) {
      return prisma.question.findMany({
        where: {
          primaryConceptId: pyq.primaryConceptId,
          sourceType: 'FINGERTIPS',
          verificationStatus: 'VERIFIED',
          publicationStatus: 'PUBLISHED',
        },
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          figures: true,
        },
      });
    }

    return [];
  }

  /**
   * Complete student knowledge graph traversal:
   * Student -> Subject -> Chapter -> Concept -> Mastery -> Attempts -> Mistakes
   */
  static async getStudentKnowledgeGraph(userId: string, subjectCode?: string) {
    const chapters = await prisma.chapter.findMany({
      where: subjectCode && subjectCode !== 'ALL' ? { subject: { code: subjectCode } } : {},
      include: {
        subject: true,
        concepts: {
          include: {
            masteries: { where: { userId } },
            mistakes: { where: { userId, isResolved: false } },
            revisions: { where: { userId } },
          },
        },
      },
    });

    return chapters.map((ch) => ({
      chapterId: ch.id,
      title: ch.title,
      subjectName: ch.subject.name,
      concepts: ch.concepts.map((c) => ({
        id: c.id,
        name: c.name,
        definition: c.definition,
        formula: c.formula,
        mastery: c.masteries[0]?.masteryScore || 0,
        status: c.masteries[0]?.status || 'UNSEEN',
        unresolvedMistakes: c.mistakes.length,
        nextReviewAt: c.masteries[0]?.nextReviewAt || c.revisions[0]?.nextRevisionAt || null,
      })),
    }));
  }
}
