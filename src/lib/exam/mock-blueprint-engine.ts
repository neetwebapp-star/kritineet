import prisma from '../prisma';

export interface BlueprintConfig {
  title: string;
  examPatternId?: string;
  targetCount: number;
  subjectDistribution: Record<string, number>;
  domainDistribution?: Record<string, number>;
  difficultyDistribution?: Record<string, number>; // e.g. { EASY: 0.35, MEDIUM: 0.50, HARD: 0.15 }
  sourceDistribution?: Record<string, number>;     // e.g. { PYQ: 0.50, NCERT: 0.35, FINGERTIPS: 0.15 }
  rules?: {
    allowDuplicates?: boolean;
    requireVerified?: boolean;
    minQualityScore?: number;
    excludeMastered?: boolean;
  };
}

export class MockBlueprintEngine {
  /**
   * Validates blueprint mathematical integrity before creation
   */
  static validateBlueprint(config: BlueprintConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Check subject distribution sum
    const totalSubjectQuestions = Object.values(config.subjectDistribution).reduce((a, b) => {
      const val = typeof b === 'object' && b !== null ? ((b as any).total ?? (b as any).count ?? 0) : Number(b) || 0;
      return a + val;
    }, 0);
    if (totalSubjectQuestions !== config.targetCount) {
      errors.push(
        `Subject distribution total (${totalSubjectQuestions}) does not match targetCount (${config.targetCount})`
      );
    }

    // 2. Check difficulty distribution sum if provided (supports both 0-1 ratio and 0-100 percentage)
    if (config.difficultyDistribution) {
      const totalDiff = Object.values(config.difficultyDistribution).reduce((a, b) => a + Number(b), 0);
      const isRatio = Math.abs(totalDiff - 1.0) <= 0.05;
      const isPercent = Math.abs(totalDiff - 100.0) <= 2.0;
      if (!isRatio && !isPercent) {
        errors.push(`Difficulty distribution ratios must sum to 1.0 or 100% (got ${totalDiff})`);
      }
    }

    // 3. Check source distribution sum if provided (supports both 0-1 ratio and 0-100 percentage)
    if (config.sourceDistribution) {
      const totalSource = Object.values(config.sourceDistribution).reduce((a, b) => a + Number(b), 0);
      const isRatio = Math.abs(totalSource - 1.0) <= 0.05;
      const isPercent = Math.abs(totalSource - 100.0) <= 2.0;
      if (!isRatio && !isPercent) {
        errors.push(`Source distribution ratios must sum to 1.0 or 100% (got ${totalSource})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Creates an auditable, reproducible test blueprint
   */
  static async createBlueprint(config: BlueprintConfig) {
    const validation = this.validateBlueprint(config);
    if (!validation.isValid) {
      throw new Error(`Invalid blueprint configuration: ${validation.errors.join(', ')}`);
    }

    return prisma.testBlueprint.create({
      data: {
        title: config.title,
        examPatternId: config.examPatternId,
        targetCount: config.targetCount,
        subjectDistribution: JSON.stringify(config.subjectDistribution),
        domainDistribution: config.domainDistribution ? JSON.stringify(config.domainDistribution) : null,
        difficultyDistribution: config.difficultyDistribution ? JSON.stringify(config.difficultyDistribution) : null,
        sourceDistribution: config.sourceDistribution ? JSON.stringify(config.sourceDistribution) : null,
        rulesJson: JSON.stringify(config.rules || {
          allowDuplicates: false,
          requireVerified: true,
          minQualityScore: 0.70,
        }),
      },
    });
  }

  /**
   * Retrieves blueprint by ID with parsed distributions
   */
  static async getBlueprint(id: string) {
    const blueprint = await prisma.testBlueprint.findUnique({
      where: { id },
      include: { examPattern: true },
    });
    if (!blueprint) return null;

    return {
      ...blueprint,
      subjectDist: JSON.parse(blueprint.subjectDistribution),
      domainDist: blueprint.domainDistribution ? JSON.parse(blueprint.domainDistribution) : null,
      difficultyDist: blueprint.difficultyDistribution ? JSON.parse(blueprint.difficultyDistribution) : null,
      sourceDist: blueprint.sourceDistribution ? JSON.parse(blueprint.sourceDistribution) : null,
      rules: blueprint.rulesJson ? JSON.parse(blueprint.rulesJson) : {},
    };
  }
}
