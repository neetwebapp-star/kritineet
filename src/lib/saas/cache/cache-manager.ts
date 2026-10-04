/**
 * Phase 8: Cache Manager & Data Isolation Guard
 * Caches high-throughput global metadata (NCERT chapters, concepts, exam patterns)
 * while strictly isolating private tenant data and preventing cross-user data leakage.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tenantId?: string | null;
}

export class CacheManager {
  private static store: Map<string, CacheEntry<any>> = new Map();

  /**
   * Sets a cached value with TTL (in seconds) and optional tenant context
   */
  public static set<T>(key: string, value: T, ttlSeconds: number = 300, tenantId?: string | null) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt, tenantId: tenantId || null });
  }

  /**
   * Gets a cached value, enforcing strict tenant isolation check
   */
  public static get<T>(key: string, requestedTenantId?: string | null): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Tenant Isolation Invariant: if cached data belongs to a specific tenant,
    // the request MUST present matching tenant context
    if (entry.tenantId && entry.tenantId !== requestedTenantId) {
      return null; // Deny cross-tenant cache hit
    }

    return entry.value as T;
  }

  /**
   * Invalidate specific key or pattern
   */
  public static invalidate(keyPrefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  public static clear() {
    this.store.clear();
  }

  /**
   * Telemetry stats
   */
  public static getStats() {
    return {
      totalEntries: this.store.size,
    };
  }
}
