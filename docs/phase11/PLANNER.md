# Phase 11 — Deterministic Daily Plan Priority Engine & Generator

## 1. Design Philosophy

The daily planning engine is strictly **deterministic, explainable, and capacity-governed**. It treats student attention and time as bounded, precious resources. Rather than creating idealistic, impossible study schedules, it prioritizes tasks based on empirical evidence from student performance and official exam syllabi.

---

## 2. Priority Scoring & Classification

Every prospective study task is scored across 10 empirical signals:

```text
Priority Score = ∑ (Signal Weight × Indicator)
```

### Signal Weights Matrix
1. **Due Spaced Revision (SM-2)**: `+50 pts` (urgent memory consolidation).
2. **Critical Error Book Mistake Count**: `+40 pts` ($\ge 3$ repeated mistakes) or `+25 pts` ($1-2$ mistakes).
3. **Active Remediation Required**: `+40 pts` (concept flagged for guided recovery).
4. **Mastery Threshold Gap**: `+30 pts` (concept mastery $< 50\%$) or `+15 pts` (mastery $50-70\%$).
5. **High NEET Weightage**: `+25 pts` (high historical NEET occurrence).
6. **Past Year Question Gap**: `+25 pts` (unattempted official PYQ).
7. **Official Syllabus Priority**: `+20 pts` (core NEET 2027 curriculum).
8. **Recent Mock Weakness**: `+20 pts` (mistake identified in latest mock).
9. **Curriculum Sequencing Dependency**: `+15 pts` (prerequisite for upcoming chapters).
10. **Assigned Mentor Target**: `+35 pts` (mandatory institutional assignment).

### Priority Tiers
* **CORE (Mandatory)**: Score $\ge 60$ pts. Represents foundational non-negotiables (overdue revisions, error corrections, high-yield concept gaps).
* **RECOMMENDED (Standard)**: Score $35-59$ pts. Represents standard syllabus progression, practice problem sets, and PYQ drills.
* **OPTIONAL (Discretionary)**: Score $< 35$ pts. Extra enrichment, MTG Fingertips challenge drills, or deep curiosity reading. May be skipped by the student without penalty.

---

## 3. Capacity Enforcement Algorithm

1. Retrieve student profile daily capacity:
   - Default Weekday: `180 minutes` (3 hours)
   - Default Weekend: `360 minutes` (6 hours)
2. Filter candidate tasks by priority score.
3. Fit `CORE` tasks into the schedule first:
   - If `CORE` tasks exceed daily capacity, the system triggers the **RecoveryPlanner** to defer non-immediate items.
4. Fit `RECOMMENDED` tasks into remaining capacity.
5. Total planned duration for `CORE + RECOMMENDED` will **never exceed daily capacity**.
6. `OPTIONAL` tasks are appended to provide stretch goals, explicitly flagged with zero penalty for non-completion.

---

## 4. Cognitive Sequencing Engine

Tasks within a daily plan are deterministically sorted to maximize focus, cognitive variety, and retention:

```text
Sequence Order:
1. REVISION           (Fresh mental state for spaced repetition review)
2. REMEDIATION        (Tackle difficult concept misconceptions early)
3. NCERT_READ         (Absorb canonical theory before problem solving)
4. PRACTICE / PYQ     (Apply concepts in active problem solving)
5. FINGERTIPS         (Speed and pattern drill)
6. MOCK_TEST          (Assessment block requiring peak endurance)
7. TEST_ANALYSIS      (Post-exam review and reflection)
```

Furthermore, identical subject blocks are interleaved when possible (e.g., Physics $\to$ Biology $\to$ Chemistry) to reduce cognitive fatigue.

---

## 5. Transparent Explanations

Every generated task carries an explicit, human-readable rationale stored in `priorityReason`:
- Example: *"Categorized as CORE because: Scheduled revision is due to reinforce memory retention; Concept mastery is below target threshold (35%)."*
- This eliminates student skepticism and promotes study discipline by making the pedagogical intent visible.
