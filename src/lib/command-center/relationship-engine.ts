/**
 * Phase 7: Relationship Engine
 * Manages secure Parent-Student Linking and Mentor-Student Assignments
 * with complete approval workflows and revocation audit trails.
 */

import prisma from '@/lib/prisma';

export class RelationshipEngine {
  // -------------------------------------------------------------
  // PARENT-STUDENT RELATIONSHIPS
  // -------------------------------------------------------------

  public static async requestParentLink(
    parentId: string,
    studentId: string,
    relationshipType: string = 'PARENT'
  ) {
    // Prevent self-linking
    if (parentId === studentId) {
      throw new Error('A user cannot link to themselves as a parent');
    }

    const parent = await prisma.user.findUnique({ where: { id: parentId } });
    const student = await prisma.user.findUnique({ where: { id: studentId } });

    if (!parent || !student) {
      throw new Error('Parent or Student user does not exist');
    }

    return prisma.parentStudentRelationship.upsert({
      where: {
        parentId_studentId: { parentId, studentId },
      },
      update: {
        status: 'PENDING',
        relationshipType,
        requestedAt: new Date(),
        revokedAt: null,
      },
      create: {
        parentId,
        studentId,
        relationshipType,
        status: 'PENDING',
      },
    });
  }

  public static async approveParentLink(relationshipId: string, approverId: string) {
    const rel = await prisma.parentStudentRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) throw new Error('Relationship not found');

    const approver = await prisma.user.findUnique({ where: { id: approverId } });
    if (!approver) throw new Error('Approver not found');

    const isStudent = rel.studentId === approverId;
    const isAdmin = approver.role === 'ADMIN' || approver.role === 'SUPER_ADMIN';

    if (!isStudent && !isAdmin) {
      throw new Error('Only the student or an admin can approve this link request');
    }

    return prisma.parentStudentRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        approvedBy: approverId,
      },
    });
  }

  public static async rejectParentLink(relationshipId: string, rejecterId: string) {
    const rel = await prisma.parentStudentRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) throw new Error('Relationship not found');

    const rejecter = await prisma.user.findUnique({ where: { id: rejecterId } });
    if (!rejecter) throw new Error('Rejecter not found');

    const isStudent = rel.studentId === rejecterId;
    const isAdmin = rejecter.role === 'ADMIN' || rejecter.role === 'SUPER_ADMIN';

    if (!isStudent && !isAdmin) {
      throw new Error('Only the student or an admin can reject this link request');
    }

    return prisma.parentStudentRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'REJECTED',
      },
    });
  }

  public static async revokeParentLink(relationshipId: string, revokerId: string) {
    const rel = await prisma.parentStudentRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) throw new Error('Relationship not found');

    const revoker = await prisma.user.findUnique({ where: { id: revokerId } });
    if (!revoker) throw new Error('Revoker not found');

    const isAuthorized =
      rel.studentId === revokerId ||
      rel.parentId === revokerId ||
      revoker.role === 'ADMIN' ||
      revoker.role === 'SUPER_ADMIN';

    if (!isAuthorized) {
      throw new Error('Unauthorized to revoke this relationship');
    }

    return prisma.parentStudentRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });
  }

  public static async getLinkedStudents(parentId: string) {
    const relationships = await prisma.parentStudentRelationship.findMany({
      where: {
        parentId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    return relationships.map(r => r.student);
  }

  // -------------------------------------------------------------
  // MENTOR-STUDENT ASSIGNMENTS
  // -------------------------------------------------------------

  public static async assignMentor(
    mentorId: string,
    studentId: string,
    assignedById: string,
    notes?: string
  ) {
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    const assigner = await prisma.user.findUnique({ where: { id: assignedById } });

    if (!mentor || !student || !assigner) {
      throw new Error('Mentor, Student, or Assigner not found');
    }

    const isAdmin = assigner.role === 'ADMIN' || assigner.role === 'SUPER_ADMIN';
    if (!isAdmin && assigner.id !== mentorId) {
      throw new Error('Only an admin or authorized mentor can make mentor assignments');
    }

    return prisma.mentorStudentAssignment.upsert({
      where: {
        mentorId_studentId: { mentorId, studentId },
      },
      update: {
        status: 'ACTIVE',
        assignedBy: assignedById,
        notes: notes || null,
        revokedAt: null,
      },
      create: {
        mentorId,
        studentId,
        assignedBy: assignedById,
        status: 'ACTIVE',
        notes: notes || null,
      },
    });
  }

  public static async revokeMentorAssignment(assignmentId: string, revokerId: string) {
    const assignment = await prisma.mentorStudentAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error('Assignment not found');

    const revoker = await prisma.user.findUnique({ where: { id: revokerId } });
    if (!revoker) throw new Error('Revoker not found');

    const isAdmin = revoker.role === 'ADMIN' || revoker.role === 'SUPER_ADMIN';
    const isMentor = assignment.mentorId === revokerId;

    if (!isAdmin && !isMentor) {
      throw new Error('Unauthorized to revoke this mentor assignment');
    }

    return prisma.mentorStudentAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });
  }

  public static async getAssignedStudents(mentorId: string) {
    const assignments = await prisma.mentorStudentAssignment.findMany({
      where: {
        mentorId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    return assignments.map(a => a.student);
  }
}
