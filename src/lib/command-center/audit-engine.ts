/**
 * Phase 7: Audit Logging Engine
 * Records immutable, tamper-resistant audit logs for all privileged administrative,
 * mentor, and relationship actions (including impersonation events).
 */

import prisma from '@/lib/prisma';

export interface AuditActionInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
}

export class AuditEngine {
  public static async logAction(input: AuditActionInput) {
    return prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues ? JSON.stringify(input.oldValues) : null,
        newValues: input.newValues ? JSON.stringify(input.newValues) : null,
        ipAddress: input.ipAddress || null,
      },
    });
  }

  public static async logImpersonation(adminId: string, targetStudentId: string, reason: string) {
    return this.logAction({
      userId: adminId,
      action: 'ADMIN_IMPERSONATION',
      entityType: 'User',
      entityId: targetStudentId,
      newValues: {
        reason,
        mode: 'READ_ONLY_SUPPORT',
        timestamp: new Date().toISOString(),
      },
    });
  }

  public static async getLogs(entityType?: string, take: number = 50) {
    return prisma.auditLog.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: { select: { email: true, name: true, role: true } },
      },
    });
  }
}
