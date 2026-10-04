# SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION
**NEET UG 2027 Intelligent Preparation Platform**
*End-to-End Architectural Blueprint (Phases 1 through 8)*

---

## 1. Architectural Topology

```
[ Web Client / Next.js 16 App Router UI ]
          │  (HTTPS / CSP / HSTS / Secure Cookies)
          ▼
[ Edge Middleware / Next.js Server Handlers ]
    ├── SecurityEngine (Rate Limiting, Upload Validation, Header Injection)
    ├── ObservabilityEngine (p50/p95/p99 Latencies, Error Sanitization)
    └── StructuredLogger (JSON Logs with Secret Redaction)
          │
          ▼
[ Core Application Services ]
    ├── Multi-Tenant & RBAC: TenantEngine, RbacEngine, ContentAccessPolicy
    ├── Billing & Entitlements: PlanEngine, SubscriptionEngine, EntitlementEngine, WebhookHandler
    ├── Learning Engines (Phases 1-5): ConceptMasteryEngine, AdaptiveEngine, SpacedRevisionEngine, CbtExamEngine
    ├── AI Tutor & Grounding (Phase 6): GroundedSystemProvider, ResponseValidator, SubjectSolvers
    ├── Command Center (Phase 7): AssignmentEngine, AlertEngine, ReportingEngine, AuditEngine
    └── Operations (Phase 8): PersistentQueue, StorageProvider, CacheManager, EmailService
          │
          ▼
[ Persistence & Data Layer ]
    ├── Prisma ORM 6.4.1 (Parameterized ANSI SQL)
    ├── Primary Database: SQLite (Development) / Managed PostgreSQL (Production)
    └── Storage: Local Filesystem / Encrypted Cloud Object Storage (Signed URLs)
```

---

## 2. Integrated Phase Foundations (Phases 1–8)

1. **Phases 1 & 2 (NCERT Ingestion & Knowledge Graph)**: 79 canonical chapters, 3,455 NCERT concepts, bi-directional relationships, Botany/Zoology canonical mapping.
2. **Phase 3 (PYQ & Fingertips Intelligence)**: 1,875 verified PYQs (1995–2024), 33 MTG Fingertips questions, cognitive difficulty evaluation, NCERT concept linking.
3. **Phase 4 (Personalized Mastery & Adaptive Engine)**: Real-time Bayesian concept mastery, Error Book mistake tracking, SM-2 spaced repetition, adaptive question recommendation.
4. **Phase 5 (CBT Exam Simulator)**: Official NTA NEET exam pattern (Section A/B, +4/-1 marking, 200 mins), server-authoritative timer, autosave, refresh survival, immutable attempts.
5. **Phase 6 (AI Tutor & Doubt Solver)**: 10 specialized tutoring modes, zero-hallucination source grounding, physics/chemistry/biology subject solvers, exam-lock during CBT tests.
6. **Phase 7 (Command Center)**: Authoritative RBAC matrix, student data ownership, Parent Visibility Policy, mentor scoping, data-driven alerts, 10-section official progress reports.
7. **Phase 8 (Production SaaS Platform)**: Multi-tenancy, tenant isolation, subscription plans, server-side entitlements, payment provider abstraction, idempotent webhooks, persistent queue, security headers, disaster recovery.

---

## 3. Security, Privacy & Data Isolation

* **Student Privacy Invariant**: The student owns their learning journey. Personal AI tutor chats and internal diagnostic notes are never exposed to parents or peer students.
* **Tenant Isolation Invariant**: Institutional tenants (coaching centers, schools) operate in isolated database namespaces. Cross-tenant queries are blocked server-side.
* **Server-Side Authoritative Defense**: Feature gating, test marking, timers, coupons, and payments are computed server-side.
