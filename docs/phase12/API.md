# Phase 12 — API Reference

## 1. Student Final-Mile Endpoints

### Readiness & Configuration
- **`GET /api/student/final-mile`**
  - Returns current preparation mode, active simulation count, recent readiness snapshots, and days until exam.
- **`GET /api/student/final-mile/readiness`**
  - Evaluates real-time 9-dimension readiness matrix and records an immutable readiness snapshot.
- **`GET /api/student/final-mile/plan`**
  - Fetches the active final revision plan and its structured blocks.
- **`POST /api/student/final-mile/plan`**
  - Generates or updates a capacity-governed final revision plan.

### Simulation Lifecycle
- **`GET /api/student/simulations`**
  - Lists past and upcoming full-length exam simulations.
- **`POST /api/student/final-mile/simulation`**
  - Creates a new full-length 200-question CBT simulation attempt from blueprint.
- **`POST /api/student/final-mile/simulation/[id]/start`**
  - Starts the server-authoritative timer, locks in question snapshots, and returns start token.
- **`GET /api/student/simulations/[id]`**
  - Fetches simulation status, remaining server time, question snapshots, and candidate responses.
- **`POST /api/student/simulations/[id]`**
  - Handles response updates, answer changes (`isAnswerChanged`), heartbeats, and final test submission.

### Simulation Diagnostics
- **`GET /api/student/simulations/[id]/time-analysis`**
  - Returns time distribution, percentiles (P25/Median/P75/P90), hesitation swing, and pacing flags.
- **`GET /api/student/simulations/[id]/review`**
  - Fetches the post-simulation review queue categorized by error type (`WRONG`, `GUESSED`, `SLOW`).
- **`POST /api/student/simulations/[id]/review`**
  - Submits item reviews and adds identified traps to the candidate's personal Error Book.
- **`GET /api/student/simulations/[id]/action-plan`**
  - Returns the personalized 4-horizon revision action plan generated from the attempt.

---

## 2. Mentor & Admin Endpoints

- **`GET /api/mentor/students/[id]/final-mile`**
  - Fetches student readiness matrix, simulation history, and revision pacing.
- **`POST /api/mentor/students/[id]/final-mile`**
  - Allows mentor to override preparation mode or tweak revision daily capacity with required audit justification.
- **`GET /api/admin/final-mile/analytics`**
  - Platform-wide aggregate metrics: distribution of candidates across preparation modes, average simulation completion rates, and psychometric discrimination trends.
