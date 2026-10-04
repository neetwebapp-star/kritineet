# Phase 12 — Exam-Day Readiness & Official Checklist Service

## 1. Overview

The **Final Days and Checklist Service** (`src/lib/final-mile/final-days-and-checklist-service.ts`) governs the critical period leading up to and including exam day. It enforces calmness, operational readiness, and compliance with official NTA directives.

---

## 2. Final Days Pacing Stages

The system automatically shifts study cadence based on proximity to the verified exam date:
- **T-7 Days (Pacing & Consolidation)**: No new mocks after T-3. Transition from problem-solving drills to high-yield NCERT formula and diagram review.
- **T-3 Days (Peak Stabilization)**: Light revision only (max 120 minutes/day). Ensure sleep schedule aligns with the NEET examination window (2:00 PM – 5:20 PM IST).
- **T-1 Day (Rest & Protocol Verification)**: Zero heavy problem solving. Verify center location, travel logistics, document preparation, and admit card instructions.
- **Exam Day (Operational Execution)**: Calming reminders, document checklist verification, hydration and nutrition guidance.

---

## 3. Official NTA Checklist Compliance

The system provides an immutable, verified checklist aligned with official National Testing Agency guidelines:
- **Mandatory Documents**:
  - Printed Admit Card (with passport photo affixed as per specifications).
  - Original Government ID (Aadhaar / Passport / Voter ID / PAN Card).
  - Additional passport-size photo for attendance sheet.
  - PwD certificate (if applicable).
  - Self-declaration Undertaking signed in candidate's own handwriting.
- **Dress Code Requirements**:
  - Light clothes with half sleeves, no big buttons or brooches.
  - Slippers / sandals with low heels (shoes are strictly prohibited).
- **Prohibited Items**:
  - Mobile phones, Bluetooth devices, smartwatches, calculators, pens/pouches (NTA supplies standard ballpoint pens at the exam venue).

---

## 4. Official Syllabus & Pattern Updates Integration

Seamlessly integrates with Phase 9 Exam Intelligence:
- Pulls verified NTA updates from `ExamUpdate` table.
- Flags any late-breaking changes in exam center rules, reporting times, or biometric guidelines.
- Displays explicit source URLs and verification stamps to eliminate rumors.
