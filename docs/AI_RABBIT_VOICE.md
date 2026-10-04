# AI Rabbit Teacher Voice Architecture

## 1. Overview
The AI Rabbit Teacher serves as an interactive pedagogical companion for NEET aspirants, delivering concise, high-yield audio capsules directly aligned with NCERT topics. 

## 2. Voice Persona & Linguistic Capabilities
- **Persona**: Warm, encouraging female educator ("Rabbit Ma'am" / "Kriti Didi") speaking with academic clarity and enthusiasm.
- **Language Modes**:
  1. **Hinglish (Default & Recommended)**: Authentic conversational blend used by top NEET educators (e.g. *"Monera kingdom ke organisms primarily prokaryotes hote hain..."*).
  2. **English**: Standard Indian English / International English academic diction.
  3. **Hindi**: Pure Devanagari Hindi academic terminology.

## 3. Implementation Stack
- **Module**: `src/lib/audio/voice-provider.ts`
- **Engine**: Cross-platform Web Speech API (`SpeechSynthesisUtterance`) with heuristic voice matching:
  ```typescript
  const PREFERRED_VOICES = [
    { lang: 'hi-IN', names: ['Swara', 'Kalpana', 'Heera', 'Microsoft Swara Online (Natural)'] },
    { lang: 'en-IN', names: ['Neerja', 'Kavita', 'Microsoft Neerja Online (Natural)'] },
    { lang: 'en-US', names: ['Jenny', 'Zira', 'Samantha', 'Google US English'] }
  ];
  ```
- **Playback Controls**:
  - Play, Pause, Resume, Stop.
  - Variable Playback Speed: `0.75x` (slow & detailed), `1.0x` (standard), `1.25x` (revision pace), `1.5x` (rapid recall).
  - Sentence-level teleprompter synchronization via utterance boundary detection (`onboundary`).

## 4. Voice Generation Pipeline
1. NCERT Topic content is summarized into high-yield NEET exam bullet points.
2. The teleprompter splits paragraphs into sequential sentences.
3. Audio boundaries trigger live sentence highlighting on screen.
4. Viseme mouth open/close animations fire concurrently with sound emission.
