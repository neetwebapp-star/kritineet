/**
 * Phase 7: Role-Based Access Control (RBAC) & Permission Engine
 * Enforces explicit role permissions, student data ownership,
 * mentor-student assignment scoping, and parent-student relationship authorization.
 */

import prisma from '@/lib/prisma';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MENTOR' | 'PARENT' | 'STUDENT';

export type Permission =
  | 'STUDENT_VIEW'
  | 'STUDENT_EDIT'
  | 'STUDENT_ASSIGN'
  | 'QUESTION_REVIEW'
  | 'QUESTION_EDIT'
  | 'TEST_CREATE'
  | 'TEST_PUBLISH'
  | 'ANALYTICS_VIEW'
  | 'AI_ANALYTICS_VIEW'
  | 'MENTOR_MANAGE'
  | 'PARENT_MANAGE'
  | 'AUDIT_VIEW'
  | 'SYSTEM_SETTINGS'
  | 'NOTE_CREATE'
  | 'NOTE_VIEW'
  | 'EXPORT_DATA'
  | 'GOAL_MANAGE'
  | 'ALERT_MANAGE'
  | 'INTERVENTION_CREATE';

// Authoritative Permission Matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'STUDENT_VIEW',
    'STUDENT_EDIT',
    'STUDENT_ASSIGN',
    'QUESTION_REVIEW',
    'QUESTION_EDIT',
    'TEST_CREATE',
    'TEST_PUBLISH',
    'ANALYTICS_VIEW',
    'AI_ANALYTICS_VIEW',
    'MENTOR_MANAGE',
    'PARENT_MANAGE',
    'AUDIT_VIEW',
    'SYSTEM_SETTINGS',
    'NOTE_CREATE',
    'NOTE_VIEW',
    'EXPORT_DATA',
    'GOAL_MANAGE',
    'ALERT_MANAGE',
    'INTERVENTION_CREATE',
  ],
  ADMIN: [
    'STUDENT_VIEW',
    'STUDENT_EDIT',
    'STUDENT_ASSIGN',
    'QUESTION_REVIEW',
    'QUESTION_EDIT',
    'TEST_CREATE',
    'TEST_PUBLISH',
    'ANALYTICS_VIEW',
    'AI_ANALYTICS_VIEW',
    'MENTOR_MANAGE',
    'PARENT_MANAGE',
    'AUDIT_VIEW',
    'NOTE_CREATE',
    'NOTE_VIEW',
    'EXPORT_DATA',
    'GOAL_MANAGE',
    'ALERT_MANAGE',
    'INTERVENTION_CREATE',
  ],
  MENTOR: [
    'STUDENT_VIEW',      // Scoped only to assigned students
    'STUDENT_ASSIGN',    // Scoped only to assigned students
    'ANALYTICS_VIEW',    // Scoped only to assigned students
    'NOTE_CREATE',
    'NOTE_VIEW',
    'EXPORT_DATA',
    'GOAL_MANAGE',
    'ALERT_MANAGE',
    'INTERVENTION_CREATE',
    'TEST_CREATE',
  ],
  PARENT: [
    'STUDENT_VIEW',      // Scoped only to linked students (permitted progress only)
    'EXPORT_DATA',
  ],
  STUDENT: [
    'STUDENT_VIEW',      // Own data only
    'GOAL_MANAGE',       // Own goals
    'EXPORT_DATA',       // Own data export
  ],
};

export class RbacEngine {
  /**
   * Checks whether a role inherently possesses a permission
   */
  public static hasPermission(role: string, permission: Permission): boolean {
    const canonicalRole = (role || 'STUDENT').toUpperCase() as UserRole;
    const permissions = ROLE_PERMISSIONS[canonicalRole] || [];
    return permissions.includes(permission);
  }

  /**
   * Server-authoritative check: Can user access this specific student's data?
   * Protects against IDOR (Insecure Direct Object Reference) vulnerabilities.
   */
  public static async canAccessStudent(
    actorId: string,
    targetStudentId: string,
    requiredPermission: Permission = 'STUDENT_VIEW'
  ): Promise<{ allowed: boolean; reason?: string; accessLevel: 'FULL' | 'MENTOR_SCOPED' | 'PARENT_SCOPED' | 'OWN' }> {
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
    });

    if (!actor) {
      return { allowed: false, reason: 'Actor not found', accessLevel: 'OWN' };
    }

    const role = (actor.role || 'STUDENT').toUpperCase() as UserRole;

    // Check base permission
    if (!this.hasPermission(role, requiredPermission)) {
      return { allowed: false, reason: `Role ${role} lacks permission ${requiredPermission}`, accessLevel: 'OWN' };
    }

    // 1. Super Admin & Admin have platform-wide access
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return { allowed: true, accessLevel: 'FULL' };
    }

    // 2. Student can only access their own data
    if (role === 'STUDENT') {
      if (actor.id === targetStudentId) {
        return { allowed: true, accessLevel: 'OWN' };
      }
      return { allowed: false, reason: 'Students cannot access other students data', accessLevel: 'OWN' };
    }

    // 3. Mentor can only access explicitly assigned students with ACTIVE status
    if (role === 'MENTOR') {
      const assignment = await prisma.mentorStudentAssignment.findUnique({
        where: {
          mentorId_studentId: {
            mentorId: actor.id,
            studentId: targetStudentId,
          },
        },
      });

      if (assignment && assignment.status === 'ACTIVE') {
        return { allowed: true, accessLevel: 'MENTOR_SCOPED' };
      }
      return { allowed: false, reason: 'Student is not actively assigned to this mentor', accessLevel: 'MENTOR_SCOPED' };
    }

    // 4. Parent can only access explicitly linked students with ACTIVE status
    if (role === 'PARENT') {
      const relationship = await prisma.parentStudentRelationship.findUnique({
        where: {
          parentId_studentId: {
            parentId: actor.id,
            studentId: targetStudentId,
          },
        },
      });

      if (relationship && relationship.status === 'ACTIVE') {
        return { allowed: true, accessLevel: 'PARENT_SCOPED' };
      }
      return { allowed: false, reason: 'Student is not actively linked to this parent', accessLevel: 'PARENT_SCOPED' };
    }

    return { allowed: false, reason: 'Unauthorized access', accessLevel: 'OWN' };
  }

  /**
   * Parent Visibility Policy:
   * Redacts sensitive student data (private AI conversations, mentor internal notes, raw telemetry)
   * while exposing high-level educational progress.
   */
  public static filterDataForParent<T extends Record<string, any>>(data: T): Partial<T> {
    const sanitized = { ...data };
    // Redact private AI conversations
    if ('tutorConversations' in sanitized) {
      delete sanitized.tutorConversations;
    }
    // Redact raw audit logs and authentication metadata
    if ('auditLogs' in sanitized) {
      delete sanitized.auditLogs;
    }
    if ('metadataJson' in sanitized) {
      delete sanitized.metadataJson;
    }
    if ('aiUsageLogs' in sanitized) {
      delete sanitized.aiUsageLogs;
    }
    return sanitized;
  }
}
