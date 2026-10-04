# Phase 12 — Grounded Final-Mile AI Coach

## 1. Overview

The **Final-Mile AI Coach** (`src/lib/final-mile/final-mile-ai-coach.ts`) provides strategic, psychological, and analytical mentoring grounded directly in the student's empirical simulation data.

---

## 2. Core Guardrails & Invariants

### Strictly Prohibited
- **Predictive Scores**: "You will score 640 in NEET."
- **AIR Estimations**: "Your expected All India Rank is ~3,200."
- **College Guarantees**: "You will definitely get a government MBBS seat."
- **Fabricated Date Claims**: Giving specific dates when NTA has not officially declared the schedule.

### Allowed & Required
- **Descriptive Diagnostics**: "In this simulation, Section B in Chemistry contributed -4 negative marks across 3 unforced guesses."
- **Behavioral Evidence**: "Your median time in Physics was 105 seconds per question, but on the last 15 questions time dropped to 28 seconds with 60% errors, indicating time pressure."
- **Tactical Advice**: "Consider solving Botany and Zoology first (target: 45–50 minutes total) to protect 75+ minutes for Physics numericals."
- **Calmness & Process Focus**: Encourages systematic execution, stress mitigation, and sleep hygiene.

---

## 3. Grounded Prompts & Evidence Injection

The AI Coach consumes structured input from:
1. `ReadinessMatrix`: 9-dimension preparation status.
2. `SimulationResult`: Scores, negative marks, subject breakdown.
3. `TimeAnalytics`: P25, median, P75, P90, hesitation gain/loss.
4. `ActionPlan`: Immediate revision horizons.

The resulting guidance is 100% auditable and reproducible from the underlying database facts.
