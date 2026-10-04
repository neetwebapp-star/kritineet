# Phase 15: Advanced Student Analytics & Learning Intelligence OS

## 1. Overview & Core Mission
The **Phase 15 Student Analytics, Learning Research & Personalization Intelligence Layer** transforms raw student actions (practice attempts, study sessions, revisions, exam simulations) into rigorous, explainable, longitudinal learning intelligence.

Instead of treating learning as a static point-in-time score or relying on ungrounded heuristics, Phase 15 establishes a scientific evidence loop:
```text
STUDENT ACTIVITY
       ↓
RAW LEARNING EVENTS (Attempts, Sessions, Reviews)
       ↓
DATA VALIDATION & QUALITY ENFORCEMENT (Quarantine Outliers & Impossible Durations)
       ↓
LONGITUDINAL ANALYTICS & BASELINES (Self-referenced, Moving Windows)
       ↓
CONCEPT / MISTAKE / RETENTION INTELLIGENCE (Stability States, Delayed Drop, Recurrence)
       ↓
PERSONALIZATION EVIDENCE FEED
       ↓
DETERMINISTIC PHASE 11 STUDY PLANNER
       ↓
STUDENT EXECUTION
       ↓
NEW EMPIRICAL EVIDENCE
```

---

## 2. Non-Negotiable Invariants
1. **Separation of Observed Fact from Inference**:
   - *Observed Fact*: "Accuracy increased from 45% to 70% over 20 attempts across 14 days."
   - *Prohibited*: "The student has mastered rotational dynamics because of flashcard review." (Causal assertions without controlled experiments are forbidden).
2. **Zero Moralizing or Psychological Jargon**:
   - All descriptions state measurable behavioral data (e.g., "Active on 5 of the last 7 calendar days; 180 total study minutes logged").
   - Moralizing language ("lazy", "undisciplined", "anxious", "careless") is strictly prohibited.
3. **Zero Predictive NEET Guarantees**:
   - The platform never fabricates All-India Ranks (AIR), target score guarantees, or probability of admission.
   - All performance baselines are self-referenced to the student's own historical trajectory.
4. **Historical Attempt Preservation**:
   - Student attempts, responses, and session records are strictly immutable.
   - Analytics metrics are derived representations that can be deterministically rebuilt without mutating raw source truth.

---

## 3. Architecture & Domain Services

### 3.1 Domain Services in `src/lib/student-intelligence/`
- **`learning-trend-engine.ts`**: Longitudinal trend analysis (`IMPROVING`, `STABLE`, `DECLINING`, `VOLATILE`, `INSUFFICIENT_DATA`) with sliding-window volatility and sample-size thresholds ($N \ge 5$).
- **`student-baseline-service.ts`**: Self-referenced longitudinal baselines across rolling 30-day windows (`ACCURACY_30D`, `RESPONSE_TIME_30D`, `SUBJECT_ACCURACY`).
- **`concept-stability-and-retention-service.ts`**: Empirical stability classification (`UNSTABLE`, `DEVELOPING`, `STABLE`, `STRONG`) and delayed drop calculation.
- **`mistake-intelligence-service.ts`**: Cross-session mistake recurrence profiling, category clustering, and Phase 10 question anomaly integration.
- **`study-activity-and-consistency-service.ts`**: Planned vs actual study minutes, session duration aggregates, and telemetry validation quarantine.
- **`intervention-and-experiment-service.ts`**: Pedagogical intervention lifecycle tracking across immediate, 7-day, and 30-day horizons; educational A/B experiments.
- **`personalization-engine.ts`**: Evidence synthesizer feeding high-priority interventions and bottlenecks into the Phase 11 deterministic planner.
- **`learning-snapshot-and-cohort-service.ts`**: Immutable periodic snapshots, tenant-isolated privacy-preserving cohort distributions, and deterministic analytics rebuild.
- **`student-analytics-worker.ts`**: Background job queue processing registered with `ResilientWorker`.

---

## 4. Prisma Schema Models
Phase 15 introduces 15 purpose-built models:
1. `StudentLearningProfile`: High-level aggregated longitudinal metrics and calculation version.
2. `StudentLearningSnapshot`: Immutable periodic snapshots (`DAILY`, `WEEKLY`, `MONTHLY`).
3. `StudentBaseline`: Rolling statistical baseline for accuracy, timing, and subjects.
4. `LearningTrend`: Longitudinal trend records with direction, delta, and evidence text.
5. `ConceptStabilityProfile`: State machine tracking concept retention across sessions and delays.
6. `MistakeRecurrenceProfile`: Error clusters across subjects and cognitive categories.
7. `LearningIntervention`: Pedagogical interventions triggered by evidence.
8. `LearningInterventionOutcome`: Multi-horizon outcome evaluations (+/- percentage points).
9. `LearningExperiment`: Educational A/B test definitions.
10. `LearningExperimentAssignment`: Student assignment to experiment variants.
11. `LearningInsight`: Transparent, calibrated insight cards with confidence scores.
12. `LearningInsightFeedback`: Student feedback (`HELPFUL` / `NOT_HELPFUL`) stored without mutating analytics.
13. `CohortAnalyticsSnapshot`: Anonymized, aggregated tenant distributions with percentiles (P25, P50, P75, P90).
14. `LearningDataQualityEvent`: Quarantined invalid or duplicate telemetry records.
15. `AnalyticsCalculationVersion`: Version registry for reproducible metric computation.
