/**
 * Phase 8: Plan Management Engine
 * Manages SaaS plans (FREE, STUDENT, PRO, INSTITUTE), configurable pricing,
 * currencies, billing intervals, and default feature entitlements.
 */

import prisma from '@/lib/prisma';

export interface PlanConfig {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  entitlements: Array<{
    feature: string;
    isEnabled: boolean;
    limitValue?: number | null;
  }>;
}

export class PlanEngine {
  /**
   * Initializes or updates the authoritative canonical plans
   */
  public static async seedDefaultPlans() {
    const plans: PlanConfig[] = [
      {
        name: 'FREE',
        description: 'Starter access to NCERT reading and baseline daily practice',
        price: 0,
        currency: 'INR',
        billingInterval: 'MONTHLY',
        entitlements: [
          { feature: 'PRACTICE', isEnabled: true, limitValue: 20 }, // 20 Qs/day
          { feature: 'PYQ', isEnabled: true, limitValue: 10 },
          { feature: 'FINGERTIPS', isEnabled: false },
          { feature: 'CBT', isEnabled: false },
          { feature: 'FULL_MOCK', isEnabled: false },
          { feature: 'AI_TUTOR', isEnabled: true, limitValue: 5 }, // 5 messages/day
          { feature: 'AI_IMAGE_SOLVER', isEnabled: false },
          { feature: 'ADVANCED_ANALYTICS', isEnabled: false },
          { feature: 'PARENT_DASHBOARD', isEnabled: false },
          { feature: 'MENTOR_DASHBOARD', isEnabled: false },
          { feature: 'EXPORT', isEnabled: false },
          { feature: 'CUSTOM_TESTS', isEnabled: false },
        ],
      },
      {
        name: 'STUDENT',
        description: 'Complete individual self-study bundle with unlimited practice and PYQs',
        price: 999,
        currency: 'INR',
        billingInterval: 'MONTHLY',
        entitlements: [
          { feature: 'PRACTICE', isEnabled: true, limitValue: null },
          { feature: 'PYQ', isEnabled: true, limitValue: null },
          { feature: 'FINGERTIPS', isEnabled: true, limitValue: null },
          { feature: 'CBT', isEnabled: true, limitValue: 4 }, // 4 mocks/month
          { feature: 'FULL_MOCK', isEnabled: true, limitValue: 2 },
          { feature: 'AI_TUTOR', isEnabled: true, limitValue: 50 }, // 50 messages/day
          { feature: 'AI_IMAGE_SOLVER', isEnabled: true, limitValue: 10 },
          { feature: 'ADVANCED_ANALYTICS', isEnabled: true },
          { feature: 'PARENT_DASHBOARD', isEnabled: true },
          { feature: 'MENTOR_DASHBOARD', isEnabled: false },
          { feature: 'EXPORT', isEnabled: true },
          { feature: 'CUSTOM_TESTS', isEnabled: false },
        ],
      },
      {
        name: 'PRO',
        description: 'High-intensity NEET aspirant plan with unlimited AI tutoring and CBT mocks',
        price: 1999,
        currency: 'INR',
        billingInterval: 'MONTHLY',
        entitlements: [
          { feature: 'PRACTICE', isEnabled: true, limitValue: null },
          { feature: 'PYQ', isEnabled: true, limitValue: null },
          { feature: 'FINGERTIPS', isEnabled: true, limitValue: null },
          { feature: 'CBT', isEnabled: true, limitValue: null },
          { feature: 'FULL_MOCK', isEnabled: true, limitValue: null },
          { feature: 'AI_TUTOR', isEnabled: true, limitValue: null },
          { feature: 'AI_IMAGE_SOLVER', isEnabled: true, limitValue: 50 },
          { feature: 'ADVANCED_ANALYTICS', isEnabled: true },
          { feature: 'PARENT_DASHBOARD', isEnabled: true },
          { feature: 'MENTOR_DASHBOARD', isEnabled: true },
          { feature: 'EXPORT', isEnabled: true },
          { feature: 'CUSTOM_TESTS', isEnabled: true },
        ],
      },
      {
        name: 'INSTITUTE',
        description: 'Organization plan for Coaching Centers and Schools with custom tests and multi-mentor workspaces',
        price: 9999,
        currency: 'INR',
        billingInterval: 'MONTHLY',
        entitlements: [
          { feature: 'PRACTICE', isEnabled: true, limitValue: null },
          { feature: 'PYQ', isEnabled: true, limitValue: null },
          { feature: 'FINGERTIPS', isEnabled: true, limitValue: null },
          { feature: 'CBT', isEnabled: true, limitValue: null },
          { feature: 'FULL_MOCK', isEnabled: true, limitValue: null },
          { feature: 'AI_TUTOR', isEnabled: true, limitValue: null },
          { feature: 'AI_IMAGE_SOLVER', isEnabled: true, limitValue: null },
          { feature: 'ADVANCED_ANALYTICS', isEnabled: true },
          { feature: 'PARENT_DASHBOARD', isEnabled: true },
          { feature: 'MENTOR_DASHBOARD', isEnabled: true },
          { feature: 'EXPORT', isEnabled: true },
          { feature: 'CUSTOM_TESTS', isEnabled: true },
        ],
      },
    ];

    const results = [];
    for (const plan of plans) {
      const p = await prisma.plan.upsert({
        where: { name: plan.name },
        update: {
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          status: 'ACTIVE',
        },
        create: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          status: 'ACTIVE',
        },
      });

      // Upsert entitlements
      for (const ent of plan.entitlements) {
        await prisma.featureEntitlement.upsert({
          where: {
            planId_feature: {
              planId: p.id,
              feature: ent.feature,
            },
          },
          update: {
            isEnabled: ent.isEnabled,
            limitValue: ent.limitValue,
          },
          create: {
            planId: p.id,
            feature: ent.feature,
            isEnabled: ent.isEnabled,
            limitValue: ent.limitValue,
          },
        });
      }

      results.push(p);
    }

    return results;
  }

  /**
   * Get all active plans with entitlements
   */
  public static async getPlans() {
    return prisma.plan.findMany({
      where: { status: 'ACTIVE' },
      include: { entitlements: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Update plan pricing or details (Admin only)
   */
  public static async updatePlan(planId: string, data: Partial<PlanConfig>) {
    return prisma.plan.update({
      where: { id: planId },
      data: {
        price: data.price,
        currency: data.currency,
        description: data.description,
        billingInterval: data.billingInterval,
      },
      include: { entitlements: true },
    });
  }
}
