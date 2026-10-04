import prisma from '../prisma';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalChecked: number;
    verifiedCount: number;
    publishedCount: number;
    averageQualityScore: number;
  };
}

export class MockQualityValidator {
  /**
   * Pre-publishing quality gate: Validates every question in a test before publishing
   */
  static async validateTest(testId: string): Promise<ValidationResult> {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: {
              include: {
                options: true,
                chapter: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    if (!test) {
      return {
        isValid: false,
        errors: [`Test with ID ${testId} not found`],
        warnings: [],
        stats: { totalChecked: 0, verifiedCount: 0, publishedCount: 0, averageQualityScore: 0 },
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Verify Question Count
    if (test.testQuestions.length !== test.totalQuestions) {
      errors.push(
        `Question count mismatch: Test has ${test.testQuestions.length} questions attached, but totalQuestions is set to ${test.totalQuestions}`
      );
    }

    // 2. Marking scheme verification
    if (test.positiveMarks <= 0) {
      errors.push(`Positive marks must be greater than 0 (found ${test.positiveMarks})`);
    }
    if (test.negativeMarks < 0) {
      errors.push(`Negative marks cannot be negative (found ${test.negativeMarks})`);
    }

    let verifiedCount = 0;
    let publishedCount = 0;
    let totalQuality = 0;
    const seenQuestionIds = new Set<string>();

    for (const tq of test.testQuestions) {
      const q = tq.question;

      // Duplicate detection within the test
      if (seenQuestionIds.has(q.id)) {
        errors.push(`Duplicate question found within test: Question ID ${q.id} appears more than once.`);
      }
      seenQuestionIds.add(q.id);

      // Duplicate copy check
      if (q.duplicateOfId) {
        errors.push(`Question ${q.id} is flagged as a duplicate copy of ${q.duplicateOfId}`);
      }

      // Verification Status invariant
      if (q.verificationStatus !== 'VERIFIED') {
        errors.push(`Question ${q.id} has unverified status: '${q.verificationStatus}'. Only VERIFIED questions allowed.`);
      } else {
        verifiedCount++;
      }

      // Publication Status invariant
      if (q.publicationStatus !== 'PUBLISHED') {
        errors.push(`Question ${q.id} has publication status: '${q.publicationStatus}'. Only PUBLISHED questions allowed.`);
      } else {
        publishedCount++;
      }

      // Answer Key completeness
      if (!q.correctOption || !['A', 'B', 'C', 'D'].includes(q.correctOption.toUpperCase())) {
        errors.push(`Question ${q.id} has invalid or missing correctOption ('${q.correctOption}')`);
      }

      // Option completeness
      if (!q.options || q.options.length < 4) {
        errors.push(`Question ${q.id} has incomplete options count (${q.options?.length || 0} / 4 minimum)`);
      }

      // Subject & Chapter linkage
      if (!q.chapterId || !q.chapter) {
        errors.push(`Question ${q.id} is not linked to any valid chapter`);
      } else if (!q.chapter.subject) {
        errors.push(`Question ${q.id} chapter '${q.chapter.title}' is missing a valid subject relation`);
      }

      // Quality score threshold
      totalQuality += q.qualityScore;
      if (q.qualityScore < 0.70) {
        warnings.push(`Question ${q.id} has below-threshold quality score (${q.qualityScore.toFixed(2)} < 0.70)`);
      }
    }

    const averageQualityScore = test.testQuestions.length > 0
      ? Number((totalQuality / test.testQuestions.length).toFixed(2))
      : 0;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalChecked: test.testQuestions.length,
        verifiedCount,
        publishedCount,
        averageQualityScore,
      },
    };
  }
}
