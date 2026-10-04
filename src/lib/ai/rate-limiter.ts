/**
 * Phase 6: AI Rate Limiter
 * Enforces per-student daily quotas for chat queries and image doubt solving,
 * resets automatically at midnight UTC, and prevents abuse.
 */

import prisma from '@/lib/prisma';

export interface RateLimitStatus {
  allowed: boolean;
  messagesUsed: number;
  dailyMessageCap: number;
  remainingMessages: number;
  imagesUsed: number;
  dailyImageCap: number;
  remainingImages: number;
  resetDate: string;
  errorMessage?: string;
}

export class AIRateLimiter {
  public static async checkLimit(
    userId: string,
    isImageQuery: boolean = false
  ): Promise<RateLimitStatus> {
    const today = new Date().toISOString().split('T')[0];

    // Find or create rate limit record
    let record = await prisma.aIRateLimit.findUnique({
      where: { userId },
    });

    if (!record) {
      record = await prisma.aIRateLimit.create({
        data: {
          userId,
          dailyMessageCap: 100,
          dailyImageCap: 20,
          messagesUsed: 0,
          imagesUsed: 0,
          lastResetDate: today,
        },
      });
    } else if (record.lastResetDate !== today) {
      // Day has rolled over, reset usage
      record = await prisma.aIRateLimit.update({
        where: { userId },
        data: {
          messagesUsed: 0,
          imagesUsed: 0,
          lastResetDate: today,
        },
      });
    }

    const remainingMessages = Math.max(0, record.dailyMessageCap - record.messagesUsed);
    const remainingImages = Math.max(0, record.dailyImageCap - record.imagesUsed);

    if (isImageQuery && record.imagesUsed >= record.dailyImageCap) {
      return {
        allowed: false,
        messagesUsed: record.messagesUsed,
        dailyMessageCap: record.dailyMessageCap,
        remainingMessages,
        imagesUsed: record.imagesUsed,
        dailyImageCap: record.dailyImageCap,
        remainingImages: 0,
        resetDate: today,
        errorMessage: `Daily image doubt limit reached (${record.dailyImageCap}/${record.dailyImageCap}). Your quota will reset tomorrow.`,
      };
    }

    if (!isImageQuery && record.messagesUsed >= record.dailyMessageCap) {
      return {
        allowed: false,
        messagesUsed: record.messagesUsed,
        dailyMessageCap: record.dailyMessageCap,
        remainingMessages: 0,
        imagesUsed: record.imagesUsed,
        dailyImageCap: record.dailyImageCap,
        remainingImages,
        resetDate: today,
        errorMessage: `Daily AI Tutor message limit reached (${record.dailyMessageCap}/${record.dailyMessageCap}). Your quota will reset tomorrow.`,
      };
    }

    return {
      allowed: true,
      messagesUsed: record.messagesUsed,
      dailyMessageCap: record.dailyMessageCap,
      remainingMessages,
      imagesUsed: record.imagesUsed,
      dailyImageCap: record.dailyImageCap,
      remainingImages,
      resetDate: today,
    };
  }

  public static async recordUsage(
    userId: string,
    isImageQuery: boolean = false
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const record = await prisma.aIRateLimit.findUnique({
      where: { userId },
    });

    if (!record) {
      await prisma.aIRateLimit.create({
        data: {
          userId,
          dailyMessageCap: 100,
          dailyImageCap: 20,
          messagesUsed: isImageQuery ? 0 : 1,
          imagesUsed: isImageQuery ? 1 : 0,
          lastResetDate: today,
        },
      });
    } else {
      await prisma.aIRateLimit.update({
        where: { userId },
        data: {
          messagesUsed: isImageQuery ? record.messagesUsed : { increment: 1 },
          imagesUsed: isImageQuery ? { increment: 1 } : record.imagesUsed,
        },
      });
    }
  }
}
