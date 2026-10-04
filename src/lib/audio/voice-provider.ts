/**
 * NEET AI Tutor / Rabbit Teacher Voice Provider Abstraction
 * Supports Natural Female voices, multilingual modes (English, Hinglish, Hindi),
 * speed regulation, sentence boundary tracking, and viseme/mouth state synchronization.
 */

export type VoiceLanguage = 'english' | 'hinglish' | 'hindi';
export type RabbitMouthState = 'CLOSED' | 'PARTIAL' | 'OPEN';
export type RabbitVisualState = 'IDLE' | 'THINKING' | 'SPEAKING' | 'PAUSED' | 'LOADING' | 'COMPLETED' | 'ERROR';

export interface VoicePlaybackCallbacks {
  onStateChange?: (state: RabbitVisualState) => void;
  onSentenceChange?: (sentenceIndex: number, sentenceText: string) => void;
  onMouthChange?: (mouth: RabbitMouthState) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export class VoiceProvider {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static animationTimer: any = null;
  private static sentenceRanges: Array<{ start: number; end: number; text: string }> = [];

  /**
   * Split a script into sentences preserving punctuation.
   */
  public static splitIntoSentences(text: string): string[] {
    if (!text) return [];
    // Split by sentence terminators: . ? ! । or newline
    const matches = text.match(/[^.!?।\n]+[.!?।\n]*/g);
    return matches ? matches.map((s) => s.trim()).filter((s) => s.length > 0) : [text];
  }

  /**
   * Selects the best natural female voice available in the environment.
   */
  public static getBestFemaleVoice(lang: VoiceLanguage): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const lowerLang = lang.toLowerCase();

    // Priority criteria for natural female voice
    const femaleKeywords = ['female', 'zira', 'samantha', 'victoria', 'karen', 'aria', 'jenny', 'swara', 'kalpana', 'neerja', 'priya'];

    // 1. If Hindi or Hinglish, prioritize Indian English / Hindi female voices
    if (lowerLang === 'hindi' || lowerLang === 'hinglish') {
      const hiFemale = voices.find(
        (v) =>
          (v.lang.startsWith('hi') || v.lang.includes('IN')) &&
          femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      );
      if (hiFemale) return hiFemale;

      const anyHi = voices.find((v) => v.lang.startsWith('hi'));
      if (anyHi) return anyHi;

      const enInFemale = voices.find(
        (v) =>
          v.lang.includes('IN') &&
          femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      );
      if (enInFemale) return enInFemale;
    }

    // 2. English Natural Female Voice (US, UK, IN)
    const naturalFemale = voices.find(
      (v) =>
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online')) &&
        femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
    );
    if (naturalFemale) return naturalFemale;

    const anyFemale = voices.find((v) =>
      femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
    );
    if (anyFemale) return anyFemale;

    // 3. Fallback to English standard voice
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    return enVoice || voices[0];
  }

  /**
   * Speak script with active boundary tracking, mouth animation, and speed control.
   */
  public static speak(
    script: string,
    lang: VoiceLanguage,
    speed: number = 1.0,
    callbacks?: VoicePlaybackCallbacks
  ) {
    if (!this.synth) {
      if (callbacks?.onError) {
        callbacks.onError(new Error('SpeechSynthesis not available'));
      }
      return;
    }

    this.stop();

    if (!script.trim()) return;

    callbacks?.onStateChange?.('THINKING');

    const sentences = this.splitIntoSentences(script);
    let cumulative = 0;
    this.sentenceRanges = sentences.map((s) => {
      const start = script.indexOf(s, cumulative);
      const end = start >= 0 ? start + s.length : cumulative + s.length;
      cumulative = end;
      return { start: Math.max(0, start), end, text: s };
    });

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = Math.max(0.75, Math.min(1.75, speed));
    utterance.pitch = 1.05; // Slightly warmer tone for female mentor

    const voice = this.getBestFemaleVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Boundary events for word & sentence highlighting
    utterance.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name === 'sentence' || e.name === 'word') {
        const charIdx = e.charIndex;
        const currentSentenceIdx = this.sentenceRanges.findIndex(
          (r) => charIdx >= r.start && charIdx <= r.end
        );
        if (currentSentenceIdx >= 0) {
          callbacks?.onSentenceChange?.(
            currentSentenceIdx,
            this.sentenceRanges[currentSentenceIdx].text
          );
        }
      }
    };

    utterance.onstart = () => {
      callbacks?.onStateChange?.('SPEAKING');
      this.startMouthAnimation(callbacks?.onMouthChange);
      if (this.sentenceRanges.length > 0) {
        callbacks?.onSentenceChange?.(0, this.sentenceRanges[0].text);
      }
    };

    utterance.onend = () => {
      this.stopMouthAnimation(callbacks?.onMouthChange);
      callbacks?.onStateChange?.('COMPLETED');
      callbacks?.onEnd?.();
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      this.stopMouthAnimation(callbacks?.onMouthChange);
      callbacks?.onStateChange?.('IDLE');
      callbacks?.onError?.(e);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;

    // Small delay for natural intake before speaking
    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 250);
  }

  public static pause(callbacks?: VoicePlaybackCallbacks) {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.stopMouthAnimation(callbacks?.onMouthChange);
      callbacks?.onStateChange?.('PAUSED');
    }
  }

  public static resume(callbacks?: VoicePlaybackCallbacks) {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.startMouthAnimation(callbacks?.onMouthChange);
      callbacks?.onStateChange?.('SPEAKING');
    }
  }

  public static stop(callbacks?: VoicePlaybackCallbacks) {
    if (this.synth) {
      this.synth.cancel();
      this.stopMouthAnimation(callbacks?.onMouthChange);
      callbacks?.onStateChange?.('IDLE');
      this.currentUtterance = null;
    }
  }

  private static startMouthAnimation(onMouthChange?: (mouth: RabbitMouthState) => void) {
    this.stopMouthAnimation();
    if (!onMouthChange) return;

    let cycle = 0;
    const states: RabbitMouthState[] = ['PARTIAL', 'OPEN', 'PARTIAL', 'CLOSED', 'OPEN', 'PARTIAL', 'CLOSED'];

    this.animationTimer = setInterval(() => {
      const nextState = states[cycle % states.length];
      onMouthChange(nextState);
      cycle++;
    }, 140);
  }

  private static stopMouthAnimation(onMouthChange?: (mouth: RabbitMouthState) => void) {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    if (onMouthChange) {
      onMouthChange('CLOSED');
    }
  }
}
