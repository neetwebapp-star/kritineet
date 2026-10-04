/**
 * Phase 7: Assignment Engine
 * Manages study plan assignments, bulk assignment scoping,
 * server-verified task completion, and progress tracking.
 */

import prisma from '@/lib/prisma';
import { NotificationEngine } from './notification-engine';

export interface CreateAssignmentInput {
  creatorId: string;
  title: string;
  description?: string;
  type: string;
  subject?: string;
  chapterId?: string;
  conceptId?: string;
  testId?: string;
  targetCount?: number;
  dueDate?: Date;
  configJson?: any;
  targetStudentIds: string[];
}

export class AssignmentEngine {
  /**
   * Create an assignment and assign to one or multiple students (Bulk Assignment)
   * Validates mentor scope: Mentors cannot assign to unassigned students.
   */
  public static async createAssignment(input: CreateAssignmentInput) {
    const creator = await prisma.user.findUnique({
      where: { id: input.creatorId },
    });

    if (!creator) throw new Error('Creator not found');

    const isMentor = creator.role === 'MENTOR';
    const isAdmin = creator.role === 'ADMIN' || creator.role === 'SUPER_ADMIN';

    if (!isMentor && !isAdmin) {
      throw new Error('Only mentors or admins can create student assignments');
    }

    // Mentor Scope Validation: verify all target students are actively assigned to mentor
    if (isMentor) {
      const activeAssignments = await prisma.mentorStudentAssignment.findMany({
        where: {
          mentorId: creator.id,
          studentId: { in: input.targetStudentIds },
          status: 'ACTIVE',
        },
      });

      const allowedStudentIds = new Set(activeAssignments.map(a => a.studentId));
      const unauthorizedIds = input.targetStudentIds.filter(id => !allowedStudentIds.has(id));

      if (unauthorizedIds.length > 0) {
        throw new Error(`Mentor cannot assign work to unauthorized students outside their scope (${unauthorizedIds.join(', ')})`);
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        creatorId: input.creatorId,
        title: input.title,
        description: input.description,
        type: input.type,
        subject: input.subject,
        chapterId: input.chapterId,
        conceptId: input.conceptId,
        testId: input.testId,
        targetCount: input.targetCount || 10,
        dueDate: input.dueDate,
        configJson: input.configJson ? JSON.stringify(input.configJson) : null,
        progressList: {
          create: input.targetStudentIds.map(studentId => ({
            studentId,
            status: 'NOT_STARTED',
            currentProgress: 0,
            targetProgress: input.targetCount || 10,
          })),
        },
      },
      include: {
        progressList: true,
      },
    });

    // Send notifications to assigned students
    for (const studentId of input.targetStudentIds) {
      await NotificationEngine.createNotification({
        recipientId: studentId,
        type: 'ASSIGNMENT',
        title: `New Assignment: ${input.title}`,
        message: input.description || `You have a new ${input.type} assignment due ${input.dueDate?.toLocaleDateString() || 'soon'}.`,
        relatedEntity: `Assignment:${assignment.id}`,
        isParentVisible: true,
      });
    }

    return assignment;
  }

  /**
   * Verified Server-Side Activity Progress:
   * Called when a student actually solves questions, reads NCERT, or takes tests.
   * Prevents students from falsely faking completion without actual evidence.
   */
  public static async recordVerifiedProgress(
    studentId: string,
    activityType: string,
    incrementCount: number = 1,
    evidence?: any
  ) {
    const activeAssignments = await prisma.assignmentProgress.findMany({
      where: {
        studentId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        assignment: {
          type: activityType,
        },
      },
      include: {
        assignment: true,
      },
    });

    const updated = [];

    for (const prog of activeAssignments) {
      const newProgress = Math.min(prog.targetProgress, prog.currentProgress + incrementCount);
      const isComplete = newProgress >= prog.targetProgress;

      const res = await prisma.assignmentProgress.update({
        where: { id: prog.id },
        data: {
          currentProgress: newProgress,
          status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
          startedAt: prog.startedAt || new Date(),
          completedAt: isComplete ? new Date() : null,
          lastActivityAt: new Date(),
          evidenceJson: evidence ? JSON.stringify(evidence) : prog.evidenceJson,
        },
      });

      updated.push(res);
    }

    return updated;
  }

  /**
   * Attempt to mark complete manually.
   * Rejected if the assignment is of type TEST, PRACTICE, PYQ without verified evidence!
   */
  public static async markComplete(progressId: string, studentId: string) {
    const progress = await prisma.assignmentProgress.findUnique({
      where: { id: progressId },
      include: { assignment: true },
    });

    if (!progress) throw new Error('Assignment progress not found');
    if (progress.studentId !== studentId) throw new Error('Unauthorized');

    // Reject manual completion without activity for verifiable types
    const verifiableTypes = ['PRACTICE', 'PYQ', 'FINGERTIPS', 'TEST', 'MOCK'];
    if (verifiableTypes.includes(progress.assignment.type) && progress.currentProgress < progress.targetProgress) {
      throw new Error(`Cannot manually mark ${progress.assignment.type} complete without verified platform attempt evidence`);
    }

    return prisma.assignmentProgress.update({
      where: { id: progressId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        currentProgress: progress.targetProgress,
      },
    });
  }

  /**
   * Get student's assigned work
   */
  public static async getStudentAssignments(studentId: string) {
    return prisma.assignmentProgress.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignment: {
          include: {
            creator: { select: { name: true, role: true } },
          },
        },
      },
    });
  }
}
