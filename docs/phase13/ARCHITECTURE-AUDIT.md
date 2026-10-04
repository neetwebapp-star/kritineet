# Phase 13 — Production Architecture Audit

## 1. System Overview & Technology Stack

The **NEET UG 2027 Preparation Platform** is an enterprise-grade Computer Based Testing (CBT), knowledge graph, and autonomous learning intelligence platform designed for high-stakes medical entrance preparation.

### Architectural Stack
- **Frontend**: Next.js 16.3.6 (App Router), React 19.2.8, Tailwind CSS v4, Lucide React icons.
- **Backend & APIs**: Next.js Server Components and Route Handlers with NextRequest/NextResponse.
- **ORM & Data Layer**: Prisma ORM 6.4.1 connected to SQLite (Development/Staging) and PostgreSQL (Production).
- **Background Worker & Queues**: Persistent database-backed queue (`BackgroundJob` model) with exponential backoff, dead-letter routing, and idempotency.
- **Observability**: Structured JSON logging with trace/request IDs, p50/p95/p99 latency tracking, slow query detector (>100ms, >250ms, >500ms, >1s), and actionable alerts.
- **Security & RBAC**: Strict RBAC for `STUDENT`, `MENTOR`, `PARENT`, `ADMIN`, `SUPER_ADMIN`, category-based rate limiting, safe DTO sanitizers, prompt injection guards, and anti-CSRF token verification.

---

## 2. Component Inventory & Audit Findings

| Component | Architecture Pattern | Resilience / Hardening Measure |
| :--- | :--- | :--- |
| **Authentication** | Token-based & Session verification | Rate limited (10/min), cryptographic token entropy (>20 chars), session rotation, secure cookie directives |
| **Authorization & RBAC** | Explicit permission matrix in `SecurityGuard` | Strict verification preventing IDOR between students, mentors, parents, and cross-tenants |
| **Database Transactions** | `prisma.$transaction` across multi-step mutations | Atomic rollback on step failure; zero partial corruption of attempts, questions, or payments |
| **CBT & Simulation Engine** | Server-authoritative timer & heartbeat | Interruption recovery, client-side clock tampering resistance, dual submission mutex locking |
| **Background Workers** | `ResilientWorker` with `BackgroundJob` | Exponential backoff with jitter, dead-letter queue, idempotent deduplication, manual replay capability |
| **AI Learning Engine** | Grounded system with local NCERT fallback | Complete insulation: core learning (NCERT, PYQ, CBT) functions with 0% downtime if LLM provider fails |
| **File Storage** | Streamed asset verification & signed URLs | Path traversal guards, prohibited dangerous extensions (`.exe`, `.php`, `.sh`), MIME verification |
| **Billing & SaaS** | Webhook handler with HMAC-SHA256 signatures | Idempotent event processing; duplicate webhook replay safely returns 200 without double-crediting |

---

## 3. High Availability & Failure Boundaries

```text
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
│   Web / Tablet / Mobile (Network-Resilient CBT Runner) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    API Gateway & Guard                 │
│   • EnvValidator (Fail-Fast Startup)                   │
│   • Rate Limiting (AUTH, CBT, AI, SEARCH)              │
│   • Security Headers (CSP, HSTS, X-Content-Type)       │
│   • IDOR & Tenant Isolation Boundary                   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                     Core Business Logic                │
│   • ExamSimulationEngine (Server Timer & Snapshots)    │
│   • ReadinessMatrixService (9-Dimension Model)         │
│   • FinalRevisionScopeEngine (Capacity Governance)     │
│   • AI Grounding Engine (Fallback Pointers)            │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼────────────┐ ┌─────────────▼────────────┐
│      Prisma Persistence  │ │     Resilient Worker      │
│  • Transactions ($tx)    │ │  • Exponential Backoff    │
│  • Unique Idempotency    │ │  • Dead Letter Queue      │
│  • Immutable Historicals │ │  • Status Telemetry       │
└──────────────────────────┘ └───────────────────────────┘
```

---

## 4. Single Points of Failure & Mitigations
- **Database Availability**: Addressed by connection pooling, read replicas in PostgreSQL production configuration, and automatic health probe status (`/api/ready`).
- **External AI Outage**: Complete decoupling; local grounded textbook pointers serve as zero-latency fallbacks without student disruption.
- **Network Flaps During CBT**: Handled by client heartbeat and server-authoritative timestamping that preserves elapsed time on reconnect.
