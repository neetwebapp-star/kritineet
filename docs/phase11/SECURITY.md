# Phase 11 — Security, Authorization & Privacy Invariants

## 1. Threat Modeling & Invariants

| Risk / Attack Vector | Mitigation in Phase 11 | Enforcement Layer |
| :--- | :--- | :--- |
| **Cross-Student IDOR** | All queries strictly filter by session user ID (`userId = session.user.id`). Students cannot inspect or mutate other students' plans, sessions, or backlogs. | Next.js API Routes & Services |
| **Unauthorized Mentor Override** | Mentors can only view or override plans for students explicitly assigned to them via `MentorAssignment` table. | `MentorService` & Route Handlers |
| **Parent Overreach / Privacy Violation** | Parents receive summarized aggregated progress (completion %, stage, hours); private study sessions, raw notes, and AI conversations remain redacted. | `ParentVisibilityPolicy` |
| **Client Timer Manipulation** | Timer duration or state cannot grant mastery without submitting verifiable attempt responses to the server assessment engine. | `RemediationGenerator` & `StudySessionEngine` |
| **Unbounded Plan Churn** | Replanning is restricted to explicit verified checkpoints (`AdaptiveReplanner`). | Checkpoint Verification Guard |
| **Audit Trail Tampering** | All mentor plan overrides and capacity mutations write immutable entries to `AuditLog`. | Prisma `AuditLog` Engine |
| **Multi-Tenant Data Leakage** | All Study OS records inherit tenant isolation; cross-tenant access is rejected at server boundaries. | SaaS RBAC Middleware |

---

## 2. Server-Side Data Protection Matrix

```text
Actor Role   │ Can Access Own? │ Can Access Linked? │ Can Access Platform?
─────────────┼─────────────────┼────────────────────┼─────────────────────
STUDENT      │ YES (Full)      │ NO (IDOR Blocked)  │ NO
PARENT       │ YES (Own Acct)  │ YES (Summary Only) │ NO
MENTOR       │ YES (Own Acct)  │ YES (Assigned Only)│ NO
ADMIN        │ YES (Full)      │ YES (Full)         │ YES (Full System)
SUPER_ADMIN  │ YES (Full)      │ YES (Full)         │ YES (Multi-Tenant)
```

---

## 3. Telemetry & State Immutability

1. **Plan Versions**:
   - When a plan is regenerated or adapted, the previous schedule is never overwritten destructively.
   - It is archived as an immutable `PlanVersion` with child `PlanChange` records logging added, removed, or rescheduled tasks.
2. **Session Telemetry Events**:
   - `StudyEvent` records (`SESSION_STARTED`, `SESSION_PAUSED`, `SESSION_RESUMED`, `CONTENT_COMPLETED`) are append-only.
   - Timestamps and durations are server-validated.
