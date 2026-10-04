'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StitchIcon } from './StitchIcon';
import {
  VoiceProvider,
  VoiceLanguage,
  RabbitMouthState,
  RabbitVisualState,
} from '@/lib/audio/voice-provider';

interface AIRabbitTeacherProps {
  topicTitle: string;
  topicNumber: string;
  audioScripts: {
    hinglish: string;
    english: string;
    hindi: string;
  };
  initialLanguage?: VoiceLanguage;
  onTopicCompleteSuggested?: () => void;
}

export function AIRabbitTeacher({
  topicTitle,
  topicNumber,
  audioScripts,
  initialLanguage = 'hinglish',
  onTopicCompleteSuggested,
}: AIRabbitTeacherProps) {
  // Voice & State
  const [lang, setLang] = useState<VoiceLanguage>(initialLanguage);
  const [speed, setSpeed] = useState<number>(1.0);
  const [state, setState] = useState<RabbitVisualState>('IDLE');
  const [mouth, setMouth] = useState<RabbitMouthState>('CLOSED');
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);

  // Blinking cycle
  const [isBlinking, setIsBlinking] = useState(false);

  // Current script
  const currentScript =
    lang === 'hinglish'
      ? audioScripts.hinglish
      : lang === 'hindi'
      ? audioScripts.hindi
      : audioScripts.english;

  // Extract sections and clean sentences for teleprompter
  const { cleanSentences, sections } = React.useMemo(() => {
    const rawSentences = VoiceProvider.splitIntoSentences(currentScript);
    const secList: { title: string; startIndex: number }[] = [];
    const cleaned: string[] = [];

    rawSentences.forEach((raw) => {
      const secMatch = raw.match(/\[SECTION\s*(?:[A-Za-z0-9\.]+)?\s*:\s*([^\]]+)\]/i);
      if (secMatch) {
        secList.push({
          title: secMatch[1].trim(),
          startIndex: cleaned.length,
        });
        const clean = raw.replace(/\[SECTION\s*(?:[A-Za-z0-9\.]+)?\s*:\s*[^\]]+\]/gi, '').trim();
        if (clean) cleaned.push(clean);
      } else {
        cleaned.push(raw);
      }
    });

    return { cleanSentences: cleaned, sections: secList };
  }, [currentScript]);

  const currentSectionIndex = React.useMemo(() => {
    if (!sections.length) return 0;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (activeSentenceIndex >= sections[i].startIndex) {
        return i;
      }
    }
    return 0;
  }, [sections, activeSentenceIndex]);

  const sentences = cleanSentences.length > 0 ? cleanSentences : [currentScript];

  // Handle blink timer
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Stop speech when unmounting or switching language
  useEffect(() => {
    return () => {
      VoiceProvider.stop();
    };
  }, []);

  useEffect(() => {
    VoiceProvider.stop();
    setState('IDLE');
    setMouth('CLOSED');
    setActiveSentenceIndex(0);
  }, [lang]);

  const handlePlay = () => {
    if (state === 'PAUSED') {
      VoiceProvider.resume({
        onStateChange: setState,
        onMouthChange: setMouth,
      });
      return;
    }

    VoiceProvider.speak(currentScript, lang, speed, {
      onStateChange: setState,
      onSentenceChange: (idx) => {
        setActiveSentenceIndex(idx);
      },
      onMouthChange: setMouth,
      onEnd: () => {
        setState('COMPLETED');
        if (onTopicCompleteSuggested) {
          onTopicCompleteSuggested();
        }
      },
      onError: () => {
        setState('IDLE');
      },
    });
  };

  const handlePause = () => {
    VoiceProvider.pause({
      onStateChange: setState,
      onMouthChange: setMouth,
    });
  };

  const handleStop = () => {
    VoiceProvider.stop({
      onStateChange: setState,
      onMouthChange: setMouth,
    });
    setActiveSentenceIndex(0);
  };

  const handleSpeedCycle = () => {
    const next = speed === 0.75 ? 1.0 : speed === 1.0 ? 1.25 : speed === 1.25 ? 1.5 : 0.75;
    setSpeed(next);
    // If currently speaking, restart with new speed
    if (state === 'SPEAKING') {
      VoiceProvider.speak(currentScript, lang, next, {
        onStateChange: setState,
        onSentenceChange: (idx) => setActiveSentenceIndex(idx),
        onMouthChange: setMouth,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e9edff] shadow-xs space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#f1f3ff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center shadow-xs">
            <StitchIcon name="headphones" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-base sm:text-lg text-[#141b2b]">
                AI Rabbit Teacher — Audio Capsule
              </h3>
              <span className="text-[10px] font-bold bg-[#e2dfff] text-[#3525cd] px-2 py-0.5 rounded-full">
                Natural Female Voice
              </span>
            </div>
            <p className="text-xs text-[#777587]">
              Topic {topicNumber}: {topicTitle} • Grounded Conceptual Explanation
            </p>
          </div>
        </div>

        {/* Speed & Language Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Button */}
          <button
            onClick={handleSpeedCycle}
            className="bg-[#f1f3ff] hover:bg-[#e2dfff] text-[#3525cd] px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-[#e1e8fd] shadow-2xs"
            title="Cycle Voice Speed"
          >
            {speed}x Speed
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#f1f3ff] p-1 rounded-xl border border-[#e1e8fd]">
            <button
              onClick={() => setLang('hinglish')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'hinglish'
                  ? 'bg-white text-[#3525cd] shadow-2xs'
                  : 'text-[#464555] hover:text-[#3525cd]'
              }`}
            >
              Hinglish
            </button>
            <button
              onClick={() => setLang('english')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'english'
                  ? 'bg-white text-[#3525cd] shadow-2xs'
                  : 'text-[#464555] hover:text-[#3525cd]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hindi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'hindi'
                  ? 'bg-white text-[#3525cd] shadow-2xs'
                  : 'text-[#464555] hover:text-[#3525cd]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-gradient-to-b from-[#f4f6ff] via-[#edf2fe] to-[#e4eaff] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-[#d6def7] relative overflow-hidden">
        {/* Animated Sonic Rings during speaking */}
        {state === 'SPEAKING' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full bg-[#3525cd]/10 animate-ping" />
            <div className="w-72 h-72 rounded-full border border-[#3525cd]/20 animate-pulse" />
          </div>
        )}

        {/* Rabbit Character Canvas & Avatar */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 shadow-xl transition-all duration-300 relative ${
              state === 'SPEAKING'
                ? 'ring-4 ring-[#3525cd] shadow-[#3525cd]/30 scale-105'
                : state === 'THINKING'
                ? 'ring-4 ring-[#ff9100] shadow-[#ff9100]/20 animate-pulse'
                : state === 'PAUSED'
                ? 'ring-4 ring-[#ba1a1a]/50'
                : 'ring-2 ring-white/80'
            }`}
            style={{
              background: 'radial-gradient(circle, #ffffff 40%, #e2e8fd 100%)',
            }}
          >
            {/* The Authentic Rabbit Reference Asset */}
            <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-sky-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/rabbit-teacher.webp"
                alt="AI Rabbit Teacher"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  state === 'SPEAKING'
                    ? 'scale-110'
                    : state === 'THINKING'
                    ? 'scale-100 rotate-[-2deg]'
                    : 'scale-105'
                }`}
              />

              {/* Dynamic Lip-Sync Mouth Overlay */}
              {state === 'SPEAKING' && (
                <div className="absolute bottom-[28%] left-[49%] transform -translate-x-1/2 pointer-events-none transition-all duration-100">
                  {mouth === 'OPEN' && (
                    <div className="w-4 h-3.5 bg-[#8b263e] rounded-full border-2 border-[#ff80ab] shadow-inner" />
                  )}
                  {mouth === 'PARTIAL' && (
                    <div className="w-3.5 h-2 bg-[#9c2d47] rounded-full border border-[#ff80ab]" />
                  )}
                  {mouth === 'CLOSED' && (
                    <div className="w-2.5 h-0.5 bg-[#4a1525] rounded-full" />
                  )}
                </div>
              )}

              {/* Blinking Overlay */}
              {isBlinking && (
                <div className="absolute top-[38%] left-[32%] right-[32%] h-4 flex justify-between pointer-events-none px-2">
                  <span className="w-4 h-1 bg-[#6d503b] rounded-full" />
                  <span className="w-4 h-1 bg-[#6d503b] rounded-full" />
                </div>
              )}
            </div>

            {/* Subtle State Badge floating on avatar edge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border border-[#e9edff] flex items-center justify-center text-[#3525cd]">
              {state === 'SPEAKING' && (
                <span className="w-3 h-3 rounded-full bg-[#00c853] animate-ping" />
              )}
              {state === 'THINKING' && (
                <StitchIcon name="psychology" size={17} className="animate-spin text-[#ff9100]" />
              )}
              {state === 'PAUSED' && (
                <StitchIcon name="pause" size={16} className="text-[#ba1a1a]" />
              )}
              {state === 'COMPLETED' && (
                <StitchIcon name="check_circle" size={18} className="text-[#006c49]" />
              )}
              {state === 'IDLE' && (
                <StitchIcon name="volume_up" size={16} className="text-[#3525cd]" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-3.5 inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-bold text-[#141b2b] shadow-2xs border border-[#e9edff]">
            <span
              className={`w-2 h-2 rounded-full ${
                state === 'SPEAKING'
                  ? 'bg-[#00c853]'
                  : state === 'THINKING'
                  ? 'bg-[#ff9100]'
                  : state === 'PAUSED'
                  ? 'bg-[#ba1a1a]'
                  : state === 'COMPLETED'
                  ? 'bg-[#006c49]'
                  : 'bg-[#9e9e9e]'
              }`}
            />
            <span>
              {state === 'IDLE' && 'Ready to explain in Natural Voice'}
              {state === 'THINKING' && 'Synthesizing teacher audio...'}
              {state === 'SPEAKING' && 'Explaining Topic Concept'}
              {state === 'PAUSED' && 'Audio Paused'}
              {state === 'COMPLETED' && 'Topic Audio Complete! ✓'}
            </span>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-3.5 mt-5">
            <button
              onClick={handleStop}
              className="w-10 h-10 rounded-full bg-white text-[#ba1a1a] flex items-center justify-center shadow-xs border border-[#e9edff] hover:bg-[#fff0f0] active:scale-95 transition-all"
              title="Stop Audio"
            >
              <StitchIcon name="stop" size={18} />
            </button>

            {state === 'SPEAKING' ? (
              <button
                onClick={handlePause}
                className="w-14 h-14 rounded-full bg-[#3525cd] text-white flex items-center justify-center shadow-md hover:bg-[#2b1ea8] active:scale-95 transition-all"
                title="Pause"
              >
                <StitchIcon name="pause" size={26} />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="w-14 h-14 rounded-full bg-[#3525cd] text-white flex items-center justify-center shadow-md hover:bg-[#2b1ea8] active:scale-95 transition-all"
                title="Play Audio"
              >
                <StitchIcon name="play_arrow" size={28} />
              </button>
            )}

            <button
              onClick={handlePlay}
              className="w-10 h-10 rounded-full bg-white text-[#3525cd] flex items-center justify-center shadow-xs border border-[#e9edff] hover:bg-[#f1f3ff] active:scale-95 transition-all"
              title="Restart from beginning"
            >
              <StitchIcon name="replay" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Spoken Script Transcript with Active Sentence Tracking */}
      <div className="bg-[#f9f9ff] rounded-2xl p-5 border border-[#e9edff] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#f1f3ff]">
          <div className="flex items-center gap-2">
            <StitchIcon name="description" size={16} className="text-[#3525cd]" />
            <span className="text-xs font-bold text-[#777587] uppercase tracking-wider">
              Spoken Script Transcript ({lang.toUpperCase()})
            </span>
          </div>
          <span className="text-xs text-[#777587]">
            {sentences.length} Sentences • Active Teleprompter
          </span>
        </div>

        {/* Section Navigation Ribbon */}
        {sections.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {sections.map((sec, idx) => {
              const isActive = idx === currentSectionIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSentenceIndex(sec.startIndex);
                    if (state !== 'SPEAKING') {
                      handlePlay();
                    }
                  }}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-2xs'
                      : 'bg-white text-[#464555] border-[#e9edff] hover:bg-[#f1f3ff]'
                  }`}
                >
                  {sec.title}
                </button>
              );
            })}
          </div>
        )}

        <div className="text-sm leading-relaxed text-[#141b2b] space-y-2 max-h-60 overflow-y-auto pr-1">
          {sentences.map((sent, sIdx) => {
            const isCurrent = state === 'SPEAKING' && sIdx === activeSentenceIndex;

            return (
              <span
                key={sIdx}
                className={`inline-block mr-1.5 transition-all duration-200 rounded px-1.5 py-0.5 ${
                  isCurrent
                    ? 'bg-[#e2dfff] text-[#3525cd] font-bold shadow-2xs ring-1 ring-[#3525cd]/40'
                    : 'text-[#464555]'
                }`}
              >
                {sent}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
