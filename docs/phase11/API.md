# Phase 11 — Study OS REST API Reference

All Study OS API endpoints enforce strict server-side authentication, tenant scoping, and authorization checks.

---

## 1. Student Daily Execution Endpoints

### `GET /api/student/today`
Returns the complete command center context for the authenticated student for today's date.
- **Query Params**: `userId` (optional in test mode, defaults to authenticated user), `date` (defaults to current date).
- **Response**:
```json
{
  "profile": { "currentPreparationStage": "FOUNDATION", "dailyStudyCapacityMinutes": 180 },
  "plan": { "id": "...", "date": "2027-01-15", "planVersion": 1, "tasks": [...] },
  "dailyBrief": "📋 Daily Preparation Brief ...",
  "health": { "overallStatus": "ON_TRACK", "coveragePercentage": 14.5 }
}
```

### `GET /api/student/plan`
Fetches a specific daily plan.
- **Query Params**: `date` (`YYYY-MM-DD`).

### `GET /api/student/plan/week`
Returns a 7-day schedule grid including planned vs. actual minutes and task counts per day.
- **Query Params**: `startDate` (`YYYY-MM-DD`).

### `POST /api/student/plan/replan`
Triggers an adaptive replan at a controlled checkpoint.
- **Request Body**:
```json
{
  "date": "2027-01-15",
  "checkpoint": "STUDENT_REQUESTED",
  "adjustedCapacityMinutes": 120,
  "triggerEventDescription": "Student evening schedule constraint"
}
```

---

## 2. Study Session Lifecycle Endpoints

### `POST /api/student/tasks/[id]/start`
Starts a live execution session for a scheduled task.
- **Request Body**: `{ "timerPreset": "45_10" }`
- **Response**: `{ "success": true, "session": { "id": "...", "status": "STARTED" } }`

### `POST /api/student/tasks/[id]/pause`
Pauses an active study session.
- **Request Body**: `{ "sessionId": "..." }`

### `POST /api/student/tasks/[id]/resume`
Resumes a paused study session.
- **Request Body**: `{ "sessionId": "..." }`

### `POST /api/student/tasks/[id]/complete`
Completes the study session, records actual minutes, and updates task status to `COMPLETED`.
- **Request Body**: `{ "sessionId": "...", "actualMinutes": 45 }`

### `POST /api/student/tasks/[id]/skip`
Allows a student to skip an `OPTIONAL` task without penalty.
- **Response**: `{ "success": true, "message": "Skipped optional task..." }`

---

## 3. Backlog, Recovery & Analytics Endpoints

### `GET /api/student/backlog`
Retrieves pending preparation backlog items sorted by priority.

### `GET /api/student/recovery`
Retrieves the active multi-day recovery plan and progress.

### `GET /api/student/progress`
Returns multi-dimensional progress: NCERT coverage, PYQ coverage, MTG Fingertips coverage, and preparation health vector.

### `GET /api/student/reviews/weekly`
Generates or retrieves a 7-day retrospective review.

### `GET /api/student/reviews/monthly`
Generates or retrieves a 30-day comprehensive preparation review.

---

## 4. Mentor Command & Oversight Endpoints

### `GET /api/mentor/students/[id]/plan`
Allows an authorized mentor to view an assigned student's study plan.
- **Authorization**: Caller must have role `MENTOR` and be assigned to student `[id]`, or have role `ADMIN`/`SUPER_ADMIN`.

### `POST /api/mentor/students/[id]/plan/override`
Allows an authorized mentor to override or adjust an assigned student's study plan.
- **Request Body**:
```json
{
  "date": "2027-01-15",
  "mentorNote": "Assigning mandatory genetics revision",
  "adjustedCapacityMinutes": 210
}
```
- **Audit**: Generates an immutable `AuditLog` entry with action `MENTOR_OVERRIDE_PLAN`.

---

## 5. Grounded AI Copilot Endpoint

### `POST /api/ai/study-coach`
Processes conversational queries with grounded facts from the deterministic planner.
- **Request Body**: `{ "command": "I only have 90 minutes today", "date": "2027-01-15" }`
- **Response**:
```json
{
  "intent": "CAPACITY_ADJUSTMENT",
  "responseMessage": "I have adjusted your schedule to fit within 90 minutes...",
  "groundedFacts": ["Current plan version: 2", "Total adjusted planned minutes: 90"]
}
```
