"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/stitch/AppShell";

export default function DppTunedPage() {
  const router = useRouter();
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployed, setDeployed] = useState<boolean>(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployed(true);
      setTimeout(() => {
        setDeployed(false);
      }, 3000);
    }, 1200);
  };

  return (
    <AppShell
      title="Tuned Practice Batch Commit"
      subtitle="Allen AITS Major 08 • 42 Questions"
      showBack={true}
      backHref="/dpp"
      rightAction={
        <div className="flex items-center gap-2">
          <button
            aria-label="Export PDF"
            className="w-10 h-10 rounded-xl bg-white border border-[#e9edff] flex items-center justify-center text-[#141b2b] hover:bg-[#f1f3ff] transition-colors cursor-pointer"
            title="Export Paper & OMR PDF"
            type="button"
          >
            <StitchIcon name="picture_as_pdf" size={18} />
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-24">
          {/* Top Live Generation Status Ribbon */}
          <div className="px-gutter pt-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  High-Rigor Algorithm (35% Challenger • 60% AR &amp; Multi-Statement)
                </span>
                <span className="font-code-sm text-code-sm text-outline flex items-center gap-1">
                  <StitchIcon name="verified" className="text-[15px] text-secondary" size={15} />
                  v4.8-NEET
                </span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  DPP #44: Botany &amp; Cell Bio Drill
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Auto-assembled from batch commit #8A49 • Question Type Mix: 60% Analytical Stems (AR / Multi-Statement)
                </p>
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-4 gap-space-xs pt-space-xs text-center">
                <div className="bg-surface-container-low rounded-lg p-2">
                  <div className="font-headline-sm text-headline-sm text-primary font-bold">25</div>
                  <div className="font-label-sm text-[10px] text-outline uppercase tracking-wider">Questions</div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-2">
                  <div className="font-headline-sm text-headline-sm text-on-surface font-bold">100</div>
                  <div className="font-label-sm text-[10px] text-outline uppercase tracking-wider">Marks</div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-2">
                  <div className="font-headline-sm text-headline-sm text-on-surface font-bold">35m</div>
                  <div className="font-label-sm text-[10px] text-outline uppercase tracking-wider">Duration</div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-2">
                  <div className="font-headline-sm text-headline-sm text-error font-bold">+4 / -1</div>
                  <div className="font-label-sm text-[10px] text-outline uppercase tracking-wider">Marking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Generation Quality & Compliance Audit */}
          <div className="px-gutter pt-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-md border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
                    Audit Engine
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    NCERT Blueprint Fidelity
                  </h3>
                </div>
                {/* Score Circular Gauge SVG */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                    <circle
                      className="text-surface-container-high"
                      cx="24"
                      cy="24"
                      fill="none"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4.5"
                    ></circle>
                    <circle
                      className="text-primary-container"
                      cx="24"
                      cy="24"
                      fill="none"
                      r="20"
                      stroke="currentColor"
                      strokeDasharray="125.66"
                      strokeDashoffset="1.2"
                      strokeLinecap="round"
                      strokeWidth="4.5"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-sm text-[12px] font-bold text-on-surface">99%</span>
                  </div>
                </div>
              </div>

              {/* 4-Stat Grid */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <StitchIcon name="balance" className="text-[16px] text-primary" size={16} />
                      Difficulty Split
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[9px] font-bold">
                      ⚡ Challenger +35%
                    </span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">20 • 45 • 35%</p>
                  <p className="font-body-sm text-[11px] text-outline">Easy (5) : NEET Level (11) : Challenger (9)</p>
                </div>

                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <StitchIcon name="menu_book" className="text-[16px] text-secondary" size={16} />
                    NCERT Mapping
                  </div>
                  <p className="font-headline-sm text-headline-sm text-secondary font-semibold">100% Verified</p>
                  <p className="font-body-sm text-[11px] text-outline">0 Unmapped line items</p>
                </div>

                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <StitchIcon name="psychology" className="text-[16px] text-tertiary" size={16} />
                      Cognitive Bloom
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[9px] font-bold">
                      60% L3/L4
                    </span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">L1: 3 • L2: 7 • L3/L4: 15</p>
                  <p className="font-body-sm text-[11px] text-outline">60% High-Order Synthesis &amp; Analysis</p>
                </div>

                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <StitchIcon name="format_list_numbered" className="text-[16px] text-primary" size={16} />
                      Question Type Mix
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[9px] font-bold">
                      60% High-Cognitive
                    </span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">AR: 8 • Multi: 7 • MCQ: 10</p>
                  <p className="font-body-sm text-[11px] text-outline">32% AR • 28% Multi-Stmt • 40% Standard</p>
                </div>
              </div>

              {/* Segmented Breakdown Progress Bar */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between items-center text-label-sm font-label-sm">
                  <span className="text-on-surface font-medium">Subject Domain Ratio</span>
                  <span className="text-outline">25 Questions Total</span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary-container" style={{ width: "48%" }} title="Cell Biology: 12 Qs"></div>
                  <div className="h-full bg-tertiary-container" style={{ width: "32%" }} title="Biological Classification: 8 Qs"></div>
                  <div className="h-full bg-secondary" style={{ width: "20%" }} title="Photosynthesis: 5 Qs"></div>
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] font-label-sm text-on-surface-variant pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                    Cell Bio (12)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                    Bio-Classification (8)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Bio-Energetics (5)
                  </span>
                </div>
              </div>

              <div className="mt-1 p-2 rounded-lg bg-surface-container-low flex items-center justify-between border border-primary/20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <StitchIcon name="tune" className="text-[15px] text-primary shrink-0" size={15} />
                  <span className="font-label-sm text-[11px] text-on-surface font-semibold shrink-0">Stem Tuning:</span>
                  <span className="font-code-sm text-[11px] text-on-surface-variant truncate">
                    32% Assertion-Reason | 28% Multi-Statement | 40% MCQ
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider shrink-0">
                  Tuned
                </span>
              </div>
            </div>
          </div>

          {/* Section Header & Controls */}
          <div className="px-gutter pt-space-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Blueprint Samples</h3>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                3 of 25
              </span>
            </div>
            <Link href="/question-bank" className="text-primary font-label-md text-label-md flex items-center gap-0.5 hover:underline">
              Full 25 Grid
              <StitchIcon name="chevron_right" className="text-[16px]" size={16} />
            </Link>
          </div>

          {/* Question Sample Cards */}
          <div className="px-gutter pt-space-sm flex flex-col gap-space-sm">
            {/* Question Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">
                    Q01
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px] font-bold">
                    Assertion-Reason Type
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px] flex items-center gap-1 font-bold shadow-xs">
                    <StitchIcon name="bolt" className="text-[13px]" size={13} /> Tier-1 Challenger
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-error font-label-sm text-[11px] flex items-center gap-1">
                    <StitchIcon name="priority_high" className="text-[12px]" size={12} /> Reverse Trap
                  </span>
                </div>
                <span className="font-code-sm text-[11px] text-outline flex items-center gap-1 shrink-0">
                  <StitchIcon name="timer" className="text-[13px]" size={13} /> 50s
                </span>
              </div>
              <div className="space-y-1 bg-surface-container-low/70 p-2.5 rounded-lg text-body-sm font-body-sm text-on-surface">
                <p><strong className="text-primary">Assertion (A):</strong> Chemiosmotic coupling synthesis of ATP requires an uninterrupted intact proton gradient across the thylakoid membrane.</p>
                <p><strong className="text-primary">Reason (R):</strong> Breakdown of proton gradient is catalysed by CF₀-CF₁ complex leading to conformational shift in CF₁ catalytic subunit.</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                  Photosynthesis p.213
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                  NCERT Exemplar
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[11px]">
                  Key: Both True, R Explains
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-label-sm text-[11px] text-secondary flex items-center gap-0.5">
                  <StitchIcon name="verified" className="text-[14px]" size={14} /> Validated Assertion Pair
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform cursor-pointer">
                    <StitchIcon name="swap_horiz" className="text-[15px]" size={15} /> Swap Item
                  </button>
                  <Link href="/drills/assertion-reason" className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform">
                    <StitchIcon name="visibility" className="text-[15px]" size={15} /> Full Stem
                  </Link>
                </div>
              </div>
            </div>

            {/* Question Card 2: Multi-Statement */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">
                    Q05
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold">
                    Multi-Statement Stem
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px]">
                    Challenger • L4 Analysis
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-[11px]">
                    NMC High Yield
                  </span>
                </div>
                <span className="font-code-sm text-[11px] text-outline flex items-center gap-1 shrink-0">
                  <StitchIcon name="timer" className="text-[13px]" size={13} /> 65s
                </span>
              </div>
              <div className="space-y-1 bg-surface-container-low/70 p-2.5 rounded-lg text-body-sm font-body-sm text-on-surface">
                <p className="font-medium text-on-surface">Consider the following statements regarding Archaebacteria and biological classification:</p>
                <ul className="space-y-1 text-[12px] pt-1 pl-1">
                  <li className="flex gap-1.5">
                    <span className="font-bold text-primary">(I)</span>
                    <span>Methanogens are obligate anaerobes producing methane from formate and acetate.</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="font-bold text-primary">(II)</span>
                    <span>Cell wall of Archaebacteria lacks peptidoglycan and contains pseudomurein with β(1-3) glycosidic bonds.</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="font-bold text-primary">(III)</span>
                    <span>Halophiles possess bacteriorhodopsin in purple membranes capable of light-driven ATP synthesis without chlorophyll.</span>
                  </li>
                </ul>
                <p className="pt-1 font-semibold text-primary">Which of the above statements are correct?</p>
                <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 text-on-surface-variant">
                  <span>A) I and II only</span>
                  <span>B) II and III only</span>
                  <span className="text-secondary font-semibold">C) I, II and III (Key)</span>
                  <span>D) I and III only</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                  Biological Classification
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                  NCERT XI p.19
                </span>
                <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[11px]">
                  3-Statement Combinatorial
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-label-sm text-[11px] text-secondary flex items-center gap-0.5">
                  <StitchIcon name="verified" className="text-[14px]" size={14} /> Answer: Option (C)
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform cursor-pointer">
                    <StitchIcon name="swap_horiz" className="text-[15px]" size={15} /> Swap Item
                  </button>
                  <Link href="/psychometrics/distractor-sim-q1" className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform">
                    <StitchIcon name="visibility" className="text-[15px]" size={15} /> Full Stem
                  </Link>
                </div>
              </div>
            </div>

            {/* Question Card 3: Diagram */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">
                    Q14
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px]">
                    Diagram Stem • Match &amp; Statement Analysis
                  </span>
                </div>
                <span className="font-code-sm text-[11px] text-outline flex items-center gap-1">
                  <StitchIcon name="timer" className="text-[13px]" size={13} /> 55s
                </span>
              </div>
              <div className="flex items-start gap-space-sm">
                <div className="w-16 h-16 rounded-lg bg-surface-container flex flex-col items-center justify-center shrink-0 text-outline">
                  <StitchIcon name="eyeglasses_2" className="text-[28px] text-primary" size={28} />
                  <span className="text-[9px] font-label-sm uppercase">Fig 8.5</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-body-md text-body-md text-on-surface font-medium line-clamp-2">
                    Identify labelled parts (W, X, Y) in Mitochondria cross-section and indicate outer membrane porin channel locations.
                  </p>
                  <span className="text-[11px] font-label-sm text-outline pt-1">NCERT Class 11 • Chapter 8</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-label-sm text-[11px] text-secondary flex items-center gap-1">
                  <StitchIcon name="auto_awesome" className="text-[14px]" size={14} /> High Yield Diagram
                </span>
                <button type="button" className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform cursor-pointer">
                  <StitchIcon name="swap_horiz" className="text-[15px]" size={15} /> Swap Item
                </button>
              </div>
            </div>
          </div>

          {/* Cohort & Deployment Targeting */}
          <div className="px-gutter pt-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-md border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <StitchIcon name="groups" className="text-[20px]" size={20} />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Target Cohort &amp; Schedule</h3>
                  <p className="font-body-sm text-[11px] text-outline">Automated classroom sync &amp; adaptive distribution</p>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Active Batch Distribution</label>
                <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <div>
                      <p className="font-headline-sm text-body-md font-semibold text-on-surface">
                        Rankers Elite Batch 2026 (Sec B8)
                      </p>
                      <p className="font-body-sm text-[11px] text-outline">1,240 enrolled NEET aspirants</p>
                    </div>
                  </div>
                  <StitchIcon name="expand_more" className="text-outline text-[20px]" size={20} />
                </div>
              </div>

              {/* Release Mode & Switch */}
              <div className="grid grid-cols-2 gap-space-xs">
                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <StitchIcon name="tune" className="text-[16px] text-primary" size={16} />
                      Stem Calibration
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[9px] font-bold">
                      60% Analytical
                    </span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">32% AR • 28% Multi</p>
                  <p className="font-body-sm text-[11px] text-outline">AR: 8 • Multi-Stmt: 7 • MCQ: 10</p>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                  <span className="font-label-sm text-[11px] text-outline">Auto-Publish</span>
                  <div className="flex items-center gap-1 text-on-surface font-headline-sm text-[13px] font-semibold">
                    <StitchIcon name="alarm" className="text-[16px] text-secondary" size={16} />
                    Tomorrow 06:00 AM
                  </div>
                  <p className="text-[10px] text-on-surface-variant">Daily routine window sync</p>
                </div>
              </div>

              {/* Streak Gamification Integration Note */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low">
                <StitchIcon name="local_fire_department" className="text-tertiary-container text-[20px]" size={20} />
                <p className="font-body-sm text-[12px] text-on-surface">
                  Eligible for <strong>7-Day Botanical Habit Streak</strong> multiplier (+150 XP).
                </p>
              </div>
            </div>
          </div>

        {/* Sticky Action Footer Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#e9edff] shadow-xs flex items-center justify-between gap-4">
          <button
            aria-label="Export PDF"
            className="h-11 px-4 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            title="Export Paper & OMR PDF"
            type="button"
          >
            <StitchIcon name="picture_as_pdf" size={18} />
            <span>Export OMR & Solution PDF</span>
          </button>
          <button
            className={`h-11 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer ${
              deployed
                ? "bg-[#006c49] text-white"
                : "bg-[#3525cd] text-white hover:bg-[#2b1ea8]"
            }`}
            onClick={handleDeploy}
            disabled={isDeploying}
            type="button"
          >
            {isDeploying ? (
              <>
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Deploying DPP #44...</span>
              </>
            ) : deployed ? (
              <>
                <StitchIcon name="check_circle" size={16} />
                <span>Published Successfully!</span>
              </>
            ) : (
              <>
                <StitchIcon name="rocket_launch" size={16} />
                <span>Deploy DPP to 1,240 Students</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
