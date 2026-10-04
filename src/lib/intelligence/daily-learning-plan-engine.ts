import prisma from '../prisma';
import { ConceptMasteryEngine } from './concept-mastery-engine';

export interface DailyMission {
  id: string;
  subject: 'BIOLOGY' | 'PHYSICS' | 'CHEMISTRY' | 'ERROR_REVISION' | 'CBT';
  title: string;
  description: string;
  targetCount: number;
  completedCount: number;
  actionType: 'PRACTICE' | 'REMEDIATION' | 'REVISION' | 'RETRY_MISTAKES' | 'CBT';
  targetSlug?: string;
  targetConceptId?: string;
}

export interface DailyPlanResponse {
  planDate: string;
  status: string;
  missions: DailyMission[];
  summary: {
    totalMissions: number;
    completedMissions: number;
    percentage: number;
  };
}

export class DailyLearningPlanEngine {
  /**
   * Retrieves existing or generates a new personalized daily learning mission
   */
  static async getOrGenerateDailyPlan(userId: string, targetDate?: string): Promise<DailyPlanResponse> {
    const todayStr = targetDate || new Date().toISOString().split('T')[0];

    // Check if plan already exists for today
    const existing = await prisma.dailyLearningPlan.findUnique({
      where: {
        userId_planDate: { userId, planDate: todayStr },
      },
    });

    if (existing) {
      const missions: DailyMission[] = JSON.parse(existing.missionsJson);
      const completed = missions.filter((m) => m.completedCount >= m.targetCount).length;
      return {
        planDate: todayStr,
        status: existing.status,
        missions,
        summary: {
          totalMissions: missions.length,
          completedMissions: completed,
          percentage: missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0,
        },
      };
    }

    // Generate plan from real student performance data
    const weakConcepts = await ConceptMasteryEngine.getWeakConcepts(userId, 5);
    const unresolvedMistakes = await prisma.studentMistake.count({
      where: { userId, isResolved: false },
    });
    const dueRevisions = await prisma.revisionSchedule.count({
      where: {
        userId,
        nextRevisionAt: { lte: new Date() },
      },
    });

    const missions: DailyMission[] = [];

    // 1. Biology Mission
    const bioWeak = weakConcepts.find((w) => {
      const code = w.concept?.chapter?.subject?.code?.toUpperCase() || '';
      return code.startsWith('BIO');
    });
    if (bioWeak) {
      missions.push({
        id: 'mission_bio_1',
        subject: 'BIOLOGY',
        title: `Remediate: ${bioWeak.concept.name}`,
        description: `Targeted review on ${bioWeak.concept.chapter.title}`,
        targetCount: 15,
        completedCount: 0,
        actionType: 'REMEDIATION',
        targetConceptId: bioWeak.conceptId,
      });
    } else {
      missions.push({
        id: 'mission_bio_1',
        subject: 'BIOLOGY',
        title: 'Biology Adaptive Practice Drill',
        description: 'Complete 20 mixed NCERT & PYQ Biology questions',
        targetCount: 20,
        completedCount: 0,
        actionType: 'PRACTICE',
      });
    }

    // 2. Physics Mission
    const phyWeak = weakConcepts.find((w) => {
      const code = w.concept?.chapter?.subject?.code?.toUpperCase() || '';
      return code.startsWith('PHY');
    });
    if (phyWeak) {
      missions.push({
        id: 'mission_phy_1',
        subject: 'PHYSICS',
        title: `Remediate: ${phyWeak.concept.name}`,
        description: `NCERT concepts & formula drill in ${phyWeak.concept.chapter.title}`,
        targetCount: 12,
        completedCount: 0,
        actionType: 'REMEDIATION',
        targetConceptId: phyWeak.conceptId,
      });
    } else {
      missions.push({
        id: 'mission_phy_1',
        subject: 'PHYSICS',
        title: 'Physics High-Yield Practice',
        description: 'Solve 15 mechanics & kinematics application problems',
        targetCount: 15,
        completedCount: 0,
        actionType: 'PRACTICE',
      });
    }

    // 3. Chemistry Mission
    const chemWeak = weakConcepts.find((w) => {
      const code = w.concept?.chapter?.subject?.code?.toUpperCase() || '';
      return code.startsWith('CHE');
    });
    if (chemWeak) {
      missions.push({
        id: 'mission_chem_1',
        subject: 'CHEMISTRY',
        title: `Fix Weakness: ${chemWeak.concept.name}`,
        description: `Reinforce concepts in ${chemWeak.concept.chapter.title}`,
        targetCount: 15,
        completedCount: 0,
        actionType: 'REMEDIATION',
        targetConceptId: chemWeak.conceptId,
      });
    } else {
      missions.push({
        id: 'mission_chem_1',
        subject: 'CHEMISTRY',
        title: 'Chemistry Revision & PYQ Drill',
        description: 'Solve 15 physical & organic chemistry problems',
        targetCount: 15,
        completedCount: 0,
        actionType: 'PRACTICE',
      });
    }

    // 4. Mistake Correction Mission
    if (unresolvedMistakes > 0) {
      missions.push({
        id: 'mission_error_1',
        subject: 'ERROR_REVISION',
        title: 'My Error Book Review',
        description: `Reattempt ${Math.min(unresolvedMistakes, 10)} unaddressed mistakes`,
        targetCount: Math.min(unresolvedMistakes, 10),
        completedCount: 0,
        actionType: 'RETRY_MISTAKES',
      });
    }

    // Save generated plan
    const created = await prisma.dailyLearningPlan.create({
      data: {
        userId,
        planDate: todayStr,
        missionsJson: JSON.stringify(missions),
        status: 'ACTIVE',
      },
    });

    return {
      planDate: todayStr,
      status: created.status,
      missions,
      summary: {
        totalMissions: missions.length,
        completedMissions: 0,
        percentage: 0,
      },
    };
  }

  /**
   * Increments mission completion progress when student solves questions
   */
  static async recordMissionProgress(userId: string, subjectCode?: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const plan = await prisma.dailyLearningPlan.findUnique({
      where: {
        userId_planDate: { userId, planDate: todayStr },
      },
    });

    if (!plan) return;

    const missions: DailyMission[] = JSON.parse(plan.missionsJson);
    let modified = false;

    for (const m of missions) {
      if (!subjectCode || m.subject.startsWith(subjectCode.toUpperCase())) {
        if (m.completedCount < m.targetCount) {
          m.completedCount += 1;
          modified = true;
          break;
        }
      }
    }

    if (modified) {
      const allDone = missions.every((m) => m.completedCount >= m.targetCount);
      await prisma.dailyLearningPlan.update({
        where: { id: plan.id },
        data: {
          missionsJson: JSON.stringify(missions),
          status: allDone ? 'COMPLETED' : 'ACTIVE',
        },
      });
    }
  }
}
