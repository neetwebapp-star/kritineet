# Phase 12 — Security & Data Integrity

## 1. Multi-Tenant Isolation

All Phase 12 database tables include `tenantId` and enforce strict foreign key constraints:
- `FinalMileConfiguration`
- `ExamSimulation`
- `ExamSimulationAttempt`
- `SimulationQuestionSnapshot`
- `ExamSimulationResult`
- `FinalRevisionPlan`
- `FinalRevisionBlock`
- `SimulationReviewQueue`
- `FinalMileActionPlan`
- `ExamDayChecklist`
- `ExamReadinessSnapshot`
- `SimulationComparison`

All API handlers verify that `session.user.tenantId === entity.tenantId` to prevent cross-tenant data leakage.

---

## 2. Role-Based Access Control (RBAC) & IDOR Prevention

- **Students**: Scoped strictly to their own user ID (`userId`). Direct manipulation of other students' simulation attempts, readiness vectors, or revision plans is blocked with `403 Forbidden`.
- **Mentors**: Authorized only for assigned students linked via mentor-student mapping. Mentor overrides generate an immutable entry in the `AuditLog` table containing the prior state, new state, and mandatory justification.
- **Admins & Super Admins**: Authorized for aggregated analytics and configuration oversight; actions are strictly audited.

---

## 3. Server-Authoritative Timing Defense

- **Clock Tampering Protection**: Client device clock manipulation (e.g., setting the OS time back by 2 hours) has zero effect on test duration. The server measures `Date.now()` against the server-recorded `endTime`.
- **Heartbeat Validation**: Pings verify active connection status. If a candidate drops offline, time continues to elapse unless an administrative pause is granted under invigilator supervision.
- **Late Submission Rejection**: Submissions received after `endTime + 15 seconds` (grace period for network latency) are auto-sealed by background workers or rejected with `400 Bad Request`.
