# NEET UG 2027 — Timetable & Study Planner Integration

## 1. Dual-Directional Synchronization

The NCERT learning flow is bi-directionally connected to the student's daily study planner and timetable:

1. **Planner to NCERT**:
   - Tasks scheduled in the Timetable Planner (`/planner`) have direct route links (e.g., `/ncert/topic/2.1` or `/ncert/monera-archaebacteria`).
   - Clicking "Resume" or "Start" navigates the student directly to the exact NCERT learning node.

2. **NCERT to Planner**:
   - When a student completes a topic (either via clicking "Mark Completed" or submitting the Topic DPP), the endpoint `POST /api/ncert/topic/[id]/complete` automatically searches for any pending `DailyStudyTask` matching:
     - `topicId`
     - `chapterTitle`
     - `routeUrl` containing the topic ID
   - Matching tasks are automatically marked `status = 'COMPLETED'` and timestamped with `completedAt = new Date()`.
   - The student's streak and daily completion percentage update automatically without requiring manual ticking.
