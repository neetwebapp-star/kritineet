/**
 * Phase 8: Feature Flag Engine
 * Controls gradual rollouts and selective experimental features across
 * GLOBAL, TENANT, and USER scopes (strictly distinct from authorization).
 */

import prisma from '@/lib/prisma';

export class FeatureFlagEngine {
  /**
   * Evaluates if a feature flag is enabled for the given context
   */
  public static async isEnabled(
    flagName: string,
    context?: { tenantId?: string | null; userId?: string | null }
  ): Promise<boolean> {
    const flags = await prisma.featureFlag.findMany({
      where: { name: flagName },
    });

    if (flags.length === 0) return false;

    // 1. Check user-specific flag
    if (context?.userId) {
      const userFlag = flags.find(f => f.scope === 'USER' && f.targetId === context.userId);
      if (userFlag) return userFlag.isEnabled;
    }

    // 2. Check tenant-specific flag
    if (context?.tenantId) {
      const tenantFlag = flags.find(
        f => (f.scope === 'TENANT' && f.targetId === context.tenantId) || f.tenantId === context.tenantId
      );
      if (tenantFlag) return tenantFlag.isEnabled;
    }

    // 3. Fall back to global flag
    const globalFlag = flags.find(f => f.scope === 'GLOBAL');
    return globalFlag ? globalFlag.isEnabled : false;
  }

  /**
   * Set or update a feature flag
   */
  public static async setFlag(
    name: string,
    isEnabled: boolean,
    scope: 'GLOBAL' | 'TENANT' | 'USER' = 'GLOBAL',
    targetId?: string | null,
    description?: string
  ) {
    const existing = await prisma.featureFlag.findFirst({
      where: {
        name,
        scope,
        targetId: targetId || null,
      },
    });

    if (existing) {
      return prisma.featureFlag.update({
        where: { id: existing.id },
        data: { isEnabled, description: description || existing.description },
      });
    }

    return prisma.featureFlag.create({
      data: {
        name,
        isEnabled,
        scope,
        targetId: targetId || null,
        tenantId: scope === 'TENANT' ? targetId || null : null,
        description,
      },
    });
  }
}
