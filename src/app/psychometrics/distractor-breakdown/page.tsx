"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DetailedDistractorBreakdownPage() {
  const router = useRouter();

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 inset-x-0 z-50 bg-surface-container-lowest/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Back or Close"
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[22px]" size={22} />
              </button>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                    NEET 2017
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium truncate">
                    AI Deep Dive
                  </span>
                </div>
                <h1 className="font-headline-sm text-headline-sm text-on-surface leading-tight truncate">
                  Detailed Distractor Breakdown: Option A vs Option B
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-space-xs flex-shrink-0">
              <button
                aria-label="Bookmark question"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="bookmark_border" className="text-[22px]" size={22} />
              </button>
              <button
                aria-label="Dismiss"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-[22px]" size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 pb-safe bg-surface min-h-screen">
          <div className="flex flex-col w-full px-gutter pb-margin-lg space-y-space-lg">
            {/* Top Summary Banner */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex flex-col space-y-space-sm">
                <div className="flex items-center justify-between flex-wrap gap-space-xs">
                  <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase font-bold">
                    NEET 2017 • Q.142 Cognitive Trap Audit
                  </span>
                  <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                    <StitchIcon name="warning" className="text-[14px]" size={14} />
                    The Classic 'Because' Test Trap
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  Archaebacteria Extremophile Survival Mechanism
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Cognitive post-mortem analyzing why more than half of test-takers misjudged the causal connector between membrane biophysics and thermal tolerance.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs pt-space-xs">
                  <div className="bg-secondary-container/20 rounded-lg p-space-sm flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary font-bold">Correct Key: Option A</span>
                    <span className="font-headline-md text-headline-md text-on-surface">31%</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Selected official key</span>
                  </div>
                  <div className="bg-error-container/30 rounded-lg p-space-sm flex flex-col">
                    <span className="font-label-sm text-label-sm text-error font-bold">Fatal Trap: Option B</span>
                    <span className="font-headline-md text-headline-md text-error">53%</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Distractor casualties</span>
                  </div>
                  <div className="bg-surface-container-high rounded-lg p-space-sm flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">Net Rank Impact</span>
                    <span className="font-headline-md text-headline-md text-primary">-1.25 Lakh</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Average peer displacement</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Cohort Error Distribution Visual Bar */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <StitchIcon name="query_stats" className="text-primary text-[20px]" size={20} />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Cohort Response Distribution</h2>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">N = 11,38,890 Aspirants</span>
              </div>
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-surface-container mb-space-sm">
                <div className="bg-secondary" style={{ width: "31%" }} title="Option A: 31%"></div>
                <div className="bg-error" style={{ width: "53%" }} title="Option B: 53%"></div>
                <div className="bg-primary-container" style={{ width: "11%" }} title="Option C: 11%"></div>
                <div className="bg-outline-variant" style={{ width: "5%" }} title="Option D: 5%"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs pt-space-xs font-label-sm text-label-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-secondary flex-shrink-0"></span>
                  <span className="text-on-surface font-semibold">Opt A: 31%</span>
                  <span className="text-secondary">(Key)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-error flex-shrink-0"></span>
                  <span className="text-on-surface font-semibold">Opt B: 53%</span>
                  <span className="text-error">(Trap)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-primary-container flex-shrink-0"></span>
                  <span className="text-on-surface-variant font-medium">Opt C: 11%</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-outline-variant flex-shrink-0"></span>
                  <span className="text-on-surface-variant font-medium">Opt D: 5%</span>
                </div>
              </div>
            </section>

            {/* Head-to-Head Logical Dissection */}
            <section className="flex flex-col space-y-space-md">
              <div className="flex items-center gap-space-xs">
                <StitchIcon name="balance" className="text-primary text-[20px]" size={20} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Head-to-Head Logical Dissection</h2>
              </div>

              {/* Card A (Correct Key) */}
              <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold mb-space-xs">
                      OFFICIAL NTA KEY • +4 MARKS
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Option A: Both True &amp; Reason (R) Explains Assertion (A)
                    </h3>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
                    ✓
                  </span>
                </div>
                <div className="bg-surface-container-low rounded-lg p-space-md mb-space-md space-y-space-xs">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase w-16 flex-shrink-0">
                      Assertion
                    </span>
                    <p className="font-body-md text-body-md text-on-surface font-medium">
                      Archaebacteria are able to survive extreme heat (up to 100°C) in deep-sea hydrothermal vents.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs pl-16">
                    <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">
                      LINK: [BECAUSE]
                    </span>
                  </div>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase w-16 flex-shrink-0">
                      Reason
                    </span>
                    <p className="font-body-md text-body-md text-on-surface font-medium">
                      Their cell membranes contain branched phytanyl chains linked by ether bonds, forming rigid monolayers that resist thermal cleavage.
                    </p>
                  </div>
                </div>
                <div className="bg-secondary-container/20 rounded-lg p-space-md">
                  <div className="flex items-center gap-space-xs mb-1">
                    <StitchIcon name="verified" className="text-secondary text-[18px]" size={18} />
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      The Biochemical Causality Rule
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Direct biophysical causation confirmed. Normal bacterial ester lipids hydrolyze at boiling temperatures, disintegrating the plasma boundary. The ether linkage coupled with phytanyl branching is the sole structural adaptation sustaining cytoplasmic integrity.
                  </p>
                </div>
              </article>

              {/* Card B (Trap) */}
              <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold mb-space-xs">
                      53% ASPIRANTS TRAPPED • -1 MARK
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Option B: Both True but (R) is NOT the Explanation of (A)
                    </h3>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
                    ✕
                  </span>
                </div>
                <div className="bg-surface-container-low rounded-lg p-space-md">
                  <div className="flex items-center gap-space-xs mb-1">
                    <StitchIcon name="psychology_alt" className="text-error text-[18px]" size={18} />
                    <span className="font-label-md text-label-md text-error font-bold">
                      The Cognitive Fallacy: 'Silo Verification Bias'
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Aspirants read Assertion, agree it is true; then read Reason, agree it is true. Instead of testing whether Reason explains <em>why</em> survival is physically possible, they conclude they are merely two separate biological facts.
                  </p>
                </div>
              </article>
            </section>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-space-sm">
              <Link
                href="/psychometrics/distractor-sim-q1"
                className="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                Back to Sim
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
