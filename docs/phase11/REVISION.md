# Phase 11 — Integrated Spaced Revision & 6-Step Remediation Engine

## 1. Unified Error-to-Mastery Pipeline

Phase 11 tightly links the Phase 2/4 spaced repetition infrastructure and Phase 4/10 error diagnostics directly into daily student workflows:

```text
Student Attempt (CBT / Practice)
            │
    [Mistake Occurs]
            │
            ▼
StudentMistake Logged (Error Book)
            │
   ┌────────┴────────┐
   ▼                 ▼
Repeated Trap?   Isolated Error?
   │                 │
   │ [Yes]           │ [No]
   ▼                 ▼
6-Step Remediation  Spaced Revision (SM-2)
Package Generated   Interval Adjusted
   │                 │
   ▼                 ▼
Mastery Gate Pass?  Daily Plan Core Task
```

---

## 2. 6-Step Structured Pedagogical Remediation

When a student makes repeated mistakes on a concept ($\ge 2$ errors), the system generates a sequential 6-step remediation package:

| Step | Step Type | Pedagogical Intent | Requirement |
| :--- | :--- | :--- | :--- |
| **1** | `NCERT_SECTION` | Re-read authoritative NCERT textbook paragraph and definitions. | Review section content for 5–10 minutes. |
| **2** | `CONCEPT_BREAKDOWN`| Structured step-by-step breakdown of underlying principles and formulas. | Review core formula / rule invariants. |
| **3** | `ERROR_ANALYSIS` | Direct breakdown of why student's chosen option was wrong and the trap involved. | Acknowledge specific mistake trap. |
| **4** | `WORKED_EXAMPLE` | Walk through an identical or closely related problem with step-by-step solution. | Study derivation and numerical setup. |
| **5** | `SIMILAR_PRACTICE` | Attempt $2-3$ isomorphic questions on the exact same concept. | Minimum 66% accuracy on similar items. |
| **6** | `REATTEMPT_ORIGINAL`| Re-attempt the exact original problem where the mistake occurred. | Correct answer must be submitted independently. |

---

## 3. Strict Empirical Mastery Gate

Concepts in active remediation cannot exit remediation or regain `MASTERED` status purely through time elapsed or reading:

```typescript
interface MasteryGateResult {
  passed: boolean;
  newMastery: number;
  reason: string;
}
```

### Mastery Gate Criteria
1. `reattemptSuccess === true`: The student must successfully solve the original failed question without viewing the answer key.
2. `additionalPracticeAccuracy >= 66%`: The student must demonstrate consistent understanding across similar items.
3. Upon passing: Mastery score increases to $\ge 65\%$ and the concept transitions from `WEAK` to `IN_REVIEW`.
4. Upon failure: Remediation remains active and a new review session is scheduled within 48 hours.

---

## 4. Spaced Revision Engine (SM-2 Integration)

All reviewed concepts and formulas are tracked via the SuperMemo-2 (SM-2) spaced repetition engine:
- Intervals: $1\text{ day} \to 3\text{ days} \to 7\text{ days} \to 14\text{ days} \to 30\text{ days} \to 60\text{ days}$.
- Overdue reviews are prioritized into the `CORE` bucket of the daily plan with $+50$ priority points.
- Spaced review sessions are embedded into morning focus blocks to ensure long-term memory consolidation.
