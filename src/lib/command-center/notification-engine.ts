/**
 * Phase 7: Notification Engine
 * Dispatches in-app notifications for assignments, revisions, tests, feedback,
 * and system reminders, supporting category filters and parent-visibility flags.
 */

import prisma from '@/lib/prisma';

export interface CreateNotificationInput {
  recipientId: string;
  type: 'ASSIGNMENT' | 'REVISION' | 'TEST' | 'FEEDBACK' | 'SYSTEM' | 'REMINDER';
  title: string;
  message: string;
  relatedEntity?: string;
  isParentVisible?: boolean;
}

export class NotificationEngine {
  public static async createNotification(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntity: input.relatedEntity || null,
        isParentVisible: input.isParentVisible ?? false,
      },
    });
  }

  public static async getNotifications(userId: string, isParentView: boolean = false) {
    const where: any = { recipientId: userId };
    if (isParentView) {
      where.isParentVisible = true;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        recipientId: userId,
        readAt: null,
      },
    });
  }

  public static async markAsRead(notificationId: string, userId: string) {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif) throw new Error('Notification not found');
    if (notif.recipientId !== userId) throw new Error('Unauthorized');

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        readAt: new Date(),
      },
    });
  }

  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        recipientId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
