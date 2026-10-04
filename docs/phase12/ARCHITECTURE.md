# Phase 12 — Final-Mile Exam Readiness & Full Exam Simulation OS Architecture

## 1. System Overview

The **NEET Final-Mile Exam Readiness & Full Exam Simulation Operating System** is the culmination layer of the NEET UG 2027 preparation platform. It transitions the student from general preparation and modular practice into full-scale, timed, high-fidelity exam simulation and targeted final-mile revision.

### Core Closed-Loop Simulation & Readiness Cycle
```text
FINAL SYLLABUS STATUS ────────► REVISION COVERAGE ────────► PYQ COVERAGE
         ▲                                                       │
         │                                                       ▼
FINAL REVISION ◄─── TARGETED REVISION ◄─── PERFORMANCE ◄─── MISTAKE RECOVERY
         │                                    │                  │
         ▼                                    ▼                  ▼
EXAM-DAY SIMULATION ◄────────────── TIME/PRESSURE ANALYSIS ◄── FULL-LENGTH SIMULATION
```

The system strictly adheres to key invariants:
1. **No Predictive AIR / Score Inflation**: Never fabricates or estimates All India Ranks (AIR) or guaranteed NEET marks.
2. **Authoritative Official Exam Dates**: When unannounced by NTA, displays "Exam date not officially announced" rather than guessing.
3. **Server-Authoritative Timing & Heartbeat**: Client-side countdown is display-only; server evaluates expiry tokens, start/end timestamps, and active heartbeats.
4. **Final Revision Freeze**: Deprioritizes low-yield new additions when final mile is reached, while preserving active revision, weak concept recovery, and high-yield mocks without deleting student history.

---

## 2. Core Architectural Pillars

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Student Execution Surface (Next.js)                   │
│   /final-mile (Readiness Dashboard) • /simulations (CBT Interface)      │
│   /simulations/[id] (Live Exam & Analytics) • /exam-day (Checklist)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Final-Mile Domain Engines (/lib/final-mile)           │
│                                                                        │
│  ┌─────────────────────────┐         ┌───────────────────────────────┐ │
│  │ FinalMileConfigService  │ ◄─────► │ ReadinessMatrixService        │ │
│  │ (Preparation Modes)     │         │ (9 Dimension Matrix)          │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ FinalRevisionScopeEngine│ ◄─────► │ ExamSimulationEngine          │ │
│  │ (Freeze & Capacity)     │         │ (Server Timer & Snapshots)    │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ SimulationAnalyticsEng  │ ◄─────► │ SimulationReview & ActionPlan │ │
│  │ (P25/75/90, Hesitation) │         │ (4 Horizons, Error Book)      │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ FinalDaysAndChecklist   │ ◄─────► │ FinalMileAICoach              │ │
│  │ (Official NTA Rules)    │         │ (Grounded, Non-Predictive)    │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐                                           │
│  │ FinalMileWorker         │                                           │
│  │ (Idempotent Cron Tasks) │                                           │
│  └─────────────────────────┘                                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Persistence & Knowledge Layer (Prisma)              │
│  FinalMileConfiguration • ExamSimulation • ExamSimulationAttempt       │
│  SimulationQuestionSnapshot • ExamSimulationResult • FinalRevisionPlan │
│  FinalRevisionBlock • SimulationReviewQueue • FinalMileActionPlan      │
│  ExamDayChecklist • ExamReadinessSnapshot • SimulationComparison       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Preparation Mode State Machine

The student transitions through verified preparation modes:
- `NORMAL_PREPARATION`: Standard learning loop with open concept exploration and daily schedule.
- `FINAL_MILE`: Activated dynamically (or mentor-guided) when syllabus mastery meets readiness criteria or countdown approaches. New low-yield topics frozen.
- `EXAM_SIMULATION`: Active full-length 200-minute timed mock tests under strict NEET Section A/B rules.
- `EXAM_DAY`: 24-hour final checklist, mental readiness, document verification, zero heavy testing.
- `POST_EXAM`: Official answer-key verification, performance post-mortem, and counseling orientation.

---

## 4. Multi-Tenant and Data Safety
All final-mile queries, simulations, snapshots, and revision plans enforce tenant isolation (`tenantId`) and strict user role boundaries (`STUDENT`, `MENTOR`, `ADMIN`, `SUPER_ADMIN`).
