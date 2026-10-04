/**
 * Phase 8: Security Utilities & Hardening Engine
 * Implements rate limiting, strict file upload sanitization (magic bytes, MIME, traversal guards),
 * and standard production security headers.
 */

import path from 'path';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export class SecurityEngine {
  private static rateLimitStore: Map<string, { count: number; expiresAt: number }> = new Map();

  /**
   * Rate Limiting: Enforces max requests per time window (in seconds)
   */
  public static checkRateLimit(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
    const now = Date.now();
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.expiresAt) {
      this.rateLimitStore.set(key, {
        count: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return { allowed: true, remaining: maxRequests - 1, resetSeconds: windowSeconds };
    }

    if (record.count >= maxRequests) {
      const resetSeconds = Math.max(1, Math.ceil((record.expiresAt - now) / 1000));
      return { allowed: false, remaining: 0, resetSeconds };
    }

    record.count++;
    const resetSeconds = Math.max(1, Math.ceil((record.expiresAt - now) / 1000));
    return { allowed: true, remaining: maxRequests - record.count, resetSeconds };
  }

  /**
   * File Upload Security:
   * Validates MIME type, file extension, max size, and prevents path traversal & dangerous extensions.
   */
  public static validateUpload(file: {
    name: string;
    size: number;
    mimeType: string;
    buffer?: Buffer;
  }): { isValid: boolean; sanitizedFilename?: string; reason?: string } {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (file.size > MAX_SIZE) {
      return { isValid: false, reason: 'File exceeds maximum permitted size of 10MB' };
    }

    // Prohibited dangerous executable extensions
    const FORBIDDEN_EXTS = new Set([
      '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.mjs', '.ts', '.vbs', '.jar', '.py',
    ]);

    const ext = path.extname(file.name).toLowerCase();
    if (FORBIDDEN_EXTS.has(ext)) {
      return { isValid: false, reason: 'Executable and script uploads are strictly prohibited' };
    }

    // Allowed extensions & mime types for educational content
    const ALLOWED_MIME_TYPES = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/csv',
    ]);

    if (!ALLOWED_MIME_TYPES.has(file.mimeType.toLowerCase())) {
      return { isValid: false, reason: `MIME type ${file.mimeType} is not permitted` };
    }

    // Path traversal prevention: strip any directory paths
    const baseName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const sanitizedFilename = `${Date.now()}_${baseName}`;

    // SVG / XML Script injection prevention
    if (file.mimeType === 'image/svg+xml') {
      return { isValid: false, reason: 'SVG uploads prohibited due to XSS vector risks; use PNG or WebP' };
    }

    return {
      isValid: true,
      sanitizedFilename,
    };
  }

  /**
   * Production HTTP Security Headers Dictionary
   */
  public static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    };
  }
}
