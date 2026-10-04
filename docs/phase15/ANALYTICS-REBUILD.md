# Deterministic Analytics Rebuild & Versioning

## 1. Analytics Rebuild Architecture
In the event of algorithm refinement, calculation bugs, or manual data corrections, derived analytics must be completely rebuildable from raw historical records.

```text
PRISMA DATABASE
 ├── AttemptEvent (Raw immutable attempt telemetry)
 ├── StudySession (Raw session start/stop times)
 └── DailyStudyTask (Planned vs actual study records)
           │
           ▼
 LearningSnapshotAndCohortService.rebuildAnalytics(studentId)
           │
           ├─ Recalculates Baselines (ACCURACY_30D, RESPONSE_TIME_30D)
           ├─ Recalculates Trends (OVERALL, SUBJECTS, CHAPTERS)
           ├─ Recalculates Concept Stability Profiles
           ├─ Recalculates Mistake Recurrence Profiles
           └─ Stamps StudentLearningProfile with new Calculation Version
```

---

## 2. Calculation Versioning
Every derived analytical metric is tagged with a calculation version:
- `LearningTrend.calculationVersion`: e.g., `trend-v2`
- `StudentBaseline.calculationVersion`: e.g., `baseline-v1`
- `StudentLearningProfile.calculationVersion`: e.g., `profile-v1-rebuilt`

When algorithms change, historical versions are recorded in `AnalyticsCalculationVersion`, ensuring that past reports remain reproducible and comparable over time.
