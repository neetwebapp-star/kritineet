# PHASE 8 ARCHITECTURE AUDIT: CURRENT STATE & PRODUCTION READINESS
**NEET UG 2027 Intelligent Preparation Platform**
*Authoritative Audit of Phases 1–7 Infrastructure Before SaaS Multi-Tenant Hardening*

---

## 1. Executive Summary

This architecture audit evaluates the state of the NEET UG 2027 platform across all components following the completion of Phases 1 through 7. The platform currently possesses rich learning engines, 3,455 canonical concepts, 2,172 verified questions, CBT simulation engines, an AI tutor, and a parent/mentor/admin command center. 

To transform this foundation into a production-grade, secure, multi-tenant SaaS platform, this audit objectively identifies the baseline infrastructure without assuming unconfigured services (e.g. PostgreSQL, Redis, AWS S3).

---

## 2. Infrastructure Inventory & Baseline Identification

| Infrastructure Component | Current Implementation | Production Target / SaaS Gap |
| :--- | :--- | :--- |
| **Database** | SQLite 3 (`prisma/dev.db`, 9.68 MB) via Prisma ORM 6.4.1 | SQLite lacks row-level concurrency for multi-tenant SaaS. Requires PostgreSQL with connection pooling (e.g., PgBouncer/Supabase), tenant indexing, and point-in-time recovery. |
| **Object Storage** | Local filesystem (`public/extracted_figures/`, ~1,069 figures) | All figures are currently in `public/` (predictable URLs). Private files (PDF sources, diagnostic reports, student uploads) need private storage with signed URLs. |
| **Authentication** | In-application session resolver (`resolveActor` in `src/lib/command-center/auth-utils.ts`) with user role resolution | Needs hardened session tokens, secure HTTP-only cookies, session expiry, token revocation, rate limiting, and password reset workflows. |
| **Multi-Tenancy** | Single-tenant implicit model. All users and data exist in a flat global namespace. | Missing `Tenant` entity, tenant isolation middleware, tenant-scoped queries, and organization management. |
| **Authorization / RBAC** | `RbacEngine` with 19 permissions across 5 roles (`SUPER_ADMIN`, `ADMIN`, `MENTOR`, `PARENT`, `STUDENT`) | Authoritative for Phase 7, but needs Tenant scoping (`tenantId` check) and Feature Entitlements based on subscription plans. |
| **Background Workers** | In-process execution (synchronous or fire-and-forget async promises) | Critical background tasks (reports, email, bulk assignments, heavy AI jobs) can block the web process or fail silently. |
| **Job Queue** | None (no Redis or persistent queue engine) | Needs a persistent queue architecture with retry logic, dead-letter queue, idempotency, and execution monitoring. |
| **Caching Layer** | In-memory JavaScript Map / direct Prisma query hits | High traffic on global NCERT hierarchy and question lookups hits the database. Needs caching with strict isolation of private tenant data. |
| **Environment Separation** | Single `.env` file (`NODE_ENV="development"`) | Missing strict environment validation (`DEVELOPMENT`, `STAGING`, `PRODUCTION`), secret hygiene, and runtime configuration guards. |
| **Security Controls** | Basic server-side permission checks. No CSP, HSTS, or rate-limiting headers in `next.config.ts`. | Missing comprehensive HTTP security headers, endpoint rate-limiting, file upload sanitization, and CSRF protection. |
| **Backup Strategy** | Manual file copying (`dev.db.phase7.backup`) | Missing automated daily snapshots, retention policies, offsite storage, encryption, and verified restore procedures. |

---

## 3. Detailed Component Audit

### 3.1 Next.js Application & Routing
* **Framework**: Next.js 16.3.6 (Turbopack bundler), React 19.2.8.
* **Routing Architecture**: Next.js App Router with 65 routes:
  * Public / Student routes: `/`, `/practice`, `/cbt`, `/question/[id]`, `/ai-tutor`, `/error-book`, `/remediation`, `/readiness`, `/tests/*`.
  * Command Center routes: `/admin`, `/admin/students`, `/admin/students/[id]`, `/admin/review`, `/admin/tests`, `/admin/ai`, `/mentor`, `/mentor/students/[id]`, `/parent`, `/reports/student/[id]`.
* **API Endpoints**: 53 dynamic route handlers under `/api/`. All require systematic tenant isolation and entitlement checking.

### 3.2 Database Schema & Data Integrity
* **ORM**: Prisma 6.4.1 targeting `sqlite`.
* **Current Core Entities**:
  * Knowledge & Questions: `ClassLevel`, `Subject`, `Unit`, `Chapter`, `Topic`, `Subtopic`, `Concept`, `Question`, `QuestionOption`, `QuestionFigure`.
  * Learning Telemetry: `AttemptEvent`, `ExamAttempt`, `StudentConceptMastery`, `StudentMistake`, `RevisionSchedule`.
  * Command Center: `ParentStudentRelationship`, `MentorStudentAssignment`, `Assignment`, `AssignmentProgress`, `MentorNote`, `Notification`, `Goal`, `LearningActivity`, `Alert`, `Invitation`, `AuditLog`.
* **Finding**: No `tenantId` foreign key exists on tenant-owned models. A multi-tenant migration must introduce `Tenant` and associate tenant-scoped records while keeping global NCERT and question bank shared.

### 3.3 Storage System
* **Asset Location**: `public/extracted_figures/` contains 1,069 image files extracted during Phases 1–3.
* **Security Risk**: Public static assets are served directly without authorization checks. Licensed content or private student uploads must not be stored in `public/`.
* **Remediation**: Establish an object storage abstraction separating `PUBLIC_ASSETS` from `PRIVATE_ASSETS` with signed URL tokens.

### 3.4 Security, Headers & Rate Limiting
* **Current Middleware / Headers**: `next.config.ts` has empty headers.
* **Vulnerabilities**:
  * Missing Content Security Policy (`CSP`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
  * No global rate-limiter guarding sensitive endpoints (`/api/ai/*`, `/api/cbt/*`, `/api/auth/*`).
* **Remediation**: Implement Next.js security headers, CSRF tokens, and a distributed-ready in-memory/persistent rate limiter.

---

## 4. Phase 8 Migration & Implementation Roadmap

1. **Multi-Tenant Data Architecture**:
   - Model `Tenant` with types (`INDIVIDUAL`, `COACHING`, `SCHOOL`, `ORGANIZATION`).
   - Add `tenantId` to tenant-owned models (`User`, `Assignment`, `Test`, `ExamAttempt`, `MentorNote`, `Notification`, `Goal`, etc.).
   - Establish `ContentAccessPolicy` separating global NCERT/PYQ from tenant-private custom tests and questions.
2. **Organization Management & Onboarding**:
   - Create `/admin/organizations` management suite and multi-step onboarding wizard.
   - Individual student onboarding with diagnostic assessment (estimating starting knowledge, avoiding fabricated NEET rank predictions).
3. **SaaS Billing & Subscriptions**:
   - Configurable `Plan`, `Subscription`, `FeatureEntitlement`, `UsageCounter`, and `Coupon`.
   - Provider-agnostic `PaymentProvider` abstraction with secure, idempotent webhook handling.
   - EntitlementEngine and Usage Gating (AI queries, mock tests, student seats).
   - `/billing` customer portal and `/admin/billing` revenue dashboard.
4. **Operations, Observability & Reliability**:
   - Persistent Queue architecture with retries, dead-letter tracking, and job status.
   - Structured JSON logging with request tracing, user/tenant context, and centralized error sanitization.
   - Health checks: `/api/health` and `/api/health/ready`.
   - Security headers, rate limiting, file upload virus/type validation.
   - Database migration plan (`DATABASE_MIGRATION_PLAN.md`) and backup/restore runbook (`BACKUP_AND_RECOVERY.md`).
5. **Testing & Acceptance**:
   - `tests/phase8_acceptance.test.ts` (44 minimum requirements).
   - Full regression across all phases (199 existing tests + 44 Phase 8 = 243 total).
   - Production build verification (`pnpm build`).

---
*Audit Completed on 2026-09-30. System snapshot confirmed stable.*
