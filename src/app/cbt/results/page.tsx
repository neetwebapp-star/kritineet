'use client';

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';

export default function TestResultsAnalysisPage() {
  return (
    <AppShell
      title="Test Results & Analysis"
      subtitle="NEET Practice Evaluation • Completed"
      showBack={true}
      backHref="/cbt"
      rightAction={
        <span className="font-label-sm text-xs bg-[#e8f7ee] text-[#006c49] border border-[#b6eed4] px-2.5 py-0.5 rounded-full font-bold">
          Completed
        </span>
      }
    >
      <div className="flex flex-col w-full max-w-5xl mx-auto pb-16">
        <div className="flex flex-col w-full">
          <div className="relative px-gutter pt-space-md pb-space-2xl space-y-space-lg">
            {/* Top Micro Banner */}
            <div className="flex items-center justify-between mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container text-label-sm font-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                NEET Practice Evaluation • Completed
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant text-label-sm font-label-sm font-medium">
                <StitchIcon name="verified" className="text-sm text-secondary" />
                AI Verified
              </div>
            </div>

            {/* Test Summary Card */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>
              <div className="flex flex-col gap-space-xs">
                <span className="text-label-sm font-label-sm text-primary uppercase tracking-wider font-bold">
                  Daily Practice Problem • Botany
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface leading-tight font-bold">
                  DPP 02: Plant Kingdom &amp; Monera
                </h2>
              </div>

              {/* Hero Score Section */}
              <div className="mt-space-lg flex items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-xl">
                <div className="flex flex-col">
                  <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">Total Score</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-display-lg-mobile font-display-lg-mobile text-primary font-bold">84</span>
                    <span className="text-headline-sm font-headline-sm text-on-surface-variant font-semibold">/ 100</span>
                  </div>
                  <span className="text-body-sm font-body-sm text-secondary font-medium mt-1 flex items-center gap-1">
                    <StitchIcon name="trending_up" className="text-base" />
                    +12 vs. Last Practice Test
                  </span>
                </div>

                {/* Radial Accuracy Metric */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                    <circle className="text-surface-container-highest" cx="36" cy="36" fill="none" r="30" stroke="currentColor" strokeWidth="6"></circle>
                    <circle
                      className="text-primary"
                      cx="36"
                      cy="36"
                      fill="none"
                      r="30"
                      stroke="currentColor"
                      strokeDasharray="188.4"
                      strokeDashoffset="22.6"
                      strokeLinecap="round"
                      strokeWidth="6"
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-label-md font-label-md text-on-surface font-bold leading-none">88%</span>
                    <span className="text-[9px] font-label-sm text-on-surface-variant mt-0.5 leading-none font-semibold">Accuracy</span>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Ribbon */}
              <div className="mt-space-md grid grid-cols-2 gap-space-sm pt-space-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low/60">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <StitchIcon name="military_tech" className="text-lg" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-label-sm text-on-surface-variant uppercase font-semibold">Predicted Rank</span>
                    <span className="text-label-md font-label-md text-on-surface truncate font-bold">Top 4% (NEET AI)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low/60">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <StitchIcon name="timer" className="text-lg" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-label-sm text-on-surface-variant uppercase font-semibold">Average Speed</span>
                    <span className="text-label-md font-label-md text-on-surface truncate font-bold">
                      41s <span className="text-on-surface-variant font-normal text-[11px]">(Goal ≤50s)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Breakdown Grid */}
            <div>
              <div className="flex items-center justify-between mb-space-xs px-0.5">
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Question Breakdown</h3>
                <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">25 Questions Total</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                {/* Correct */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-secondary-container/30 text-on-secondary-container flex items-center justify-center">
                      <StitchIcon name="check" className="text-sm font-bold" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container text-label-sm font-label-sm font-bold">
                      +84 Marks
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-display-lg-mobile font-display-lg-mobile text-on-surface font-bold leading-none">21</span>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 font-medium">Correct answers</p>
                  </div>
                </div>

                {/* Incorrect */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                      <StitchIcon name="close" className="text-sm font-bold" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-error-container/40 text-on-error-container text-label-sm font-label-sm font-bold">
                      -2 Penalty
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-display-lg-mobile font-display-lg-mobile text-error font-bold leading-none">2</span>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 font-medium">Incorrect mistakes</p>
                  </div>
                </div>

                {/* Unattempted */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                      <StitchIcon name="remove" className="text-sm" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-label-sm font-label-sm font-semibold">
                      0 Marks
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-display-lg-mobile font-display-lg-mobile text-on-surface font-bold leading-none">2</span>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 font-medium">Skipped/Left</p>
                  </div>
                </div>

                {/* Marked for Review */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center">
                      <StitchIcon name="bookmark" className="text-sm" fill />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-label-sm font-bold">
                      Flagged
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-display-lg-mobile font-display-lg-mobile text-primary font-bold leading-none">1</span>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 font-medium">Marked for review</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mistake Remediation Box */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                    <StitchIcon name="auto_fix_high" className="text-base" />
                  </span>
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Mistake Book Remediation</h3>
                    <span className="text-label-sm font-label-sm text-error font-medium">2 concepts need attention</span>
                  </div>
                </div>
                <span className="text-label-sm font-label-sm px-2.5 py-0.5 rounded-full bg-error-container/30 text-on-error-container font-semibold">
                  Priority
                </span>
              </div>

              {/* Mistake 1 */}
              <div className="p-space-md rounded-lg bg-surface-container-low space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-error/10 text-error text-[11px] font-bold">Q14</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">Plant Diversity • Conceptual Slip</span>
                  </div>
                  <span className="text-[10px] font-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                    NCERT Botany
                  </span>
                </div>
                <p className="text-body-md font-body-md text-on-surface font-semibold leading-snug">
                  Cell wall composition in Methanogenic Archaebacteria
                </p>
                <div className="flex items-center gap-2 text-body-sm font-body-sm py-1">
                  <span className="line-through text-error decoration-1">Selected: Peptidoglycan</span>
                  <StitchIcon name="arrow_forward" className="text-xs text-on-surface-variant" />
                  <span className="text-secondary font-bold">Correct: Pseudomurein</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/ncert/monera-archaebacteria"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface text-label-sm font-label-sm font-semibold active:scale-95 transition-transform"
                  >
                    <StitchIcon name="menu_book" className="text-sm text-primary" />
                    Read NCERT p. 19
                  </Link>
                  <Link
                    href="/flashcards"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-label-sm font-semibold active:scale-95 transition-transform"
                  >
                    <StitchIcon name="style" className="text-sm" />
                    + Flashcard
                  </Link>
                </div>
              </div>

              {/* Mistake 2 */}
              <div className="p-space-md rounded-lg bg-surface-container-low space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-error/10 text-error text-[11px] font-bold">Q22</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">Algae &amp; Bryophytes • Speed Slip</span>
                  </div>
                  <span className="text-[10px] font-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                    Speed Panic
                  </span>
                </div>
                <p className="text-body-md font-body-md text-on-surface font-semibold leading-snug">
                  Isogamous non-flagellated reproduction in Chlamydomonas
                </p>
                <div className="flex items-center gap-2 text-body-sm font-body-sm py-1">
                  <span className="text-on-surface-variant">Spent only 12s on question (Rushed decision)</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/ai-tutor"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface text-label-sm font-label-sm font-semibold active:scale-95 transition-transform"
                  >
                    <StitchIcon name="play_circle" className="text-sm text-primary" />
                    Review Solution
                  </Link>
                </div>
              </div>
            </div>

            {/* Subtopic Performance */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Subtopic Performance</h3>
                <span className="text-label-sm font-label-sm text-primary font-bold">3 Chapters</span>
              </div>
              <div className="space-y-space-md">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="font-semibold text-on-surface truncate pr-2">Kingdom Monera &amp; Archaebacteria</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-label-sm font-label-sm font-bold text-secondary">10/10 (100%)</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container text-label-sm font-label-sm font-bold">
                        Mastered
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="font-semibold text-on-surface truncate pr-2">Algae &amp; Pigment Profiles</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-label-sm font-label-sm font-bold text-primary">8/10 (80%)</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-label-sm font-bold">
                        Good
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="font-semibold text-on-surface truncate pr-2">Bryophytes &amp; Pteridophytes</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-label-sm font-label-sm font-bold text-on-surface-variant">3/5 (60%)</span>
                      <span className="px-2 py-0.5 rounded-full bg-error-container/30 text-on-error-container text-label-sm font-label-sm font-bold">
                        Needs Revision
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-error rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Management Card */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Time Management</h3>
                <span className="text-label-sm font-label-sm text-secondary font-bold flex items-center gap-1">
                  <StitchIcon name="speed" className="text-sm" />
                  4m faster than NEET avg
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface font-semibold">Botany Section Pace</span>
                  <span className="text-on-surface-variant font-semibold">
                    14 mins <span className="font-normal text-xs text-secondary font-semibold">(Target ≤20m)</span>
                  </span>
                </div>
                <div className="relative w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '70%' }} title="Your Pace"></div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant pt-1 font-semibold">
                  <span>0m</span>
                  <span className="text-secondary font-bold">You: 14m (Optimal)</span>
                  <span>Avg Aspirant: 18m</span>
                  <span>Max: 25m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Persistent Action Drawer */}
          <div className="sticky bottom-0 w-full z-40 bg-surface/95 backdrop-blur-md px-gutter py-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex flex-col gap-2 border-t border-surface-container">
            <div className="flex items-center gap-space-sm">
              <Link
                href="/dpp"
                className="flex-1 h-11 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-label-md font-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform font-bold"
              >
                <StitchIcon name="visibility" className="text-lg text-primary" />
                Review 25 Solutions
              </Link>
              <Link
                href="/drills/pyq-drill"
                className="flex-1 h-11 px-3 rounded-lg bg-primary text-on-primary text-label-md font-label-md flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform font-bold"
              >
                <StitchIcon name="bolt" className="text-lg" />
                Practice Weak (10 Qs)
              </Link>
            </div>
            <div className="text-center pb-1">
              <Link
                href="/error-book"
                className="text-label-sm font-label-sm text-error font-bold hover:underline inline-flex items-center gap-1"
              >
                <StitchIcon name="restart_alt" className="text-xs" />
                Retest Mistakes in Mistake Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
