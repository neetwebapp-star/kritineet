export interface CandidateTask {
  taskType: string;
  subjectCode: string;
  chapterSlug?: string;
  chapterTitle?: string;
  conceptId?: string;
  sourceType: string;
  estimatedMinutes: number;
  // Evidence signals
  isRevisionDue?: boolean;
  masteryLevel?: number; // 0 - 100
  recentMistakeCount?: number;
  errorRate?: number; // 0 - 100
  hasPyqGap?: boolean;
  isSyllabusDeadline?: boolean;
  isMockPrep?: boolean;
  exposureCount?: number;
  daysSinceLastStudied?: number;
  isStudentSelected?: boolean;
  isMentorAssigned?: boolean;
  mentorNote?: string;
}

export interface EvaluatedTaskPriority {
  priority: 'CORE' | 'RECOMMENDED' | 'OPTIONAL';
  priorityScore: number;
  priorityReasons: string[];
  explanation: string;
}

export class PlanPriorityEngine {
  /**
   * Deterministically evaluates task priority with explainable evidence
   */
  static evaluatePriority(task: CandidateTask): EvaluatedTaskPriority {
    let score = 50.0;
    const reasons: string[] = [];

    // 1. Mentor Assignment (Highest authoritative boost)
    if (task.isMentorAssigned) {
      score += 40.0;
      reasons.push('MENTOR_ASSIGNED');
    }

    // 2. Revision Due (Essential for memory retention)
    if (task.isRevisionDue) {
      score += 35.0;
      reasons.push('REVISION_DUE');
    }

    // 3. Recent Mistakes & High Error Rate
    if ((task.recentMistakeCount && task.recentMistakeCount > 0) || (task.errorRate && task.errorRate > 40)) {
      score += 25.0;
      reasons.push('RECENT_MISTAKE');
      if (task.errorRate && task.errorRate > 50) {
        score += 15.0;
        reasons.push('HIGH_ERROR_RATE');
      }
    }

    // 4. Low Concept Mastery
    if (task.masteryLevel != null) {
      if (task.masteryLevel < 40) {
        score += 25.0;
        reasons.push('LOW_MASTERY');
      } else if (task.masteryLevel < 70) {
        score += 10.0;
      }
    }

    // 5. Syllabus Timeline / Deadlines
    if (task.isSyllabusDeadline) {
      score += 20.0;
      reasons.push('SYLLABUS_DEADLINE');
    }

    // 6. PYQ Coverage Deficit
    if (task.hasPyqGap) {
      score += 15.0;
      reasons.push('PYQ_GAP');
    }

    // 7. Mock Test Preparation
    if (task.isMockPrep) {
      score += 15.0;
      reasons.push('MOCK_PREPARATION');
    }

    // 8. Low Recency (Long time since concept was touched)
    if (task.daysSinceLastStudied && task.daysSinceLastStudied > 14) {
      score += 10.0;
      reasons.push('LOW_RECENCY');
    }

    // 9. High Exposure Gap (Concept not practiced enough)
    if (task.exposureCount != null && task.exposureCount < 3) {
      score += 10.0;
      reasons.push('HIGH_EXPOSURE_GAP');
    }

    // 10. Student explicitly selected or requested
    if (task.isStudentSelected) {
      score += 15.0;
      reasons.push('STUDENT_SELECTED');
    }

    // Priority classification based on score thresholds
    let priority: 'CORE' | 'RECOMMENDED' | 'OPTIONAL' = 'RECOMMENDED';
    if (score >= 80.0 || task.isMentorAssigned || task.isRevisionDue) {
      priority = 'CORE';
    } else if (score < 60.0) {
      priority = 'OPTIONAL';
    }

    // Human-readable explanation
    const humanReasons = reasons.map((r) => {
      switch (r) {
        case 'MENTOR_ASSIGNED':
          return `Assigned by mentor${task.mentorNote ? `: "${task.mentorNote}"` : ''}`;
        case 'REVISION_DUE':
          return 'Scheduled revision is due to reinforce memory retention';
        case 'RECENT_MISTAKE':
          return 'Addresses recent incorrect responses on this concept';
        case 'HIGH_ERROR_RATE':
          return `Concept has an elevated error rate (${task.errorRate?.toFixed(0)}%)`;
        case 'LOW_MASTERY':
          return `Concept mastery is below target threshold (${task.masteryLevel?.toFixed(0)}%)`;
        case 'SYLLABUS_DEADLINE':
          return 'Target chapter aligns with current syllabus completion milestone';
        case 'PYQ_GAP':
          return 'Crucial NEET Past Year Questions remain unattempted';
        case 'MOCK_PREPARATION':
          return 'Prepares core concepts for upcoming scheduled mock examination';
        case 'LOW_RECENCY':
          return `Not reviewed in ${task.daysSinceLastStudied} days`;
        case 'HIGH_EXPOSURE_GAP':
          return 'Practice exposure count is below readiness standard';
        case 'STUDENT_SELECTED':
          return 'Requested by student in custom study focus';
        default:
          return r;
      }
    });

    const explanation =
      humanReasons.length > 0
        ? `Categorized as ${priority} because: ${humanReasons.join('; ')}.`
        : `Categorized as ${priority} for balanced daily syllabus progression.`;

    return {
      priority,
      priorityScore: Math.round(score * 10) / 10,
      priorityReasons: reasons,
      explanation,
    };
  }
}
