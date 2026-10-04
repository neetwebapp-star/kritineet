/**
 * Phase 8: Multi-Tenant Architecture & Tenant Isolation Engine
 * Manages tenant boundaries (INDIVIDUAL, COACHING, SCHOOL, ORGANIZATION),
 * organization profiles, and guarantees strict server-side tenant isolation.
 */

import prisma from '@/lib/prisma';

export type TenantType = 'INDIVIDUAL' | 'COACHING' | 'SCHOOL' | 'ORGANIZATION';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface CreateTenantInput {
  name: string;
  slug?: string;
  type?: TenantType;
  adminUserId?: string;
  planId?: string;
}

export class TenantEngine {
  /**
   * Generates a clean URL slug from name
   */
  public static generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  /**
   * Create a new Tenant entity
   */
  public static async createTenant(input: CreateTenantInput) {
    const slug = input.slug || this.generateSlug(input.name);

    const tenant = await prisma.tenant.create({
      data: {
        name: input.name,
        slug,
        type: input.type || 'INDIVIDUAL',
        status: 'ACTIVE',
        planId: input.planId || null,
      },
    });

    if (input.adminUserId) {
      await prisma.user.update({
        where: { id: input.adminUserId },
        data: {
          tenantId: tenant.id,
          role: input.type === 'INDIVIDUAL' ? 'STUDENT' : 'ADMIN',
        },
      });
    }

    return tenant;
  }

  /**
   * Assign a user to a tenant
   */
  public static async assignUserToTenant(userId: string, tenantId: string, role?: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    return prisma.user.update({
      where: { id: userId },
      data: {
        tenantId,
        role: role || undefined,
      },
    });
  }

  /**
   * Server-side Tenant Isolation Check:
   * Validates whether an actor belongs to the requested tenant or has platform super-admin access.
   * NEVER trust tenantId sent by browser without validation!
   */
  public static validateTenantAccess(
    actorTenantId: string | null | undefined,
    targetTenantId: string | null | undefined,
    actorRole: string
  ): { isAllowed: boolean; reason?: string } {
    // Platform Super Admin has global override
    if (actorRole === 'SUPER_ADMIN') {
      return { isAllowed: true };
    }

    // Global shared resources (null targetTenantId) are accessible to all authenticated tenants
    if (!targetTenantId) {
      return { isAllowed: true };
    }

    // If resource is tenant-scoped, actor MUST belong to the exact same tenant
    if (!actorTenantId) {
      return { isAllowed: false, reason: 'Actor does not belong to any tenant' };
    }

    if (actorTenantId !== targetTenantId) {
      return { isAllowed: false, reason: 'Cross-tenant access forbidden' };
    }

    return { isAllowed: true };
  }

  /**
   * Fetch tenant by ID or slug
   */
  public static async getTenant(tenantIdOrSlug: string) {
    return prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }],
      },
      include: {
        plan: true,
        subscriptions: { where: { status: 'ACTIVE' }, take: 1 },
        _count: {
          select: { users: true, customTests: true, assignments: true },
        },
      },
    });
  }

  /**
   * List organizations with member counts and active subscription info
   */
  public static async listOrganizations(take: number = 50, skip: number = 0) {
    return prisma.tenant.findMany({
      where: {
        type: { in: ['COACHING', 'SCHOOL', 'ORGANIZATION'] },
      },
      include: {
        plan: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            customTests: true,
            assignments: true,
          },
        },
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }
}
