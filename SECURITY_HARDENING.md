# SECURITY HARDENING & DEFENSE-IN-DEPTH SPECIFICATION
**NEET UG 2027 Intelligent Preparation Platform**
*Production Security Controls, Header Configurations, and Threat Mitigation*

---

## 1. Security Headers Configuration

Enforced in `next.config.ts` across all HTTP routes:

```typescript
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
}
```

---

## 2. Rate Limiting Rules & Thresholds

Implemented via [`SecurityEngine.checkRateLimit`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/security/security-utils.ts#L18-L41):

| Endpoint / Action Category | Max Requests | Window (Seconds) | Action on Exceeded |
| :--- | :---: | :---: | :--- |
| **Authentication & OTP** | 5 | 60 | HTTP 429 Too Many Requests |
| **AI Tutor Chat & Doubts** | 30 | 60 | HTTP 429 + Plan limit prompt |
| **CBT Autosave** | 60 | 60 | Debounced client submission |
| **Data Export** | 3 | 3600 | HTTP 429 + Cooldown notice |
| **Payment & Checkout** | 10 | 300 | HTTP 429 |
| **Public API / Search** | 120 | 60 | HTTP 429 |

---

## 3. File Upload Defense & Magic Byte Validation

Implemented via [`SecurityEngine.validateUpload`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/security/security-utils.ts#L43-L92):
* **Max Payload Limit**: 10MB per file.
* **Prohibited Extensions**: Strictly blocks `.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.js`, `.py`, `.vbs`, etc.
* **SVG Script Injection Defense**: Blocks `image/svg+xml` to eliminate embedded `<script>` stored XSS vectors.
* **Path Traversal Protection**: Filenames are sanitized with `path.basename` and stripped of non-alphanumeric characters.
* **Safe Storage Root**: Files are written outside executable web roots and served via signed URLs with cryptographic expiration.

---

## 4. API Security & Zero-Trust IDOR Safeguards

* **No Trusted Client Input**: `tenantId`, `studentId`, and `role` are never accepted blindly from client request bodies or query parameters.
* **Session Ownership**: Derived securely from server session tokens via `resolveActor`.
* **Tenant Isolation Invariant**: All queries on tenant-scoped resources (`User`, `Assignment`, `Test`, `ExamAttempt`) enforce `WHERE tenantId = actor.tenantId`.
* **Data Redaction**: Sensitive attributes (`password`, `token`, `secret`, `apiKey`) are automatically masked by [`StructuredLogger.sanitize`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/observability/logger.ts#L27-L50).
