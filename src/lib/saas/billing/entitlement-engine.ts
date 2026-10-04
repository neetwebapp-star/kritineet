/**
 * Phase 8: Feature Entitlement Engine
 * Evaluates whether a user or tenant has authorized access to platform features
 * based on their active subscription, plan entitlements, and role.
 */

import prisma from '@/lib/prisma';
import { SubscriptionEngine } from './subscription-engine';

export type PlatformFeature =
  | 'PRACTICE'
  | 'PYQ'
  | 'FINGERTIPS'
  | 'CBT'
  | 'FULL_MOCK'
  | 'AI_TUTOR'
  | 'AI_IMAGE_SOLVER'
  | 'ADVANCED_ANALYTICS'
  | 'PARENT_DASHBOARD'
  | 'MENTOR_DASHBOARD'
  | 'EXPORT'
  | 'CUSTOM_TESTS';

export class EntitlementEngine {
  /**
   * Server-side check: Is user/tenant entitled to use this feature?
   */
  public static async canAccessFeature(
    userId: string,
    feature: PlatformFeature,
    tenantId?: string | null
  ): Promise<{ allowed: boolean; limitValue?: number | null; reason?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Super Admin has unrestricted access to all platform features
    if (user.role === 'SUPER_ADMIN') {
      return { allowed: true, limitValue: null };
    }

    const resolvedTenantId = tenantId || user.tenantId;

    let activePlanId: string | null = null;

    if (resolvedTenantId) {
      const activeSub = await SubscriptionEngine.getActiveSubscription(resolvedTenantId);
      if (activeSub && activeSub.planId) {
        activePlanId = activeSub.planId;
      }
    }

    // If no active subscription or expired, fall back to FREE plan
    if (!activePlanId) {
      const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
      activePlanId = freePlan ? freePlan.id : null;
    }

    if (!activePlanId) {
      // Default safety fallback if DB hasn't been seeded with FREE plan
      return { allowed: feature === 'PRACTICE' || feature === 'PYQ', limitValue: 10 };
    }

    const entitlement = await prisma.featureEntitlement.findUnique({
      where: {
        planId_feature: {
          planId: activePlanId,
          feature,
        },
      },
    });

    if (!entitlement || !entitlement.isEnabled) {
      return {
        allowed: false,
        reason: `Feature ${feature} is not included in current subscription plan. Upgrade required.`,
      };
    }

    return {
      allowed: true,
      limitValue: entitlement.limitValue,
    };
  }

  /**
   * Get all features permitted for this tenant
   */
  public static async getAllowedFeatures(tenantId?: string | null): Promise<Record<string, { enabled: boolean; limit: number | null }>> {
    let planId: string | null = null;
    if (tenantId) {
      const sub = await SubscriptionEngine.getActiveSubscription(tenantId);
      if (sub) planId = sub.planId;
    }

    if (!planId) {
      const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
      planId = freePlan?.id || null;
    }

    const entitlements = planId
      ? await prisma.featureEntitlement.findMany({ where: { planId } })
      : [];

    const result: Record<string, { enabled: boolean; limit: number | null }> = {};
    for (const ent of entitlements) {
      result[ent.feature] = {
        enabled: ent.isEnabled,
        limit: ent.limitValue,
      };
    }

    return result;
  }
}
