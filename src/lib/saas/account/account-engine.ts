/**
 * Phase 8: Account Management, Privacy & Controlled Deletion Engine
 * Manages personal data export, privacy controls, and controlled account deletion
 * (safely preserving immutable financial/audit records for legal compliance).
 */

import prisma from '@/lib/prisma';
import { AuditEngine } from '@/lib/command-center/audit-engine';

export class AccountEngine {
  /**
   * Generates a comprehensive export of personal learning data for a student.
   * Invariant: Never exports other students' data, private mentor notes, or raw licensed textbook PDFs.
   */
  public static async exportStudentData(studentId: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        attempts: {
          select: {
            id: true,
            testId: true,
            totalScore: true,
            accuracy: true,
            status: true,
            submittedAt: true,
          },
        },
        mistakes: {
          select: {
            id: true,
            mistakeType: true,
            mistakeCount: true,
            isResolved: true,
            learnedAt: true,
          },
        },
        revisions: {
          select: {
            id: true,
            category: true,
            nextRevisionAt: true,
            repetitionLevel: true,
          },
        },
        goals: {
          select: {
            id: true,
            title: true,
            metricType: true,
            target: true,
            current: true,
            status: true,
          },
        },
      },
    });

    if (!student) throw new Error('Student not found');

    return {
      exportedAt: new Date().toISOString(),
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        targetExamYear: student.profile?.targetExamYear || 2027,
      },
      learningData: {
        examAttempts: student.attempts,
        errorBookMistakes: student.mistakes,
        spacedRevisionSchedule: student.revisions,
        goals: student.goals,
      },
      exportDisclaimer:
        'This file contains your verified personal learning data from the NEET UG 2027 platform. Proprietary publisher material and system secrets are excluded in compliance with licensing policies.',
    };
  }

  /**
   * Retrieves active privacy relationships (who can view this account)
   */
  public static async getPrivacySettings(studentId: string) {
    const [parents, mentors] = await Promise.all([
      prisma.parentStudentRelationship.findMany({
        where: { studentId, status: 'ACTIVE' },
        include: { parent: { select: { id: true, name: true, email: true } } },
      }),
      prisma.mentorStudentAssignment.findMany({
        where: { studentId, status: 'ACTIVE' },
        include: { mentor: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return {
      studentId,
      authorizedParents: parents.map(p => ({
        id: p.parent.id,
        name: p.parent.name,
        email: p.parent.email,
        type: p.relationshipType,
      })),
      authorizedMentors: mentors.map(m => ({
        id: m.mentor.id,
        name: m.mentor.name,
        email: m.mentor.email,
      })),
      dataVisibilityPolicy: {
        parentsSee: 'High-level syllabus progress, study streak, homework completion',
        parentsCannotSee: 'Private AI doubt chats, mentor internal notes, raw telemetry',
      },
    };
  }

  /**
   * Controlled Account Deletion:
   * Removes personal user data and learning sessions, while retaining immutable
   * audit logs and financial records as mandated by legal and regulatory retention policies.
   */
  public static async deleteAccount(userId: string, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 1. Audit log the deletion request before wiping
    await AuditEngine.logAction({
      userId,
      action: 'ACCOUNT_DELETION',
      entityType: 'User',
      entityId: userId,
      oldValues: { email: user.email, name: user.name, role: user.role, reason },
      newValues: { status: 'DELETED', deletedAt: new Date().toISOString() },
    });

    // 2. Cascade delete personal learning objects
    await prisma.studentProfile.deleteMany({ where: { userId } });
    await prisma.studentMistake.deleteMany({ where: { userId } });
    await prisma.revisionSchedule.deleteMany({ where: { userId } });
    await prisma.goal.deleteMany({ where: { userId } });
    await prisma.learningActivity.deleteMany({ where: { userId } });
    await prisma.examAttempt.deleteMany({ where: { userId } });
    await prisma.tutorConversation.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { recipientId: userId } });

    // 3. Sever active relationships
    await prisma.parentStudentRelationship.deleteMany({
      where: { OR: [{ parentId: userId }, { studentId: userId }] },
    });
    await prisma.mentorStudentAssignment.deleteMany({
      where: { OR: [{ mentorId: userId }, { studentId: userId }] },
    });

    // 4. Anonymize user record to preserve foreign keys on non-deletable audit/payment events
    const anonymizedEmail = `deleted_${userId.substring(0, 8)}@deleted.neet2027.internal`;
    return prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        name: 'Deleted User',
      },
    });
  }
}
