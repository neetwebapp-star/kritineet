"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ComparativeCognitiveAuditPage() {
  const router = useRouter();

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col items-center font-body-md">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Go back"
                className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[22px]" size={22} />
              </button>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate tracking-tight">
                  Comparative Cognitive Audit
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  AR Q01 vs Multi-Statement Q05 • Discrimination Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Filter"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="tune" className="text-[20px]" size={20} />
              </button>
              <button
                aria-label="Share"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="share" className="text-[20px]" size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 bg-surface pb-safe min-h-screen">
          <div className="flex flex-col w-full px-margin pb-space-2xl space-y-space-lg">
            {/* Top Cohort & Simulation Header */}
            <div className="flex flex-col space-y-space-sm pt-space-xs">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Cohort Benchmark • N=1,240 (Rankers Elite B8)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  <StitchIcon name="tune" className="text-[14px]" size={14} />
                  Simulation v4.2
                </span>
              </div>
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  AR Q01 vs Multi-Statement Q05
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Comparative Distractor Rigor &amp; Discrimination Analysis
                </p>
              </div>
            </div>

            {/* Key Metrics Differential Strip */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
              <div className="grid grid-cols-2 gap-space-sm">
                {/* AR Q01 Summary Tile */}
                <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md text-primary">AR Q01</span>
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                      Photosynthesis
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-on-surface">38%</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">accuracy</span>
                  </div>
                  <div className="mt-space-xs grid grid-cols-2 gap-1 pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                    <div>
                      <span className="text-outline font-label-sm">Time</span> 50s
                    </div>
                    <div>
                      <span className="text-outline font-label-sm">DI</span>{" "}
                      <span className="text-secondary font-label-md">0.78</span>
                    </div>
                    <div className="col-span-2 text-error">
                      <span className="text-outline font-label-sm text-on-surface-variant">Negative Drag</span> -1.32m
                    </div>
                  </div>
                </div>

                {/* Multi Q05 Summary Tile */}
                <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md text-tertiary">Multi Q05</span>
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                      Archaea
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-on-surface">42%</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">accuracy</span>
                  </div>
                  <div className="mt-space-xs grid grid-cols-2 gap-1 pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                    <div>
                      <span className="text-outline font-label-sm">Time</span> 65s
                    </div>
                    <div>
                      <span className="text-outline font-label-sm">DI</span>{" "}
                      <span className="text-secondary font-label-md">0.74</span>
                    </div>
                    <div className="col-span-2 text-error">
                      <span className="text-outline font-label-sm text-on-surface-variant">Negative Drag</span> -1.18m
                    </div>
                  </div>
                </div>
              </div>

              {/* Delta Callout Banner */}
              <div className="bg-error-container/40 rounded-lg p-space-sm flex items-start gap-space-sm">
                <StitchIcon name="warning" className="text-error text-[20px] shrink-0 mt-0.5" size={20} fill />
                <div className="min-w-0 flex-1">
                  <span className="font-label-sm text-label-sm text-on-error-container uppercase tracking-wider block">
                    Differential Criticality
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                    <strong className="font-headline-sm text-headline-sm text-primary">AR Q01</strong> generates{" "}
                    <span className="text-error font-headline-sm text-headline-sm">+11.8%</span> greater negative mark
                    drag and exhibits <span className="text-error font-headline-sm text-headline-sm">+5.4%</span> higher
                    distractor trap density compared to Multi Q05.
                  </p>
                </div>
              </div>
            </div>

            {/* Stem Archetype & Cognitive Load Comparison */}
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5">
                  <StitchIcon name="psychology" className="text-primary text-[20px]" size={20} />
                  Cognitive Load &amp; Archetype
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Bloom Level L4</span>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                {/* Left Column (AR Q01) */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between space-y-space-md">
                  <div className="space-y-space-xs">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                      Assertion-Reason
                    </span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1">Causal Mechanism</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Chemiosmosis &amp; CF0-CF1 ATP Synthase Proton Flow
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-space-sm space-y-1">
                    <div className="flex items-center gap-1 text-primary">
                      <StitchIcon name="device_hub" className="text-[16px]" size={16} />
                      <span className="font-label-sm text-label-sm uppercase">Causality Bottleneck</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <strong>"The Independent Fact Fallacy"</strong>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Aspirants verify both statements as valid isolated facts, but fail to evaluate the causal junction connector.
                    </p>
                  </div>
                </div>

                {/* Right Column (Multi Q05) */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between space-y-space-md">
                  <div className="space-y-space-xs">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      3-Statement Combinatorial
                    </span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1">Combinatorial Recall</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Archaebacteria Bioenergetics &amp; Pseudomurein Ether Bonds
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-space-sm space-y-1">
                    <div className="flex items-center gap-1 text-secondary">
                      <StitchIcon name="rule" className="text-[16px]" size={16} />
                      <span className="font-label-sm text-label-sm uppercase">Heuristic Bottleneck</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <strong>"Functional Intuition Fallacy"</strong>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Deep-seated heuristic doubt regarding non-chlorophyll ATP generation in halophiles suppresses correct selection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-space-sm">
              <Link
                href="/psychometrics/distractor-simulation"
                className="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                Distractor Sim
              </Link>
              <Link
                href="/psychometrics/rigor-report"
                className="flex-1 py-3 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm text-center shadow-md hover:opacity-95 active:scale-98 transition-all"
              >
                Export Rigor Report →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
