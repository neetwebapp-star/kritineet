# Phase 10: Advanced Assessment, Question Intelligence & Psychometrics 2.0 Architecture

## 1. System Overview

Phase 10 elevates the NEET UG 2027 Preparation Platform from an educational content delivery system into a **scientifically rigorous, evidence-driven assessment engine**.

In Phases 1–9, the platform tracked:
* What the student knows (Concept Mastery)
* What the student gets wrong (Mistake Intelligence & Error Book)
* What the student should study next (Adaptive Calendar & Revision Scheduling)

Phase 10 answers the inverse and complementary question:
> **How effective and reliable is each question as an assessment instrument?**

Every student attempt across practice sessions, mock tests, and CBT simulations feeds empirical evidence into the question bank. The system computes psychometric parameters, detects anomalies, isolates ambiguous items, regulates item exposure, and ensures immutable historical auditing.

```
                      +---------------------------------------+
                      |       NEET UG Student Attempts        |
                      |   (CBT, Mock Tests, Adaptive Practice)|
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         StudentResponse Table         |
                      |  - questionVersionId (Immutable)      |
                      |  - correctOptionAtAttempt (Immutable) |
                      |  - responseTimeMs (Immutable)         |
                      +---------------------------------------+
                                          |
                                          v
+---------------------------------------------------------------------------------+
|                       PsychometricsEngine (CTT Analysis)                        |
| - Sample size threshold: <10 INSUFFICIENT, 10-29 LOW, 30-99 MEDIUM, >=100 HIGH |
| - Observed Difficulty P: [0.75-1.00 EASY, 0.40-0.74 MEDIUM, 0.00-0.39 HARD]    |
| - Upper/Lower Discrimination: D = (R_upper - R_lower) / N                      |
| - Distractor Analysis: KEY, STRONG, WEAK, SUSPICIOUS, AMBIGUOUS, NORMAL        |
| - Pacing Percentiles: p25, p50, p75, p90                                       |
+---------------------------------------------------------------------------------+
          |                                               |
          v                                               v
+-----------------------------------+   +-----------------------------------+
|         AnomalyDetector           |   |      QuestionLifecycleEngine      |
| - BROKEN_QUESTION / MISSING_IMAGE |   | - ACTIVE / MONITORED              |
| - AMBIGUOUS_OPTIONS (P >= 30%)    |   | - REVIEW_REQUIRED                 |
| - LOW_DISCRIMINATION (D < 0.10)   |   | - TEMPORARILY_SUPPRESSED          |
| - ANSWER_KEY_CONCERN              |   | - RETIRED                         |
| - EXTREME_TIME_PATTERN            |   | - Immutable Versioning            |
+-----------------------------------+   +-----------------------------------+
          |                                               |
          +-----------------------+-----------------------+
                                  |
                                  v
+---------------------------------------------------------------------------------+
|                      Downstream Assessment Applications                         |
| 1. AdaptiveEngineV2: Multi-factor selection, overexposure penalty, explanation |
| 2. BlueprintEngine: 11-dimension test quality evaluation, coverage variance    |
| 3. TestFormEngine: Parallel mock form creation, Spearman-Brown split-half      |
| 4. StudentBaselineEngine: Student pacing baselines, careless error detection    |
| 5. AIQuestionGate: 9-rule deterministic quality gate for generative items      |
+---------------------------------------------------------------------------------+
```

---

## 2. Core Entities & Data Architecture

### 2.1 QuestionAssessmentProfile
Stores the cumulative psychometric state for each item:
* `authoredDifficulty`: Subject-matter expert authored difficulty (immutable baseline).
* `observedDifficulty`: Empirically computed difficulty (`EASY`, `MEDIUM`, `HARD`) derived strictly from student accuracy.
* `difficultyConfidence`: Sample size tier (`INSUFFICIENT` for $N < 10$, `LOW` for $10 \le N < 30$, `MEDIUM` for $30 \le N < 100$, `HIGH` for $N \ge 100$).
* `discriminationIndex`: Classical upper/lower group discrimination ($D \in [-1.0, 1.0]$).
* `discriminationConfidence`: Statistical confidence tier for discrimination.
* `averageResponseTime` & `medianResponseTime`: Central tendencies in seconds.
* `timeP25`, `timeP50`, `timeP75`, `timeP90`: Empirical response time percentiles.
* `optionDistribution`: JSON map recording raw selection counts per option.
* `distractorEffectiveness`: JSON map categorizing distractors (`KEY`, `STRONG`, `WEAK`, `SUSPICIOUS`, `AMBIGUOUS`, `NORMAL`).
* `ambiguityScore`: Scaled index ($[0.0, 1.0]$) aggregating distractor collision and negative discrimination.
* `qualityScore`: Overall assessment instrument quality index ($[0.0, 1.0]$).
* `assessmentStatus`: Operational lifecycle status (`ACTIVE`, `MONITORED`, `REVIEW_REQUIRED`, `TEMPORARILY_SUPPRESSED`, `RETIRED`).
* `calculationVersion`: Version identifier of the calculation algorithm (`v1.0`).

### 2.2 QuestionOptionPerformance
Maintains item option statistics:
* `questionId`, `optionLabel`: Unique composite identity.
* `selectionCount`, `selectionRate`: Total choices and percentage.
* `selectedByCorrectResponders`, `selectedByIncorrectResponders`: Performance group segmentation.
* `distractorCategory`: Automated classification.

### 2.3 QuestionAnomaly
Audits detected behavioral, statistical, and structural flaws:
* `anomalyType`: Structural (`BROKEN_QUESTION`, `MISSING_IMAGE`), Statistical (`LOW_DISCRIMINATION`, `EXTREME_TIME_PATTERN`), or Answer-Key (`ANSWER_KEY_CONCERN`, `AMBIGUOUS_OPTIONS`).
* `severity`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
* `evidence`: JSON blob capturing triggering metrics.
* `status`: `FLAGGED` $\to$ `UNDER_REVIEW` $\to$ `RESOLVED` / `IGNORED`.

### 2.4 QuestionVersion & Immutability Architecture
Preserves editorial revisions:
* `versionNumber`: Incremental version number.
* `stem`, `optionsJson`, `correctAnswer`, `explanation`, `sourceReference`: Frozen snapshot.
* `changeReason`, `changedBy`: Audit metadata.
* **Attempt Integrity**: `StudentResponse` records store `questionVersionId` and `correctOptionAtAttempt`, ensuring past test results remain forever unchanged even if an answer key is revised.

### 2.5 AssessmentBlueprint & TestForm
Defines formal test composition:
* `targetQuestionCount`, `targetDurationMinutes`, `rulesJson`.
* `blueprintRules`: Min/max question quotas by subject, chapter, concept, difficulty, and source.
* `TestForm`: Parallel mock versions (Form A, Form B, etc.) with frozen question snapshots and equivalence status.

---

## 3. Integration with Phases 1–9

| Phase Layer | Phase 10 Enhancement |
|:---|:---|
| **Phase 1 & 2 (NCERT & KG)** | Detects concept coverage gaps (`CONCEPT_WITHOUT_PRACTICE`, `CONCEPT_WITHOUT_PYQ`). |
| **Phase 3 (Question Bank)** | Validates 1,875 PYQs and MTG Fingertips items against empirical student response distributions. |
| **Phase 4 (Mastery & Adaptive)** | Upgrades adaptive practice to `AdaptiveEngineV2` with multi-factor scoring, overexposure penalties, and psychometric weights. |
| **Phase 5 (CBT Exam Engine)** | Pre-validates mock tests with an 11-dimension `AssessmentQualityReport` before publication. |
| **Phase 6 (AI Tutor)** | Introduces `AIQuestionGate` with 9 deterministic filters preventing unverified generative questions from reaching students. |
| **Phase 7 (Command Center)** | Provides administrative dispute resolution, question suppression/restoration, and immutable audit logs. |
| **Phase 8 (SaaS & Multi-Tenant)** | Preserves student data isolation while pooling anonymized psychometrics across institutional cohorts. |
| **Phase 9 (Exam OS)** | Maps psychometrically validated items into the official NEET UG 2027 preparation calendar. |
