# NEET UG 2027 — NCERT Content & Source Material Audit

**Audit Date**: October 2026  
**Auditor**: Antigravity NEET OS Engineering Team  
**Scope**: Complete NCERT Syllabus Ingestion, Provenance, and Structure Verification for Class 11 and Class 12 (Biology, Chemistry, Physics).

---

## 1. Executive Summary

This audit establishes the baseline and inventory of all source assets and database entities supporting the **Kriti NEET NCERT Complete Learning System**. All official NCERT textbook packages for the 2024-25 / 2026-27 rationalised curriculum have been ingested and mapped directly into the relational SQLite/Prisma schema (`prisma/dev.db`).

| Metric | Verified Count | Status |
| :--- | :--- | :--- |
| **Classes Covered** | 2 (Class 11, Class 12) | 100% Complete |
| **Subjects Covered** | 6 (Bio 11, Bio 12, Chem 11, Chem 12, Phys 11, Phys 12) | 100% Complete |
| **NCERT Official Units** | 48 Units | 100% Linked |
| **NCERT Official Chapters** | 79 Chapters | 100% Ingested |
| **NCERT Topics** | 426 Topics | Ingested & Numbered |
| **NCERT Subtopics** | 397 Subtopics | Ingested & Linked |
| **Extracted NCERT Figures** | 3,946 Figures | Persisted in `/public/extracted_figures/` |
| **Extracted NCERT Tables** | 420 High-Yield Tables | Persisted & Linked |
| **Question Bank** | 2,172 Questions (1,875 PYQs, 263 NCERT Exercises, 33 Fingertips) | Verified & Topic Mapped |

---

## 2. Source Material Provenance & Extraction

### Source 1 — Official NCERT Book Packages
Extracted from official NCERT distribution packages (`kebo1dd.zip`, `kech1dd.zip`, `kech2dd.zip`, `keph1dd.zip`, `keph2dd.zip`, `lebo1dd.zip`, `lech1dd.zip`, `lech2dd.zip`, `leph1dd.zip`, `leph2dd.zip`):

1. **Class 11 Biology (`kebo1`)**:
   - Total Chapters: 19 (Ch 1 `The Living World` to Ch 19 `Chemical Coordination and Integration`)
   - Text extracted verbatim with headings, subheadings, figures, tables, and exercises.
2. **Class 11 Chemistry Part 1 & 2 (`kech1`, `kech2`)**:
   - Total Chapters: 9 rationalised chapters (`Some Basic Concepts of Chemistry` to `Hydrocarbons`)
3. **Class 11 Physics Part 1 & 2 (`keph1`, `keph2`)**:
   - Total Chapters: 14 chapters (`Units and Measurement` to `Waves`)
4. **Class 12 Biology (`lebo1`)**:
   - Total Chapters: 13 chapters (`Sexual Reproduction in Flowering Plants` to `Environmental Issues/Ecology`)
5. **Class 12 Chemistry Part 1 & 2 (`lech1`, `lech2`)**:
   - Total Chapters: 10 rationalised chapters (`Solutions` to `Biomolecules`)
6. **Class 12 Physics Part 1 & 2 (`leph1`, `leph2`)**:
   - Total Chapters: 14 chapters (`Electric Charges and Fields` to `Semiconductor Electronics`)

### Source 2 — MTG NCERT at your Fingertips & NEET PYQ Archives
- MTG Objective NCERT at your Fingertips Biology (249 MB)
- MTG Objective NCERT at your Fingertips Chemistry (182 MB)
- MTG Objective NCERT at your Fingertips Physics (210 MB)
- 28 Canonical NEET-UG and AIPMT Question Papers (2000 – 2026)
- Total questions linked to topics for Daily Practice Problems (DPP): 667+ direct links with fallback to chapter-level high-yield questions.

---

## 3. Database Schema Integrity

1. **`ClassLevel`**: 2 records (`CLASS_11`, `CLASS_12`).
2. **`Subject`**: 6 records mapped with foreign keys to `ClassLevel`.
3. **`Unit`**: 48 canonical units created with `unitNumber`, `title`, and `subjectId`.
4. **`Chapter`**: 79 official NCERT chapters with `chapterNumber`, `title`, `slug`, `unitId`, and `ncertBookCode`.
5. **`Topic`**: 426 records with `topicNumber`, `title`, `pageStart`, `pageEnd`, `contentHtml`, `contentMarkdown`, `sourceProvenance`, `hinglishExplanation`, `englishExplanation`, `hindiExplanation`, `audioScriptHinglish`, `audioScriptEnglish`, `audioScriptHindi`.
6. **`Subtopic`**: 397 records with `subtopicNumber`, `title`, and `orderIndex`.
7. **`TopicProgress`**: Tracks student mastery per topic (`status`, `contentRead`, `explanationUsed`, `audioListened`, `dppCompleted`, `dppScore`, `completedAt`).
8. **`DailyStudyTask`**: Integrated with timetable planner via `topicId` and `chapterTitle`.
