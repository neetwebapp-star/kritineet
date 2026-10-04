# Phase 11 — Intelligent Study Recovery Engine & Backlog Management

## 1. Problem Statement

A common failure mode of conventional study timetables is the "avalanche effect":
When a student misses a planned 3-hour study block, traditional software dumps all missed tasks onto the following day. Tomorrow becomes an impossible 6-hour mountain, causing anxiety, demotivation, and abandonment of the system.

Phase 11 introduces a **non-punitive, multi-day distributed recovery engine** that maintains pedagogical momentum without overloading the student.

---

## 2. Recovery Rules & Invariants

1. **Strict Tomorrow Cap**:
   - The recovery engine limits tomorrow's added study workload to a maximum of `+30 minutes`.
   - Tomorrow is never converted into an unsustainable cramming session.

2. **Multi-Day Distribution**:
   - Missed study minutes are distributed evenly across the next `3 to 5 preparation days`.
   - Each recovery block is capped at $+20$ to $+30$ minutes per day.

3. **Pruning Optional Tasks**:
   - Before scheduling recovery debt, the engine automatically cancels or prunes pending `OPTIONAL` tasks to free up cognitive bandwidth.

4. **Strategic Deferral to Backlog**:
   - If total missed time cannot be safely distributed within the daily recovery cap, items are cleanly moved to the `PreparationBacklog` with status `ACTIVE`.
   - Backlog items are prioritized by NEET importance, not by age.

5. **Non-Punitive Recovery Plans**:
   - Missed sessions never trigger shaming, negative tone, or sudden streak destruction.
   - The system frames recovery constructively:
     *"Distributed 90m of missed study across next 3 days (+30m/day cap). 1 item deferred to backlog, 35m optional tasks pruned to avoid student burnout."*

---

## 3. Preparation Backlog Lifecycle

```text
       ┌───────────┐
       │  ACTIVE   │ ◄─── Missed or overflow tasks deferred
       └─────┬─────┘
             │
             ├───► [SCHEDULED]   ───► Rescheduled onto weekend / buffer day
             │
             ├───► [COMPLETED]   ───► Student completes target
             │
             ├───► [DEFERRED]    ───► Temporarily held for later stage
             │
             ├───► [DROPPED]     ───► Discarded due to syllabus changes
             │
             └───► [SUPERSEDED]  ───► Replaced by newer diagnostic or revision
```

### Backlog Management Invariant
Backlog capacity is governed. If a backlog exceeds 20 items, low-yield non-core items are either marked `SUPERSEDED` or scheduled onto dedicated buffer days to prevent unbounded backlog explosion.

---

## 4. End-of-Day Checkpoint Handling

At the end of each study day, incomplete tasks are systematically classified:
- `COMPLETED`: Session finished, target minutes or problems fulfilled.
- `PARTIAL`: Task started but session stopped before target duration (remaining time evaluated).
- `MISSED`: Task was not started during the scheduled day.
- `SKIPPED`: Task was an optional drill that the student explicitly dismissed.

No assumptions are made regarding student personal reasons. The recovery planner simply inspects the empirical outcome (missed vs. completed) and updates the recovery roadmap.
