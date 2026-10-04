import prisma from '../prisma';

export interface StructuredQuestionSearchFilter {
  query?: string;
  subjectCode?: string;
  subjectId?: string;
  chapterSlug?: string;
  chapterId?: string;
  conceptId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sourceType?: 'PYQ' | 'NCERT' | 'FINGERTIPS' | 'AI_GENERATED';
  examYear?: number;
  questionType?: string;
  assessmentStatus?: 'ACTIVE' | 'MONITORED' | 'REVIEW_REQUIRED' | 'TEMPORARILY_SUPPRESSED' | 'RETIRED';
  status?: 'ACTIVE' | 'MONITORED' | 'REVIEW_REQUIRED' | 'TEMPORARILY_SUPPRESSED' | 'RETIRED';
  confidence?: 'INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'HIGH';
  minAccuracy?: number;
  maxAccuracy?: number;
  minDiscrimination?: number;
  maxDiscrimination?: number;
  minQualityScore?: number;
  hasAnomalies?: boolean;
  anomalyType?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export class QuestionSearchV2 {
  /**
   * Executes structured multi-dimensional search across questions and their psychometric profiles
   */
  static async searchQuestions(filter: StructuredQuestionSearchFilter) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = filter.offset !== undefined ? filter.offset : (page - 1) * limit;

    const where: any = {};

    if (filter.query && filter.query.trim()) {
      where.questionText = { contains: filter.query.trim() };
    }

    if (filter.subjectId) {
      where.subjectId = filter.subjectId;
    } else if (filter.subjectCode && filter.subjectCode !== 'ALL') {
      where.subject = { code: filter.subjectCode.toUpperCase() };
    }

    if (filter.chapterId) {
      where.chapterId = filter.chapterId;
    } else if (filter.chapterSlug) {
      where.chapter = { slug: filter.chapterSlug };
    }

    if (filter.conceptId) {
      where.primaryConceptId = filter.conceptId;
    }

    if (filter.difficulty) {
      where.difficulty = filter.difficulty;
    }

    if (filter.sourceType) {
      where.sourceType = filter.sourceType;
    }

    if (filter.examYear) {
      where.examYear = filter.examYear;
    }

    if (filter.questionType) {
      where.questionType = filter.questionType;
    }

    const targetStatus = filter.status || filter.assessmentStatus;
    if (targetStatus) {
      where.assessmentStatus = targetStatus;
    }

    // Profile filters
    const profileWhere: any = {};
    if (filter.confidence) {
      profileWhere.difficultyConfidence = filter.confidence;
    }
    if (filter.minAccuracy !== undefined || filter.maxAccuracy !== undefined) {
      profileWhere.accuracyRate = {
        ...(filter.minAccuracy !== undefined && { gte: filter.minAccuracy }),
        ...(filter.maxAccuracy !== undefined && { lte: filter.maxAccuracy }),
      };
    }
    if (filter.minDiscrimination !== undefined || filter.maxDiscrimination !== undefined) {
      profileWhere.discriminationIndex = {
        ...(filter.minDiscrimination !== undefined && { gte: filter.minDiscrimination }),
        ...(filter.maxDiscrimination !== undefined && { lte: filter.maxDiscrimination }),
      };
    }
    if (filter.minQualityScore !== undefined) {
      profileWhere.qualityScore = { gte: filter.minQualityScore };
    }

    if (Object.keys(profileWhere).length > 0) {
      where.assessmentProfile = profileWhere;
    }

    if (filter.anomalyType) {
      where.anomalies = { some: { anomalyType: filter.anomalyType, status: { in: ['FLAGGED', 'UNDER_REVIEW', 'OPEN'] } } };
    } else if (filter.hasAnomalies) {
      where.anomalies = { some: { status: { in: ['FLAGGED', 'UNDER_REVIEW', 'OPEN'] } } };
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          subject: true,
          chapter: true,
          primaryConcept: true,
          assessmentProfile: true,
          anomalies: { where: { status: { in: ['FLAGGED', 'UNDER_REVIEW'] } } },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      questions,
    };
  }
}
