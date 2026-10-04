# Phase 14: Editorial Review Workflow & SLA Tracking

## 1. Overview
The Editorial Review Workflow provides role-based editorial management for content discrepancies, automated review signals, psychometric anomaly alerts, and publisher updates.

## 2. Review Roles & Permissions

| Role | Permissions |
|---|---|
| `CONTENT_VIEWER` | View items, audit histories, diffs, and health metrics. Read-only. |
| `CONTENT_REVIEWER` | Claim review items, approve non-scientific edits, reject items, request more evidence. |
| `SCIENTIFIC_REVIEWER` | Review scientific formulas, approve scientific validations, correct answer keys. |
| `CONTENT_ADMIN` | Perform bulk operations, configure license policies, manage review queues. |
| `SUPER_ADMIN` | Full unrestricted authority across all domains and system configurations. |

## 3. SLA Aging Buckets
The system tracks review backlog aging according to predefined operational tiers:
- **Tier 1 (Fresh)**: 0 to 1 day old
- **Tier 2 (Approaching SLA)**: 2 to 7 days old
- **Tier 3 (Overdue)**: 8 to 30 days old
- **Tier 4 (Critical SLA Breach)**: > 30 days old

## 4. Immutable Corrections & Version Spawning
When a reviewer or admin executes `POST /api/admin/content/[id]/correct`:
1. The existing version is frozen and unmodified.
2. A new `ContentVersion` is created with an incremented version number (`versionNumber: current + 1`).
3. The correction justification, actor ID, and diff are cataloged.
4. An immutable audit record is committed to `ContentQualityEvent`.
