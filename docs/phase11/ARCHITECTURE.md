# Phase 11 — Personal AI Study OS Architecture

## 1. System Overview

The **NEET Personal AI Study Operating System** is the orchestration layer of the NEET UG 2027 preparation platform. It transforms the collection of learning features established in Phases 1–10 into a continuous, self-correcting personal study operating system.

### Core Closed-Loop Cycle
```text
  PLAN ─────────► STUDY ─────────► PRACTICE ─────────► ASSESS
   ▲                                                     │
   │                                                     ▼
EXECUTE AGAIN ◄─── REPLAN ◄─── REVISE ◄─── ANALYZE ◄─────┘
```

The system answers twelve deterministic daily execution questions:
1. What should the student study today?
2. In what sequence?
3. For how many minutes?
4. Which exact NCERT textbook paragraphs/concepts?
5. Which drill questions?
6. Which official Past Year Questions (PYQs)?
7. Which mistake types require Error Book review?
8. Which weak areas require 6-step remediation?
9. Which spaced revisions (SM-2) are due today?
10. Which diagnostic or full mock test should be attempted?
11. How does missed work get recovered without overload?
12. How does tomorrow's plan adapt based on today's evidence?

---

## 2. Core Architectural Pillars

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Student Execution Surface (Next.js)                   │
│   /today (Command Center)  •  /focus (Timer/Flow)  •  /plan/week       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Study OS Domain Engines (/lib/study-os)              │
│                                                                        │
│  ┌─────────────────────────┐         ┌───────────────────────────────┐ │
│  │ DailyPlanGenerator      │ ◄─────► │ PlanPriorityEngine (10 Signs) │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ StudySessionEngine      │ ◄─────► │ RecoveryPlanner & Backlog     │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ AdaptiveReplanner       │ ◄─────► │ RemediationGenerator (Gate)   │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ CoverageTracker         │ ◄─────► │ ReviewsAndAnalyticsService    │ │
│  └────────────┬────────────┘         └───────────────────────────────┘ │
│               │                                                        │
│  ┌────────────▼────────────┐         ┌───────────────────────────────┐ │
│  │ MockOrchestrator        │ ◄─────► │ AIStudyCoach (Grounded Copilot│ │
│  └─────────────────────────┘         └───────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Relational Persistence Layer (Prisma ORM)             │
│  StudentPreparationProfile • DailyStudyPlan • DailyStudyTask           │
│  StudySession • StudyEvent • PreparationBacklog • PlanVersion          │
│  PlanChange • RecoveryPlan • WeeklyReview • MonthlyReview • StudyStreak│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│          Underlying Phase 1-10 Knowledge & Assessment Truth            │
│  NCERT Content Graph • PYQ Bank (1,875) • Fingertips (33)              │
│  CBT Simulation • Mistake Pipeline • Psychometrics 2.0 • SaaS / RBAC   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Preparation Stages

Students advance along 7 measurable stages:
1. `FOUNDATION`: First-pass canonical NCERT textbook completion across Biology, Chemistry, Physics.
2. `CONCEPT_MASTERY`: Deep concept reinforcement, formula mastery, targeted practice.
3. `PYQ_INTENSIVE`: Systematic exposure and mastery across 1995–2024 Past Year Questions.
4. `DRILL_STRENGTHENING`: Rapid timed problem drills, MTG Fingertips, error book elimination.
5. `SIMULATION_READINESS`: Full-length 200-question timed mocks (Phase 5 CBT Engine).
6. `ERROR_CONVERGENCE`: Remediation of recurring traps, speed calibration, careless error reduction.
7. `EXAM_READY`: High mock score stability, zero unreviewed error book backlog, syllabus confidence.

---

## 4. Subsystem Roles

| Subsystem | Responsibilities | Key Invariants |
| :--- | :--- | :--- |
| **PreparationProfileService** | Manages stage transitions, study capacity (weekday/weekend), target exam edition, and study streak calculations. | Stage progression requires measurable empirical threshold evidence; no arbitrary jumping. |
| **PlanPriorityEngine** | Evaluates 10 evidence signals to sort tasks into `CORE`, `RECOMMENDED`, and `OPTIONAL` tiers. | 100% reproducible; generates clear student-facing explanation strings. |
| **DailyPlanGenerator** | Builds daily schedules bounded strictly by student capacity; cognitive sequencing; version tracking. | Total duration of `CORE` + `RECOMMENDED` tasks never exceeds daily capacity. |
| **StudySessionEngine** | Manages live execution lifecycle (`STARTED`, `PAUSED`, `RESUMED`, `COMPLETED`), state continuity, and granular event telemetry. | Timer completion alone does not grant mastery without empirical attempt assessment. |
| **RecoveryPlanner** | Redistributes missed study time across 3+ subsequent days (+30m/day cap), defers overflow to backlog. | Tomorrow workload is capped at +30m max to prevent demotivating student overload. |
| **RemediationGenerator** | Constructs 6-step structured remedial packages for repeated errors and enforces strict empirical `Mastery Gate`. | Concepts cannot exit remediation until passing re-attempt and clean practice drills. |
| **CoverageTracker** | Tracks NCERT (5 states: UNSEEN, INTRODUCED, PRACTICED, REVIEWED, MASTERED), authentic PYQs, and MTG Fingertips. | MTG Fingertips is strictly separated from PYQ coverage statistics. |
| **MockOrchestrator** | Evaluates readiness for full mocks and enforces the `Mock Review Gate`. | Students are blocked from taking a new mock if $> 5$ errors from previous mocks remain unreviewed. |
| **ReviewsAndAnalyticsService** | Produces weekly/monthly preparation reviews and multidimensional `PreparationHealthVector`. | Single aggregated fake scores are strictly forbidden; health is multidimensional. |
| **AdaptiveReplanner** | Regulates schedule updates to verified checkpoints (`MORNING_PLANNING`, `AFTER_MAJOR_TEST`, `AFTER_STUDY_BLOCK`, `END_OF_DAY`, `STUDENT_REQUESTED`, `MENTOR_TRIGGERED`, `EXAM_UPDATE`). | Prevents schedule churn during active execution; logs full audit trails on mentor overrides. |
| **AIStudyCoach** | Generates grounded daily preparation briefings and assists with capacity inquiries. | AI acts strictly as an advisory copilot; deterministic planner remains authoritative. |
