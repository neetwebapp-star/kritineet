'use client';

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';

export default function TopicStudyWorkspacePage() {
  const [resuming, setResuming] = useState(false);

  const handleResume = () => {
    setResuming(true);
    setTimeout(() => {
      window.location.href = '/dpp';
    }, 600);
  };

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="Topic Workspace"
      showBack={true}
      backHref="/"
    >
      <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6 pb-16">
        <div className="flex flex-col w-full">
          <div className="px-gutter pt-space-md pb-space-lg flex flex-col gap-space-md">
            {/* Top Metadata Breadcrumb & Fast Switcher */}
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant min-w-0">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                  Class 11 Botany
                </span>
                <StitchIcon name="chevron_right" className="text-[14px]" size={14} />
                <span className="font-label-sm text-label-sm truncate font-medium">Unit 1: Diversity</span>
              </div>
              <Link
                href="/learning-map"
                className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors active:scale-95"
              >
                <StitchIcon name="swap_horiz" className="text-[16px]" size={16} />
                <span className="font-label-sm text-label-sm font-semibold">Change</span>
              </Link>
            </div>

            {/* Chapter Master Hero Card */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_2px_12px_rgba(20,27,43,0.04)] p-space-lg">
              <div className="flex flex-col gap-space-md relative z-10">
                <div className="flex items-start justify-between gap-space-md">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide">CHAPTER 02</span>
                    <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-0.5 font-bold">
                      Biological Classification
                    </h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Five Kingdom System, Monera, Protista, Fungi &amp; Viruses
                    </p>
                  </div>
                  {/* Master Circular Progress Gauge */}
                  <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container-highest"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      ></path>
                      <path
                        className="text-primary-container"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="60, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-headline-sm text-[13px] leading-tight font-bold text-on-surface">60%</span>
                    </div>
                  </div>
                </div>

                {/* Pill Stat Badges */}
                <div className="flex flex-wrap items-center gap-space-xs pt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm font-semibold">In Progress</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                    <StitchIcon name="schedule" className="text-[15px] text-tertiary" size={15} />
                    <span className="font-label-sm text-label-sm font-medium">45m left today</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                    <StitchIcon name="analytics" className="text-[15px] text-primary" size={15} />
                    <span className="font-label-sm text-label-sm font-medium">NEET Weight: 3 Qs (~12M)</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-primary-fixed/30 pointer-events-none blur-xl"></div>
            </div>

            {/* Quick Micro-Tool Strip */}
            <div className="grid grid-cols-3 gap-space-xs">
              <Link
                href="/mindmaps"
                className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-lowest shadow-[0_1px_3px_rgba(20,27,43,0.03)] hover:bg-surface-container transition-all text-center"
              >
                <StitchIcon name="account_tree" className="text-primary text-[22px]" size={22} />
                <span className="font-label-sm text-label-sm text-on-surface mt-1 font-semibold">Mind Map</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">14 Nodes</span>
              </Link>
              <Link
                href="/mnemonics"
                className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-lowest shadow-[0_1px_3px_rgba(20,27,43,0.03)] hover:bg-surface-container transition-all text-center"
              >
                <StitchIcon name="audio_file" className="text-secondary text-[22px]" size={22} />
                <span className="font-label-sm text-label-sm text-on-surface mt-1 font-semibold">Audio Notes</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">3 Recs</span>
              </Link>
              <Link
                href="/error-book"
                className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-lowest shadow-[0_1px_3px_rgba(20,27,43,0.03)] hover:bg-surface-container transition-all text-center"
              >
                <StitchIcon name="bookmark_heart" className="text-error text-[22px]" size={22} />
                <span className="font-label-sm text-label-sm text-on-surface mt-1 font-semibold">Mistakes</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">4 Flagged</span>
              </Link>
            </div>

            {/* Learning Path Section Header */}
            <div className="flex items-center justify-between pt-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Learning Pathway</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-bold">
                  6
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">NCERT Standard</span>
            </div>

            {/* Step-by-Step Learning Checklist */}
            <div className="flex flex-col gap-space-sm">
              {/* STEP 1: COMPLETED */}
              <div className="group relative rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_4px_rgba(20,27,43,0.03)] transition-all">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 mt-0.5">
                    <StitchIcon name="check" className="text-[20px]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                        1. NCERT Reading (p. 23–34)
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-[10px] font-semibold">
                        Done
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Highlighted 14 key facts, 1 audio footnote recorded.
                    </p>
                    <div className="flex items-center gap-space-md mt-2 text-on-surface-variant">
                      <span className="inline-flex items-center gap-1 font-label-sm text-[11px]">
                        <StitchIcon name="history" className="text-[14px] text-secondary" size={14} /> Read 2h ago
                      </span>
                      <Link
                        href="/ncert/monera-archaebacteria"
                        className="inline-flex items-center gap-1 font-label-sm text-[11px] text-primary hover:underline font-semibold"
                      >
                        Review notes <StitchIcon name="arrow_forward" className="text-[13px]" size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: ACTIVE */}
              <div className="relative rounded-xl bg-surface-container-lowest p-space-md shadow-[0_4px_16px_rgba(79,70,229,0.08)] bg-gradient-to-r from-primary-fixed/20 via-surface-container-lowest to-surface-container-lowest">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span className="font-label-md text-label-md font-bold">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-primary font-bold truncate">
                        Fingertips DPP (25 Questions)
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] font-bold">
                        Active
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">15/25 completed • Avg time 48s/question</p>
                    <div className="w-full bg-surface-container h-2 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="font-label-sm text-label-sm text-on-surface font-medium">Current: Q16 (Chrysophytes)</span>
                      </div>
                      <Link
                        href="/dpp"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary hover:bg-primary transition-transform active:scale-95 shadow-sm"
                      >
                        <span className="font-label-sm text-label-sm font-semibold">Continue Practice</span>
                        <StitchIcon name="play_arrow" className="text-[16px]" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: UP NEXT */}
              <div className="relative rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_4px_rgba(20,27,43,0.03)] hover:shadow-md transition-all">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 mt-0.5 font-label-md font-bold">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">3. View Mind Map</h2>
                      <StitchIcon name="lock_open" className="text-[18px] text-outline" size={18} />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Kingdom Monera, Protista, Fungi branch taxonomies.</p>
                    <Link
                      href="/mindmaps"
                      className="mt-2.5 p-2 rounded-lg bg-surface-container-low flex items-center justify-between hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <StitchIcon name="hub" className="text-primary text-[20px]" size={20} />
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface font-semibold">Five Kingdom Flowchart</span>
                          <span className="font-label-sm text-[10px] text-on-surface-variant">Whittaker (1969) classification</span>
                        </div>
                      </div>
                      <span className="font-label-sm text-[11px] text-primary font-semibold">Inspect</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* STEP 4: FLASHCARDS */}
              <div className="relative rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_4px_rgba(20,27,43,0.03)]">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 mt-0.5 font-label-md font-bold">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                        4. Flashcards (20 Cards)
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-[10px] font-semibold">
                        SRS Due in 2d
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Spaced repetition schedule: Cell wall types &amp; flagella.
                    </p>
                    <Link href="/flashcards" className="flex items-center gap-space-sm mt-2">
                      <div className="flex -space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-secondary text-[9px] text-on-secondary font-bold flex items-center justify-center">12</span>
                        <span className="w-5 h-5 rounded-full bg-tertiary text-[9px] text-on-tertiary font-bold flex items-center justify-center">5</span>
                        <span className="w-5 h-5 rounded-full bg-outline text-[9px] text-on-primary font-bold flex items-center justify-center">3</span>
                      </div>
                      <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold">12 Mastered • 5 Review • 3 New</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* STEP 5: PYQ VAULT */}
              <div className="relative rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_4px_rgba(20,27,43,0.03)]">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 mt-0.5 font-label-md font-bold">
                    5
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                        5. Solve PYQs (32 Questions)
                      </h2>
                      <span className="font-label-sm text-label-sm font-semibold text-tertiary">2012–2024</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Real past entrance test papers with verified NTA answer keys.
                    </p>
                    <Link href="/pyq-vault" className="inline-flex items-center gap-1 font-label-sm text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded mt-2">
                      <StitchIcon name="grade" className="text-[13px] text-primary" size={13} /> High repeated weightage
                    </Link>
                  </div>
                </div>
              </div>

              {/* STEP 6: CHAPTER MOCK TEST */}
              <div className="relative rounded-xl bg-surface-container-lowest p-space-md shadow-[0_1px_4px_rgba(20,27,43,0.03)] opacity-85">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 mt-0.5 font-label-md font-bold">
                    6
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">6. Take Chapter Test</h2>
                      <StitchIcon name="lock" className="text-[18px] text-outline" size={18} />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Timed CBT evaluation (30 mins • 45 Marks • -1 Negative).
                    </p>
                    <span className="inline-block mt-2 font-label-sm text-[11px] text-on-surface-variant">
                      Unlocks when Step 2 &amp; 5 reach 80%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Doubt Assist Callout Tile */}
            <div className="rounded-xl bg-surface-container-high p-space-md flex items-center justify-between gap-space-sm mt-space-xs">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
                  <StitchIcon name="psychology" className="text-[20px]" size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-[14px] leading-tight text-on-surface font-bold truncate">
                    Confused about Dinoflagellates?
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Ask Kriti AI to explain red tides &amp; toxins
                  </span>
                </div>
              </div>
              <Link
                href="/ai-tutor"
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-bright flex-shrink-0"
              >
                Ask AI
              </Link>
            </div>
          </div>

          {/* Persistent Bottom Action Floating Anchor */}
          <div className="sticky bottom-0 z-40 w-full px-gutter pb-space-md pt-2 bg-gradient-to-t from-surface via-surface/95 to-transparent">
            <div className="w-full bg-inverse-surface text-inverse-on-surface rounded-xl p-space-sm shadow-[0_8px_24px_rgba(20,27,43,0.14)] flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0 pl-1">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse flex-shrink-0"></div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-[11px] text-outline-variant font-medium uppercase tracking-wider">
                    Next Milestone
                  </span>
                  <span className="font-headline-sm text-[13px] leading-tight text-surface-container-lowest font-semibold truncate">
                    Complete DPP Question 16
                  </span>
                </div>
              </div>
              <button
                onClick={handleResume}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-bold flex items-center gap-1.5 flex-shrink-0 shadow-md active:scale-95 transition-all"
              >
                <span>{resuming ? 'Loading...' : 'Resume'}</span>
                <StitchIcon name="chevron_right" className="text-[16px]" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
