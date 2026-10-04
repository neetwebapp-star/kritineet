# Phase 15 Analytics & Intelligence API Reference

## 1. Student Endpoints

### `GET /api/student/analytics/trends`
Returns longitudinal trends across overall accuracy, subjects, and chapters.
- **Query Params**: `windowDays` (default: 30)
- **Response**: Array of trend objects with `domain`, `direction`, `deltaValue`, `confidence`, and `evidenceText`.

### `GET /api/student/analytics/retention`
Returns concept stability metrics, delayed drops, and review efficiency.
- **Response**: `stabilityDistribution`, `highDropConcepts`, `averageDelayedDrop`.

### `GET /api/student/analytics/mistakes`
Returns recurring error clusters, error category breakdowns, and affected chapters.
- **Response**: Array of error clusters with `errorCategory`, `occurrenceCount`, and `clusterLabel`.

### `GET /api/student/analytics/concepts`
Returns hierarchical stability states for all concepts in the syllabus.
- **Response**: Array of concepts with `stabilityState`, `attemptsCount`, `accuracy`, and `stabilityScore`.

### `GET /api/student/analytics/subjects`
Returns subject-level longitudinal profiles for Physics, Chemistry, and Biology.
- **Response**: Breakdown of baseline accuracy, trend direction, and total attempts.

---

## 2. Mentor Endpoints

### `GET /api/mentor/students/[id]/analytics`
Returns comprehensive longitudinal profile for an assigned student.
- **Authorization**: Scoped to assigned mentors or ADMIN roles.
- **Response**: Student learning profile, baselines, trends, and recent intervention outcomes.

---

## 3. Admin & Research Endpoints

### `GET /api/admin/cohort-analytics` & `POST /api/admin/cohort-analytics`
Aggregates and retrieves tenant-isolated anonymized cohort analytics.
- **Body (`POST`)**: `{ tenantId, cohortName, windowDays }`
- **Response**: Percentiles (`p25`, `p50`, `p75`, `p90`), accuracy distributions, and sample counts.

### `GET /api/admin/intervention-outcomes` & `POST /api/admin/intervention-outcomes`
Evaluates and tracks multi-horizon intervention efficacy.

### `GET /api/admin/learning-experiments` & `POST /api/admin/learning-experiments`
Manages educational A/B experiments and evaluates sample distributions.
