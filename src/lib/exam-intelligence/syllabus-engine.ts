import prisma from '../prisma';

export interface ChapterSyllabusEntry {
  chapterSlug: string;
  chapterTitle: string;
  subjectCode: string;
  classLevelCode: string;
  status: 'INCLUDED' | 'REMOVED' | 'MODIFIED';
  notes?: string;
  includedTopics?: string[];
  excludedTopics?: string[];
}

export interface SyllabusDiffResult {
  addedChapters: string[];
  removedChapters: string[];
  modifiedChapters: string[];
  renamedChapters: string[];
  unchangedChapters: string[];
  affectedConceptsCount: number;
  affectedQuestionsCount: number;
}

export class SyllabusEngine {
  /**
   * Initializes or creates an immutable Syllabus Version
   */
  static async createSyllabusVersion(data: {
    editionId: string;
    version: number;
    title: string;
    source: string;
    effectiveDate?: Date;
    publishedDate?: Date;
    chapters: ChapterSyllabusEntry[];
    summaryOfChanges?: string;
    adminUserId?: string;
  }) {
    // Check if this version already exists to guarantee immutability
    const existing = await prisma.examSyllabus.findUnique({
      where: {
        editionId_version: {
          editionId: data.editionId,
          version: data.version,
        },
      },
    });

    if (existing) {
      throw new Error(`Syllabus version ${data.version} for this edition already exists and is immutable.`);
    }

    const syllabus = await prisma.examSyllabus.create({
      data: {
        editionId: data.editionId,
        version: data.version,
        title: data.title,
        source: data.source,
        effectiveDate: data.effectiveDate || new Date(),
        publishedDate: data.publishedDate || new Date(),
        status: 'ACTIVE',
        syllabusDataJson: JSON.stringify({ chapters: data.chapters }),
        summaryOfChanges: data.summaryOfChanges || null,
      },
    });

    // Mark previous active syllabi for this edition as SUPERSEDED
    await prisma.examSyllabus.updateMany({
      where: {
        editionId: data.editionId,
        id: { not: syllabus.id },
        status: 'ACTIVE',
      },
      data: {
        status: 'SUPERSEDED',
      },
    });

    // Update Edition syllabusVersion pointer
    await prisma.examEdition.update({
      where: { id: data.editionId },
      data: { syllabusVersion: data.version },
    });

    await prisma.auditLog.create({
      data: {
        userId: data.adminUserId || null,
        action: 'CREATE_SYLLABUS_VERSION',
        entityType: 'ExamSyllabus',
        entityId: syllabus.id,
        newValues: JSON.stringify({ version: data.version, title: data.title, source: data.source }),
      },
    });

    return syllabus;
  }

  /**
   * Compares two syllabus versions and detects ADDED, REMOVED, MODIFIED, RENAMED, UNCHANGED chapters.
   */
  static async computeSyllabusDiff(fromSyllabusId: string, toSyllabusId: string): Promise<SyllabusDiffResult> {
    const fromSyllabus = await prisma.examSyllabus.findUnique({ where: { id: fromSyllabusId } });
    const toSyllabus = await prisma.examSyllabus.findUnique({ where: { id: toSyllabusId } });

    if (!fromSyllabus || !toSyllabus) {
      throw new Error('Syllabus version not found for diff comparison');
    }

    const fromData: { chapters: ChapterSyllabusEntry[] } = JSON.parse(fromSyllabus.syllabusDataJson);
    const toData: { chapters: ChapterSyllabusEntry[] } = JSON.parse(toSyllabus.syllabusDataJson);

    const fromMap = new Map<string, ChapterSyllabusEntry>();
    fromData.chapters.forEach((c) => fromMap.set(c.chapterSlug, c));

    const toMap = new Map<string, ChapterSyllabusEntry>();
    toData.chapters.forEach((c) => toMap.set(c.chapterSlug, c));

    const addedChapters: string[] = [];
    const removedChapters: string[] = [];
    const modifiedChapters: string[] = [];
    const renamedChapters: string[] = [];
    const unchangedChapters: string[] = [];

    // Check chapters in toMap
    for (const [slug, toChap] of toMap.entries()) {
      const fromChap = fromMap.get(slug);
      if (!fromChap) {
        if (toChap.status !== 'REMOVED') {
          addedChapters.push(slug);
        }
      } else {
        if (toChap.status === 'REMOVED' && fromChap.status !== 'REMOVED') {
          removedChapters.push(slug);
        } else if (toChap.chapterTitle !== fromChap.chapterTitle) {
          renamedChapters.push(slug);
        } else if (
          toChap.status === 'MODIFIED' ||
          JSON.stringify(toChap.includedTopics) !== JSON.stringify(fromChap.includedTopics) ||
          JSON.stringify(toChap.excludedTopics) !== JSON.stringify(fromChap.excludedTopics)
        ) {
          modifiedChapters.push(slug);
        } else {
          unchangedChapters.push(slug);
        }
      }
    }

    // Check chapters in fromMap missing from toMap
    for (const [slug, fromChap] of fromMap.entries()) {
      if (!toMap.has(slug) && fromChap.status !== 'REMOVED') {
        removedChapters.push(slug);
      }
    }

    // Identify affected concepts and questions for removed / modified chapters
    const affectedChapterSlugs = [...removedChapters, ...modifiedChapters];
    let affectedConceptsCount = 0;
    let affectedQuestionsCount = 0;

    if (affectedChapterSlugs.length > 0) {
      const affectedDbChapters = await prisma.chapter.findMany({
        where: { slug: { in: affectedChapterSlugs } },
        select: { id: true },
      });
      const chapterIds = affectedDbChapters.map((c) => c.id);

      if (chapterIds.length > 0) {
        affectedConceptsCount = await prisma.concept.count({
          where: { chapterId: { in: chapterIds } },
        });

        affectedQuestionsCount = await prisma.question.count({
          where: { chapterId: { in: chapterIds } },
        });
      }
    }

    const diffRecord = await prisma.examSyllabusDiff.create({
      data: {
        fromSyllabusId,
        toSyllabusId,
        diffSummary: `Diff from v${fromSyllabus.version} to v${toSyllabus.version}: +${addedChapters.length} added, -${removedChapters.length} removed, ~${modifiedChapters.length} modified`,
        diffDetailsJson: JSON.stringify({
          added: addedChapters,
          removed: removedChapters,
          modified: modifiedChapters,
          renamed: renamedChapters,
          unchanged: unchangedChapters,
        }),
        affectedConceptsCount,
        affectedQuestionsCount,
      },
    });

    return {
      addedChapters,
      removedChapters,
      modifiedChapters,
      renamedChapters,
      unchangedChapters,
      affectedConceptsCount,
      affectedQuestionsCount,
    };
  }

  /**
   * Applies syllabus content impact: marks questions outside current syllabus
   * so they are excluded from new practice/mocks by default while preserving historical data.
   */
  static async applySyllabusContentImpact(syllabusId: string, adminUserId?: string) {
    const syllabus = await prisma.examSyllabus.findUnique({ where: { id: syllabusId } });
    if (!syllabus) throw new Error('Syllabus not found');

    const syllabusData: { chapters: ChapterSyllabusEntry[] } = JSON.parse(syllabus.syllabusDataJson);
    const removedSlugs = syllabusData.chapters.filter((c) => c.status === 'REMOVED').map((c) => c.chapterSlug);
    const includedSlugs = syllabusData.chapters.filter((c) => c.status === 'INCLUDED').map((c) => c.chapterSlug);

    let updatedToOutsideCount = 0;
    let updatedToCurrentCount = 0;

    if (removedSlugs.length > 0) {
      const removedChapters = await prisma.chapter.findMany({
        where: { slug: { in: removedSlugs } },
        select: { id: true },
      });
      const removedIds = removedChapters.map((c) => c.id);

      if (removedIds.length > 0) {
        const res = await prisma.question.updateMany({
          where: {
            chapterId: { in: removedIds },
            syllabusStatus: { not: 'OUTSIDE_CURRENT_SYLLABUS' },
          },
          data: {
            syllabusStatus: 'OUTSIDE_CURRENT_SYLLABUS',
          },
        });
        updatedToOutsideCount = res.count;
      }
    }

    if (includedSlugs.length > 0) {
      const includedChapters = await prisma.chapter.findMany({
        where: { slug: { in: includedSlugs } },
        select: { id: true },
      });
      const includedIds = includedChapters.map((c) => c.id);

      if (includedIds.length > 0) {
        const res = await prisma.question.updateMany({
          where: {
            chapterId: { in: includedIds },
            syllabusStatus: 'OUTSIDE_CURRENT_SYLLABUS',
          },
          data: {
            syllabusStatus: 'CURRENT',
          },
        });
        updatedToCurrentCount = res.count;
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: adminUserId || null,
        action: 'APPLY_SYLLABUS_CONTENT_IMPACT',
        entityType: 'ExamSyllabus',
        entityId: syllabusId,
        newValues: JSON.stringify({
          updatedToOutsideCount,
          updatedToCurrentCount,
        }),
      },
    });

    return {
      updatedToOutsideCount,
      updatedToCurrentCount,
    };
  }

  /**
   * Builds question Prisma where-filter respecting current syllabus eligibility.
   * By default, strictly excludes questions outside current syllabus.
   */
  static buildEligibilityFilter(includeOutOfSyllabus: boolean = false) {
    if (includeOutOfSyllabus) {
      return {};
    }
    return {
      syllabusStatus: {
        in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'],
      },
    };
  }
}
