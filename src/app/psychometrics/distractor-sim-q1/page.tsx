"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DistractorSimQ1Page() {
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
                  Distractor Simulation: AR Q01
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Chemiosmotic Coupling &amp; CF₀–CF₁ • Plant Physiology
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Bookmark item"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="bookmark" className="text-[20px]" size={20} />
              </button>
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ml-space-xs shrink-0"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 bg-surface pb-safe min-h-screen">
          <div className="flex flex-col w-full pb-10">
            {/* Micro-Header Context Sub-bar */}
            <section className="px-margin pt-space-md pb-space-sm flex flex-wrap items-center justify-between gap-space-xs">
              <div className="flex items-center flex-wrap gap-space-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm shadow-sm">
                  <StitchIcon name="psychology" className="text-[14px]" size={14} />
                  Faculty Distractor Lab
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  <StitchIcon name="groups" className="text-[13px] text-tertiary" size={13} />
                  Cohort N=1,240 (Rankers Elite B8)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                High Severity Trap
              </span>
            </section>

            {/* Question Diagnostic Overview Card */}
            <section className="px-margin my-space-xs">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Botany • Plant Physiology
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                      Challenger Tier-1
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    NCERT Class 11, Ch 13, pp. 213–214 • Mitchell Chemiosmosis &amp; CF₀–CF₁ ATP Synthase
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-space-xs">
                  <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Bloom Level</span>
                    <span className="font-headline-sm text-headline-sm text-primary mt-0.5">L4 Causality</span>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Target Time</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5">50s</span>
                  </div>
                  <div className="bg-error-container/40 p-space-sm rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="font-label-sm text-label-sm text-on-error-container">Sim. Accuracy</span>
                    <span className="font-headline-sm text-headline-sm text-error mt-0.5">38%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Visual Concept Graphic */}
            <section className="px-margin my-space-xs">
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative w-full h-36 bg-surface-container flex items-center justify-center bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5">
                  <StitchIcon name="biotech" className="text-[64px] text-primary/40" size={64} />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow-sm flex items-center gap-1">
                      <StitchIcon name="verified" className="text-[14px] text-secondary" size={14} />
                      NMC High-Yield Blueprint 2024.4
                    </span>
                    <span className="font-code-sm text-code-sm text-primary px-2 py-0.5 rounded bg-surface-container-lowest/90 font-semibold shadow-sm">
                      Q01 • DPP #44
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Assertion-Reason Proposition Box */}
            <section className="px-margin my-space-xs">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5">
                    <StitchIcon name="balance" className="text-primary text-[20px]" size={20} />
                    Proposition Breakdown
                  </h2>
                  <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed/40 px-2 py-0.5 rounded-full">
                    Dual-True Validated
                  </span>
                </div>

                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary tracking-wide">ASSERTION (A)</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-medium">
                      Factually True • Requirement
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    “Chemiosmotic coupling synthesis of ATP requires an uninterrupted intact proton gradient across the thylakoid membrane.”
                  </p>
                </div>

                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary tracking-wide">REASON (R)</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-medium">
                      Factually True • Mechanism
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    “Breakdown of proton gradient is catalysed by CF₀–CF₁ complex leading to conformational shift in CF₁ catalytic subunit.”
                  </p>
                </div>

                <div className="bg-primary-fixed/30 rounded-lg p-space-md flex items-start gap-space-sm">
                  <StitchIcon name="link" className="text-primary text-[20px] shrink-0 mt-0.5" size={20} />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-sm text-label-sm text-on-primary-fixed font-semibold uppercase">
                      Causal Validation Matrix
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      <strong>(R) directly explains (A):</strong> Proton motive force dissipation across CF₀ channel physically triggers the conformational shift in CF₁ to phosphorylate ADP to ATP.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4-Choice AR Grid */}
            <section className="px-margin my-space-xs">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">CBT Response Distribution</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Discrimination Index: <strong className="text-secondary">0.78</strong>
                  </span>
                </div>

                <div className="flex flex-col gap-space-sm">
                  <div className="p-space-md rounded-lg bg-secondary-fixed/20 shadow-sm flex flex-col gap-1 border border-secondary/30">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm text-secondary">
                        Option A (Verified Key)
                      </span>
                      <span className="font-headline-sm text-headline-sm text-secondary">38%</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Both (A) and (R) are true and (R) is correct explanation.
                    </p>
                  </div>

                  <div className="p-space-md rounded-lg bg-error-container/30 shadow-sm flex flex-col gap-1 border border-error/30">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm text-error">
                        Option B (Fatal Trap)
                      </span>
                      <span className="font-headline-sm text-headline-sm text-error">47%</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Both (A) and (R) are true but (R) is NOT correct explanation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions Dock */}
            <div className="px-margin pt-2 flex items-center gap-space-sm">
              <Link
                href="/psychometrics/distractor-simulation"
                className="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                Multi-Q05 Sim
              </Link>
              <Link
                href="/psychometrics/distractor-breakdown"
                className="flex-1 py-3 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm text-center shadow-md hover:opacity-95 active:scale-98 transition-all"
              >
                Detailed Breakdown →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
