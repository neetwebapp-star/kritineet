# PHASE 4: PERSONALIZED NEET LEARNING ENGINE — FINAL ENGINEERING REPORT

**Project:** NEET UG 2027 Preparation Platform  
**Phase:** 4 — Personalized Learning & Intelligence Engine  
**Target Examination:** NEET UG 2027 (Strict NTA CBT Pattern)  
**System Status:** Production Ready & Verified  
**Automated Test Status:** 92 / 92 Passed (100% Pass Rate across Phases 2, 3, and 4)  

---

## 1. Executive Summary

Phase 4 transforms the NEET UG 2027 Preparation Platform from a static question-bank and basic CBT simulator into an intelligent, closed-loop **Personalized NEET Learning Engine**.

The system implements the complete NEET learning feedback cycle:
$$\text{CONTENT} \longrightarrow \text{QUESTION} \longrightarrow \text{STUDENT ATTEMPT} \longrightarrow \text{PERFORMANCE ANALYSIS} \longrightarrow \text{MISTAKE CLASSIFICATION} \longrightarrow \text{CONCEPT MASTERY UPDATE} \longrightarrow \text{ADAPTIVE DECISION} \longrightarrow \text{REVISION / REMEDIATION} \longrightarrow \text{RE-TEST} \longrightarrow \text{MASTERY UPDATE}$$

Every student interaction is deterministically tracked, scored, and mapped to the canonical NCERT knowledge graph (3,455 concepts, 79 chapters) and multi-source question bank (1,875 PYQs, 33 MTG Fingertips, 264 NCERT questions).

---

## 2. Student Knowledge Profile Architecture

The student profile models learning progression strictly across the canonical 7-tier NEET hierarchy:
$$\text{Class} \longrightarrow \text{Subject} \longrightarrow \text{Unit} \longrightarrow \text{Chapter} \longrightarrow \text{Topic} \longrightarrow \text{Subtopic} \longrightarrow \text{Concept}$$

### Persistent Relational Models (`prisma/schema.prisma`):
1. **`StudentConceptMastery`**:
   - `masteryScore`: Float ($0.0 \le \text{score} \le 100.0$) with exponential recency weighting.
   - `confidenceScore`: Float ($0.0 \le \text{confidence} \le 1.0$) based on attempt volume and consistency.
   - `status`: `UNSEEN` | `LEARNING` | `WEAK` | `REVIEW_DUE` | `MASTERED`.
   - `consecutiveCorrect` & `consecutiveIncorrect`: Direct streak tracking.
   - `nextReviewAt`: Dynamic spaced repetition interval timestamp.
2. **`StudentProfile`**:
   - Aggregated metrics (`totalAttempted`, `totalCorrect`, `accuracyRate`, `studyStreakDays`).
   - Purely derived from verified attempt history; zero artificial seeding.
3. **`StudentMistake`**:
   - Deterministic classification (`mistakeType`, `confidence`, `evidence`, `notes`).
   - Categorization for "My Error Book" (`isLearned`, `isResolved`, `mistakeCount`).

---

## 3. Multi-Signal Concept Mastery Engine (`ConceptMasteryEngine`)

Unlike naive percentage trackers, mastery in Phase 4 evaluates four concurrent educational signals:
1. **Exponential Recency Weighting**:
   - Recent attempts carry higher weight via decay formulation:
     $$w_i = e^{-\lambda \cdot i}$$
   - A student with $8/10$ who failed the last $2$ attempts is identified as declining and penalized.
   - A student with $8/10$ who failed the first $2$ attempts and succeeded on the last $8$ is recognized as improving and accelerated toward `MASTERED`.
2. **Streak Momentum**:
   - $\ge 2$ consecutive correct answers trigger streak bonuses ($+4.0 \times \text{consecutiveCorrect}$).
   - $\ge 2$ consecutive incorrect answers trigger repeated error penalties and automatically mark the concept as `WEAK`.
3. **Cognitive Difficulty Weighting**:
   - Answering a `HARD` question correctly awards $+18.0$ points; `EASY` awards $+7.0$.
   - Failing an `EASY` question incurs a severe penalty ($-15.0$ points); failing a `HARD` question inflicts only a mild penalty ($-4.0$ points), ensuring difficult questions do not destroy student confidence.
4. **Time Calibration**:
   - Fast, correct responses ($t \le 0.8 \times t_{\text{expected}}$) receive a $15\%$ fluency bonus.
   - Prolonged responses ($t > 2.0 \times t_{\text{expected}}$) suffer a $15\%$ struggle dampening.

---

## 4. Deterministic Mistake Classification Engine (`MistakeClassifier`)

Every incorrect response is classified across 11 deterministic categories with accompanying evidence and confidence ratings:

| Mistake Type | Trigger Heuristic | Confidence | Evidence Generated |
| :--- | :--- | :--- | :--- |
| **`CALCULATION`** | Numerical stem, arithmetic error, unit conversion, or power-of-10 mismatch | $0.70$ | "Calculation problem where student likely made an arithmetic or power-of-10 error." |
| **`MISREAD`** | Rapid response ($t < 25\text{s}$) on questions with negative qualifiers (`NOT`, `INCORRECT`, `EXCEPT`) | $0.75$ | "Question contains negative qualifier. Rapid timing indicates reading slip." |
| **`DIAGRAM_INTERPRETATION`** | Graphical, anatomical, or diagrammatic identification question (`hasDiagram: true`) | $0.75$ | "Error occurred in interpreting morphological diagram or curve." |
| **`TIME_PRESSURE`** | Prolonged struggle ($t > 1.8 \times t_{\text{expected}}$) or last-minute test rush | $0.80$ | "Response time exceeded $1.8\times$ baseline, indicating pacing breakdown." |
| **`OPTION_CONFUSION`** | Distractor traps or multiple option changes ($\ge 2$) before submission | $0.70$ | "Student toggled options multiple times between close distractors." |
| **`CONCEPTUAL`** | Repeated errors ($\ge 2$) on the same concept across different questions | $0.85$ | "Repeated failure across multiple questions indicates fundamental gap." |
| **`FORMULA`** | Numerical problem failed repeatedly on the same concept | $0.75$ | "Repeated numerical failure points to wrong formula or constant selection." |
| **`MEMORY`** | Direct NCERT nomenclature, taxonomic ranking, or anatomical naming | $0.75$ | "Direct NCERT factual recall item where specific terminology was forgotten." |
| **`SILLY`** | Isolated single error on an `EASY` question with normal timing | $0.60$ | "Standard timing on isolated basic question suggests accidental slip." |
| **`GUESS`** | Very fast incorrect answer ($t < 15\text{s}$) on non-trivial items | $0.65$ | "Extremely rapid response suggests random guess." |
| **`UNKNOWN`** | Ambiguous behavioral pattern with no qualifying heuristics | $0.20$ | "Ambiguous behavioral pattern. Never hallucinate false certainty." |

---

## 5. Immutable Attempt Event Model (`AttemptEvent`)

All student interactions are appended to an immutable audit log:
- **Model**: `AttemptEvent`
- **Fields Recorded**: `userId`, `questionId`, `selectedOption`, `correctOption`, `isCorrect`, `timeSpentSeconds`, `sourceType`, `examYear`, `chapterId`, `conceptId`, `difficulty`, `mistakeType`, `sessionId`, `sourceContext` (`PRACTICE` | `CBT` | `REMEDIATION` | `REVISION`).
- **Invariant**: Past attempt events cannot be overwritten, modified, or deleted by any student API.

---

## 6. Upgraded Adaptive Practice Engine (`AdaptivePracticeEngine`)

The practice selection engine executes a 4-tier prioritized selection algorithm:
1. **Tier 1 (30% Target)**: Unlearned mistakes from `StudentMistake` (retry with prior error context).
2. **Tier 2 (40% Target)**: Weak concepts ($\text{mastery} < 55$ or $\text{status} = \text{'WEAK'}$), starting with `EASY` and `MEDIUM` foundational drills.
3. **Tier 3 (15% Target)**: Overdue spaced revision items via SM-2 repetition schedule.
4. **Tier 4 (15% Target)**: Fresh unexposed questions, ranked using `QuestionExposureEngine`.

**Strict Invariants**:
- Zero unverified or unpublished questions are ever selected.
- Deduplication exclusion (`duplicateOfId: null`) ensures duplicate question variants are never presented in the same practice session.

---

## 7. Concept Remediation Engine: "Fix My Weakness" (`/remediation`)

When a student identifies or is diagnosed with a weak concept, the platform generates a targeted 3-step mastery package:
- **Step 1: NCERT Theory & Core Grounding**
  - Canonical concept definition, mathematical formulas, scientific laws, and authoritative NCERT excerpt.
  - Accompanied by a verified `EASY` NCERT drill question.
- **Step 2: Applied Practice Drill**
  - A verified `MEDIUM` question (from NCERT Exemplar or MTG Fingertips) testing applied understanding.
- **Step 3: NEET Exam Validation**
  - A verified real NEET/AIPMT Previous Year Question (PYQ) validating that the student has conquered the concept under real exam conditions.

---

## 8. Spaced Revision Engine (`SpacedRevisionEngine`)

Implements an enhanced SuperMemo SM-2 spaced repetition algorithm tailored for NEET UG:
- **Input**: Student recall quality score ($0$ to $5$).
- **Ease Factor Update**:
  $$EF' = EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right) \quad (\text{minimum } 1.3)$$
- **Interval Progression**:
  - $q \ge 3$: $I_1 = 1\text{ day}$, $I_2 = 6\text{ days}$, $I_n = \text{round}(I_{n-1} \times EF')$.
  - $q < 3$: $I = 1\text{ day}$, repetition count reset to $0$, marked as `WEAK`.

---

## 9. Daily Learning Plan Engine (`DailyLearningPlanEngine`)

Generates structured daily missions customized to each student's current weakness profile:
- **Biology Mission**: e.g., "Remediate: Binomial Nomenclature" (Target: 15 questions).
- **Physics Mission**: e.g., "NCERT concepts & formula drill in Laws of Motion" (Target: 12 questions).
- **Chemistry Mission**: e.g., "Chemistry Revision & PYQ Drill" (Target: 15 questions).
- **Error & Speed Drill**: e.g., "Reattempt 10 Unresolved Mistakes in Error Book".

---

## 10. Chapter & Subject Mastery Aggregations

Mastery scores aggregate deterministically up the knowledge hierarchy:
- **Chapter Mastery**:
  $$\text{ChapterMastery} = \frac{\sum_{c \in \text{Concepts}} \text{MasteryScore}(c)}{|\text{Concepts}|}$$
  *(Unattempted concepts count as $0.0$, preventing artificial mastery inflation).*
- **Subject Mastery**:
  Aggregates across all chapters in Physics, Chemistry, and Biology, matching both shorthand (`BIO`, `PHY`, `CHE`) and full canonical codes (`BIOLOGY`, `PHYSICS`, `CHEMISTRY`).

---

## 11. CBT Engine Upgrades: Anti-Loss Persistence & Post-Test Analytics

The Computer-Based Testing engine (`/cbt`) was upgraded to meet high-stakes examination standards:
1. **Anti-Loss State Autosave (`/api/cbt/attempt/autosave`)**:
   - Persists `activeQuestionIndex`, `remainingSeconds`, `answersJson`, and `markedForReviewJson` on every option select and periodically every 25 seconds.
   - Survives browser crashes, accidental page reloads, and network drops.
2. **Active Attempt Recovery (`GET /api/cbt/attempt/[id]`)**:
   - Automatically resumes active sessions upon page mount.
3. **Idempotent Submission (`POST /api/cbt/attempt/submit`)**:
   - Guaranteed single evaluation: submitting an already submitted exam returns cached `PostTestAnalysis` without double grading.
4. **Post-Test Diagnostics**:
   - Subject-wise scores, detected weak concepts with 1-click remediation links (`/remediation?conceptId=...`), and mistake category breakdowns.

---

## 12. "My Error Book" System (`/error-book`)

A dedicated revision workspace organizing all student mistakes into actionable categories:
- **Tabs**: All Mistakes, Repeated Errors ($\ge 2\text{x}$), Slow Struggles, Guesses, and Mastered/Learned.
- **Mark as Learned**: Updates `isLearned: true`, records `learnedAt`, and transitions question exposure state to `MASTERED`.
- **Retry Queue**: Directly feeds prioritized errors into the practice loop.

---

## 13. Question Exposure Control (`QuestionExposureEngine`)

Prevents question fatigue and over-exposure:
- **State Machine**:
  $$\text{UNSEEN} \longrightarrow \text{SEEN} \longrightarrow \text{ANSWERED\_WRONG} \longrightarrow \text{ANSWERED\_CORRECT} \longrightarrow \text{MASTERED}$$
- **Exposure Prioritization**:
  $\text{UNSEEN } (100) > \text{ANSWERED\_WRONG } (90) > \text{REVIEW\_DUE } (80) > \text{ANSWERED\_CORRECT } (40) > \text{MASTERED } (10)$.

---

## 14. Security & Student Data Isolation

- **Authentication Derivation**: All student endpoints derive identity from authenticated session headers or server session (`student@neet2027.com`).
- **IDOR Prevention**: All attempt access endpoints (`/api/cbt/attempt/[id]`, `/api/cbt/attempt/[id]/result`) verify `attempt.userId === student.id` and reject cross-student queries with `403 Forbidden`.
- **Completed Attempt Immutability**: Any autosave call attempted on a `SUBMITTED` exam is rejected (`saved: false`).

---

## 15. Zero Fake Data Policy Verification

- Fresh students start with empty mastery tables (`0.0%`).
- No hardcoded completion percentages or seeded synthetic performance profiles exist anywhere in the application.
- UI renders clear empty states ("Start practicing to build your performance profile") when no attempts exist.

---

## 16. Frontend Implementation & Stitch UI Fidelity

All four key Phase 4 views are fully implemented and styled in accordance with Google Stitch UI tokens:
1. **Student Dashboard (`/`)**: Today's Missions, Subject Readiness cards, Weak Concept alerts, Error Book summary.
2. **CBT Examination & Analytics (`/cbt`)**: NTA exam palette, live timer, anti-loss recovery, detailed scorecard with weak concept triggers.
3. **Concept Remediation Studio (`/remediation`)**: 3-step targeted remediation (Theory $\to$ Drill $\to$ PYQ).
4. **My Error Book (`/error-book`)**: Category filters, mistake diagnosis badges, and 1-click "Mark as Learned".

---

## 17. Automated Acceptance Test Results

### Phase 4 Acceptance Test Suite (`tests/phase4_acceptance.test.ts`)
| Test # | Test Name | Result |
| :--- | :--- | :--- |
| 1 | New student has no fake mastery | **PASS** |
| 2 | Correct answer increases mastery | **PASS** |
| 3 | Wrong answer decreases mastery | **PASS** |
| 4 | Recent attempts receive higher weight | **PASS** |
| 5 | Hard question does not disproportionately destroy mastery | **PASS** |
| 6 | Repeated failures trigger weakness | **PASS** |
| 7 | Repeated success increases mastery | **PASS** |
| 8 | Mistake classification works | **PASS** |
| 9 | Unknown mistake remains UNKNOWN | **PASS** |
| 10 | Revision scheduling works | **PASS** |
| 11 | Overdue revision is prioritized | **PASS** |
| 12 | Adaptive engine selects weak concepts | **PASS** |
| 13 | Adaptive engine avoids excessive repeats | **PASS** |
| 14 | Related questions are selected | **PASS** |
| 15 | NCERT remediation is available | **PASS** |
| 16 | PYQ validation follows remediation | **PASS** |
| 17 | Daily plan is generated | **PASS** |
| 18 | Daily plan changes with student performance | **PASS** |
| 19 | Chapter mastery aggregates correctly | **PASS** |
| 20 | Subject mastery aggregates correctly | **PASS** |
| 21 | Error book collects mistakes | **PASS** |
| 22 | Retry engine prioritizes repeated mistakes | **PASS** |
| 23 | Question exposure works | **PASS** |
| 24 | CBT state survives refresh | **PASS** |
| 25 | CBT autosave works | **PASS** |
| 26 | CBT timer works | **PASS** |
| 27 | CBT auto-submit works | **PASS** |
| 28 | Duplicate CBT submission is prevented | **PASS** |
| 29 | CBT result calculation is correct | **PASS** |
| 30 | Post-test weakness detection works | **PASS** |
| 31 | Student A cannot access Student B data | **PASS** |
| 32 | Client cannot override authenticated student ID | **PASS** |
| 33 | Completed attempts are immutable | **PASS** |
| 34 | Existing Phase 2 tests still pass | **PASS** |
| 35 | Existing Phase 3 tests still pass | **PASS** |
**Phase 4 Score: 35 / 35 Passed (100%)**

### Regression Test Verification
- **Phase 2 Test Suite (`tests/phase2_acceptance.test.ts`)**: **29 / 29 Passed (100%)**
- **Phase 3 Test Suite (`tests/phase3_acceptance.test.ts`)**: **28 / 28 Passed (100%)**
- **Combined Test Total**: **92 / 92 Passed (100%)**

---

## 18. Production Build Verification

Executed `pnpm build`:
- **Build Status**: Exit Code `0` (Success)
- **Static Pages Generated**: 27 / 27
- **Dynamic API Routes**: 17 / 17
- **TypeScript & Lint Errors**: 0
- **Prerender Errors**: 0 (all client search params wrapped in React Suspense boundaries).

---

## 19. Readiness for Phase 5

The platform foundation is verified, stable, and ready for Phase 5 enhancements:
- Multi-student multi-tenant onboarding.
- Real-time AI explanation generation for complex numerical physics problems.
- Advanced full-length 200-question NTA mock examination runs with all-India percentile projections.
- Offline-first ServiceWorker caching for seamless practice under intermittent internet connectivity.
