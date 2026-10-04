/**
 * Phase 13: Enterprise Security Guard & Abuse Protection Engine
 * Implements:
 * 1. Category-based rate limiting (AUTH, SEARCH, PRACTICE, CBT, AI, ADMIN, UPLOAD, EXPORT, PAYMENT, WEBHOOK)
 * 2. Abuse detection and persistence (AbuseEvent model)
 * 3. IDOR prevention and strict multi-tenant boundary verification
 * 4. Safe DTO generation (stripping sensitive secrets/prompts)
 * 5. Prompt injection detection and AI data isolation guards
 * 6. Content sanitization against XSS & Path Traversal
 */

import prisma from '@/lib/prisma';
import path from 'path';

export type RateLimitCategory =
  | 'AUTH'
  | 'SEARCH'
  | 'PRACTICE'
  | 'CBT'
  | 'AI'
  | 'ADMIN'
  | 'UPLOAD'
  | 'EXPORT'
  | 'PAYMENT'
  | 'WEBHOOK';

export interface RateLimitPolicy {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_POLICIES: Record<RateLimitCategory, RateLimitPolicy> = {
  AUTH: { maxRequests: 10, windowSeconds: 60 },
  SEARCH: { maxRequests: 60, windowSeconds: 60 },
  PRACTICE: { maxRequests: 120, windowSeconds: 60 },
  CBT: { maxRequests: 100, windowSeconds: 60 },
  AI: { maxRequests: 20, windowSeconds: 60 },
  ADMIN: { maxRequests: 40, windowSeconds: 60 },
  UPLOAD: { maxRequests: 10, windowSeconds: 60 },
  EXPORT: { maxRequests: 5, windowSeconds: 300 },
  PAYMENT: { maxRequests: 15, windowSeconds: 60 },
  WEBHOOK: { maxRequests: 120, windowSeconds: 60 },
};

export interface CheckRateLimitResult {
  allowed: boolean;
  category: RateLimitCategory;
  remaining: number;
  resetSeconds: number;
  totalLimit: number;
}

export interface SecurityActor {
  id: string;
  role: 'STUDENT' | 'MENTOR' | 'PARENT' | 'ADMIN' | 'SUPER_ADMIN';
  tenantId?: string | null;
  assignedStudentIds?: string[];
  linkedStudentIds?: string[];
}

export interface SecurableEntity {
  id?: string;
  userId?: string | null;
  studentId?: string | null;
  tenantId?: string | null;
}

export class SecurityGuard {
  private static rateLimitBuckets: Map<string, { count: number; expiresAt: number }> = new Map();

  /**
   * Evaluates category-based rate limiting with granular memory buckets
   */
  public static checkRateLimit(
    identifier: string,
    category: RateLimitCategory,
    customPolicy?: RateLimitPolicy
  ): CheckRateLimitResult {
    const policy = customPolicy || RATE_LIMIT_POLICIES[category];
    const bucketKey = `${category}:${identifier}`;
    const now = Date.now();
    const bucket = this.rateLimitBuckets.get(bucketKey);

    if (!bucket || now > bucket.expiresAt) {
      this.rateLimitBuckets.set(bucketKey, {
        count: 1,
        expiresAt: now + policy.windowSeconds * 1000,
      });
      return {
        allowed: true,
        category,
        remaining: policy.maxRequests - 1,
        resetSeconds: policy.windowSeconds,
        totalLimit: policy.maxRequests,
      };
    }

    if (bucket.count >= policy.maxRequests) {
      const resetSeconds = Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000));
      return {
        allowed: false,
        category,
        remaining: 0,
        resetSeconds,
        totalLimit: policy.maxRequests,
      };
    }

    bucket.count++;
    const resetSeconds = Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000));
    return {
      allowed: true,
      category,
      remaining: policy.maxRequests - bucket.count,
      resetSeconds,
      totalLimit: policy.maxRequests,
    };
  }

  /**
   * Records an abuse event into database asynchronously without blocking user path
   */
  public static async recordAbuse(
    type: 'BRUTE_FORCE' | 'RAPID_REQUESTS' | 'AI_SPAM' | 'CBT_SUBMIT_SPAM' | 'UPLOAD_ABUSE' | 'SCRAPING' | 'ENUMERATION' | 'IDOR_ATTEMPT',
    details: {
      userId?: string;
      tenantId?: string;
      ip?: string;
      metadata?: Record<string, any>;
    }
  ) {
    try {
      return await prisma.abuseEvent.create({
        data: {
          type,
          userId: details.userId || null,
          tenantId: details.tenantId || null,
          ip: details.ip || null,
          metadata: details.metadata ? JSON.stringify(details.metadata) : null,
        },
      });
    } catch {
      // Fail-safe: recording abuse failure must never crash core transaction
      return null;
    }
  }

  /**
   * Enforces strict RBAC, IDOR prevention, and Tenant isolation
   */
  public static verifyOwnership(
    entity: SecurableEntity,
    actor: SecurityActor
  ): { allowed: boolean; reason?: string } {
    // 1. Super Admin bypasses tenant and user checks
    if (actor.role === 'SUPER_ADMIN') {
      return { allowed: true };
    }

    // 2. Tenant Isolation Check
    if (entity.tenantId && actor.tenantId && entity.tenantId !== actor.tenantId) {
      return { allowed: false, reason: 'Cross-tenant resource access is prohibited' };
    }

    // 3. Admin Check (within tenant)
    if (actor.role === 'ADMIN') {
      return { allowed: true };
    }

    const targetStudentId = entity.studentId || entity.userId;

    // 4. Student Check (own data only)
    if (actor.role === 'STUDENT') {
      if (targetStudentId && targetStudentId !== actor.id) {
        return { allowed: false, reason: 'Student cannot access other students data' };
      }
      return { allowed: true };
    }

    // 5. Mentor Check (assigned students only)
    if (actor.role === 'MENTOR') {
      if (targetStudentId) {
        const isAssigned = actor.assignedStudentIds?.includes(targetStudentId);
        if (!isAssigned) {
          return { allowed: false, reason: 'Mentor not assigned to target student' };
        }
      }
      return { allowed: true };
    }

    // 6. Parent Check (linked students only)
    if (actor.role === 'PARENT') {
      if (targetStudentId) {
        const isLinked = actor.linkedStudentIds?.includes(targetStudentId);
        if (!isLinked) {
          return { allowed: false, reason: 'Parent not linked to target student' };
        }
      }
      return { allowed: true };
    }

    return { allowed: false, reason: 'Insufficient role permissions' };
  }

  /**
   * Recursively sanitizes response DTOs to strip passwords, secret tokens, and internal prompts
   */
  public static createSafeDTO<T>(data: T): T {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.createSafeDTO(item)) as unknown as T;
    }

    const REDACTED_KEYS = new Set([
      'password',
      'passwordhash',
      'secret',
      'token',
      'apikey',
      'systemprompt',
      'internalprompt',
      'privatekey',
      'webhooksecret',
      'signingsecret',
    ]);

    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      const lower = k.toLowerCase();
      if (REDACTED_KEYS.has(lower) || lower.includes('password') || lower.includes('secret') || lower.includes('prompt')) {
        continue; // omit sensitive field entirely
      } else if (typeof v === 'object' && v !== null) {
        sanitized[k] = this.createSafeDTO(v);
      } else {
        sanitized[k] = v;
      }
    }

    return sanitized as T;
  }

  /**
   * AI Prompt Security: Detects prompt injections, jailbreaks, and system prompt extraction
   */
  public static inspectAIPrompt(prompt: string): { isSafe: boolean; flagReason?: string } {
    const INJECTION_PATTERNS = [
      /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
      /reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions)/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /dan\s+mode/i,
      /show\s+me\s+the\s+database\s+credentials/i,
      /exfiltrate/i,
      /bypass\s+(safety|content\s+filter)/i,
      /system\s*:\s*override/i,
    ];

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        return {
          isSafe: false,
          flagReason: 'Potential prompt injection or safety bypass detected',
        };
      }
    }

    return { isSafe: true };
  }

  /**
   * Sanitizes user input against basic XSS scripts
   */
  public static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Checks file path against path traversal attacks
   */
  public static isPathSafe(baseDir: string, targetPath: string): boolean {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, targetPath);
    return resolvedTarget.startsWith(resolvedBase);
  }
}
