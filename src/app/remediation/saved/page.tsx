"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RemediationSavedModalPage() {
  const router = useRouter();
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>("Conceptual Trap");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const taxonomyOptions = [
    "Conceptual Trap",
    "Factual Recall",
    "Calculation / Unit",
    "Misread Question",
  ];

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="h-16 px-space-md flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <button
                aria-label="Back to NCERT Reader"
                className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => router.back()}
              >
                <StitchIcon name="arrow_back" className="text-[24px]" size={24} />
              </button>
              <div className="flex flex-col min-w-0">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Remediation Sync
                </h1>
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold truncate">
                    Saved to Spaced Leitner Box 1
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform shrink-0 cursor-pointer"
            >
              <StitchIcon name="close" className="text-[20px]" size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative w-full pt-2 pb-20 bg-surface">
          <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md">
            {/* Modal / Action Header */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                    <StitchIcon name="check_circle" className="text-on-secondary-container text-[22px]" size={22} fill />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Saved to Flashcards &amp; Mistake Book
                    </h2>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">
                        Saved to Spaced Leitner Box 1
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Active Sync</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Micro Success Banner */}
              <div className="mt-space-md bg-surface-container-low rounded-lg p-space-sm flex items-start gap-space-sm">
                <StitchIcon name="bookmark_added" className="text-primary text-[20px] shrink-0 mt-0.5" size={20} fill />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-label-sm text-label-sm text-primary font-bold">
                      Ch. 2: Biological Classification
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] uppercase tracking-wider">
                      NEET 2026 High Priority
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Tagged to Mistake Book under <span className="font-medium text-on-surface">Biochemistry Traps</span> • NCERT Para 2.1.1
                  </p>
                </div>
              </div>
            </section>

            {/* Mnemonic & Audio Asset Preview Card */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <StitchIcon name="graphic_eq" className="text-tertiary text-[18px]" size={18} />
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Audio Mnemonic Snapshot
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                  38s Hook
                </span>
              </div>

              <div className="bg-surface-container-low rounded-lg p-space-md space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Archaebacteria Extremophile Survival Hook
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Narrated by Dr. Sharma (AI Voice • Socratic Accent)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>1.0x</span>
                    <StitchIcon name="speed" className="text-[14px]" size={14} />
                  </button>
                </div>

                {/* Rhyme Bubble */}
                <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex items-start gap-space-xs">
                  <StitchIcon name="format_quote" className="text-primary text-[18px] shrink-0 mt-0.5" size={18} />
                  <p className="font-body-md text-body-md text-on-surface italic">
                    “Archaea in the <strong className="text-primary font-semibold">BOILING HEATER</strong>, links its chains with resilient <strong className="text-secondary font-semibold">ETHER</strong>!”
                  </p>
                </div>

                {/* Mini Waveform Player */}
                <div className="flex items-center gap-space-sm pt-space-xs">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    aria-label="Play mnemonic snippet"
                    className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform shrink-0 cursor-pointer"
                  >
                    <StitchIcon name={isPlayingAudio ? "pause" : "play_arrow"} className="text-[20px]" size={20} fill />
                  </button>
                  <div className="flex-1 flex items-center gap-1 h-8 px-space-xs bg-surface-container-lowest rounded-lg">
                    <span className="w-1 h-3 rounded-full bg-primary/40 animate-pulse"></span>
                    <span className="w-1 h-5 rounded-full bg-primary/70"></span>
                    <span className="w-1 h-7 rounded-full bg-primary"></span>
                    <span className="w-1 h-4 rounded-full bg-primary/80"></span>
                    <span className="w-1 h-6 rounded-full bg-primary"></span>
                    <span className="w-1 h-3 rounded-full bg-primary/50"></span>
                    <span className="w-1 h-5 rounded-full bg-secondary"></span>
                    <span className="w-1 h-7 rounded-full bg-secondary"></span>
                    <span className="w-1 h-4 rounded-full bg-secondary/70"></span>
                    <span className="w-1 h-2 rounded-full bg-outline-variant"></span>
                    <span className="w-1 h-3 rounded-full bg-outline-variant"></span>
                    <span className="w-1 h-5 rounded-full bg-outline-variant"></span>
                    <span className="w-1 h-2 rounded-full bg-outline-variant"></span>
                    <span className="w-1 h-4 rounded-full bg-outline-variant"></span>
                    <span className="w-1 h-3 rounded-full bg-outline-variant"></span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant font-medium shrink-0">00:38</span>
                </div>
              </div>
            </section>

            {/* Error Taxonomy Settings */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <StitchIcon name="psychology_alt" className="text-primary text-[20px]" size={20} />
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Error Taxonomy &amp; Tagging</h3>
                </div>
                <span className="font-label-sm text-label-sm text-error bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-semibold">
                  NCERT Trap
                </span>
              </div>

              <div className="space-y-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Classify Why You Tripped:</span>
                <div className="grid grid-cols-2 gap-space-xs pt-1">
                  {taxonomyOptions.map((opt) => {
                    const isSelected = selectedTaxonomy === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedTaxonomy(opt)}
                        className={`flex items-center gap-space-xs p-space-sm rounded-lg font-label-md text-label-md font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <StitchIcon name={isSelected ? "check_circle" : "radio_button_unchecked"} className="text-[18px]" size={18} fill={isSelected} />
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Navigation Actions */}
            <div className="pt-2 flex items-center gap-space-sm">
              <Link
                href="/error-book"
                className="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                View in Mistake Book
              </Link>
              <Link
                href="/drills/assertion-reason"
                className="flex-1 py-3 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm text-center shadow-md hover:opacity-95 active:scale-98 transition-all"
              >
                Continue Practice
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
