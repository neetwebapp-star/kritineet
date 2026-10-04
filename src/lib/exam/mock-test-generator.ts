import prisma from '../prisma';
import { ExamPatternEngine } from './exam-pattern-engine';
import { MockBlueprintEngine, BlueprintConfig } from './mock-blueprint-engine';
import { MockQualityValidator } from './mock-quality-validator';
import { ConceptMasteryEngine } from '../intelligence/concept-mastery-engine';

export interface GenerateMockOptions {
  title?: string;
  customTitle?: string;
  customCount?: number;
  description?: string;
  testType:
    | 'FULL_MOCK'
    | 'GRAND_MOCK'
    | 'SUBJECT_TEST'
    | 'CHAPTER_TEST'
    | 'TOPIC_TEST'
    | 'PYQ_TEST'
    | 'WEAKNESS_TEST'
    | 'REVISION_TEST'
    | 'CUSTOM_TEST'
    | 'PRACTICE';
  examPatternId?: string;
  blueprintConfig?: BlueprintConfig;
  subjectCode?: string;
  chapterSlug?: string;
  examYear?: number;
  userId?: string;
  mode?: 'PRACTICE' | 'TEST' | 'EXAM' | 'REVIEW';
  isPublished?: boolean;
}

export class MockTestGenerator {
  /**
   * Generates a complete mock test according to the active exam pattern and blueprint
   */
  static async generateMock(options: GenerateMockOptions) {
    // 1. Resolve Exam Pattern
    const pattern = options.examPatternId
      ? await prisma.examPattern.findUnique({ where: { id: options.examPatternId } })
      : await ExamPatternEngine.getActivePattern();

    if (!pattern) throw new Error('No active or valid exam pattern found.');

    const subjectConfig: Record<string, number> = typeof pattern.subjectConfiguration === 'string'
      ? JSON.parse(pattern.subjectConfiguration)
      : pattern.subjectConfiguration || { BIOLOGY: 90, PHYSICS: 45, CHEMISTRY: 45 };

    // 2. Resolve Blueprint
    let blueprint: any = null;
    const customCount = (options as any).customCount;
    const testTitle = options.title || (options as any).customTitle || `${options.testType.replace(/_/g, ' ')} Simulation`;
    let targetCount = customCount || options.blueprintConfig?.targetCount || pattern.totalQuestions;

    if (options.testType === 'SUBJECT_TEST' && options.subjectCode) {
      const code = options.subjectCode.toUpperCase();
      const count = customCount || (code.startsWith('BIO') ? 90 : 45);
      targetCount = count;
      options.blueprintConfig = {
        title: `${testTitle} Blueprint`,
        targetCount: count,
        subjectDistribution: { [code]: count },
      };
    } else if (['CHAPTER_TEST', 'TOPIC_TEST', 'WEAKNESS_TEST', 'REVISION_TEST'].includes(options.testType)) {
      targetCount = customCount || options.blueprintConfig?.targetCount || 30;
    }

    if (options.blueprintConfig) {
      blueprint = await MockBlueprintEngine.createBlueprint(options.blueprintConfig);
    }

    // 3. Question Selection Strategy
    const selectedQuestions: Array<{ questionId: string; sectionName: string; subject: string }> = [];
    const usedQuestionIds = new Set<string>();

    if (options.testType === 'WEAKNESS_TEST' && options.userId) {
      // WEAKNESS TEST: Select questions from student's weak concepts & unresolved mistakes
      const weakConcepts = await ConceptMasteryEngine.getWeakConcepts(options.userId, 10);
      const weakConceptIds = weakConcepts.map((w) => w.conceptId);

      const candidateQuestions = await prisma.question.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          publicationStatus: 'PUBLISHED',
          duplicateOfId: null,
          syllabusStatus: { in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'] },
          options: { some: {} },
          primaryConceptId: weakConceptIds.length > 0 ? { in: weakConceptIds } : undefined,
        },
        take: targetCount,
        include: { chapter: { include: { subject: true } } },
      });

      for (const q of candidateQuestions) {
        if (!usedQuestionIds.has(q.id) && selectedQuestions.length < targetCount) {
          usedQuestionIds.add(q.id);
          selectedQuestions.push({
            questionId: q.id,
            sectionName: 'Weakness Section',
            subject: q.chapter?.subject?.name || 'General',
          });
        }
      }
    } else if (options.testType === 'REVISION_TEST' && options.userId) {
      // REVISION TEST: Select questions due for revision
      const dueSchedules = await prisma.revisionSchedule.findMany({
        where: {
          userId: options.userId,
          nextRevisionAt: { lte: new Date() },
          questionId: { not: null },
        },
        take: targetCount,
        include: { question: { include: { chapter: { include: { subject: true } } } } },
      });

      for (const s of dueSchedules) {
        if (s.question && !usedQuestionIds.has(s.question.id) && selectedQuestions.length < targetCount) {
          usedQuestionIds.add(s.question.id);
          selectedQuestions.push({
            questionId: s.question.id,
            sectionName: 'Revision Section',
            subject: s.question.chapter?.subject?.name || 'General',
          });
        }
      }
    } else if (options.testType === 'PYQ_TEST') {
      // PYQ TEST: Strict Previous Year Questions
      const pyqWhere: any = {
        sourceType: 'PYQ',
        verificationStatus: 'VERIFIED',
        publicationStatus: 'PUBLISHED',
        duplicateOfId: null,
        syllabusStatus: { in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'] },
      };
      if (options.examYear) {
        pyqWhere.examYear = options.examYear;
      }
      if (options.subjectCode) {
        pyqWhere.chapter = { subject: { code: { in: [options.subjectCode, options.subjectCode.toUpperCase()] } } };
      }

      const pyqs = await prisma.question.findMany({
        where: pyqWhere,
        take: targetCount,
        include: { chapter: { include: { subject: true } } },
      });

      for (const q of pyqs) {
        if (!usedQuestionIds.has(q.id) && selectedQuestions.length < targetCount) {
          usedQuestionIds.add(q.id);
          selectedQuestions.push({
            questionId: q.id,
            sectionName: 'PYQ Section',
            subject: q.chapter?.subject?.name || 'General',
          });
        }
      }
    }

    // Default / FULL_MOCK / GRAND_MOCK: Structured subject distribution
    if (selectedQuestions.length < targetCount) {
      const subjectEntries = options.blueprintConfig?.subjectDistribution
        ? Object.entries(options.blueprintConfig.subjectDistribution)
        : Object.entries(subjectConfig);

      for (const [subjCode, requiredCount] of subjectEntries) {
        const normalized = subjCode.toUpperCase();
        const codeFilter = normalized.startsWith('BIO')
          ? ['BIOLOGY', 'BIO']
          : normalized.startsWith('PHY')
          ? ['PHYSICS', 'PHY']
          : ['CHEMISTRY', 'CHE'];

        // Determine Section A (35) vs Section B (15) if count is 45 or 90
        const sectionACount = requiredCount >= 45 ? Math.round(requiredCount * 0.777) : requiredCount;
        const sectionBCount = requiredCount - sectionACount;

        const candidates = await prisma.question.findMany({
          where: {
            verificationStatus: 'VERIFIED',
            publicationStatus: 'PUBLISHED',
            duplicateOfId: null,
            syllabusStatus: { in: ['CURRENT', 'REVIEW_REQUIRED', 'UNMAPPED'] },
            options: { some: {} },
            chapter: { subject: { code: { in: codeFilter } } },
            id: { notIn: Array.from(usedQuestionIds) },
          },
          take: requiredCount * 2,
          include: { chapter: { include: { subject: true } } },
        });

        let addedForSubject = 0;
        for (const q of candidates) {
          if (addedForSubject >= requiredCount || selectedQuestions.length >= targetCount) break;
          if (!usedQuestionIds.has(q.id)) {
            usedQuestionIds.add(q.id);
            const sectionName = addedForSubject < sectionACount ? 'Section A' : 'Section B';
            selectedQuestions.push({
              questionId: q.id,
              sectionName: `${subjCode} - ${sectionName}`,
              subject: q.chapter.subject.name,
            });
            addedForSubject++;
          }
        }
      }
    }

    // 4. Create Test Entity
    const test = await prisma.test.create({
      data: {
        title: testTitle,
        description: options.description || `Configured ${options.testType} examination simulation`,
        testType: options.testType,
        durationMinutes: customCount
          ? Math.max(15, Math.round((selectedQuestions.length / pattern.totalQuestions) * pattern.durationMinutes))
          : pattern.durationMinutes,
        totalQuestions: selectedQuestions.length,
        totalMarks: Math.round(selectedQuestions.length * pattern.positiveMarks),
        positiveMarks: pattern.positiveMarks,
        negativeMarks: pattern.negativeMarks,
        isPublished: options.isPublished ?? true,
        version: 1,
        examPatternId: pattern.id,
        blueprintId: blueprint?.id || null,
        blueprintJson: blueprint ? JSON.stringify(blueprint) : null,
        mode: options.mode || 'EXAM',
        publishedAt: options.isPublished ?? true ? new Date() : null,
      },
    });

    // 5. Attach Questions
    for (let i = 0; i < selectedQuestions.length; i++) {
      const item = selectedQuestions[i];
      await prisma.testQuestion.create({
        data: {
          testId: test.id,
          questionId: item.questionId,
          sectionName: item.sectionName,
          questionOrder: i + 1,
          marks: pattern.positiveMarks,
          negativeMarks: pattern.negativeMarks,
          subject: item.subject,
        },
      });
    }

    // 6. Pre-Publish Validation Gate
    const validation = await MockQualityValidator.validateTest(test.id);

    return {
      test,
      questionCount: selectedQuestions.length,
      validation,
    };
  }
}
