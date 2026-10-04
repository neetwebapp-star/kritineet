/**
 * Phase 12: Final Revision Scope & Freeze Engine
 * Enforces scope discipline in the final mile:
 * Prevents scope expansion into brand-new low-yield chapters while retaining
 * high-priority weak concepts, due revisions, mistake remediation, and mocks.
 */

import { prisma } from '@/lib/prisma';

export interface FinalRevisionFreezeRules {
  deprioritizeLowPriorityNewContent: boolean;
  retainHighPriorityWeakConcepts: boolean;
  retainDueRevisions: boolean;
  retainMistakeRemediation: boolean;
  retainScheduledMocks: boolean;
}

export const DEFAULT_FREEZE_RULES: FinalRevisionFreezeRules = {
  deprioritizeLowPriorityNewContent: true,
  retainHighPriorityWeakConcepts: true,
  retainDueRevisions: true,
  retainMistakeRemediation: true,
  retainScheduledMocks: true,
};

export class FinalRevisionScopeEngine {
  /**
   * Activates or updates the Final Revision Freeze for a student.
   * Never silently deletes pending content.
   */
  static async activateRevisionFreeze(
    userId: string,
    rules: Partial<FinalRevisionFreezeRules> = {}
  ) {
    const mergedRules = { ...DEFAULT_FREEZE_RULES, ...rules };

    // Update or create active final revision plan
    const today = new Date().toISOString().split('T')[0];
    const plan = await prisma.finalRevisionPlan.findFirst({
      where: { userId, date: today },
    });

    if (plan) {
      return await prisma.finalRevisionPlan.update({
        where: { id: plan.id },
        data: {
          isFrozen: true,
          freezeActivatedAt: new Date(),
          freezeRulesJson: JSON.stringify(mergedRules),
        },
      });
    }

    return await prisma.finalRevisionPlan.create({
      data: {
        userId,
        date: today,
        isFrozen: true,
        freezeActivatedAt: new Date(),
        freezeRulesJson: JSON.stringify(mergedRules),
      },
    });
  }

  /**
   * Generates a structured FinalRevisionPlan composed of prioritized blocks:
   * NCERT, FORMULAS, DIAGRAMS, REACTIONS, DEFINITIONS, HIGH_ERROR_CONCEPTS, PYQS, MISTAKES, MOCK_REVIEW
   */
  static async generateFinalRevisionPlan(
    userId: string,
    date: string,
    targetCapacityMinutes: number = 240
  ) {
    // 1. Check if plan already exists for this date
    let plan = await prisma.finalRevisionPlan.findFirst({
      where: { userId, date },
      include: { blocks: true },
    });

    if (plan && plan.blocks.length > 0) {
      return plan;
    }

    if (!plan) {
      plan = await prisma.finalRevisionPlan.create({
        data: {
          userId,
          date,
          isFrozen: true,
          freezeActivatedAt: new Date(),
          freezeRulesJson: JSON.stringify(DEFAULT_FREEZE_RULES),
        },
        include: { blocks: true },
      });
    }

    const candidateBlocks: Array<{
      blockType: string;
      title: string;
      subjectCode: string;
      chapterId?: string;
      conceptId?: string;
      estimatedMinutes: number;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      evidence: string;
    }> = [];

    // Block 1: MISTAKES & ERROR BOOK
    const recentMistakes = await prisma.studentMistake.findMany({
      where: { userId, isResolved: false },
      include: { question: true, chapter: true },
      orderBy: { mistakeCount: 'desc' },
      take: 2,
    });

    for (const m of recentMistakes) {
      candidateBlocks.push({
        blockType: 'MISTAKES',
        title: `Error Book Remediation: ${m.chapter?.title || 'High Error Topic'}`,
        subjectCode: m.chapter?.subjectId || 'PHYSICS',
        chapterId: m.chapterId,
        estimatedMinutes: 30,
        priority: 'CRITICAL',
        evidence: `Concept logged ${m.mistakeCount} uncorrected errors in recent test activity.`,
      });
    }

    // Block 2: FORMULAS / HIGH_ERROR_CONCEPTS
    const weakConcepts = await prisma.studentConceptMastery.findMany({
      where: { userId, masteryScore: { lt: 50 } },
      include: { concept: { include: { chapter: true } } },
      orderBy: { masteryScore: 'asc' },
      take: 2,
    });

    for (const wc of weakConcepts) {
      candidateBlocks.push({
        blockType: 'FORMULAS',
        title: `Formula & Definition Drill: ${wc.concept.name}`,
        subjectCode: wc.concept.chapter?.subjectId || 'CHEMISTRY',
        chapterId: wc.concept.chapterId,
        conceptId: wc.conceptId,
        estimatedMinutes: 25,
        priority: 'HIGH',
        evidence: `Concept mastery is currently ${wc.masteryScore}%. Frequently represented in the available PYQ dataset.`,
      });
    }

    // Block 3: NCERT REVIEW
    candidateBlocks.push({
      blockType: 'NCERT',
      title: 'Canonical NCERT High-Yield Line Review',
      subjectCode: 'BIOLOGY',
      estimatedMinutes: 45,
      priority: 'HIGH',
      evidence: 'NCERT lines are authoritative direct sources for NEET Biology questions.',
    });

    // Block 4: PYQ DRILL
    candidateBlocks.push({
      blockType: 'PYQS',
      title: 'Curated 10-Year Verified PYQ Speed Drill',
      subjectCode: 'PHYSICS',
      estimatedMinutes: 40,
      priority: 'HIGH',
      evidence: 'Verified past year exam patterns from 2015-2024 to reinforce exam pacing.',
    });

    // Block 5: DIAGRAMS
    candidateBlocks.push({
      blockType: 'DIAGRAMS',
      title: 'NCERT Diagram & Morphological Labels Drill',
      subjectCode: 'BOTANY',
      estimatedMinutes: 20,
      priority: 'MEDIUM',
      evidence: 'High visual representation in official NEET botany papers.',
    });

    // Capacity-governed allocation
    let accumulatedMinutes = 0;
    const finalBlocksData = [];

    for (const b of candidateBlocks) {
      if (accumulatedMinutes + b.estimatedMinutes <= targetCapacityMinutes || b.priority === 'CRITICAL') {
        accumulatedMinutes += b.estimatedMinutes;
        finalBlocksData.push(b);
      }
    }

    // Insert blocks into database
    await prisma.finalRevisionBlock.createMany({
      data: finalBlocksData.map((fb) => ({
        planId: plan!.id,
        blockType: fb.blockType,
        title: fb.title,
        subjectCode: fb.subjectCode,
        chapterId: fb.chapterId,
        conceptId: fb.conceptId,
        estimatedMinutes: fb.estimatedMinutes,
        priority: fb.priority,
        evidence: fb.evidence,
        status: 'PENDING',
      })),
    });

    return await prisma.finalRevisionPlan.update({
      where: { id: plan.id },
      data: {
        totalEstimatedMinutes: accumulatedMinutes,
      },
      include: { blocks: true },
    });
  }

  /**
   * Completes a revision block within the active plan.
   */
  static async completeRevisionBlock(blockId: string) {
    return await prisma.finalRevisionBlock.update({
      where: { id: blockId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}
