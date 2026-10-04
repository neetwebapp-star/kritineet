# NEET UG 2027 — Audio Capsule & AI Rabbit Teacher Architecture

## 1. Overview

The Audio Capsule provides an auditory learning experience powered by the **AI Rabbit Teacher** character. Aspirants can listen to topic summaries during active revision or on-the-go study sessions.

## 2. Character States

The AI Rabbit Teacher avatar implements 5 distinct states with corresponding visual animations:
1. `IDLE`: Calm posture, waiting for user to start.
2. `THINKING`: Pulsing purple aura, preparing the voice synthesis.
3. `SPEAKING`: Vibrant indigo avatar with animated radial audio wave rings and ear movements.
4. `PAUSED`: Static red pause indicator.
5. `FINISHED`: Green completion checkmark indicator.

## 3. Playback Engine

- Utilizes the browser-native **Web Speech API** (`window.speechSynthesis`) for instantaneous, low-latency playback with zero external API latency or bandwidth costs.
- Speed controls: 1.0x, 1.25x, 1.5x.
- Interactive controls: Play, Pause, Stop, Replay.
- Teleprompter: Real-time script transcript display in Hinglish, English, or Hindi.
