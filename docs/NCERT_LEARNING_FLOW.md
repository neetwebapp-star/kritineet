# NEET UG 2027 — NCERT Learning Flow Specification

## 1. Topic Learning Loop

Every topic in the platform follows this sequence:

```text
1. NCERT Verbatim Text & Diagrams
        ↓
2. AI Hinglish Conceptual Breakdown
        ↓
3. AI Rabbit Teacher Audio Capsule
        ↓
4. Topic Daily Practice Problem (DPP)
        ↓
5. Instant Evaluation & Explanation
        ↓
6. Mark Topic Complete (Auto-Syncs Timetable)
        ↓
7. Sequential Next Topic Navigation
```

## 2. Chapter Completion Experience

When all topics of a chapter are completed:

```text
🎉 Chapter Completed Modal
        ├── 🗺️ Mind Map (/mindmaps?chapter=...)
        ├── 🗂️ Flashcards (/flashcards?chapter=...)
        ├── 📝 Full Chapter Practice (/practice?chapterId=...)
        ├── 🎯 Fingertips Chapter Test (/tests?chapterId=...)
        └── 🔄 Chapter Spaced Revision (/revision?chapterId=...)
```

## 3. UI Component Structure

- **Stepper Ribbon**: Horizontal scroll showing `2.1 ✓`, `2.2 (active)`, `2.3`, `2.4`.
- **4-Pillar Tabs**:
  - `📖 NCERT Text`: Clean typography, subtopics, callouts, diagrams with click-to-zoom modal, tables.
  - `🧠 AI Explanation`: Hinglish, English, and Hindi language toggles, NEET trap alerts, mnemonics.
  - `🎧 Audio Capsule`: Animated AI Rabbit Teacher with states (`IDLE`, `THINKING`, `SPEAKING`, `PAUSED`, `FINISHED`), 1x/1.25x/1.5x speed control, voice synthesis, teleprompter transcript.
  - `🎯 Topic DPP`: 5-10 question timed quiz, option selection, submit, instant explanation, score analysis.
- **Persistent Bottom Bar**: Prev topic link, DPP launch shortcut, Next topic link (`Next: 2.2 Kingdom Protista →`).
