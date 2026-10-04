/**
 * Phase 8: Usage Tracking & Limits Engine
 * Tracks configurable usage counters per tenant/user (AI queries, mock tests, daily questions, exports)
 * and enforces plan thresholds.
 */

import prisma from '@/lib/prisma';
import { EntitlementEngine, PlatformFeature } from './entitlement-engine';

export class UsageEngine {
  /**
   * Computes deterministic period keys for daily or monthly tracking
   */
  public static getPeriodKey(period: 'DAILY' | 'MONTHLY'): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    if (period === 'MONTHLY') {
      return `${year}-${month}`;
    }
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Checks whether usage is within limits and increments the counter if permitted
   */
  public static async checkAndIncrementUsage(
    tenantId: string,
    userId: string,
    feature: PlatformFeature,
    period: 'DAILY' | 'MONTHLY' = 'DAILY',
    incrementBy: number = 1
  ): Promise<{ allowed: boolean; currentCount: number; maxLimit: number | null; reason?: string }> {
    // 1. Check feature entitlement limit
    const entitlement = await EntitlementEngine.canAccessFeature(userId, feature, tenantId);
    if (!entitlement.allowed) {
      return { allowed: false, currentCount: 0, maxLimit: 0, reason: entitlement.reason };
    }

    const maxLimit = entitlement.limitValue;
    const periodKey = this.getPeriodKey(period);

    // If unlimited (null limitValue), record usage without blocking
    const counter = await prisma.usageCounter.findUnique({
      where: {
        tenantId_feature_periodKey: {
          tenantId,
          feature,
          periodKey,
        },
      },
    });

    const currentCount = counter ? counter.count : 0;

    if (maxLimit !== null && maxLimit !== undefined && currentCount + incrementBy > maxLimit) {
      return {
        allowed: false,
        currentCount,
        maxLimit,
        reason: `Exceeded ${period.toLowerCase()} usage limit of ${maxLimit} for ${feature}. Upgrade your plan for higher capacity.`,
      };
    }

    // Increment counter
    const updatedCounter = await prisma.usageCounter.upsert({
      where: {
        tenantId_feature_periodKey: {
          tenantId,
          feature,
          periodKey,
        },
      },
      update: {
        count: { increment: incrementBy },
      },
      create: {
        tenantId,
        userId,
        feature,
        period,
        periodKey,
        count: incrementBy,
      },
    });

    return {
      allowed: true,
      currentCount: updatedCounter.count,
      maxLimit: maxLimit ?? null,
    };
  }

  /**
   * Get current usage summary for a tenant
   */
  public static async getTenantUsageSummary(tenantId: string) {
    const dailyKey = this.getPeriodKey('DAILY');
    const monthlyKey = this.getPeriodKey('MONTHLY');

    const counters = await prisma.usageCounter.findMany({
      where: {
        tenantId,
        periodKey: { in: [dailyKey, monthlyKey] },
      },
    });

    return counters.map(c => ({
      feature: c.feature,
      period: c.period,
      count: c.count,
      periodKey: c.periodKey,
    }));
  }
}
