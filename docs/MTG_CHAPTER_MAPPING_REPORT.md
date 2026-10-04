# MTG Fingertips Chapter-Level Test & Miscellaneous Mapping

## 1. Chapter Test Overview
Upon finishing all topics in an NCERT chapter, the student unlocks the **Chapter Completion Experience**:
- 🎉 Chapter Completed Modal
- Mind Map View
- Flashcards Deck
- Full Chapter Practice
- **Fingertips-Based Chapter Test**

## 2. Ingestion & Test Composition
The MTG Fingertips Chapter Test is composed of advanced NEET questions from the end of each MTG Fingertips chapter:
- **Assertion & Reason (A/R) Questions**: Standard NEET format with 4 standard direction choices.
- **Match the Following**: Matrix matching tables directly assessing NCERT data.
- **HOTS / Exemplar Problems**: High-order thinking skill questions testing multi-concept integration.
- **Exam Archive / PYQ Section**: High-yield NEET trend questions.

## 3. Dedicated Route & Endpoints
- **Frontend Page**: `src/app/ncert/chapter/[id]/test/page.tsx`
  - Clean CBT interface following the Stitch design system (`#f9f9ff` background, `#3525cd` accent).
  - Real-time countdown timer, question palette, review status, and immediate score breakdown.
- **API Endpoints**:
  - `GET /api/ncert/chapter/[id]/fingertips`: Returns 15–25 chapter-level test questions with question types (`ASSERTION_REASON`, `MATCH_FOLLOWING`, `MCQ`).
  - `POST /api/ncert/chapter/[id]/fingertips`: Evaluates submission, computes percentage score, checks pass criteria (>=70%), records mistakes in `StudentMistake`, and updates `StudentChapterProgress`.

## 4. Chapter Test Mapping Status
- **Class 11 Biology Chapters**: Ingested and active across all units.
- **Sample Verified**: Biological Classification (15 authentic questions including Assertion-Reasoning on Methanogens, Cyanobacteria, and Lichens).
- **Error Handling**: Graceful fallback to chapter practice questions if a custom chapter test is pending ingestion.
