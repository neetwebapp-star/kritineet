# AI Rabbit Teacher Lip-Sync & Animation System

## 1. Design & Character Asset
- **Asset**: `public/images/rabbit-teacher.webp` (adapted faithfully from the reference character specification).
- **Component**: `src/components/stitch/AIRabbitTeacher.tsx`.
- **Character Traits**: White rabbit in study apparel with round wireframe glasses, expressive ears, and animated face features.

## 2. Animation States & Visemes
The animation engine synchronizes facial states with the audio playback clock:

### A. Lip-Sync / Mouth States (`MouthState`)
- `CLOSED`: Neutral, slight warm smile when idle or during pauses.
- `PARTIAL`: Half-open mouth used for soft consonants and transition syllables.
- `OPEN`: Fully open mouth used for vowel sounds (`A`, `O`, `E`) during active speech.
- **Timing**:
  - Speech viseme switching occurs dynamically every 110ms – 160ms while audio is active.
  - State transitions follow rhythmic syllabic cadence (`CLOSED -> PARTIAL -> OPEN -> PARTIAL -> CLOSED`).

### B. Natural Idle Behaviors
- **Blinking**: Procedural timer triggers eye-blink every 3.5 to 5.5 seconds, creating life-like engagement.
- **Ear Movements**: Subtle CSS tilt oscillations (±2.5deg) simulate alert listening.
- **Aura & Audio Waves**: Triple expanding concentric pulse rings around the avatar during speech, indicating sound output visually even if user has system audio muted.

## 3. Teleprompter & Visual Sync
- The teleprompter displays the current script sentence in high-contrast purple text (`#3525cd`) with soft indigo background.
- Prior sentences fade softly, and upcoming sentences remain dimmed until reached.
- Speed slider controls both audio delivery rate and lip-sync cycle frequency.
