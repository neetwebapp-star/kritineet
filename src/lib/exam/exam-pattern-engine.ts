import prisma from '../prisma';

export interface ExamPatternConfig {
  id?: string;
  examName: string;
  examYear: number;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  subjectConfiguration: Record<string, number>;
  sectionConfiguration?: Record<string, any>;
  instructions?: string;
  active?: boolean;
}

export class ExamPatternEngine {
  /**
   * Retrieves active exam pattern or initializes canonical NEET UG 2027 pattern
   */
  static async getActivePattern(): Promise<any> {
    let pattern = await prisma.examPattern.findFirst({
      where: { active: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!pattern) {
      pattern = await this.initializeDefaultNeetPattern();
    }

    return {
      ...pattern,
      subjectConfig: JSON.parse(pattern.subjectConfiguration),
      sectionConfig: pattern.sectionConfiguration ? JSON.parse(pattern.sectionConfiguration) : null,
    };
  }

  /**
   * Initializes canonical NEET UG 2027 exam pattern
   */
  static async initializeDefaultNeetPattern() {
    return prisma.examPattern.create({
      data: {
        examName: 'NEET UG 2027',
        examYear: 2027,
        durationMinutes: 200,
        totalQuestions: 200,
        totalMarks: 720.0,
        positiveMarks: 4.0,
        negativeMarks: 1.0,
        subjectConfiguration: JSON.stringify({
          BIOLOGY: 100,
          PHYSICS: 50,
          CHEMISTRY: 50,
        }),
        sectionConfiguration: JSON.stringify({
          SectionA: { count: 35, compulsory: true },
          SectionB: { count: 15, maxToAttempt: 10 },
        }),
        instructions: [
          '# Official NEET UG 2027 Computer Based Examination Instructions',
          '',
          '1. The examination duration is **180 minutes** (3 Hours).',
          '2. The question paper contains **180 multiple choice questions** across three subjects: Physics, Chemistry, and Biology (Botany & Zoology).',
          '3. **Scoring Scheme:**',
          '   - Each question carries **+4 marks** for the correct answer.',
          '   - **-1 mark** is deducted for each incorrect answer.',
          '   - **0 marks** for unanswered questions.',
          '4. Each subject consists of two sections:',
          '   - **Section A:** 35 Questions (All Compulsory)',
          '   - **Section B:** 15 Questions (Students may attempt any 10)',
          '5. Timer is server-authoritative. The test will automatically submit upon countdown expiry.',
          '6. Responses are autosaved continuously to prevent data loss on browser refresh.',
        ].join('\n'),
        active: true,
      },
    });
  }

  /**
   * Creates a new configurable exam pattern
   */
  static async createPattern(config: ExamPatternConfig) {
    if (config.active) {
      // Deactivate other patterns if this one is active
      await prisma.examPattern.updateMany({
        where: { active: true },
        data: { active: false },
      });
    }

    return prisma.examPattern.create({
      data: {
        examName: config.examName,
        examYear: config.examYear,
        durationMinutes: config.durationMinutes,
        totalQuestions: config.totalQuestions,
        totalMarks: config.totalMarks,
        positiveMarks: config.positiveMarks,
        negativeMarks: config.negativeMarks,
        subjectConfiguration: JSON.stringify(config.subjectConfiguration),
        sectionConfiguration: config.sectionConfiguration ? JSON.stringify(config.sectionConfiguration) : null,
        instructions: config.instructions,
        active: config.active ?? false,
      },
    });
  }

  /**
   * Sets a specific pattern as active
   */
  static async setActivePattern(patternId: string) {
    await prisma.examPattern.updateMany({
      where: { active: true },
      data: { active: false },
    });

    return prisma.examPattern.update({
      where: { id: patternId },
      data: { active: true },
    });
  }

  /**
   * Lists all available exam patterns
   */
  static async getAllPatterns() {
    return prisma.examPattern.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tests: true } },
      },
    });
  }
}
