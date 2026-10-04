# MULTI-TENANT ARCHITECTURE & ISOLATION SPECIFICATION
**NEET UG 2027 Intelligent Preparation Platform**
*Tenant Hierarchy, Shared vs Isolated Content, and Organization Management*

---

## 1. Multi-Tenant Entity Hierarchy

```
                    Platform (Global NCERT & Verified Question Bank)
                                        │
                                        ▼
                  Tenant (INDIVIDUAL | COACHING | SCHOOL | ORGANIZATION)
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              Administrative / Mentors              Students
                         │                             │
                         ▼                             ▼
              Custom Tests & Notes          Attempts, Mistakes, Mastery
```

---

## 2. Shared Global Content vs Private Tenant Content

The platform enforces strict separation between shared canonical curriculum assets and institutional private assets via [`ContentAccessPolicy`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/content-policy.ts):

| Domain | Content Assets | Storage / Scope | Accessibility |
| :--- | :--- | :--- | :--- |
| **GLOBAL CONTENT** | 3,455 NCERT Concepts, 79 Chapters, 1,875 Verified PYQs, 33 Fingertips, Exam Patterns | Global namespace (`tenantId = null`) | Accessible to all registered tenants; strictly read-only for non-superadmins. |
| **TENANT CONTENT** | Students, Cohorts, Mentor Notes, Custom Mock Tests, Private Questions, Tenant Assignments | Tenant-scoped (`tenantId = tenant.id`) | Strictly isolated to members of that specific tenant. Cross-tenant access blocked. |

---

## 3. Server-Side Tenant Isolation Invariants

1. **No Client Trust**: Never trust `tenantId` passed in HTTP headers, cookies, or body parameters from client web browsers.
2. **Session Resolution**: `tenantId` is derived server-side from the authenticated user's database record (`resolveActor`).
3. **Query Scoping**: Every mutation or query on tenant-owned models (`Assignment`, `Test`, `ExamAttempt`, `MentorNote`, `Notification`, `Goal`) automatically appends `WHERE tenantId = actor.tenantId`.
4. **Cross-Tenant Blocking**: Verified in `Test 2` and `Test 33` of `tests/phase8_acceptance.test.ts`: requests targeting a resource belonging to Tenant B from an actor in Tenant A immediately return `HTTP 403 Forbidden`.

---

## 4. Organization Management & Onboarding

* **Admin Route**: [`/admin/organizations`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/app/admin/organizations/page.tsx).
* **Onboarding Flow**:
  1. Organization creation with deterministic slug generation.
  2. Institutional admin user assignment.
  3. Automatic 14-day Institute trial activation.
  4. Batch mentor invitation and student cohort assignment.
  5. Custom CBT exam authoring and assignment dispatch.
