# Ekriti NEET UG Intelligence & CBT Platform

> **Production-Grade Computer-Based Testing (CBT), NCERT Integrity Engine & Autonomous Learning Platform for NEET UG Aspirants.**

[![CI / Production Quality Gate](https://github.com/qbitconnect/neet-cbt-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/qbitconnect/neet-cbt-platform/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Next.js 16](https://img.shields.io/badge/next.js-16.3.6-black.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/react-19.2.8-blue.svg)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/prisma-6.4.1-1B222D.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

---

## 🌟 Overview

**Ekriti NEET** is a production-grade educational platform built to simulate high-stakes Computer-Based Testing (CBT) conforming to the National Testing Agency (NTA) NEET UG examination standards. It integrates canonical NCERT curricula, 13,750 verified MTG NCERT at Your Fingertips questions, real-time autosave resilience, psychometric distractor analytics, and deterministic spaced repetition (SM-2).

### Key Architectural Pillars
- **Zero Mock Data Invariant**: All chapter-topic hierarchies, questions, answers, and audit statuses are verified against canonical NCERT syllabus registries.
- **NTA CBT Exam Simulation**: Anti-loss autosave, client-side answer stripping to prevent network leaks, Section A/B optionality, and deterministic scoring.
- **Content Integrity & Reconciliation Engine**: Full MTG topic auditor (`src/lib/auditor/`) and deterministic repair algorithms (`src/lib/repair/`) with cryptographically secure content hashes.
- **Psychometrics & Distractor Engine**: Cognitive rigor scoring, misconception tagging, distractor simulation, and error book analytics.
- **Autonomous Study OS**: Daily plan generation, spaced revision via SuperMemo-2 (SM-2), weakness remediation, and syllabus tracker.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16.3.6 (App Router with Turbopack) |
| **Frontend** | React 19.2.8, Tailwind CSS v4, Lucide Icons, KaTeX for LaTeX Math |
| **Backend & APIs** | Next.js Dynamic Route Handlers, Edge/Node Runtime |
| **Database & ORM** | Prisma 6.4.1 (SQLite for development / PostgreSQL for cloud scale) |
| **Auditing & Repair** | Custom Deterministic Graph Engines (TypeScript & Python) |
| **Package Manager** | `pnpm` 11.24.0 |
| **Quality Gates** | TypeScript 5.9 strict type checking, ESLint 9, End-to-end acceptance suite |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x`, `v22.x`, or `v24.x` (LTS recommended)
- **pnpm**: `v11.x` (`npm install -g pnpm`)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/qbitconnect/neet-cbt-platform.git
   cd neet-cbt-platform
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   *(For development, the defaults in `.env.example` using SQLite are ready out-of-the-box).*

4. **Initialize Prisma Client**:
   ```bash
   pnpm exec prisma generate
   ```

5. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Gates & Testing

Before any code is committed or merged to production, all quality gates must pass:

```bash
# 1. TypeScript Strict Typecheck (Zero type errors)
pnpm exec tsc --noEmit

# 2. ESLint Static Code Analysis
pnpm run lint

# 3. Phase 2 Content Intelligence & CBT Acceptance Test Suite (29 passing tests)
pnpm exec tsx tests/phase2_acceptance.test.ts

# 4. Next.js Turbopack Production Build
pnpm run build
```

---

## 📁 Repository Directory Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline (Build, Lint, Tests)
├── docs/                        # Technical specifications & deployment runbooks
│   ├── DEPLOYMENT.md            # Complete multi-cloud deployment guide
│   ├── PRODUCTION_DEPLOYMENT_REPORT.md # Deployment readiness audit report
│   └── ...                      # Auditing & reconciliation reports
├── prisma/
│   └── schema.prisma            # Authoritative database models
├── public/                      # Static assets, diagrams, and mindmaps
├── src/
│   ├── app/                     # Next.js App Router (Routes & API Endpoints)
│   │   ├── admin/               # Administration, content review, and metrics
│   │   ├── api/                 # REST & RPC endpoints (/api/health, /api/cbt, etc.)
│   │   ├── cbt/                 # High-fidelity NTA CBT exam interface
│   │   ├── dpp/                 # Daily Practice Problems
│   │   ├── error-book/          # Mistake tracking & remediation
│   │   └── ncert/               # NCERT hierarchy, fingertips, and auditor
│   ├── components/              # Shared UI components and layout widgets
│   └── lib/                     # Domain business logic & engines
│       ├── auditor/             # MTG canonical reconciliation auditor
│       ├── intelligence/        # Cognitive scoring & distractor breakdown
│       ├── production/          # Health checks, worker resilience, security
│       ├── repair/              # Deterministic topic repair engine
│       ├── saas/                # Caching, queues, observability, billing
│       └── study-os/            # Autonomous study planner & spaced repetition
└── tests/                       # Automated acceptance and regression suites
```

---

## 🛡️ Security & Integrity Guardrails

- **Zero Secret Invariant**: `.env`, `.env.local`, API keys, database credentials, and SSL certificates are strictly excluded via `.gitignore`.
- **Large Binary Protection**: All raw multi-gigabyte source PDFs and local SQLite WAL dumps are excluded from Git history.
- **Client Security**: Answers and solution rationale are never exposed over the wire during active CBT test attempts.
- **Cryptographic Grounding**: Question content is tracked via SHA-256 content hashes to prevent accidental drift or corruption during schema migrations.

---

## 📄 License & Ownership

Proprietary. All rights reserved &copy; 2026 Ekriti NEET.
