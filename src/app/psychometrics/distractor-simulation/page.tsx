"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DistractorSimulationPage() {
  const router = useRouter();

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 px-margin flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Back"
                className="min-w-[44px] min-h-[44px] -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-95 cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[22px]" size={22} />
              </button>
              <Image
                alt="Brand logo"
                className="h-8 w-auto object-contain shrink-0"
                src="/stitch/logo.png"
                width={32}
                height={32}
              />
              <div className="flex flex-col min-w-0 pr-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase truncate">
                    Kriti NEET OS
                  </span>
                </div>
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight">
                  Distractor Simulation &amp; Cognitive Audit
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Q05 • Archaebacteria Multi-Statement
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Bookmark Question"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="bookmark_border" className="text-[20px]" size={20} />
              </button>
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shadow-sm"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 w-full pt-2 pb-safe bg-surface">
          <div className="flex flex-col w-full pb-10 space-y-4">
            {/* Module Banner */}
            <div className="px-margin pt-2 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-container text-on-primary">
                    <StitchIcon name="psychology" className="text-[13px]" size={13} />
                    Faculty Distractor Lab
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant">
                    Simulated Cohort: N=1,240
                  </span>
                </div>
                <span className="text-label-sm font-label-sm text-secondary flex items-center gap-0.5">
                  <StitchIcon name="auto_awesome" className="text-[14px]" size={14} />
                  AI Projection v4.2
                </span>
              </div>

              {/* Question Master Details */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col space-y-3">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Botany • Biological Classification
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      NCERT Class 11, Ch 2, p. 19 | NMC High-Yield 2024.3
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-error-container text-on-error-container text-label-sm font-label-sm shrink-0">
                    Challenger Tier
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs pt-1">
                  <div className="bg-surface-container-low p-2 rounded-lg flex flex-col items-center text-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Bloom Level</span>
                    <span className="font-headline-sm text-headline-sm text-primary mt-0.5">L4 Analysis</span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg flex flex-col items-center text-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Avg Solvability</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5">65s</span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg flex flex-col items-center text-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Target Acc.</span>
                    <span className="font-headline-sm text-headline-sm text-error mt-0.5">42%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Stem Live Card */}
            <div className="px-margin flex flex-col space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5">
                  <StitchIcon name="quiz" className="text-primary text-[18px]" size={18} />
                  Stem &amp; Statement Breakdown
                </span>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                  Combinatorial
                </span>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-3">
                <div className="space-y-2">
                  <div className="bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-label-sm font-label-sm shrink-0 mt-0.5">
                      I
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md text-on-surface">
                        Methanogens are obligate anaerobes producing methane from formate and acetate.
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-label-sm font-label-sm text-secondary">
                        <StitchIcon name="check_circle" className="text-[13px]" size={13} /> Factually True • Formate pathway test
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-label-sm font-label-sm shrink-0 mt-0.5">
                      II
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md text-on-surface">
                        Cell wall of Archaebacteria lacks peptidoglycan and contains pseudomurein with β(1→3) glycosidic bonds.
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-label-sm font-label-sm text-tertiary">
                        <StitchIcon name="warning" className="text-[13px]" size={13} /> High-Trap • β(1→3) vs β(1→4) linkage
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-label-sm font-label-sm shrink-0 mt-0.5">
                      III
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md text-on-surface">
                        Halophiles possess bacteriorhodopsin in purple membranes capable of light-driven ATP synthesis without chlorophyll.
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-label-sm font-label-sm text-secondary">
                        <StitchIcon name="check_circle" className="text-[13px]" size={13} /> Exceptional Adaptation • <i>H. salinarum</i>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="font-label-md text-label-md text-on-surface-variant font-medium">
                    Which of the above statements are correct?
                  </p>
                </div>

                {/* Option Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-label-sm font-label-sm">
                  <div className="p-2 rounded-lg bg-surface-container-high/60 text-on-surface flex items-center justify-between">
                    <span>A) I and II only</span>
                    <span className="text-error font-semibold">28% Trap</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-high/60 text-on-surface flex items-center justify-between">
                    <span>B) II and III only</span>
                    <span className="text-on-surface-variant font-semibold">9% Trap</span>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary-container/50 text-on-secondary-container flex items-center justify-between font-bold">
                    <span>C) I, II and III</span>
                    <span className="flex items-center gap-0.5 text-secondary">41% Key</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-high/60 text-on-surface flex items-center justify-between">
                    <span>D) I and III only</span>
                    <span className="text-error font-semibold">22% Trap</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projected Cohort Response Simulation */}
            <div className="px-margin flex flex-col space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5">
                  <StitchIcon name="bar_chart" className="text-primary text-[18px]" size={18} />
                  Simulated Cohort Distribution
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">1,240 Aspirants</span>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-2 pb-1">
                  <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                      <StitchIcon name="radar" className="text-[18px]" size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm font-label-sm text-on-surface-variant">Discrimination (DI)</span>
                      <span className="font-headline-sm text-headline-sm text-secondary">
                        0.74 <span className="text-label-sm font-label-sm text-on-surface-variant font-normal">Superb</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                      <StitchIcon name="warning" className="text-[18px]" size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm font-label-sm text-on-surface-variant">Trap Gravity</span>
                      <span className="font-headline-sm text-headline-sm text-error">59% Misdirection</span>
                    </div>
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>Option A (I &amp; II)</span>
                      <span className="text-error font-semibold">28% (347 students)</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-error h-2 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>Option B (II &amp; III)</span>
                      <span className="text-on-surface-variant font-semibold">9% (112 students)</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-outline h-2 rounded-full" style={{ width: "9%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span className="font-bold text-secondary">Option C (Key: I, II &amp; III)</span>
                      <span className="text-secondary font-bold">41% (508 students)</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: "41%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>Option D (I &amp; III)</span>
                      <span className="text-error font-semibold">22% (273 students)</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-error/70 h-2 rounded-full" style={{ width: "22%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Dock */}
            <div className="px-margin pt-2 flex items-center gap-space-sm">
              <Link
                href="/psychometrics/distractor-sim-q1"
                className="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                AR Q01 Sim
              </Link>
              <Link
                href="/psychometrics/cognitive-audit"
                className="flex-1 py-3 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm text-center shadow-md hover:opacity-95 active:scale-98 transition-all"
              >
                Comparative Audit →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
