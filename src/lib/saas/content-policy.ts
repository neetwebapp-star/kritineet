/**
 * Phase 8: Content Access Policy & Source Licensing Isolation
 * Determines who can view, practice, assign, export, and edit content across
 * GLOBAL (NCERT, PYQ, Fingertips) vs TENANT (Custom Tests, Private Questions).
 */

export interface ContentAccessRequest {
  actorRole: string;
  actorTenantId?: string | null;
  contentTenantId?: string | null;
  sourceType: string; // NCERT | PYQ | FINGERTIPS | CUSTOM | PRIVATE
  action: 'VIEW' | 'PRACTICE' | 'ASSIGN' | 'EXPORT' | 'EDIT';
  isLicensedAsset?: boolean;
}

export class ContentAccessPolicy {
  /**
   * Authoritative check: can this actor perform this action on this content?
   */
  public static canAccessContent(req: ContentAccessRequest): { allowed: boolean; reason?: string } {
    const role = (req.actorRole || 'STUDENT').toUpperCase();

    // 1. EDIT action rules
    if (req.action === 'EDIT') {
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        // Global content can only be edited by Admins
        if (!req.contentTenantId) return { allowed: true };
        // Tenant content can only be edited by admins of that tenant
        if (req.actorTenantId === req.contentTenantId) return { allowed: true };
        return { allowed: false, reason: 'Cannot edit content from another organization' };
      }
      return { allowed: false, reason: 'Only administrators can edit content' };
    }

    // 2. EXPORT action rules (Strict Licensing Protection)
    if (req.action === 'EXPORT') {
      // Raw licensed source files (e.g. MTG Fingertips raw PDFs/extracts) cannot be exported in bulk
      if (req.isLicensedAsset || req.sourceType === 'FINGERTIPS') {
        return { allowed: false, reason: 'Bulk export prohibited by copyright & publisher licensing agreements' };
      }
      if (role === 'STUDENT' || role === 'PARENT') {
        return { allowed: true }; // Permitted for personal progress exports
      }
      return { allowed: true };
    }

    // 3. ASSIGN action rules
    if (req.action === 'ASSIGN') {
      if (role !== 'MENTOR' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return { allowed: false, reason: 'Only mentors and admins can assign study content' };
      }
      // If content is tenant-private, ensure creator belongs to same tenant
      if (req.contentTenantId && req.contentTenantId !== req.actorTenantId && role !== 'SUPER_ADMIN') {
        return { allowed: false, reason: 'Cannot assign private tests/questions belonging to another tenant' };
      }
      return { allowed: true };
    }

    // 4. VIEW and PRACTICE action rules
    if (req.action === 'VIEW' || req.action === 'PRACTICE') {
      // Global shared content is open to all registered users
      if (!req.contentTenantId) {
        return { allowed: true };
      }
      // Tenant-private content is scoped strictly to tenant members
      if (req.actorTenantId === req.contentTenantId || role === 'SUPER_ADMIN') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Content is restricted to organization members' };
    }

    return { allowed: false, reason: 'Unknown action requested' };
  }

  /**
   * Sanitizes question or test payload to ensure licensed source PDF URLs
   * and raw internal database IDs are not leaked publicly.
   */
  public static sanitizeContentForClient<T extends Record<string, any>>(content: T): Partial<T> {
    const sanitized = { ...content };
    if ('sourceDriveFileId' in sanitized) delete sanitized.sourceDriveFileId;
    if ('sourceZipName' in sanitized) delete sanitized.sourceZipName;
    if ('extractedFilename' in sanitized) delete sanitized.extractedFilename;
    return sanitized;
  }
}
