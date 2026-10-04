"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AssertionReasonDrillQ2Page() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("A");
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(true);
  const [confidence, setConfidence] = useState<string>("Select Level");

  const options = [
    {
      id: "A",
      text: "Both (A) and (R) are true and (R) is the correct explanation of (A).",
      explanation: "Bacteriorhodopsin proton pump drives chemiosmotic ATP synthesis in extreme hypersaline stress.",
    },
    {
      id: "B",
      text: "Both (A) and (R) are true but (R) is NOT the correct explanation of (A).",
      explanation: null,
    },
    {
      id: "C",
      text: "Assertion (A) is true, but Reason (R) is false.",
      explanation: null,
    },
    {
      id: "D",
      text: "Both (A) and (R) are false.",
      explanation: null,
    },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <button
                type="button"
                aria-label="Exit drill"
                className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary rounded-lg transition-colors cursor-pointer"
                onClick={() => router.back()}
              >
                <StitchIcon name="arrow_back" className="text-[24px]" size={24} />
              </button>
              <Image
                alt="Brand logo"
                className="h-8 w-auto object-contain"
                src="/stitch/logo.png"
                width={32}
                height={32}
              />
              <div className="flex flex-col min-w-0">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Assertion Reason Drill • 5 Qs
                </h1>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">NEET Prep</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                  <span className="font-label-sm text-label-sm bg-surface-container-high text-primary px-space-xs py-[1px] rounded-full">
                    Q 2 of 5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-sm flex-shrink-0">
              <div className="flex items-center gap-1 bg-surface-container px-space-sm py-1 rounded-lg text-primary">
                <StitchIcon name="timer" className="text-[18px]" size={18} />
                <span className="font-label-md text-label-md font-semibold tracking-tight">03:32</span>
              </div>
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 pb-28">
          {/* Top Progress & Meta Bar */}
          <section className="px-gutter pt-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-1.5 bg-surface-container-high px-space-sm py-1 rounded-full text-primary">
                <StitchIcon name="biotech" className="text-[15px]" size={15} fill />
                <span className="font-label-sm text-label-sm font-semibold">
                  Ch. 2: Biological Classification • Extremophiles &amp; Monera
                </span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <StitchIcon name="timer" className="text-[14px]" size={14} />
                <span className="font-label-sm text-label-sm">Target: 40s</span>
              </div>
            </div>

            {/* Stepper Tracker */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Question 2</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">of 5</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    +4
                  </span>
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    -1
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">NCERT P.20–22</span>
                </div>
              </div>

              {/* Progress Bar 40% */}
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
                <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: "40%" }}></div>
              </div>

              {/* Chips */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <Link
                  href="/drills/assertion-reason"
                  className="flex-1 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md flex flex-col items-center justify-center shadow-sm"
                >
                  <span className="flex items-center justify-center">
                    <StitchIcon name="check" className="text-[14px] leading-none" size={14} />
                  </span>
                  <span className="w-1 h-1 rounded-full bg-secondary-fixed mt-0.5"></span>
                </Link>
                <button className="flex-1 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex flex-col items-center justify-center shadow-sm">
                  <span>Q2</span>
                  <span className="w-1 h-1 rounded-full bg-on-primary mt-0.5"></span>
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center hover:bg-surface-container transition-colors">
                  <span>Q3</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant mt-0.5"></span>
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center hover:bg-surface-container transition-colors">
                  <span>Q4</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant mt-0.5"></span>
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center hover:bg-surface-container transition-colors">
                  <span>Q5</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant mt-0.5"></span>
                </button>
              </div>
            </div>
          </section>

          {/* Question Presentation Area */}
          <section className="px-gutter pt-space-md flex flex-col gap-space-md">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-space-xs text-primary">
                <StitchIcon name="verified" className="text-[18px]" size={18} />
                <span className="font-label-md text-label-md tracking-wide uppercase">NEET Benchmark Target</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Halophiles &amp; Purple Membrane Osmoregulation
              </h2>
              <div className="bg-surface-container-high rounded-lg px-space-sm py-1.5 flex items-center gap-2">
                <StitchIcon name="warning" className="text-error text-[18px]" size={18} />
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  <strong className="text-on-surface">Cognitive Trap:</strong> Bacteriorhodopsin ATP Synthesis vs Chlorophyll Photosynthesis
                </span>
              </div>
            </div>

            {/* Assertion Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-on-primary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm tracking-wide">
                  ASSERTION (A)
                </span>
                <button
                  type="button"
                  aria-label="Listen to Assertion"
                  className="text-on-surface-variant hover:text-primary p-1 rounded-full transition-colors flex items-center justify-center"
                >
                  <StitchIcon name="volume_up" className="text-[20px]" size={20} />
                </button>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                ‘Halophiles such as Halobacterium salinarum can survive in saturated brine pools and solar salt evaporation ponds.’
              </p>
            </div>

            {/* Reason Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="bg-tertiary-container text-on-tertiary-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm tracking-wide">
                  REASON (R)
                </span>
                <button
                  type="button"
                  aria-label="Listen to Reason"
                  className="text-on-surface-variant hover:text-primary p-1 rounded-full transition-colors flex items-center justify-center"
                >
                  <StitchIcon name="volume_up" className="text-[20px]" size={20} />
                </button>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                ‘In anaerobic, high-intensity light conditions, Halobacterium synthesizes bacteriorhodopsin in its purple membrane to generate ATP by photophosphorylation without using chlorophyll or generating oxygen.’
              </p>
            </div>

            {/* Interactive Conjunction Helper Tool (BECAUSE test) */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between p-space-md cursor-pointer select-none text-left"
              >
                <div className="flex items-center gap-space-xs text-primary">
                  <StitchIcon name="psychology_alt" className="text-[20px]" size={20} />
                  <span className="font-label-md text-label-md font-semibold">The “BECAUSE” Conjunction Test</span>
                </div>
                <StitchIcon name="expand_more" className={`text-on-surface-variant text-[20px] transition-transform duration-200 ${ detailsOpen ? 'rotate-180' : '' }`} size={20} />
              </button>

              {detailsOpen && (
                <div className="px-space-md pb-space-md flex flex-col gap-space-xs pt-1 text-on-surface-variant">
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
                    <div className="flex items-center gap-1.5">
                      <StitchIcon name="neurology" className="text-[16px] text-primary" size={16} />
                      <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wide">
                        3-Step Causal Litmus Test
                      </span>
                    </div>
                    <span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      Systematic Heuristic
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-1 border border-outline-variant/20 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                          Convert Assertion into Interrogative
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface italic pl-6">
                        “WHY can Halobacterium salinarum survive saturated brine pools and hypersaline solar salt evaporation ponds?”
                      </p>
                    </div>

                    <div className="flex items-center justify-center my-0.5">
                      <div className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1 rounded-full font-label-md text-label-md font-semibold shadow-sm ring-2 ring-primary-fixed">
                        <StitchIcon name="link" className="text-[14px]" size={14} />
                        <span>...BECAUSE...</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-1 border border-outline-variant/20 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                          Plug Reason Directly
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface italic pl-6">
                        “...because under anaerobic &amp; high light conditions, bacteriorhodopsin forms a proton pump generating ATP without requiring chlorophyll or oxygen.”
                      </p>
                    </div>

                    <div className="bg-secondary-container/50 border border-secondary/30 p-space-sm rounded-lg flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-secondary font-semibold font-label-sm text-label-sm">
                        <StitchIcon name="verified" className="text-[16px]" size={16} />
                        <span>Causality Verdict Confirmed</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                        The Reason provides the bioenergetic basis that allows the organism to survive cellular dehydration and sustain ion pumping in brine. Therefore, Option A is logically mandatory.
                      </p>
                    </div>

                    <div className="flex items-start gap-1.5 bg-error-container/40 p-2 rounded-lg text-on-surface-variant">
                      <StitchIcon name="warning" className="text-error text-[16px] mt-0.5 flex-shrink-0" size={16} />
                      <p className="font-label-sm text-label-sm leading-snug">
                        <strong className="text-error">Trap Alert:</strong> Don't treat Reason as merely an isolated true fact. It answers <em>how</em> survival is energetically possible.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Mnemonic & Confidence Bar */}
            <div className="flex items-center gap-space-sm">
              <Link
                href="/mnemonics"
                className="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl p-space-sm flex items-center gap-2 shadow-sm transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                  <StitchIcon name="headphones" className="text-[20px]" size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold truncate">Dr. Sharma’s 20s Clue</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant truncate">Bacteriorhodopsin Trap</span>
                </div>
              </Link>

              <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-2 flex-shrink-0">
                <StitchIcon name="flaky" className="text-primary text-[18px]" size={18} />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">Confidence</span>
                  <span className="font-label-md text-label-md font-semibold text-primary leading-tight">
                    {confidence}
                  </span>
                </div>
              </div>
            </div>

            {/* Option Cards */}
            <div aria-label="Answer options" className="flex flex-col gap-space-xs mt-1" role="radiogroup">
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`group relative flex items-start gap-space-md p-space-md rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary-fixed shadow-md"
                        : "bg-surface-container-lowest shadow-sm hover:bg-surface-container-low"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md font-semibold flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-primary text-on-primary shadow-sm"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {opt.id}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-body-md text-body-md leading-snug ${
                            isSelected ? "font-semibold text-on-primary-fixed" : "text-on-surface"
                          }`}
                        >
                          {opt.text}
                        </span>
                        {isSelected && (
                          <StitchIcon name="check_circle" className="text-primary text-[20px] ml-1 flex-shrink-0" size={20} fill />
                        )}
                      </div>
                      {opt.explanation && isSelected && (
                        <span className="font-label-sm text-label-sm text-on-primary-fixed-variant mt-1">
                          {opt.explanation}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sticky Bottom Controls */}
          <aside className="fixed bottom-0 left-0 right-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="max-w-2xl mx-auto px-gutter pt-space-sm pb-space-sm flex flex-col gap-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>3 Questions remaining</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOption("")}
                  className="text-on-surface-variant hover:text-error transition-colors underline font-medium cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center justify-center gap-1.5 px-space-md py-3 rounded-xl font-label-md text-label-md transition-colors flex-shrink-0 ${
                    isBookmarked
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
                  }`}
                >
                  <StitchIcon name="bookmark_border" className="text-[18px]" size={18} fill={isBookmarked} />
                  <span>Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/drills/pyq-drill")}
                  className="flex-1 flex items-center justify-between px-space-xl py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Save &amp; Next</span>
                    <span className="font-label-sm text-label-sm bg-primary-container text-on-primary px-1.5 py-0.5 rounded-full font-semibold">
                      +4 pts
                    </span>
                  </div>
                  <StitchIcon name="arrow_forward" className="text-[20px]" size={20} />
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
