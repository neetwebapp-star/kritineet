# NEET UG 2027 — NCERT Topic DPP Integration

## 1. Architecture

Each topic in the NCERT learning system has a dedicated Daily Practice Problem (DPP) set consisting of 5 to 10 questions.

### Question Sourcing
1. **Direct Topic Match**: Questions tagged directly with `topicId`.
2. **Chapter Augmentation**: If direct topic questions are fewer than 5, questions from the parent chapter are dynamically surfaced to ensure a full 5-10 question drill.
3. **Canonical Provenance**: Questions are sourced strictly from authentic NEET-UG/AIPMT PYQs (2000-2026), MTG NCERT at your Fingertips, and official NCERT Exemplar.

## 2. API Endpoints

### Fetch Questions:
- **Route**: `GET /api/ncert/topic/[id]/dpp`
- **Output**:
  ```json
  {
    "success": true,
    "topicId": "TOPIC_KEBO102_2_1",
    "topicNumber": "2.1",
    "topicTitle": "Kingdom Monera",
    "totalQuestions": 5,
    "questions": [
      {
        "index": 1,
        "id": "Q_...",
        "text": "...",
        "options": [{"key": "A", "text": "..."}, ...],
        "difficulty": "MEDIUM",
        "exam": "NEET-UG 2023"
      }
    ]
  }
  ```

### Submit & Evaluate:
- **Route**: `POST /api/ncert/topic/[id]/dpp/submit`
- **Input**:
  ```json
  {
    "answers": [
      { "questionId": "Q_...", "selectedOption": "A" }
    ]
  }
  ```
- **Actions Performed**:
  1. Validates against `Question.correctOption`.
  2. For incorrect answers, logs into `StudentMistake` with `mistakeType = 'CONCEPTUAL'`.
  3. Updates `TopicProgress` with `dppCompleted = true`, `dppScore = percentage`.
  4. Returns score percentage, per-question correctness, and detailed explanation.
