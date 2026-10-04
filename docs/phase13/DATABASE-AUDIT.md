# Phase 13 — Database Audit & Optimization Report

## 1. Overview & Schema Architecture

The NEET UG 2027 preparation platform database contains 85+ models spanning knowledge graphs, question intelligence, CBT simulations, study OS plans, subscriptions, and system observability.

---

## 2. Indexing Strategy & Compound Patterns

Key models are indexed to ensure sub-millisecond lookups under high concurrent query loads:

| Model | Indexed Fields | Query Access Pattern |
| :--- | :--- | :--- |
| `Question` | `[subjectId, chapterId]`, `[verificationStatus]`, `[sourceType]` | Fast chapter/subject practice drills and admin review queues |
| `ExamAttempt` | `[userId]`, `[testId]`, `[status]`, `[startedAt]` | Historical attempt reviews, student dashboards, analytics |
| `BackgroundJob` | `[queue, status]`, `[status]`, `[idempotencyKey]` | Worker queue polling and duplicate job suppression |
| `AbuseEvent` | `[type, createdAt]`, `[userId]`, `[tenantId]` | Security rate-limit violation queries and intrusion detection |
| `SystemHealthSnapshot` | `[timestamp]`, `[status]` | Periodic health monitoring and admin telemetry |
| `StudySession` | `[userId, date]`, `[taskId]` | Daily learning activity queries and streak calculations |

---

## 3. Referential Integrity & Constraints

- **Foreign Key Enforcement**: All child models (e.g. `DailyStudyTask`, `StudentResponse`, `SimulationQuestionSnapshot`) enforce explicit cascade or restrict foreign key constraints. Orphan tasks without valid parent links are strictly rejected.
- **Unique Idempotency Constraints**:
  - `BackgroundJob.idempotencyKey`: Unique constraint prevents concurrent worker duplication.
  - `PaymentWebhookEvent.eventId`: Prevents duplicate webhook charging.
  - `DailyStudyPlan.[userId, date]`: Enforces single canonical plan per student per day.

---

## 4. Slow Query Detection & Thresholds

The platform implements real-time query monitoring via `ObservabilityService`:
- **100ms Threshold**: Flagged as informational slow query.
- **250ms Threshold**: Monitored for potential missing indexes or unbounded query limits.
- **500ms Threshold**: Logged with high priority.
- **1000ms Threshold**: Automatically triggers an operational `DATABASE_SLOW` alert for administrator attention.
- **Sanitization Invariant**: Query literals and parameters are redacted (`?`) prior to logging to ensure candidate PII and credentials are never stored in diagnostic logs.
