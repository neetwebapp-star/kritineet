# Phase 13 — Security Incident Response Plan

## 1. Incident Lifecycle

```text
DETECTION ───► CONTAINMENT ───► INVESTIGATION ───► ROTATION ───► RECOVERY ───► POST-MORTEM
```

---

## 2. Response Phases

### Phase 1: Detection
- Automated alerts triggered by `SecurityGuard.recordAbuse()`:
  - `BRUTE_FORCE`: Excessive failed login attempts on single account or IP.
  - `RAPID_REQUESTS`: Rate limit breach exceeding allowable bucket burst.
  - `IDOR_ATTEMPT`: Unauthorized cross-student or cross-tenant access attempt.
  - `PROMPT_INJECTION`: Extraction attack detected in AI Tutor queries.

### Phase 2: Containment
- Temporary IP or user session rate throttling.
- Immediate revocation of compromised session tokens.
- Isolation of affected tenant workspace if cross-tenant leakage suspected.

### Phase 3: Credential Rotation Procedure
- **Auth Secrets**: Generate new `AUTH_SECRET` (minimum 32 bytes entropy). Active sessions are invalidated, forcing user re-authentication.
- **Provider API Keys**: Invalidate old keys in provider dashboards and update environment variables.
- **Database Credentials**: Trigger zero-downtime database credential rotation via secrets manager.

### Phase 4: Post-Mortem & Audit
- Compile append-only `AuditLog` and `AbuseEvent` records.
- Document Root Cause Analysis (RCA) and file security patch.
