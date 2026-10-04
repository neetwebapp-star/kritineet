"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PostRemediationAuditPage() {
  const router = useRouter();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Go back"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors -ml-space-xs cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[24px]" size={24} />
              </button>
              <Image
                alt="Brand logo"
                className="h-8 w-auto object-contain shrink-0"
                src="/stitch/logo.png"
                width={32}
                height={32}
              />
              <div className="flex flex-col min-w-0 pr-space-xs">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate tracking-tight">
                  Post Remediation Final Audit
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Rankers Elite B8 • Botany CBT Audit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Share report"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="share" className="text-[22px]" size={22} />
              </button>
              <button
                aria-label="Close modal"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-[22px]" size={22} />
              </button>
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ml-space-xs"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 pb-safe bg-surface min-h-screen">
          <div className="flex flex-col w-full pb-10">
            {/* Status Ribbon & Metadata */}
            <div className="px-gutter pt-space-md pb-space-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-sm flex-wrap">
                <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Post-Remediation Audit • Concluded (T+30m)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-code-sm text-code-sm">
                  <StitchIcon name="verified" className="text-[15px] text-secondary" size={15} />
                  <span>Completed at 10:45 AM</span>
                </div>
              </div>
              <div className="mt-space-xs">
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                  Batch Remediation &amp; Cognitive Recovery Audit
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Cohort: Rankers Elite B8 • Botany CBT Test #4C (AR Q01 &amp; Multi Q05)
                </p>
              </div>
            </div>

            {/* Key Metrics 4-Grid Bento */}
            <div className="px-gutter py-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Total Flagged</span>
                    <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <StitchIcon name="group" className="text-[18px]" size={18} />
                    </span>
                  </div>
                  <div className="mt-space-md">
                    <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight">620</div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">100% targeted cohort</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Net Remediated</span>
                    <span className="w-7 h-7 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <StitchIcon name="task_alt" className="text-[18px]" size={18} />
                    </span>
                  </div>
                  <div className="mt-space-md">
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-lg text-headline-lg text-secondary tracking-tight">598</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ 620</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-secondary font-label-sm text-label-sm">
                      <StitchIcon name="trending_up" className="text-[14px]" size={14} />
                      <span>96.5% (+156 via WA)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Traps Neutralized</span>
                    <span className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                      <StitchIcon name="format_image_left" className="text-[18px]" size={18} />
                    </span>
                  </div>
                  <div className="mt-space-md">
                    <div className="font-headline-lg text-headline-lg text-primary tracking-tight">89.2%</div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Down from 51.0% initial fail</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Marks Recovered</span>
                    <span className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                      <StitchIcon name="add_circle" className="text-[18px]" size={18} />
                    </span>
                  </div>
                  <div className="mt-space-md">
                    <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight">+3,840</div>
                    <p className="font-body-sm text-body-sm text-secondary font-medium">+6.2 marks/student avg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Audio Spotlight */}
            <div className="px-gutter py-space-sm">
              <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
                <div className="w-13 h-13 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <StitchIcon name="school" className="text-primary text-[28px]" size={28} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      Prof. Verma's 50s Causality Bridge
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                    CF0-CF1 rotary catalysis trap breakdown
                  </p>
                  <div className="flex items-center gap-space-sm mt-1 text-on-surface-variant font-code-sm text-code-sm">
                    <span className="inline-flex items-center gap-1 text-primary">
                      <StitchIcon name="headphones" className="text-[15px]" size={15} fill />
                      564 Listened (&gt;80%)
                    </span>
                    <span>•</span>
                    <span>Avg 46s retained</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  aria-label="Review audio note"
                  className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                  <StitchIcon name={isPlayingAudio ? "pause" : "play_arrow"} className="text-[20px]" size={20} fill />
                </button>
              </div>
            </div>

            {/* Multi-Channel Funnel Pipeline */}
            <div className="px-gutter py-space-sm">
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-space-md">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">End-to-End Resolution Pipeline</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Multi-channel touchpoint progression
                    </p>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    5 Steps
                  </span>
                </div>

                <div className="flex flex-col gap-space-md relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-surface-container-highest"></div>

                  {[
                    { step: 1, title: "Initial App Push Dispatch", stat: "82.6% reach", desc: "620 targets dispatched → 512 reached & actively engaged immediately" },
                    { step: 2, title: "In-App Audio Remediation", stat: "68.4% completed", desc: "424 students finished the 50s audio breakdown in first 10 minutes" },
                    { step: 3, title: "WhatsApp Mentorship Escalation", stat: "+156 recovered", desc: "Automated high-priority audio dispatch reached offline students" },
                    { step: 4, title: "Adaptive Micro-Drill Re-Assessment", stat: "94.2% pass rate", desc: "584 students attempted retest question with 94.2% accuracy" },
                    { step: 5, title: "Final Cognitive Recovery Closure", stat: "96.5% resolved", desc: "Zero active misconception flags remain in Leitner Box 1" },
                  ].map((pipe) => (
                    <div key={pipe.step} className="flex items-start gap-space-md relative z-10">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-label-sm text-label-sm shadow-sm">
                        {pipe.step}
                      </div>
                      <div className="flex-1 min-w-0 bg-surface-container-low p-space-sm rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">{pipe.title}</span>
                          <span className="font-label-sm text-label-sm text-primary font-semibold">{pipe.stat}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{pipe.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-gutter pt-space-sm flex items-center gap-space-sm">
              <Link
                href="/admin/hub"
                className="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                Admin Hub
              </Link>
              <Link
                href="/error-book"
                className="flex-1 py-3 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm text-center shadow-md hover:opacity-95 active:scale-98 transition-all"
              >
                Open Mistake Book
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
