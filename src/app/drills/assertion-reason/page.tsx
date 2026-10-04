"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AssertionReasonDrillQ1Page() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("C");
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<string>("High (100%)");

  const options = [
    {
      id: "A",
      text: "Both (A) and (R) are true and (R) is the correct explanation of (A).",
      explanation: null,
    },
    {
      id: "B",
      text: "Both (A) and (R) are true but (R) is NOT the correct explanation of (A).",
      explanation: null,
    },
    {
      id: "C",
      text: "Assertion (A) is true, but Reason (R) is false.",
      explanation: "Methanogens are obligate ANAEROBES, not aerobes.",
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
                    Q 1 of 5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-sm flex-shrink-0">
              <div className="flex items-center gap-1 bg-surface-container px-space-sm py-1 rounded-lg text-primary">
                <StitchIcon name="timer" className="text-[18px]" size={18} />
                <span className="font-label-md text-label-md font-semibold tracking-tight">04:15</span>
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

        {/* Main Content */}
        <main className="flex flex-col relative w-full pt-2 pb-28">
          {/* Top Progress & Meta Header Bar */}
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
                <span className="font-label-sm text-label-sm">Target: 45s</span>
              </div>
            </div>

            {/* Stepper Tracker */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Question 1</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">of 5</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    +4
                  </span>
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    -1
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">NCERT P.19-21</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
                <div className="bg-primary h-full rounded-full transition-all duration-300 w-1/5"></div>
              </div>

              {/* Question Chips */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <button className="flex-1 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex flex-col items-center justify-center shadow-sm">
                  <span>Q1</span>
                  <span className="w-1 h-1 rounded-full bg-on-primary mt-0.5"></span>
                </button>
                <Link
                  href="/drills/assertion-reason/q2"
                  className="flex-1 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span>Q2</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant mt-0.5"></span>
                </Link>
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
            {/* Header Card & Cognitive Trap */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-space-xs text-primary">
                <StitchIcon name="verified" className="text-[18px]" size={18} />
                <span className="font-label-md text-label-md tracking-wide uppercase">NEET Benchmark Target</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Archaebacteria &amp; Methanogen Metabolism
              </h2>
              <div className="bg-surface-container-high rounded-lg px-space-sm py-1.5 flex items-center gap-2">
                <StitchIcon name="warning" className="text-error text-[18px]" size={18} />
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  <strong className="text-on-surface">Cognitive Trap:</strong> Teleological Conjunction vs True Causality
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
                “Methanogens are present in the gut of several ruminant animals such as cows and buffaloes and are responsible for the production of biogas from the dung.”
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
                “Methanogens are obligate aerobes that thrive exclusively in hyper-oxygenated rumen tissues and rely on oxidative phosphorylation for methane formation.”
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
                  <p className="font-body-sm text-body-sm">
                    <strong>Method:</strong> Read Assertion (A), insert the word{" "}
                    <span className="bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded font-label-sm text-label-sm font-semibold">
                      BECAUSE
                    </span>
                    , then read Reason (R).
                  </p>
                  <div className="bg-surface-container p-space-sm rounded-lg font-body-sm text-body-sm italic text-on-surface">
                    “...responsible for biogas from dung <strong>BECAUSE</strong> they are obligate aerobes that thrive in hyper-oxygenated tissues...”
                  </div>
                  <div className="flex items-center gap-1.5 text-error mt-1">
                    <StitchIcon name="cancel" className="text-[16px]" size={16} />
                    <span className="font-label-sm text-label-sm font-medium">
                      Biological red flag: Check oxygen requirement for rumen methanogens!
                    </span>
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
                  <span className="font-label-sm text-label-sm font-semibold truncate">Dr. Sharma’s 25s Clue</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant truncate">Free Practice Hint</span>
                </div>
              </Link>

              <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-2 flex-shrink-0">
                <StitchIcon name="verified_user" className="text-secondary text-[18px]" size={18} />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">Confidence</span>
                  <span className="font-label-md text-label-md font-semibold text-secondary leading-tight">
                    {confidence}
                  </span>
                </div>
              </div>
            </div>

            {/* Option Cards (NTA 4-Choice Matrix) */}
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

          {/* Sticky Bottom Controls & Sprint Summary */}
          <aside className="fixed bottom-0 left-0 right-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="max-w-2xl mx-auto px-gutter pt-space-sm pb-space-sm flex flex-col gap-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>4 Questions remaining</span>
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
                  onClick={() => router.push("/drills/assertion-reason/q2")}
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
