# Phase 10 API Reference

## 1. Administrative Question Intelligence

### `GET /api/admin/question-intelligence`
Lists questions with multi-dimensional psychometric filters.

**Query Parameters:**
* `query` (string): Text search across stem, topic, or concept.
* `subjectCode` (string): `PHYSICS`, `CHEMISTRY`, `BIOLOGY`.
* `difficulty` (string): `EASY`, `MEDIUM`, `HARD`.
* `sourceType` (string): `PYQ`, `FINGERTIPS`, `NCERT_EXEMPLAR`, `AI_GENERATED`.
* `status` (string): `ACTIVE`, `MONITORED`, `REVIEW_REQUIRED`, `TEMPORARILY_SUPPRESSED`, `RETIRED`.
* `minDiscrimination` / `maxDiscrimination` (float): Filter by $D$ index.
* `minAttempts` (integer): Filter by sample size.
* `hasAnomalies` (boolean): Only items with flagged anomalies.
* `limit` (default 50), `offset` (default 0).

---

### `GET /api/admin/questions/[id]/intelligence`
Returns detailed psychometric diagnostic profile for a specific item:
* Cumulative `assessmentProfile` ($P$, $D$, percentiles, qualityScore, ambiguityScore).
* `optionPerformances` (frequencies, responder splits, distractor categories).
* `performanceSnapshots` (historical weekly/monthly trends).
* `anomalies` (flagged issues and evidence).
* `versions` (full immutable revision history).
* `reviews` (audit log of dispute decisions).

**Actions (`POST /api/admin/questions/[id]/intelligence`):**
* `RECALCULATE`: Triggers on-demand recalculation of psychometric parameters and anomaly scan.
* `UPDATE_STATUS`: Updates question status (`ACTIVE`, `MONITORED`, `REVIEW_REQUIRED`, etc.).

---

### `GET /api/admin/assessment-intelligence`
Provides cohort-level psychometric health telemetry:
* Discrimination index distribution (Excellent, Good, Marginal, Poor, Negative, Uncalibrated).
* Difficulty migration matrix (Easier than authored vs. harder than authored).
* Distractor breakdown counts (Key, Strong, Weak, Suspicious, Ambiguous, Normal).
* Anomaly summary grouped by type and status.
* Average test blueprint quality scores.

---

### `GET /api/admin/question-anomalies`
Lists detected question anomalies with filtering by severity, status, and type.

**Actions (`POST /api/admin/question-anomalies`):**
* `RUN_SCAN`: Initiates platform-wide anomaly scan across question bank.
* `SCAN_QUESTION`: Scans a specific question ID.
* `UPDATE_STATUS`: Resolves or ignores an anomaly with resolution notes and reviewer ID.

---

### `POST /api/admin/question-suppress`
Suppresses or permanently retires a question from all active mock tests and practice queues.

**Body:**
```json
{
  "questionId": "Q_PHY_101",
  "reason": "Option C contains typographical unit error (mA instead of A)",
  "adminUserId": "usr_admin_123",
  "permanent": false
}
```

---

### `POST /api/admin/question-restore`
Restores a suppressed question back to `ACTIVE` status after editorial review.

---

### `POST /api/admin/question-review`
Manages dispute resolution and editorial reviews.

**Query Parameters:**
* `questionId`, `status`, `reviewType`, `limit`, `offset`.

**Body (`POST`):**
```json
{
  "questionId": "Q_PHY_101",
  "reviewerId": "usr_admin_123",
  "reviewType": "ANSWER_KEY_DISPUTE",
  "decision": "CORRECTED",
  "findings": "Empirical evidence indicates Option B is scientifically correct per NCERT page 142",
  "newStatus": "ACTIVE",
  "revisedCorrectOption": "B",
  "revisedStem": "Optional updated stem",
  "revisedExplanation": "Updated explanation..."
}
```

---

### `GET /api/admin/test-quality/[testId]`
Evaluates a test against the 11-dimension assessment blueprint rules.

**Response:**
* `report`: Blueprint compliance status (`PASS`, `WARNING`, `REVIEW_REQUIRED`).
* `metrics`: Array of evaluated metrics with target, actual, and status.
* `variance`: Distribution differences across subjects and difficulty tiers.

---

## 2. Student Assessment Insights

### `GET /api/student/assessment-insights`
Returns personalized baseline metrics, solving speed categories, and recent item pacing evaluations for the authenticated student.
