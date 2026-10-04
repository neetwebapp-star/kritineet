/**
 * Phase 8: Subscription Engine
 * Manages SaaS subscriptions, trial lifecycles, and state transitions
 * (TRIAL, ACTIVE, PAST_DUE, PAUSED, CANCELLED, EXPIRED).
 */

import prisma from '@/lib/prisma';

export type SubscriptionState = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface CreateSubscriptionInput {
  tenantId: string;
  planId: string;
  trialDays?: number;
  provider?: string;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
}

export class SubscriptionEngine {
  /**
   * Start a trial subscription for a tenant (duration is admin-configurable, default: 7 days)
   */
  public static async startTrial(tenantId: string, planName: string = 'STUDENT', trialDays: number = 7) {
    const plan = await prisma.plan.findUnique({ where: { name: planName } });
    if (!plan) throw new Error(`Plan ${planName} not found`);

    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + trialDays);

    // Cancel existing active/trial subscriptions
    await prisma.subscription.updateMany({
      where: {
        tenantId,
        status: { in: ['TRIAL', 'ACTIVE'] },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
    });

    const subscription = await prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: 'TRIAL',
        startedAt: now,
        expiresAt: trialEndsAt,
        trialEndsAt,
        provider: 'SANDBOX',
      },
      include: {
        plan: { include: { entitlements: true } },
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { planId: plan.id },
    });

    return subscription;
  }

  /**
   * Activate paid subscription (invoked only after server payment verification or verified webhook)
   */
  public static async activateSubscription(input: CreateSubscriptionInput) {
    const plan = await prisma.plan.findUnique({ where: { id: input.planId } });
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const expiresAt = new Date();
    if (plan.billingInterval === 'YEARLY') {
      expiresAt.setFullYear(now.getFullYear() + 1);
    } else {
      expiresAt.setMonth(now.getMonth() + 1);
    }

    // Cancel any previous subscriptions
    await prisma.subscription.updateMany({
      where: {
        tenantId: input.tenantId,
        status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
    });

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: input.tenantId,
        planId: input.planId,
        status: 'ACTIVE',
        startedAt: now,
        expiresAt,
        provider: input.provider || 'SANDBOX',
        providerSubscriptionId: input.providerSubscriptionId || null,
        providerCustomerId: input.providerCustomerId || null,
      },
      include: {
        plan: { include: { entitlements: true } },
      },
    });

    await prisma.tenant.update({
      where: { id: input.tenantId },
      data: { planId: input.planId },
    });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  public static async cancelSubscription(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Resolves authoritative subscription status for a tenant.
   * Auto-transitions expired trials/subscriptions to EXPIRED.
   */
  public static async getActiveSubscription(tenantId: string) {
    const sub = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: {
        plan: { include: { entitlements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return null;

    // Check expiration
    if (sub.expiresAt && new Date() > sub.expiresAt) {
      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' },
        include: { plan: { include: { entitlements: true } } },
      });
      return updated;
    }

    return sub;
  }
}
