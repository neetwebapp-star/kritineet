# NCERT Topic Practice Report

## 1. Practice Hierarchy within Each Topic
Every topic in the NCERT reader contains a dual-tier practice framework:
1. **Tier 1: Daily Practice Problems (DPP)**
   - 5 foundational NCERT line-by-line questions.
   - Immediate feedback with solution explanation.
   - Purpose: Ensure student understands the basic text before proceeding.
2. **Tier 2: MTG NCERT at your Fingertips Practice**
   - 5–10 authentic NEET exam-level questions extracted from MTG Fingertips.
   - Higher difficulty, analytical framing, negative marking (+4 / -1) mindset.
   - Integrated into the dedicated `📚 MTG Practice` tab.

## 2. Topic Practice Data Pipeline
```mermaid
flowchart TD
    StudentTopic[Student on Topic Page] --> SelectTab{Choose Tab}
    SelectTab -->|DPP Tab| LoadDPP[GET /api/ncert/topic/id/dpp]
    SelectTab -->|MTG Tab| LoadMTG[GET /api/ncert/topic/id/fingertips]
    LoadDPP --> SubmitDPP[POST /api/ncert/topic/id/dpp/submit]
    LoadMTG --> SubmitMTG[POST /api/ncert/topic/id/fingertips]
    SubmitDPP --> SaveProgress[Update StudentTopicProgress]
    SubmitMTG --> SaveMistakes[Record in StudentMistake Table]
    SaveProgress --> CheckComplete{All Topics in Chapter Done?}
    CheckComplete -->|Yes| TriggerCelebration[🎉 Show Chapter Completed Modal]
    CheckComplete -->|No| NextTopicBtn[Enable Next Topic Button]
```

## 3. Analytics & Mistake Tracking
- Incorrect selections are logged into the student's personal mistake notebook (`StudentMistake`).
- Each recorded mistake captures:
  - `questionId`
  - `selectedOption` vs `correctOption`
  - `explanation`
  - `conceptId`
- Mistakes feed directly into the spaced repetition flashcards and revision planner.
