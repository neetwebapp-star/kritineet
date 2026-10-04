'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function DppChallengerPage() {
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
      title="Batch Commit Audit"
      subtitle="Allen AITS Major 08 • 42 Questions"
      showBack={true}
      backHref="/dpp"
      rightAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
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
      <div className="max-w-5xl mx-auto w-full space-y-6 pb-36">
        {/* Top Live Generation Status Ribbon */}
        <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f7ee] text-[#006c49] font-headline text-xs font-semibold border border-[#b6eed4]">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
              High-Rigor Algorithm (35% Challenger Calibrated)
            </span>
            <span className="font-code-sm text-xs text-[#777587] flex items-center gap-1.5 font-semibold bg-[#f1f3ff] px-2.5 py-1 rounded-full border border-[#e9edff]">
              <StitchIcon name="verified" className="text-[15px] text-[#006c49]" size={15} />
              v4.8-NEET Blueprinted
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] tracking-tight">
              DPP #44: Botany &amp; Cell Bio Drill
            </h1>
            <p className="text-sm font-sans text-[#464555] mt-1">
              Auto-assembled from batch commit #8A49 • Target Batch 2026-B8 • High Rigor Benchmark
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl p-3 text-center">
              <div className="text-2xl font-headline font-bold text-[#3525cd]">25</div>
              <div className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider mt-0.5">Questions</div>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl p-3 text-center">
              <div className="text-2xl font-headline font-bold text-[#141b2b]">100</div>
              <div className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider mt-0.5">Total Marks</div>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl p-3 text-center">
              <div className="text-2xl font-headline font-bold text-[#141b2b]">35m</div>
              <div className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider mt-0.5">Duration</div>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl p-3 text-center">
              <div className="text-2xl font-headline font-bold text-[#ba1a1a]">+4 / -1</div>
              <div className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider mt-0.5">NTA Marking</div>
            </div>
          </div>
        </div>

        {/* Generation Quality & Compliance Audit */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e9edff] shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="font-label-sm text-label-sm text-[#3525cd] font-bold tracking-wider uppercase">
                Audit Engine
              </span>
              <h2 className="text-lg sm:text-xl font-headline font-bold text-[#141b2b] mt-0.5">
                NCERT Blueprint Fidelity
              </h2>
            </div>
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle className="text-[#e9edff]" cx="24" cy="24" fill="none" r="20" stroke="currentColor" strokeWidth="4.5"></circle>
                <circle
                  className="text-[#3525cd]"
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
                <span className="font-headline text-xs font-bold text-[#141b2b]">99%</span>
              </div>
            </div>
          </div>

          {/* 4-Stat Grid: Properly spaced across 4 columns on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-[#464555] font-headline text-xs font-semibold">
                  <StitchIcon name="balance" className="text-[16px] text-[#3525cd]" size={16} />
                  Difficulty Split
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-headline text-[10px] font-bold">
                  ⚡ +35% Rigor
                </span>
              </div>
              <p className="text-base font-headline font-bold text-[#141b2b]">20 • 45 • 35%</p>
              <p className="text-[11px] font-sans text-[#777587]">Easy (5) : NEET (11) : Challenger (9)</p>
            </div>

            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-headline text-xs font-semibold">
                <StitchIcon name="menu_book" className="text-[16px] text-[#006c49]" size={16} />
                NCERT Mapping
              </div>
              <p className="text-base font-headline font-bold text-[#006c49]">100% Line Verified</p>
              <p className="text-[11px] font-sans text-[#777587]">0 Unmapped textbook items</p>
            </div>

            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-headline text-xs font-semibold">
                <StitchIcon name="psychology" className="text-[16px] text-[#004598]" size={16} />
                Cognitive Bloom
              </div>
              <p className="text-base font-headline font-bold text-[#141b2b]">L1: 4 • L2: 9 • L3: 12</p>
              <p className="text-[11px] font-sans text-[#777587]">48% High-Order Analysis</p>
            </div>

            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-headline text-xs font-semibold">
                <StitchIcon name="warning" className="text-[16px] text-[#ba1a1a]" size={16} />
                Distractor Index
              </div>
              <p className="text-base font-headline font-bold text-[#141b2b]">11 Trap Items</p>
              <p className="text-[11px] font-sans text-[#777587]">Elevated negative marking pressure</p>
            </div>
          </div>

          {/* Segmented Breakdown Progress Bar */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#e9edff]">
            <div className="flex justify-between items-center text-xs font-headline">
              <span className="text-[#141b2b] font-bold">Subject Domain Distribution</span>
              <span className="text-[#777587] font-medium">25 Questions Total</span>
            </div>
            <div className="w-full h-3 bg-[#e9edff] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#3525cd]" style={{ width: '48%' }} title="Cell Biology: 12 Qs"></div>
              <div className="h-full bg-[#004598]" style={{ width: '32%' }} title="Biological Classification: 8 Qs"></div>
              <div className="h-full bg-[#006c49]" style={{ width: '20%' }} title="Photosynthesis: 5 Qs"></div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs font-sans text-[#464555] pt-0.5 font-medium gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]"></span> Cell Bio (12 Qs / 48%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004598]"></span> Bio-Classification (8 Qs / 32%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]"></span> Bio-Energetics (5 Qs / 20%)
              </span>
            </div>
          </div>

          {/* Difficulty Calibration Status Strip */}
          <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e9edff] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <StitchIcon name="tune" className="text-[16px] text-[#3525cd] shrink-0" size={16} />
              <span className="font-headline text-xs text-[#141b2b] font-bold shrink-0">Difficulty Calibration:</span>
              <span className="font-code-sm text-xs text-[#464555] truncate">
                20% Easy | 45% NEET Standard | 35% Challenger
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e8f7ee] text-[#006c49] border border-[#b6eed4] font-headline text-[11px] font-bold uppercase tracking-wider shrink-0">
              Recalibrated
            </span>
          </div>
        </div>

        {/* Section Header & Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-headline font-bold text-[#141b2b]">
              Blueprint Samples
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-headline text-xs font-semibold border border-[#e9edff]">
              3 of 25
            </span>
          </div>
          <Link
            href="/dpp"
            className="text-[#3525cd] font-headline text-sm font-semibold flex items-center gap-1 hover:underline group"
          >
            <span>Full 25 Grid</span>
            <StitchIcon name="chevron_right" className="text-[16px] group-hover:translate-x-0.5 transition-transform" size={16} />
          </Link>
        </div>

        {/* Question Sample Cards */}
        <div className="flex flex-col gap-4">
          {/* Question Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col gap-3.5 hover:border-[#c3c0ff] transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] font-headline text-xs font-bold border border-[#e9edff]">
                  Q01
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8f7ee] text-[#006c49] font-headline text-xs font-semibold border border-[#b6eed4] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-pulse"></span>
                  High-Rigor Algorithm (35% Challenger)
                </span>
              </div>
              <span className="font-code-sm text-xs text-[#777587] flex items-center gap-1">
                <StitchIcon name="timer" className="text-[14px]" size={14} /> 45s
              </span>
            </div>
            <p className="font-sans text-base text-[#141b2b] font-medium leading-relaxed">
              Which sub-cellular organelle features thylakoid membranes where active photophosphorylation drives proton accumulation inside the lumen?
            </p>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">
                Cell Biology
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">
                NCERT XI p.136
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] font-headline text-xs font-semibold">
                Bloom L2: Understanding
              </span>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#006c49] text-white text-xs flex items-center justify-center font-bold shrink-0">
                  C
                </span>
                <span className="font-sans text-sm text-[#141b2b] font-medium">Chloroplast Granum Matrix</span>
              </div>
              <span className="font-headline text-xs text-[#006c49] flex items-center gap-1 font-semibold shrink-0">
                <StitchIcon name="check_circle" className="text-[15px]" size={15} /> Verified Key
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#e9edff]">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-headline text-xs flex items-center gap-1.5 active:scale-95 transition-all font-semibold border border-[#e9edff] cursor-pointer"
              >
                <StitchIcon name="swap_horiz" className="text-[15px] text-[#3525cd]" size={15} />
                <span>Swap Item</span>
              </button>
              <Link
                href="/drills/assertion-reason"
                className="px-3.5 py-1.5 rounded-lg bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-headline text-xs flex items-center gap-1.5 active:scale-95 transition-all font-semibold"
              >
                <StitchIcon name="visibility" className="text-[15px]" size={15} />
                <span>Full Stem</span>
              </Link>
            </div>
          </div>

          {/* Question Card 2: Assertion Reason with High Trap */}
          <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col gap-3.5 hover:border-[#c3c0ff] transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] font-headline text-xs font-bold border border-[#e9edff]">
                  Q07
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-headline text-xs font-bold border border-[#ffb4ab]">
                  Challenger • L4 Analysis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] font-headline text-xs font-bold flex items-center gap-1 shadow-xs">
                  <StitchIcon name="bolt" className="text-[13px] text-[#3525cd]" size={13} /> Tier-1 Challenger
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6]/60 text-[#ba1a1a] font-headline text-xs flex items-center gap-1 font-semibold">
                  <StitchIcon name="priority_high" className="text-[12px]" size={12} /> Reverse Trap
                </span>
              </div>
            </div>
            <div className="space-y-2 bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl text-sm font-sans text-[#141b2b]">
              <p>
                <strong className="text-[#3525cd] font-headline">Assertion (A):</strong> Chemiosmotic coupling synthesis of ATP requires an uninterrupted intact proton gradient across the thylakoid membrane.
              </p>
              <p>
                <strong className="text-[#3525cd] font-headline">Reason (R):</strong> Breakdown of proton gradient is catalysed by CF₀ channel leading to conformational shift in CF₁ active subunit.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">
                NCERT Exemplar
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">
                Photosynthesis p.213
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#cedbff] text-[#004598] font-headline text-xs font-semibold">
                Distractor Weight: 42%
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e9edff]">
              <span className="font-sans text-xs text-[#464555]">
                Answer: <strong className="text-[#141b2b] font-semibold">Option (A) [A &amp; R True, R Explains]</strong>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-headline text-xs flex items-center gap-1.5 active:scale-95 transition-all font-semibold border border-[#e9edff] cursor-pointer"
              >
                <StitchIcon name="swap_horiz" className="text-[15px] text-[#3525cd]" size={15} />
                <span>Swap Item</span>
              </button>
            </div>
          </div>

          {/* Question Card 3: Diagram Question */}
          <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col gap-3.5 hover:border-[#c3c0ff] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] font-headline text-xs font-bold border border-[#e9edff]">
                  Q14
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#3525cd] font-headline text-xs font-semibold border border-[#e9edff]">
                  NEET Standard • Diagram Stem
                </span>
              </div>
              <span className="font-code-sm text-xs text-[#777587] flex items-center gap-1">
                <StitchIcon name="timer" className="text-[14px]" size={14} /> 60s
              </span>
            </div>
            <p className="font-sans text-base text-[#141b2b] font-medium leading-relaxed">
              Identify the marked region (X) on the chloroplast ultrastructure diagram and evaluate its primary enzymatic biochemical function:
            </p>
            <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-2 text-[#464555]">
                <StitchIcon name="image" size={36} className="text-[#3525cd]" />
                <span className="font-headline text-xs font-semibold">Chloroplast Internal Thylakoid Stroma Lamellae</span>
                <span className="font-sans text-[11px] text-[#777587]">Verbatim Figure 13.6, NCERT Biology Class XI</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#e9edff]">
              <span className="font-sans text-xs text-[#464555]">
                Key: <strong className="text-[#006c49] font-semibold">Rubisco Dark Reaction Stroma Matrix</strong>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-headline text-xs flex items-center gap-1.5 active:scale-95 transition-all font-semibold border border-[#e9edff] cursor-pointer"
              >
                <StitchIcon name="swap_horiz" className="text-[15px] text-[#3525cd]" size={15} />
                <span>Swap Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gamification & Streak multiplier callout */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#e8f7ee] border border-[#b6eed4] text-[#006c49]">
          <div className="w-8 h-8 rounded-full bg-[#006c49] text-white flex items-center justify-center shrink-0">
            <StitchIcon name="local_fire_department" size={18} />
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#006c49] leading-relaxed">
            Completing this Challenger DPP unlocks the <strong>7-Day Botanical Habit Streak</strong> multiplier (+150 XP towards Target AIR 500).
          </p>
        </div>
      </div>

      {/* Sticky Action Footer Bar (offset on desktop lg:left-64 xl:left-72) */}
      <div className="fixed bottom-0 left-0 lg:left-64 xl:left-72 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e9edff] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
          <button
            aria-label="Export PDF"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="py-3 px-4 sm:px-5 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] border border-[#e9edff] text-[#141b2b] font-headline text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            title="Export Paper & OMR PDF"
            type="button"
          >
            <StitchIcon name="picture_as_pdf" size={18} />
            <span className="hidden sm:inline">Export OMR &amp; PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            className={`flex-1 py-3 px-5 rounded-xl font-headline text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer ${
              deployed
                ? 'bg-[#006c49] text-white'
                : 'bg-[#3525cd] text-white hover:bg-[#2b1ea8]'
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
                <StitchIcon name="check_circle" size={18} />
                <span>Published Successfully to Batch!</span>
              </>
            ) : (
              <>
                <StitchIcon name="rocket_launch" size={18} />
                <span>Deploy DPP to 1,240 Students</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
