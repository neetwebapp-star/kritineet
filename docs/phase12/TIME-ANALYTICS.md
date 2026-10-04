# Phase 12 — Simulation Time & Pressure Analytics

## 1. Overview

The **Simulation Analytics Engine** (`src/lib/final-mile/simulation-analytics-engine.ts`) calculates descriptive, evidence-based metrics from student simulation attempts. It avoids speculative rank predictions and focuses on behavioral diagnostics.

---

## 2. Time Distribution & Percentiles

Calculates granular time statistics across the attempt:
- **Median Time**: Middle value of time spent on questions.
- **P25 (Fast quartile)**: Questions solved with high automaticity.
- **P75 (Deliberation threshold)**: Questions requiring deeper cognitive load.
- **P90 (Slow outlier threshold)**: Potential time sinks that jeopardize section pacing.

### Time Pressure Detection
- Flags questions where time spent exceeds 2.5x the subject median.
- Detects end-of-test rushing (unusually low time on last 15-20 questions with high error rate).
- Classifies pacing into descriptive labels: `BALANCED`, `RUSHED_AT_END`, `STALLED_IN_PHYSICS`, `ERRATIC`.

---

## 3. Answer Switching & Hesitation Analysis

Tracks candidate response adjustments:
- **Switch Frequency**: Percentage of questions where `isAnswerChanged === true`.
- **Switch Impact**:
  - `WRONG -> RIGHT`: Positive switch (+5 mark swing: avoids -1, gains +4).
  - `RIGHT -> WRONG`: Negative switch (-5 mark loss: loses +4, incurs -1).
  - `WRONG -> WRONG`: Neutral mark outcome (-1 maintained).
- **Net Answer Switch Gain**: Net marks gained or lost solely due to changing answers. Provides actionable guidance on candidate intuition reliability.

---

## 4. Confidence Calibration & Error Taxonomy

Cross-references candidate confidence against actual correctness:
- **Overconfident Errors**: High confidence, incorrect answer (suggests misconception or trap).
- **Underconfident Hits**: Low confidence, correct answer (indicates ungrounded guessing or lack of self-trust).
- **Calibration Score**: Correlation between subjective confidence and objective outcome.
- **Negative Mark Traps**: Identifies specific chapters/concepts responsible for the majority of `-1` penalties.
