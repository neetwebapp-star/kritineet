# Phase 12 — Full Exam Simulation Engine

## 1. Overview

The **Exam Simulation Engine** (`src/lib/final-mile/exam-simulation-engine.ts`) implements high-fidelity computer-based testing mirroring the exact NEET UG examination pattern.

### NEET Pattern Compliance
- **Total Duration**: 200 minutes (3 hours 20 minutes).
- **Total Questions**: 200 questions across 4 subjects (Physics, Chemistry, Botany, Zoology).
- **Section Structure**:
  - **Section A**: 35 compulsory questions per subject.
  - **Section B**: 15 optional questions per subject (student must attempt any 10).
- **Marking Scheme**:
  - Correct: `+4`
  - Incorrect: `-1`
  - Unattempted / Over-attempted in Section B: `0`
- **Total Maximum Score**: 720 marks.

---

## 2. Server-Authoritative Timer & Heartbeat

Client devices cannot manipulate the exam clock.
1. **Start Timestamp**: Recorded on the server upon attempt initialization (`startTime`).
2. **Server Expiration**: `endTime = startTime + (durationMinutes * 60 * 1000)`.
3. **Heartbeat Loop**: Client transmits ping every 30 seconds (`POST /api/student/simulations/[id]` action `heartbeat`).
4. **Interruption Recovery**: If network drops or browser crashes, reopening the simulation restores remaining time based strictly on server clock (`Math.max(0, endTime - Date.now())`).
5. **Auto-Submission**: When server `Date.now() >= endTime`, attempts are automatically finalized and sealed.

---

## 3. Question Snapshot Freezing

To preserve complete auditability and prevent post-hoc changes to question text or answer keys:
- Every question presented in an exam simulation is frozen into a `SimulationQuestionSnapshot`.
- Captures:
  - Exact question text & options at test instant
  - Correct option ID
  - Subject, Section (A or B), question index
  - Concept & Chapter tags
- Guarantees historical consistency even if underlying question records in Phase 3/10 are later edited or retired.

---

## 4. Response Tracking & Answer Hesitation

The simulation engine captures micro-behaviors for psychometric analysis:
- `originalAnswer`: The first option picked by the candidate.
- `finalAnswer`: The final option submitted.
- `isAnswerChanged`: Boolean flag indicating decision switches.
- `confidenceLevel`: Candidate self-declared confidence (`SURE`, `CONFIDENT`, `DOUBTFUL`, `WILD_GUESS`).
- `timeSpentSeconds`: Total time spent on each individual question item.
