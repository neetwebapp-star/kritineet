'use client';

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';

export default function AudioMnemonicsPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(14);
  const [speed, setSpeed] = useState<'1.0x' | '1.25x' | '1.5x' | '2.0x'>('1.25x');
  const [autoLoop, setAutoLoop] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= 38) {
            return autoLoop ? 0 : 38;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, autoLoop]);

  const progressPercent = Math.min(100, Math.round((currentTime / 38) * 100));

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="Audio Mnemonics"
      showBack={true}
      backHref="/ncert"
    >
      <div className="flex flex-col w-full max-w-3xl mx-auto pb-16">
        <div className="flex flex-col w-full relative">
          <div className="relative z-10 w-full flex flex-col bg-surface-container-lowest rounded-t-[28px] shadow-2xl overflow-hidden mt-2">
            {/* Drag Handle & Sheet Header */}
            <div className="flex flex-col items-center pt-3 pb-2 px-space-md">
              <div className="w-12 h-1.5 rounded-full bg-outline-variant/60 mb-3"></div>
              <div className="w-full flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs flex-wrap min-w-0">
                  <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wide font-semibold">
                    38s High-Yield
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                    <StitchIcon name="auto_awesome" className="text-[14px]" size={14} />
                    NEET Rank Booster
                  </span>
                </div>
                <Link
                  href="/ncert/monera-archaebacteria"
                  aria-label="Minimize Audio Player"
                  className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <StitchIcon name="close" className="text-[18px]" size={18} />
                </Link>
              </div>
            </div>

            {/* Scrollable Audio Lesson Body */}
            <div className="px-space-md pb-6 flex flex-col gap-space-md">
              {/* Audio Header & Mentor Identification Card */}
              <div className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low shadow-sm">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm bg-primary-fixed flex items-center justify-center text-primary font-bold text-xl">
                  👨‍⚕️
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                    <StitchIcon name="graphic_eq" className="text-on-secondary text-[10px]" size={10} />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-label-sm text-label-sm text-primary font-semibold">Dr. Sharma • Top Biology Mentor</span>
                    <StitchIcon name="verified" className="text-[14px] text-primary" size={14} fill />
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                    Archaebacteria Extremophile Survival Hook
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Ether Links vs Ester Links • Memory Trick for NEET 2026
                  </p>
                </div>
              </div>

              {/* Waveform Visualizer & Interactive Scrubber */}
              <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm shadow-sm">
                {/* Live Waveform Bars */}
                <div className="h-14 flex items-center justify-between gap-1 px-1 overflow-hidden" id="waveformContainer">
                  {[4, 7, 11, 5, 9, 12, 8, 14, 10, 6, 12, 14, 8, 5, 11, 9, 4, 10, 7, 12, 6, 8, 3, 6].map((h, i) => {
                    const isPassed = i < Math.floor((currentTime / 38) * 24);
                    return (
                      <span
                        key={i}
                        className={`w-1.5 rounded-full transition-all ${
                          isPassed
                            ? 'bg-primary h-' + (h >= 10 ? '12' : '6')
                            : 'bg-outline-variant h-' + (h >= 10 ? '8' : '4')
                        }`}
                        style={{ height: `${h * 3.5}px` }}
                      ></span>
                    );
                  })}
                </div>

                {/* Scrubber Bar */}
                <div
                  className="relative w-full flex items-center cursor-pointer group py-1"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPct = clickX / rect.width;
                    setCurrentTime(Math.round(newPct * 38));
                  }}
                >
                  <div className="w-full h-1.5 bg-outline-variant/40 rounded-full relative overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <div
                    className="absolute -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(53,37,205,0.7)] flex items-center justify-center ring-2 ring-surface-container-lowest transition-all"
                    style={{ left: `${progressPercent}%` }}
                  >
                    <span className="w-1.5 h-1.5 bg-on-primary rounded-full"></span>
                  </div>
                </div>

                {/* Timestamps & Loop Meta */}
                <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant px-0.5">
                  <span className="font-semibold text-primary">0:{currentTime < 10 ? `0${currentTime}` : currentTime}</span>
                  <span className="text-on-surface-variant/70">Remaining -0:{38 - currentTime < 10 ? `0${38 - currentTime}` : 38 - currentTime}</span>
                  <span>0:38</span>
                </div>
              </div>

              {/* High-Yield Mnemonic Rhyme Callout Card */}
              <div className="rounded-xl p-space-md bg-gradient-to-br from-primary-fixed/60 via-surface-container-low to-surface-container-lowest shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary">
                    <StitchIcon name="music_note" className="text-[20px]" size={20} />
                    <span className="font-label-md text-label-md font-bold uppercase tracking-wider">
                      Mnemonic Rhyme • Repeat 3x
                    </span>
                  </div>
                  <button
                    aria-label="Copy mnemonic"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        'Archaea in the BOILING HEATER, Links its chains with resilient ETHER! Normal bacteria dissolve in blister, Bound by breakable bonds of ESTER!'
                      );
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors cursor-pointer"
                  >
                    <StitchIcon name={isCopied ? "check" : "content_copy"} className="text-[15px]" size={15} />
                    <span>{isCopied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                {/* Rhyme Verses */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-space-md rounded-lg shadow-sm flex flex-col gap-1.5 text-on-surface">
                  <p className="font-body-md text-body-md leading-relaxed">
                    🔥 &ldquo;<span className="font-semibold text-primary">Archaea</span> in the{' '}
                    <span className="font-bold underline decoration-primary/40">BOILING HEATER</span>,
                  </p>
                  <p className="font-body-md text-body-md leading-relaxed">
                    Links its chains with resilient{' '}
                    <span className="font-bold text-secondary bg-secondary-container/40 px-1 rounded">ETHER</span>!
                  </p>
                  <p className="font-body-md text-body-md leading-relaxed">Normal bacteria dissolve in blister,</p>
                  <p className="font-body-md text-body-md leading-relaxed">
                    Bound by breakable bonds of{' '}
                    <span className="font-bold text-on-error-container bg-error-container/40 px-1 rounded">ESTER</span>!&rdquo;
                  </p>
                </div>

                {/* Chemical Comparison Matrix Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-start gap-2 shadow-sm">
                    <span className="text-[18px]">♨️</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-secondary font-bold truncate">
                        Archaebacteria = ETHER
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                        C–O–C • Heat-Proof Monolayer
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-start gap-2 shadow-sm">
                    <span className="text-[18px]">🦠</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-error-container font-bold truncate">
                        Eubacteria = ESTER
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                        C–O–C=O • Melts at high temps
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Playback Controls Cluster */}
              <div className="flex flex-col gap-space-sm pt-1">
                <div className="flex items-center justify-between px-space-md">
                  <button
                    aria-label="Rewind 10 seconds"
                    onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                    className="w-12 h-12 rounded-full bg-surface-container flex flex-col items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-90 shadow-sm"
                  >
                    <StitchIcon name="replay_10" className="text-[24px]" size={24} />
                  </button>

                  <div className="relative flex items-center justify-center">
                    {isPlaying && (
                      <>
                        <span className="absolute w-20 h-20 rounded-full bg-primary/15 animate-ping pointer-events-none"></span>
                        <span className="absolute w-16 h-16 rounded-full bg-primary/25 pointer-events-none"></span>
                      </>
                    )}
                    <button
                      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="relative z-10 w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:bg-primary-container active:scale-95 transition-all"
                    >
                      <StitchIcon name={isPlaying ? 'pause' : 'play_arrow'} className="text-[34px]" size={34} />
                    </button>
                  </div>

                  <button
                    aria-label="Forward 10 seconds"
                    onClick={() => setCurrentTime((t) => Math.min(38, t + 10))}
                    className="w-12 h-12 rounded-full bg-surface-container flex flex-col items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-90 shadow-sm"
                  >
                    <StitchIcon name="forward_10" className="text-[24px]" size={24} />
                  </button>
                </div>

                {/* Auxiliary Utilities: Speeds & Auto-loop */}
                <div className="flex items-center justify-between pt-2 px-1">
                  <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full">
                    {(['1.0x', '1.25x', '1.5x', '2.0x'] as const).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSpeed(spd)}
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-all ${
                          speed === spd
                            ? 'bg-primary text-on-primary font-semibold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAutoLoop(!autoLoop)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold hover:bg-primary-fixed transition-colors"
                  >
                    <StitchIcon name="repeat_one" className="text-[16px]" size={16} />
                    <span>Auto-Loop: {autoLoop ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Karaoke-Synced Interactive NCERT Transcript Box */}
              <div className="rounded-xl p-space-md bg-surface-container-low shadow-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <StitchIcon name="record_voice_over" className="text-[16px]" size={16} />
                    <span className="font-label-sm text-label-sm uppercase font-semibold">
                      Live Synced NCERT Reader Line (0:{currentTime < 10 ? `0${currentTime}` : currentTime})
                    </span>
                  </div>
                  <button
                    aria-label="Bookmark this statement"
                    onClick={() => {
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 2500);
                    }}
                    className={`transition-colors cursor-pointer ${
                      savedSuccess ? "text-[#006c49]" : "text-on-surface-variant hover:text-primary"
                    }`}
                    title={savedSuccess ? "Saved to Revision Notes!" : "Bookmark statement"}
                  >
                    <StitchIcon name={savedSuccess ? "bookmark_added" : "bookmark_add"} className="text-[18px]" size={18} />
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm">
                  <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    <span className="bg-primary-fixed text-primary font-semibold px-1 rounded transition-all duration-300">
                      “Remember: NTA tests this distinction in Assertion-Reasoning almost every alternate year.
                    </span>{' '}
                    Whenever you see boiling hydrothermal vents, choose{' '}
                    <strong className="text-on-surface font-semibold">Ether linkages</strong>, NOT peptidoglycan.”
                  </p>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant/80 font-body-sm text-body-sm pt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <StitchIcon name="auto_stories" className="text-[14px]" size={14} />
                    NCERT Class 11 • Chapter 2, Page 19, Para 2
                  </span>
                  <span className="font-code-sm text-code-sm text-secondary font-semibold">98.4% Match Rate</span>
                </div>
              </div>

              {/* Next Immediate Action Buttons */}
              <div className="flex flex-col gap-space-sm pt-2">
                <Link
                  href="/drills/pyq-drill"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition-all font-bold"
                >
                  <StitchIcon name="bolt" className="text-[20px]" size={20} />
                  <span>Take 2017 PYQ Assertion-Reasoning Test</span>
                </Link>

                <Link
                  href="/remediation/saved"
                  className="w-full h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-[0.98] transition-all font-semibold"
                >
                  <StitchIcon name="note_add" className="text-[18px]" size={18} />
                  <span>Save to My Mistake Book / Voice Flashcards</span>
                </Link>

                <Link
                  href="/ncert/monera-archaebacteria"
                  className="w-full py-1 text-center font-label-md text-label-md text-primary hover:underline transition-colors flex items-center justify-center gap-1 font-semibold"
                >
                  <span>Return to NCERT Reader P.19</span>
                  <StitchIcon name="arrow_forward" className="text-[14px]" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
