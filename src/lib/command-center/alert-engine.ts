/**
 * Phase 7: Alert & Intervention Engine
 * Scans student performance signals to generate evidence-based, data-driven alerts
 * and pedagogical intervention recommendations (strictly avoiding unsupported assumptions).
 */

import prisma from '@/lib/prisma';

export interface GeneratedAlert {
  type: 'REVISION_OVERDUE' | 'ASSIGNMENT_OVERDUE' | 'NO_RECENT_ACTIVITY' | 'REPEATED_MISTAKE' | 'LOW_ACCURACY' | 'TEST_PERFORMANCE_DROP';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  evidence: Record<string, any>;
  suggestedIntervention: string;
}

export class AlertEngine {
  /**
   * Scans a student's actual database telemetry and generates evidence-based alerts
   */
  public static async scanStudentAlerts(studentId: string): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const now = new Date();

    // 1. Check for Overdue Revisions
    const overdueRevisions = await prisma.revisionSchedule.findMany({
      where: {
        userId: studentId,
        nextRevisionAt: { lt: now },
      },
      take: 5,
      include: {
        concept: { select: { name: true } },
      },
    });

    if (overdueRevisions.length > 0) {
      alerts.push({
        type: 'REVISION_OVERDUE',
        severity: overdueRevisions.length > 3 ? 'HIGH' : 'MEDIUM',
        title: `${overdueRevisions.length} Spaced Revision Items Overdue`,
        description: `Student has ${overdueRevisions.length} concepts scheduled for spaced repetition that have passed their review date.`,
        evidence: {
          overdueCount: overdueRevisions.length,
          sampleConcepts: overdueRevisions.map(r => r.concept?.name || 'General Concept'),
        },
        suggestedIntervention: 'Schedule a 15-minute active recall session to review pending SM-2 flashcard intervals.',
      });
    }

    // 2. Check for Overdue Assignments
    const overdueAssignments = await prisma.assignmentProgress.findMany({
      where: {
        studentId,
        status: { not: 'COMPLETED' },
        assignment: {
          dueDate: { lt: now },
        },
      },
      include: {
        assignment: { select: { title: true, type: true } },
      },
    });

    if (overdueAssignments.length > 0) {
      alerts.push({
        type: 'ASSIGNMENT_OVERDUE',
        severity: 'MEDIUM',
        title: `${overdueAssignments.length} Assignments Past Due Date`,
        description: `Assignments assigned by mentor/admin are pending beyond the configured due date.`,
        evidence: {
          overdueCount: overdueAssignments.length,
          titles: overdueAssignments.map(a => a.assignment.title),
        },
        suggestedIntervention: 'Send a study reminder message and consider adjusting the deadline if work is in progress.',
      });
    }

    // 3. Check for Repeated Conceptual Mistakes
    const repeatedMistakes = await prisma.studentMistake.findMany({
      where: {
        userId: studentId,
        mistakeCount: { gte: 2 },
        isResolved: false,
      },
      take: 3,
      include: {
        concept: { select: { name: true } },
        chapter: { select: { title: true } },
      },
    });

    if (repeatedMistakes.length > 0) {
      const topMistake = repeatedMistakes[0];
      alerts.push({
        type: 'REPEATED_MISTAKE',
        severity: 'HIGH',
        title: `Repeated Error Pattern in ${topMistake.chapter?.title || 'Subject'}`,
        description: `Student has repeated mistake on concept "${topMistake.concept?.name || 'topic'}" ${topMistake.mistakeCount} times without resolution.`,
        evidence: {
          conceptName: topMistake.concept?.name,
          chapter: topMistake.chapter?.title,
          mistakeCount: topMistake.mistakeCount,
          mistakeType: topMistake.mistakeType,
        },
        suggestedIntervention: `Assign concept remediation reading for "${topMistake.chapter?.title}" + 10 targeted questions.`,
      });
    }

    // 4. Check for Recent Accuracy Drops
    const recentAttempts = await prisma.attemptEvent.findMany({
      where: { userId: studentId },
      orderBy: { answeredAt: 'desc' },
      take: 10,
    });

    if (recentAttempts.length >= 8) {
      const correctCount = recentAttempts.filter(a => a.isCorrect).length;
      const accuracy = (correctCount / recentAttempts.length) * 100;

      if (accuracy < 50) {
        alerts.push({
          type: 'LOW_ACCURACY',
          severity: 'HIGH',
          title: `Low Accuracy on Recent Practice (${accuracy.toFixed(0)}%)`,
          description: `Student answered ${correctCount}/${recentAttempts.length} correctly in the last 10 practice attempts.`,
          evidence: {
            sampleSize: recentAttempts.length,
            correctCount,
            accuracyRate: accuracy,
          },
          suggestedIntervention: 'Switch adaptive difficulty down from Hard to Medium and review fundamental formulas.',
        });
      }
    }

    // Persist discovered alerts to DB if not already present
    for (const a of alerts) {
      const existing = await prisma.alert.findFirst({
        where: {
          studentId,
          type: a.type,
          isResolved: false,
        },
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            studentId,
            type: a.type,
            severity: a.severity,
            title: a.title,
            description: a.description,
            evidenceJson: JSON.stringify(a.evidence),
            suggestedIntervention: a.suggestedIntervention,
          },
        });
      }
    }

    return alerts;
  }

  /**
   * Get active alerts for student
   */
  public static async getActiveAlerts(studentId: string) {
    return prisma.alert.findMany({
      where: {
        studentId,
        isResolved: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve an alert
   */
  public static async resolveAlert(alertId: string, resolverId: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolverId,
      },
    });
  }
}
