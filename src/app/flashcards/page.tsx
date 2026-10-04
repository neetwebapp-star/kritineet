'use client';

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';

export default function FlashcardsDeckPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(3); // 0-indexed, so Card 4
  const [isFlipped, setIsFlipped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isPronouncing, setIsPronouncing] = useState(false);
  const [srsStatus, setSrsStatus] = useState('Ready to record');

  const cards = [
    {
      id: 1,
      tag: 'Monera Extremophiles',
      prompt: 'What unique cell wall & membrane composition enables Archaebacteria to survive extreme boiling hydrothermal vents and hypersaline marshes?',
      hint: 'Recall difference in linkage bonds: Ether vs Ester bonds in extremophiles.',
      answer: 'Branched-chain ether lipids in cell membrane & pseudomurein in cell wall. Completely lacks true peptidoglycan.',
      mnemonic: 'M-E-T-H-A-N-O: Ether-linked Thermo-tolerant Hydrocarbon tails resist heat denaturation!',
      trap: 'Eubacteria contain peptidoglycan with NAM & NAG. Never confuse Archaebacteria cell walls with plant cellulose or fungal chitin!',
      years: ['NEET 2021', 'NEET 2017', 'AIPMT 2014'],
    },
    {
      id: 2,
      tag: 'Cyanobacteria Heterocysts',
      prompt: 'Under what specific physiological micro-environment does the enzyme nitrogenase function inside Nostoc heterocysts?',
      hint: 'Oxygen sensitivity of nitrogenase enzyme.',
      answer: 'Strictly anaerobic micro-environment created by thick impermeable cell walls and lack of Photosystem II (no O₂ evolution).',
      mnemonic: 'N-O-S-T-O-C: No Oxygen System Tolerated for Nitrogenase Operation in Cells!',
      trap: 'Heterocysts possess Photosystem I for ATP synthesis via cyclic photophosphorylation, but LACK PS II!',
      years: ['NEET 2020', 'NEET 2018', 'NEET 2015'],
    },
    {
      id: 3,
      tag: 'Diatoms & Chrysophytes',
      prompt: 'Why are diatom cell walls practically indestructible, and what economic geological deposit do they form over billions of years?',
      hint: 'Silica deposition in overlapping soap-box shells.',
      answer: 'Cell walls are embedded with silica (SiO₂) forming two overlapping halves that fit like a soap box, forming Diatomaceous Earth.',
      mnemonic: 'D-I-A-T-O-M: Double Insoluble Armor of Transparent Oxide Mineral (Silica)!',
      trap: 'Diatomaceous earth is gritty, used in polishing and oil filtration, NOT as a commercial fertilizer!',
      years: ['NEET 2019', 'NEET 2016', 'NEET 2013'],
    },
    {
      id: 4,
      tag: 'Mycoplasma Exceptions',
      prompt: 'Why are Mycoplasma inherently resistant to penicillin and cephalosporin antibiotics?',
      hint: 'Target of beta-lactam antibiotics.',
      answer: 'Mycoplasma completely lack a cell wall (the target of beta-lactam antibiotics which inhibit peptidoglycan synthesis).',
      mnemonic: 'M-Y-C-O: Minus Yearly Cell-wall Outer layer!',
      trap: 'Mycoplasma are bacteria, NOT viruses, and can survive completely in the absence of oxygen!',
      years: ['NEET 2022', 'NEET 2017', 'NEET 2011'],
    },
  ];

  const card = cards[currentCardIndex % cards.length];

  const handleSrsRate = (rating: string) => {
    setSrsStatus(`Logged: ${rating.toUpperCase()} (Saving...)`);
    setTimeout(() => {
      setSrsStatus('Next card queued');
      setIsFlipped(false);
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    }, 400);
  };

  const handlePronounce = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = isFlipped ? card.answer : card.prompt;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPronouncing(false);
      utterance.onerror = () => setIsPronouncing(false);
      setIsPronouncing(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPronouncing(true);
      setTimeout(() => setIsPronouncing(false), 1200);
    }
  };

  const handleShuffleToggle = () => {
    setIsShuffled((prev) => !prev);
    const randomIdx = Math.floor(Math.random() * cards.length);
    setCurrentCardIndex(randomIdx);
    setIsFlipped(false);
  };

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="Flashcards Deck"
      showBack={true}
      backHref="/ncert"
    >
      <div className="flex flex-col w-full max-w-4xl mx-auto space-y-6 pb-16">
        <div className="flex flex-col w-full">
          {/* Top Session Meta Strip */}
          <section className="px-gutter pt-space-md flex flex-col gap-space-sm mt-2">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                  <StitchIcon name="psychology" className="text-[14px]" size={14} />
                  Box 2 • Next: 3 Days
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                  <StitchIcon name="local_fire_department" className="text-[13px] text-error" size={13} />
                  8x in NEET/AIPMT
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {currentCardIndex + 1 < 10 ? `0${currentCardIndex + 1}` : currentCardIndex + 1}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">/ 20</span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div aria-label="Deck progression" className="flex items-center gap-1 w-full pt-1">
              {[...Array(20)].map((_, i) => {
                const isMastered = i < currentCardIndex;
                const isCurrent = i === currentCardIndex;
                return (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-primary ring-2 ring-primary-fixed ring-offset-1'
                        : isMastered
                        ? 'bg-secondary'
                        : 'bg-surface-container-highest'
                    }`}
                  ></div>
                );
              })}
            </div>

            {/* Syllabus Context & Tag Strip */}
            <div className="flex items-center gap-space-xs overflow-x-auto py-0.5 no-scrollbar">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
                Monera vs Protista
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
                Cell Wall Chemistry
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm whitespace-nowrap font-medium">
                <StitchIcon name="menu_book" className="text-[13px] mr-1" size={13} />NCERT Page 19
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm whitespace-nowrap font-semibold">
                3 Mastered • 1 Needs Review
              </span>
            </div>
          </section>

          {/* Interactive 3D Card Stage */}
          <section className="px-gutter pt-space-md flex flex-col items-center">
            <div className="relative w-full">
              <div
                className="w-full bg-surface-container-lowest rounded-xl shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Top Status Bar within Card */}
                <div className="px-space-lg pt-space-md pb-space-xs flex items-center justify-between bg-surface-container-low/50">
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm tracking-wide font-bold">
                      NCERT FACT CHECK
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase font-semibold">
                      Exception
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Listen question voiceover"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePronounce();
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-all ${
                        isPronouncing ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      <StitchIcon name={isPronouncing ? 'graphic_eq' : 'volume_up'} className="text-[18px]" size={18} />
                    </button>
                    <button
                      aria-label="Save card to Mistake Book"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBookmarked(!isBookmarked);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:scale-90 transition-all"
                    >
                      <StitchIcon name={isBookmarked ? 'bookmark' : 'bookmark_border'} className={`text-[18px] ${isBookmarked ? 'text-primary' : ''}`} size={18} fill />
                    </button>
                  </div>
                </div>

                {!isFlipped ? (
                  /* FRONT SIDE CONTENT */
                  <div className="px-space-lg pt-space-md pb-space-lg flex flex-col justify-between" id="card-front">
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                          Concept Prompt #{currentCardIndex + 1 < 10 ? `0${currentCardIndex + 1}` : currentCardIndex + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold">
                          <StitchIcon name="auto_stories" className="text-[14px]" size={14} />
                          Para 2.1.1
                        </span>
                      </div>
                      <p className="font-headline-md text-headline-md text-on-surface leading-snug font-bold">
                        {card.prompt}
                      </p>
                      <div className="flex items-center gap-2 p-space-sm rounded-lg bg-surface-container-low text-on-surface-variant">
                        <StitchIcon name="lightbulb" className="text-primary text-[18px]" size={18} />
                        <p className="font-body-sm text-body-sm">{card.hint}</p>
                      </div>
                    </div>

                    <div className="pt-space-xl flex flex-col items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(true);
                        }}
                        className="w-full py-3 px-space-md rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-md active:scale-98 transition-all hover:bg-primary font-bold"
                      >
                        <StitchIcon name="flip" className="text-[20px]" size={20} />
                        <span>Tap to Reveal Answer</span>
                      </button>
                      <span className="mt-2 font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 font-medium">
                        <StitchIcon name="touch_app" className="text-[14px]" size={14} /> Double tap card anywhere to flip
                      </span>
                    </div>
                  </div>
                ) : (
                  /* BACK SIDE CONTENT */
                  <div className="px-space-lg pt-space-md pb-space-lg flex flex-col gap-space-md bg-surface-container-lowest" id="card-back">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                        <StitchIcon name="check_circle" className="text-[14px]" size={14} />
                        High-Yield Verified
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(false);
                        }}
                        className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm hover:text-primary font-semibold"
                      >
                        <StitchIcon name="replay" className="text-[16px]" size={16} /> Question
                      </button>
                    </div>

                    <div className="p-space-md rounded-lg bg-surface-container text-on-surface">
                      <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider block mb-1">
                        Definitive NCERT Answer
                      </span>
                      <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">{card.answer}</p>
                    </div>

                    <div className="p-space-md rounded-lg bg-primary-fixed text-on-primary-fixed flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <StitchIcon name="psychology" className="text-[18px] text-primary" size={18} />
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">Kriti Rapid Mnemonic</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{card.mnemonic}</p>
                    </div>

                    <div className="p-space-md rounded-lg bg-error-container text-on-error-container flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <StitchIcon name="warning" className="text-[18px] text-error" size={18} />
                        <span className="font-headline-sm text-headline-sm text-error font-bold">NTA NEET Trap Alert</span>
                      </div>
                      <p className="font-body-sm text-body-sm font-medium">{card.trap}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-label-sm text-label-sm text-on-surface-variant mr-1 font-medium">Appeared in:</span>
                      {card.years.map((y, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm font-semibold">
                          {y}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SRS Feedback Action Section */}
          <section className="px-gutter pt-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Rate recall accuracy for SM-2 scheduling:
              </span>
              <span className="font-label-sm text-label-sm text-primary font-bold" id="srs-status-pill">
                {srsStatus}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-space-xs">
              <button
                onClick={() => handleSrsRate('again')}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-error-container text-on-error-container hover:shadow-md active:scale-95 transition-all text-center"
              >
                <span className="font-headline-sm text-headline-sm text-error leading-tight font-bold">Again</span>
                <span className="font-code-sm text-code-sm text-on-error-container opacity-80 mt-0.5">&lt; 1 min</span>
                <span className="w-1.5 h-1.5 rounded-full bg-error mt-1"></span>
              </button>
              <button
                onClick={() => handleSrsRate('hard')}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-high text-on-surface hover:shadow-md active:scale-95 transition-all text-center"
              >
                <span className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">Hard</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant mt-0.5">12 hrs</span>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1"></span>
              </button>
              <button
                onClick={() => handleSrsRate('good')}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-primary-fixed text-on-primary-fixed hover:shadow-md active:scale-95 transition-all text-center"
              >
                <span className="font-headline-sm text-headline-sm text-primary leading-tight font-bold">Good</span>
                <span className="font-code-sm text-code-sm text-on-primary-fixed-variant mt-0.5">1 day</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></span>
              </button>
              <button
                onClick={() => handleSrsRate('easy')}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-secondary-container text-on-secondary-container hover:shadow-md active:scale-95 transition-all text-center"
              >
                <span className="font-headline-sm text-headline-sm text-secondary leading-tight font-bold">Easy</span>
                <span className="font-code-sm text-code-sm text-on-secondary-container opacity-90 mt-0.5">4 days</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1"></span>
              </button>
            </div>
          </section>

          {/* Auxiliary Deck Utilities & AI Tutor Prompt Strip */}
          <section className="px-gutter pt-space-md pb-space-lg flex flex-col gap-space-sm mb-6">
            <Link
              href="/ai-tutor"
              className="w-full flex items-center justify-between p-space-sm px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all text-left shadow-sm"
            >
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <StitchIcon name="smart_toy" className="text-[16px]" size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-primary font-bold">Ask Kriti AI Tutor</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    &ldquo;Why do branched ether lipids resist hydrothermal boiling?&rdquo;
                  </span>
                </div>
              </div>
              <StitchIcon name="chevron_right" className="text-primary text-[20px] shrink-0" size={20} />
            </Link>

            <div className="flex items-center justify-between pt-1">
              <button
                aria-label="Previous flashcard"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
                }}
                className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
              >
                <StitchIcon name="arrow_back_ios_new" className="text-[22px]" size={22} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Toggle shuffle deck"
                  onClick={handleShuffleToggle}
                  className={`h-10 px-3.5 rounded-full flex items-center gap-1.5 font-label-md text-label-md active:scale-95 transition-all font-semibold ${
                    isShuffled
                      ? 'bg-primary-fixed text-on-primary-fixed shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <StitchIcon name="shuffle" className="text-[18px]" size={18} />
                  <span>{isShuffled ? 'Shuffled' : 'Shuffle'}</span>
                </button>
                {isBookmarked && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                    <StitchIcon name="star" className="text-[14px]" size={14} />
                    In Mistake Book
                  </span>
                )}
              </div>
              <button
                aria-label="Next flashcard"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev + 1) % cards.length);
                }}
                className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
              >
                <StitchIcon name="arrow_forward_ios" className="text-[22px]" size={22} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
