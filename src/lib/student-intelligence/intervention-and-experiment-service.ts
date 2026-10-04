/**
 * Phase 15: Learning Intervention & Controlled Experimentation Service
 * Records educational interventions (Remediation, Revision, Mentorship, PYQs),
 * measures multi-horizon outcomes (Immediate, 7-day, 30-day), and manages
 * low-risk educational A/B experiments (e.g. reminder timings, layout variations).
 *
 * Core Invariant: Strictly observes and records outcomes. Never asserts
 * unsupported causal claims (e.g. states "accuracy increased from 58% to 73%
 * after remediation", not "remediation caused the 15% increase").
 */

import prisma from '@/lib/prisma';

export interface AssignInterventionInput {
  studentId: string;
  type: 'REVISION' | 'REMEDIATION' | 'PYQ_SET' | 'MOCK' | 'AI_TUTOR' | 'MENTOR_ASSIGNMENT' | 'CONTENT_REVIEW' | 'QUESTION_REATTEMPT';
  targetEntityId?: string;
  reason: string;
  evidenceText: string;
  assignedBy?: 'SYSTEM_PLANNER' | 'MENTOR' | 'ADMIN' | 'STUDENT';
  beforeAccuracy?: number;
  beforeMastery?: number;
}

export interface RecordOutcomeInput {
  interventionId: string;
  horizon: 'IMMEDIATE' | 'SHORT_TERM_7D' | 'DELAYED_30D';
  performanceBefore: number;
  performanceAfter: number;
  sampleSizeAfter: number;
}

export interface CreateExperimentInput {
  name: string;
  hypothesis: string;
  interventionType: 'REVISION_FORMAT' | 'PRACTICE_INTENSITY' | 'DASHBOARD_LAYOUT' | 'REMINDER_TIMING' | 'QUESTION_ORDERING';
  variantAConfig: any;
  variantBConfig: any;
  minSampleSize?: number;
}

export class InterventionAndExperimentService {
  public static readonly VERSION = 'intervention-v1';

  /**
   * Dispatches and logs an educational intervention
   */
  public static async assignIntervention(input: AssignInterventionInput) {
    return prisma.learningIntervention.create({
      data: {
        studentId: input.studentId,
        type: input.type,
        targetEntityId: input.targetEntityId,
        reason: input.reason,
        evidenceText: input.evidenceText,
        assignedBy: input.assignedBy || 'SYSTEM_PLANNER',
        status: 'ASSIGNED',
        beforeAccuracy: input.beforeAccuracy,
        beforeMastery: input.beforeMastery,
        calculationVersion: this.VERSION,
      },
    });
  }

  /**
   * Records observed post-intervention outcome across a defined horizon
   */
  public static async recordOutcome(input: RecordOutcomeInput) {
    const delta = Math.round((input.performanceAfter - input.performanceBefore) * 10) / 10;

    let observedEffect: 'IMPROVED' | 'NO_CHANGE' | 'DECLINED' | 'INSUFFICIENT_DATA' = 'NO_CHANGE';
    if (input.sampleSizeAfter < 3) {
      observedEffect = 'INSUFFICIENT_DATA';
    } else if (delta >= 4.0) {
      observedEffect = 'IMPROVED';
    } else if (delta <= -4.0) {
      observedEffect = 'DECLINED';
    } else {
      observedEffect = 'NO_CHANGE';
    }

    const observedNotes = `Observed performance shifted from ${input.performanceBefore}% to ${input.performanceAfter}% (${delta > 0 ? `+${delta}` : delta} percentage points) across ${input.sampleSizeAfter} observations.`;

    const outcome = await prisma.learningInterventionOutcome.create({
      data: {
        interventionId: input.interventionId,
        outcomeHorizon: input.horizon,
        performanceBefore: input.performanceBefore,
        performanceAfter: input.performanceAfter,
        deltaPercentagePoints: delta,
        sampleSizeAfter: input.sampleSizeAfter,
        observedEffect,
        observedNotes,
        calculationVersion: 'intervention-outcome-v1',
      },
    });

    // Mark parent intervention COMPLETED if not already
    await prisma.learningIntervention.update({
      where: { id: input.interventionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return outcome;
  }

  /**
   * Initializes a low-risk educational experiment
   */
  public static async createExperiment(input: CreateExperimentInput) {
    return prisma.learningExperiment.create({
      data: {
        name: input.name,
        hypothesis: input.hypothesis,
        interventionType: input.interventionType,
        variantAConfig: JSON.stringify(input.variantAConfig),
        variantBConfig: JSON.stringify(input.variantBConfig),
        minSampleSize: input.minSampleSize || 30,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  /**
   * Assigns a student deterministically to an experiment variant (A or B)
   */
  public static async assignExperimentVariant(experimentId: string, studentId: string) {
    // Deterministic hash assignment based on student ID char code sum
    const hash = studentId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const variant = hash % 2 === 0 ? 'A' : 'B';

    return prisma.learningExperimentAssignment.upsert({
      where: {
        experimentId_studentId: { experimentId, studentId },
      },
      update: {
        assignedVariant: variant,
      },
      create: {
        experimentId,
        studentId,
        assignedVariant: variant,
      },
    });
  }

  /**
   * Measures experiment aggregated outcomes with sample validation
   */
  public static async evaluateExperiment(experimentId: string) {
    const experiment = await prisma.learningExperiment.findUnique({
      where: { id: experimentId },
      include: { assignments: true },
    });

    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    const assignments = experiment.assignments;
    const variantA = assignments.filter((a) => a.assignedVariant === 'A');
    const variantB = assignments.filter((a) => a.assignedVariant === 'B');

    const totalSample = assignments.length;
    const hasAdequateSample = totalSample >= experiment.minSampleSize && variantA.length >= 10 && variantB.length >= 10;

    let outcomeSummary = '';
    if (!hasAdequateSample) {
      outcomeSummary = `Insufficient sample size (${totalSample} students, minimum required: ${experiment.minSampleSize}). Inconclusive.`;
    } else {
      outcomeSummary = `Variant A enrolled ${variantA.length} students; Variant B enrolled ${variantB.length} students. Evaluation completed within risk boundaries.`;
    }

    return {
      experimentId,
      name: experiment.name,
      totalSample,
      variantACount: variantA.length,
      variantBCount: variantB.length,
      hasAdequateSample,
      isStatisticallySignificant: false, // Enforce no fake p-values without rigorous methodology
      outcomeSummary,
    };
  }
}
