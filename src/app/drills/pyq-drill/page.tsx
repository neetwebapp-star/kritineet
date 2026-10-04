"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PyqDrillPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("A");
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<string>("High (90%+)");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const options = [
    {
      id: "A",
      text: (
        <>
          Both Assertion (A) and Reason (R) are true, and Reason (R) is the{" "}
          <span className="text-primary font-semibold">correct explanation</span> of Assertion (A).
        </>
      ),
    },
    {
      id: "B",
      text: (
        <>
          Both Assertion (A) and Reason (R) are true, but Reason (R) is{" "}
          <span className="text-error font-semibold">NOT</span> the correct explanation of Assertion (A).
        </>
      ),
    },
    {
      id: "C",
      text: (
        <>
          Assertion (A) is <span className="text-secondary font-semibold">true</span>, but Reason (R) is{" "}
          <span className="text-error font-semibold">false</span>.
        </>
      ),
    },
    {
      id: "D",
      text: (
        <>
          Both Assertion (A) and Reason (R) are <span className="text-error font-semibold">false</span>.
        </>
      ),
    },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 inset-x-0 z-50 bg-surface-container-lowest/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Exit Drill"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-[22px]" size={22} />
              </button>
              <Image
                alt="Brand logo"
                className="h-8 w-auto object-contain"
                src="/stitch/logo.png"
                width={32}
                height={32}
              />
              <div className="flex flex-col ml-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                    NEET 2017
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">PYQ Drill</span>
                </div>
                <h1 className="font-headline-sm text-headline-sm text-on-surface leading-tight truncate max-w-[160px]">
                  Sprint CBT Active Drill
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-space-xs">
              <div className="flex items-center gap-1.5 px-space-sm py-1 bg-surface-container rounded-full">
                <StitchIcon name="timer" className="text-primary text-[16px]" size={16} />
                <span className="font-label-md text-label-md text-primary font-bold tabular-nums">00:59</span>
              </div>
              <button
                aria-label="Bookmark question"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isBookmarked
                    ? "text-primary bg-primary/10"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
                type="button"
              >
                <StitchIcon name="bookmark_border" className="text-[22px]" size={22} fill={isBookmarked} />
              </button>
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ml-space-xs"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 pb-safe bg-surface min-h-screen">
          <div className="flex flex-col w-full px-gutter pb-space-2xl gap-space-lg">
            {/* Top Drill Metadata & Exam Telemetry Card */}
            <section className="flex flex-col gap-space-sm mt-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    NEET 2017 Official • Q.142
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <StitchIcon name="bolt" className="text-[13px]" size={13} fill />
                    High Rigor
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high">
                  <span className="font-label-sm text-label-sm text-secondary font-bold">+4</span>
                  <span className="text-outline-variant font-label-sm text-label-sm">/</span>
                  <span className="font-label-sm text-label-sm text-error font-bold">-1</span>
                </div>
              </div>

              {/* Chapter Breadcrumb & Live Timer */}
              <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <StitchIcon name="biotech" className="text-[20px]" size={20} fill />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Class 11 Biology
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Biological Classification
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-on-error-container shrink-0 animate-pulse">
                  <StitchIcon name="hourglass_top" className="text-[16px]" size={16} />
                  <span className="font-label-md text-label-md font-bold tabular-nums">00:48</span>
                </div>
              </div>

              {/* Academic Badges */}
              <div className="flex items-center justify-between gap-space-xs flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                  <StitchIcon name="menu_book" className="text-[15px] text-primary" size={15} />
                  <span>NCERT Page 19 • Para 2.1.1</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error-container/60 text-on-error-container font-label-sm text-label-sm font-semibold">
                  <StitchIcon name="warning" className="text-[15px]" size={15} />
                  <span>Trap Level: 84% Incorrect in 2017</span>
                </div>
              </div>
            </section>

            {/* Question Stem Directions */}
            <section className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm">
              <StitchIcon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" size={20} />
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Directions:</strong> In the following question, a statement of Assertion (A) is followed by a statement of Reason (R). Scrutinize both statements critically under standard NCERT nomenclature.
              </p>
            </section>

            {/* Assertion & Reason Cards */}
            <section className="flex flex-col gap-space-sm">
              <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-sm overflow-hidden flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold tracking-wide">
                    ASSERTION (A)
                  </span>
                  <button
                    aria-label="Listen statement A"
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    type="button"
                  >
                    <StitchIcon name="volume_up" className="text-[18px]" size={18} />
                  </button>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface font-medium leading-relaxed">
                  Archaebacteria are able to survive in harsh habitats such as extreme hot springs and deep hydrothermal vents.
                </p>
              </div>

              <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-sm overflow-hidden flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold tracking-wide">
                    REASON (R)
                  </span>
                  <button
                    aria-label="Listen statement R"
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    type="button"
                  >
                    <StitchIcon name="volume_up" className="text-[18px]" size={18} />
                  </button>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface font-medium leading-relaxed">
                  Archaebacteria have branched chain lipids with ether linkages in their cell membranes and lack true peptidoglycan in their cell walls.
                </p>
              </div>
            </section>

            {/* Interactive Option Cards */}
            <section aria-label="Answer options" className="flex flex-col gap-space-sm" role="radiogroup">
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`cursor-pointer rounded-xl p-space-md transition-all duration-200 flex items-start gap-space-md active:scale-[0.99] ${
                      isSelected ? "bg-primary-fixed shadow-md" : "bg-surface-container-lowest shadow-sm"
                    }`}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                      }`}
                    >
                      {opt.id}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-body-md text-body-md text-on-surface font-medium leading-normal">
                        {opt.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* CBT Exam Utilities */}
            <section className="flex flex-col gap-space-sm mt-space-xs">
              {/* Audio Clue Hook */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-sm shadow-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div
                    className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm cursor-pointer active:scale-95 transition-transform"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  >
                    <StitchIcon name={isPlayingAudio ? "pause" : "headphones"} className="text-[20px]" size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-headline-sm text-on-surface truncate">Audio Clue</span>
                      <span className="font-label-sm text-label-sm px-1.5 py-0.2 rounded bg-surface-container-high text-primary font-bold">
                        38s
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      Dr. Sharma's Cell Envelope Hook
                    </span>
                  </div>
                </div>
                <button
                  className="px-space-md py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-bold flex items-center gap-1 active:bg-surface-container-high cursor-pointer"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  type="button"
                >
                  <span>{isPlayingAudio ? "Pause" : "Play"}</span>
                  <StitchIcon name={isPlayingAudio ? "pause" : "play_arrow"} className="text-[16px]" size={16} />
                </button>
              </div>

              {/* Confidence Rater */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Confidence Metric
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-medium">
                    {confidence} Selected
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs mt-1">
                  {["Low (<50%)", "Medium (70%)", "High (90%+)"].map((level) => {
                    const isActive = confidence === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setConfidence(level)}
                        className={`py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary-fixed text-on-primary-fixed font-bold shadow-sm"
                            : "bg-surface-container text-on-surface-variant font-semibold hover:bg-surface-container-high"
                        }`}
                      >
                        {level.split(" ")[0]} {level.includes("90%") ? "90%+" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Peer Stats Module */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-space-md">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle
                      className="text-surface-container"
                      cx="24"
                      cy="24"
                      fill="none"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <circle
                      className="text-error"
                      cx="24"
                      cy="24"
                      fill="none"
                      r="18"
                      stroke="currentColor"
                      strokeDasharray="113.1"
                      strokeDashoffset="78.0"
                      strokeLinecap="round"
                      strokeWidth="4"
                    />
                  </svg>
                  <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">31%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Real-Time Peer Cohort Insight
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    Only <strong className="text-primary font-bold">31% of NEET aspirants</strong> marked this correctly on their first timed attempt.
                  </p>
                </div>
              </div>
            </section>

            {/* Sticky Bottom Dock */}
            <section className="sticky bottom-0 inset-x-0 pt-space-xs pb-space-sm bg-surface/95 backdrop-blur-md mt-space-sm">
              <div className="flex items-center gap-space-xs justify-between">
                <button
                  className="px-space-sm py-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-medium transition-colors cursor-pointer"
                  onClick={() => setSelectedOption("")}
                  type="button"
                >
                  Clear Selection
                </button>
                <div className="flex items-center gap-space-xs">
                  <button
                    className="px-space-md py-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    type="button"
                  >
                    <StitchIcon name="bookmark_border" className="text-[18px]" size={18} fill={isBookmarked} />
                    <span className="hidden sm:inline">Mark for</span> Review
                  </button>
                  <button
                    className="px-space-lg py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-2 shadow-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                    onClick={() => router.push("/cbt/results")}
                    type="button"
                  >
                    <span>Submit &amp; Check</span>
                    <span className="px-1.5 py-0.5 rounded bg-on-primary/20 text-on-primary text-[10px] font-bold">
                      +4
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
