# Phase 11 — Grounded AI Study Coach & Daily Preparation Briefing

## 1. Grounding Principles & Non-Negotiable Invariants

In Phase 11, the AI Study Assistant is explicitly constrained to operate as an **advisory copilot** rather than an uncontrolled schedule generator:

1. **Deterministic Priority Engine is Sole Authority**:
   - The AI **never** autonomously invents, deletes, or mutates study plans without invoking the deterministic planning engine.
   - All AI schedule suggestions are verified by the `PlanPriorityEngine` and bounded by `dailyStudyCapacityMinutes`.

2. **Zero Hallucination of Metrics or Progress**:
   - The AI coach never manufactures fake readiness percentages, imaginary PYQ counts, or fictional exam dates.
   - All numbers must cite verifiable database records from `CoverageTracker`, `ReviewsAndAnalyticsService`, or `Prisma`.

3. **Constructive, Grounded Tone**:
   - The coach communicates with empathy and academic clarity.
   - It avoids toxic ranking, guilt-tripping for missed sessions, or empty motivational hype.

---

## 2. Daily Preparation Briefings

Every morning, the `AIStudyCoach` compiles a concise, structured preparation briefing for the student:

```text
📋 Daily Preparation Brief — 2027-01-15
────────────────────────────────────────────────────
Preparation Stage: FOUNDATION (Goal: First-pass NCERT textbook completion)
Target Capacity: 180 minutes | Total Tasks: 4

🎯 Core Focus:
  • Spaced Revision: Newton's Laws of Motion (30m)
  • NCERT Textbook Study: Motion in a Plane (45m)
  • Error Book Remediation: Kinematics 2D Traps (30m)

💡 Pedagogical Insight:
  "Prioritizing mechanics revision today will solidify vector components 
   before moving to Circular Motion practice."
────────────────────────────────────────────────────
```

---

## 3. Supported Student Voice & Text Commands

The AI Study Coach understands natural conversational inputs regarding daily capacity and study pacing:

| Input Pattern | Intent Detected | Deterministic Action Triggered |
| :--- | :--- | :--- |
| *"I only have 90 minutes today"* | `CAPACITY_ADJUSTMENT` | Invokes `AdaptiveReplanner` with adjusted capacity $90\text{m}$; preserves `CORE`, prunes lower-priority tasks. |
| *"Explain why this task is first"* | `EXPLANATION_QUERY` | Reads `priorityReason` from the active task and explains evidence signals transparently. |
| *"I missed yesterday's study block"* | `RECOVERY_INQUIRY` | Invokes `RecoveryPlanner` and summarizes the multi-day recovery distribution without shame. |
| *"What should I focus on in Physics?"* | `SUBJECT_GUIDANCE` | Inspects `CoverageTracker` physics state and identifies lowest mastery / unattempted PYQ chapters. |

---

## 4. Controlled Replanning Checkpoints

To prevent chaotic schedule shifting during study sessions, replanning can only be executed at defined checkpoints:
- `MORNING_PLANNING`: Initial plan generation before the study day begins.
- `AFTER_MAJOR_TEST`: Upon completion of a diagnostic or full mock test.
- `AFTER_STUDY_BLOCK`: When a student completes a scheduled multi-task study block.
- `END_OF_DAY`: Evening reconciliation of completed vs. missed tasks.
- `STUDENT_REQUESTED`: Explicit capacity adjustments initiated by the student.
- `MENTOR_TRIGGERED`: Verified mentor assignments or overrides.
- `EXAM_UPDATE`: Confirmation of official NTA syllabus or exam schedule changes.
