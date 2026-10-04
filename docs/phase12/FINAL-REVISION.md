# Phase 12 — Final Revision Scope Engine & Freeze Rules

## 1. Overview

The **Final Revision Scope Engine** (`src/lib/final-mile/final-revision-scope-engine.ts`) controls preparation boundaries as the exam approaches. It prevents candidate anxiety and late-stage burnout caused by starting massive new syllabus blocks.

---

## 2. The Final Mile Freeze Rule

### What Gets Frozen
- **Untouched Low-Yield Topics**: Deprioritized from primary study recommendations.
- **Experimental Learning Paths**: Locked down in favor of proven revision blocks.

### What Stays Active (The Priority Tiers)
1. **Critical Mistake Recovery**: High-frequency errors from previous simulations and Error Book.
2. **Spaced Revision Due**: Concepts whose SM-2 decay interval is reaching retention limit.
3. **Core NCERT Fact Checks**: High-yield botanical morphology, chemical inorganic tables, and physics formulae.
4. **Official PYQs**: Unmastered official NEET questions from the last 10 editions.
5. **Timed Full-Length Simulations**: Rehearsal under full 200-minute conditions.

### Invariant: Zero Data Loss
- The freeze never deletes pending tasks, backlog items, or question progress.
- Tasks are categorized with explicit freeze tags (`isFrozen: true`) and clearly explained to the candidate.

---

## 3. Capacity Allocation & Block Structure

Final revision plans allocate time strictly according to measured student daily capacity (default: 180–300 minutes):
- **Block Duration**: 30 to 60-minute blocks with mandatory rest intervals.
- **Block Types**:
  - `NCERT_HIGH_YIELD_REVIEW`: Fast-paced NCERT line-by-line retrieval.
  - `ERROR_BOOK_TRIAGE`: Deep-dive into recent mock test traps.
  - `FORMULA_AND_CONSTANTS`: Memory consolidation for physical sciences.
  - `PYQ_SPEED_RUN`: High-tempo past year question drills.
- **Progress Tracking**: Blocks record completion status, actual minutes spent, and conceptual takeaways.
