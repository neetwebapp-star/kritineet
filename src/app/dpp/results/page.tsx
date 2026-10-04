'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function DppResultsPage() {
  return (
    <AppShell
      title="DPP Generation Results"
      subtitle="Batch Assembly • 25 Questions"
      showBack={true}
      backHref="/dpp"
      rightAction={
        <Link
          href="/cbt?mode=dpp&batch=44"
          className="px-3.5 py-1.5 bg-[#3525cd] text-white rounded-full font-label-sm text-label-sm font-semibold hover:bg-[#2b1ea8] transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>Start CBT</span>
          <StitchIcon name="arrow_forward" size={14} />
        </Link>
      }
    >
      <div className="space-y-6 pb-36 max-w-5xl mx-auto">
        {/* Top Live Generation Status Ribbon */}
        <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f7ee] text-[#006c49] font-label-sm text-label-sm font-semibold border border-[#b6eed4]">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
              Algorithm Calibrated (100% Match)
            </span>
            <span className="font-code-sm text-code-sm text-[#777587] flex items-center gap-1.5 font-semibold bg-[#f1f3ff] px-2.5 py-1 rounded-full border border-[#e9edff]">
              <StitchIcon name="verified" className="text-[15px] text-[#006c49]" size={15} />
              v4.8-NEET Blueprinted
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] tracking-tight">
              DPP #44: Botany &amp; Cell Biology Drill
            </h1>
            <p className="text-sm font-sans text-[#464555] mt-1">
              Auto-assembled from batch commit #8A49 • Target Batch 2026-B8 • High Yield Focus
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

          {/* 4-Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-label-sm text-label-sm font-semibold">
                <StitchIcon name="balance" className="text-[16px] text-[#3525cd]" size={16} />
                Difficulty Split
              </div>
              <p className="text-base font-headline font-bold text-[#141b2b]">32 • 48 • 20%</p>
              <p className="text-[11px] font-sans text-[#777587]">Easy : NEET Level : Challenger</p>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-label-sm text-label-sm font-semibold">
                <StitchIcon name="menu_book" className="text-[16px] text-[#006c49]" size={16} />
                NCERT Mapping
              </div>
              <p className="text-base font-headline font-bold text-[#006c49]">100% Line Verified</p>
              <p className="text-[11px] font-sans text-[#777587]">0 Unmapped textbook items</p>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-label-sm text-label-sm font-semibold">
                <StitchIcon name="psychology" className="text-[16px] text-[#004598]" size={16} />
                Cognitive Bloom
              </div>
              <p className="text-base font-headline font-bold text-[#141b2b]">L1:6 • L2:10 • L3:9</p>
              <p className="text-[11px] font-sans text-[#777587]">36% High-Order Analysis</p>
            </div>
            <div className="bg-[#f9f9ff] border border-[#e9edff] p-3.5 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#464555] font-label-sm text-label-sm font-semibold">
                <StitchIcon name="warning" className="text-[16px] text-[#ba1a1a]" size={16} />
                Distractor Index
              </div>
              <p className="text-base font-headline font-bold text-[#141b2b]">8 Trap Items</p>
              <p className="text-[11px] font-sans text-[#777587]">Negative marking pressure calibrated</p>
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
                <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]"></span> Photosynthesis (5 Qs / 20%)
              </span>
            </div>
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] font-headline text-xs font-bold border border-[#e9edff]">
                  Q01
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8f7ee] text-[#006c49] font-headline text-xs font-semibold border border-[#b6eed4]">
                  Easy • 88% Expected Accuracy
                </span>
              </div>
              <span className="font-code-sm text-xs text-[#777587] flex items-center gap-1">
                <StitchIcon name="timer" className="text-[14px]" size={14} /> 45s
              </span>
            </div>
            <p className="font-sans text-base text-[#141b2b] font-medium leading-relaxed">
              Which sub-cellular organelle features thylakoid membranes where active photophosphorylation drives proton accumulation inside the lumen?
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">Cell Biology</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">NCERT XI p.136</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] font-headline text-xs font-semibold">Bloom L2: Understanding</span>
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
          </div>

          {/* Question Card 2: Assertion Reason with High Trap */}
          <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col gap-3.5 hover:border-[#c3c0ff] transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] font-headline text-xs font-bold border border-[#e9edff]">
                  Q07
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-headline text-xs font-bold border border-[#ffb4ab]">
                  Challenger • L4 Analysis
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6]/60 text-[#ba1a1a] font-headline text-xs flex items-center gap-1 font-semibold">
                <StitchIcon name="priority_high" className="text-[13px]" size={13} /> Reverse Trap
              </span>
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
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">NCERT Exemplar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-sans text-xs border border-[#e9edff]">Photosynthesis p.213</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#cedbff] text-[#004598] font-headline text-xs font-semibold">Distractor Weight: 42%</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e9edff]">
              <span className="font-sans text-xs text-[#464555]">
                Answer: <strong className="text-[#141b2b] font-semibold">Option (A) [A &amp; R True, R Explains]</strong>
              </span>
              <Link
                href="/remediation"
                className="px-3 py-1.5 rounded-lg bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-headline text-xs flex items-center gap-1.5 active:scale-95 transition-all font-semibold border border-[#e9edff]"
              >
                <StitchIcon name="analytics" className="text-[15px] text-[#3525cd]" size={15} />
                <span>Audit Distractor</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar: strictly offset on desktop (lg:left-64 xl:left-72) */}
      <div className="fixed bottom-0 left-0 lg:left-64 xl:left-72 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e9edff] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
          <Link
            href="/cbt?mode=dpp&batch=44"
            className="flex-1 py-3 px-5 bg-[#3525cd] text-white rounded-xl font-headline text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#2b1ea8] active:scale-[0.98] transition-all font-bold text-center"
          >
            <StitchIcon name="play_arrow" className="text-[20px]" size={20} />
            <span>Launch Practice Session</span>
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            className="py-3 px-5 bg-[#f1f3ff] border border-[#e9edff] text-[#141b2b] rounded-xl font-headline text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#e1e8fd] active:scale-[0.98] transition-all font-semibold cursor-pointer shrink-0"
            title="Print or Save DPP as PDF"
          >
            <StitchIcon name="print" className="text-[20px]" size={20} />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
