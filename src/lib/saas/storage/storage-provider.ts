/**
 * Phase 8: Storage Provider & Asset Privacy Engine
 * Separates PUBLIC ASSETS from PRIVATE CONTENT (licensed textbooks, student uploads,
 * medical diagrams, reports), generating secure signed URLs with cryptographic expiration.
 */

import crypto from 'crypto';
import path from 'path';

export interface StorageUploadInput {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  isPublic?: boolean;
  tenantId?: string;
  ownerId?: string;
}

export class StorageProvider {
  private static SIGNING_SECRET = process.env.STORAGE_SIGNING_SECRET || 'storage_signing_key_neet2027';

  /**
   * Generates a signed, time-limited URL for private content
   */
  public static generateSignedUrl(
    filePath: string,
    expiresInSeconds: number = 3600,
    tenantId?: string
  ): { url: string; expiresAt: number; token: string } {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const cleanPath = path.normalize(filePath).replace(/\\/g, '/');

    const payload = `${cleanPath}:${expiresAt}:${tenantId || 'global'}`;
    const token = crypto
      .createHmac('sha256', this.SIGNING_SECRET)
      .update(payload)
      .digest('hex');

    const url = `/api/storage/file?path=${encodeURIComponent(cleanPath)}&expires=${expiresAt}&token=${token}${
      tenantId ? `&tenantId=${tenantId}` : ''
    }`;

    return { url, expiresAt, token };
  }

  /**
   * Verifies a signed URL request token
   */
  public static verifySignedUrl(
    filePath: string,
    expiresAt: number,
    token: string,
    tenantId?: string
  ): { isValid: boolean; reason?: string } {
    const now = Math.floor(Date.now() / 1000);
    if (now > expiresAt) {
      return { isValid: false, reason: 'Signed URL has expired' };
    }

    const cleanPath = path.normalize(filePath).replace(/\\/g, '/');
    const expectedPayload = `${cleanPath}:${expiresAt}:${tenantId || 'global'}`;
    const expectedToken = crypto
      .createHmac('sha256', this.SIGNING_SECRET)
      .update(expectedPayload)
      .digest('hex');

    if (expectedToken !== token) {
      return { isValid: false, reason: 'Invalid or forged signature token' };
    }

    return { isValid: true };
  }

  /**
   * Resolves storage location: ensures files stay strictly within permitted storage roots
   * and prevents path traversal attacks.
   */
  public static resolveSafePath(baseDir: string, relativePath: string): string {
    const safeBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(baseDir, relativePath);

    if (!resolvedPath.startsWith(safeBase)) {
      throw new Error('Path traversal attempt detected');
    }

    return resolvedPath;
  }
}
