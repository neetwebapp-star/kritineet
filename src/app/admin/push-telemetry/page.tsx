"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPushTelemetryPage() {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Go Back"
                className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high active:scale-95 transition-all shrink-0 cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[24px]" size={24} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-space-xs">
                  <h1 className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight">
                    Push Delivery &amp; Student Listen Telemetry
                  </h1>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Remediation Audio Dispatch • 620 Aspirants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary font-label-sm text-label-sm border border-secondary/20 shadow-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                <span>LIVE</span>
              </div>
              <Link
                href="/admin/broadcast"
                aria-label="Broadcast Settings"
                className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <StitchIcon name="sensors" className="text-[22px]" size={22} />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full bg-surface pb-32 space-y-4 px-4 pt-3">
          {/* Top Broadcast Active Header & Live Pulse Card */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-xs relative overflow-hidden border border-outline-variant/30">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                </span>
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-semibold">
                  Broadcast Active • T+04m 18s
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  aria-label="Refresh telemetry stream"
                  className={`h-8 w-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-transform active:rotate-180 duration-300 cursor-pointer ${
                    isRefreshing ? "rotate-180" : ""
                  }`}
                  onClick={handleRefresh}
                  type="button"
                >
                  <StitchIcon name="sync" className="text-[18px]" size={18} />
                </button>
                <button
                  className="h-8 px-2.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors flex items-center gap-1 font-label-sm text-label-sm cursor-pointer"
                  onClick={() => setIsPaused(!isPaused)}
                  type="button"
                >
                  <StitchIcon name={isPaused ? "play_circle" : "pause_circle"} className="text-[16px]" size={16} />
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                Prof. Verma&apos;s 50s Causality Bridge
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                <StitchIcon name="hub" className="text-[16px] text-primary" size={16} />
                <span>CF₀-CF₁ ATP Synthase • AR Q01 Trap B &amp; Multi-Stmt Q05</span>
              </p>
            </div>

            <div className="mt-3 pt-3 bg-surface-container-low/70 rounded-lg p-2.5 flex items-center justify-between text-on-surface">
              <div className="flex items-center gap-2">
                <StitchIcon name="groups" className="text-primary text-[18px]" size={18} />
                <span className="font-label-md text-label-md font-semibold text-on-surface">Rankers Elite B8</span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-xs">
                620 Target Recipients
              </span>
            </div>
          </div>

          {/* Primary Macro Telemetry KPIs (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Delivered</span>
                <span className="h-6 w-6 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                  <StitchIcon name="done_all" className="text-[15px]" size={15} />
                </span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md font-bold text-on-surface">
                  608 <span className="text-label-md text-on-surface-variant font-normal">/ 620</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center">
                    <StitchIcon name="trending_up" className="text-[13px]" size={13} />98.1%
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] truncate">+14 in 60s</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Listened (≥80%)</span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[10px] uppercase font-semibold">
                  Surging
                </span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md font-bold text-primary">
                  442 <span className="text-label-md text-on-surface-variant font-normal">/ 620</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-12 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "71.3%" }}></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">71.3%</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Drill Started</span>
                <span className="h-6 w-6 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <StitchIcon name="quiz" className="text-[15px]" size={15} />
                </span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md font-bold text-on-surface">
                  318 <span className="text-label-sm text-on-surface-variant font-normal">51.3%</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <StitchIcon name="verified" className="text-[13px] text-secondary" size={13} />
                  <span className="font-body-sm text-body-sm text-secondary font-semibold text-[11px]">88% Accuracy</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Traps Defused</span>
                <span className="h-6 w-6 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                  <StitchIcon name="shield_with_heart" className="text-[15px]" size={15} />
                </span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md font-bold text-secondary">81.4%</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px] font-semibold text-primary">
                    +4.2 avg marks recov.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Funnel Progress Waterfall */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-xs space-y-3 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StitchIcon name="filter_alt" className="text-primary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Funnel Telemetry</h3>
              </div>
              <span className="font-code-sm text-code-sm px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md">
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <div className="flex justify-between items-center font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface font-semibold">1. Dispatched Batch</span>
                  <span className="text-on-surface-variant font-code-sm">620 (100%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-on-surface-variant rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface font-semibold flex items-center gap-1">
                    2. Delivered to Device
                    <span className="text-[10px] text-secondary font-normal">(+98.1%)</span>
                  </span>
                  <span className="text-on-surface font-code-sm">608</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: "98.1%" }}></div>
                </div>
                <p className="text-[10px] font-body-sm text-on-surface-variant mt-0.5">12 queued / offline cellular buffer</p>
              </div>

              <div>
                <div className="flex justify-between items-center font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface font-semibold">3. Opened / Interacted</span>
                  <span className="text-on-surface font-code-sm">512 (82.6%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "82.6%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface font-semibold">4. Audio Finished (100%)</span>
                  <span className="text-on-surface font-code-sm">412 (66.5%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-tertiary-container rounded-full" style={{ width: "66.5%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface font-semibold text-secondary">5. Passed Verification Drill</span>
                  <span className="text-secondary font-code-sm font-semibold">279 (45.0%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "45.0%" }}></div>
                </div>
              </div>
            </div>

            <div className="mt-2 p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
              <StitchIcon name="info" className="text-[18px] text-tertiary-container shrink-0 mt-0.5" size={18} />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Average time to first listen: <span className="font-semibold text-on-surface">46 seconds</span> across active mock test sessions.
              </p>
            </div>
          </div>

          {/* Listening Depth Matrix */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-xs space-y-3 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StitchIcon name="graphic_eq" className="text-secondary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Listening Depth Matrix</h3>
              </div>
              <span className="text-label-sm font-label-sm text-primary font-semibold">50s Causality</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Full Listen (0:50)</span>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                    412 <span className="font-normal text-on-surface-variant">(66.5%)</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary text-[11px] pl-4">
                  Causality Rule Internalized • Proton gradient direction mapped
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Substantial (0:30 - 0:49)</span>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                    78 <span className="font-normal text-on-surface-variant">(12.6%)</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] pl-4">
                  Key &quot;Because&quot; rule heard • Did not finish closing summary
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-error"></span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Drop-out Early (&lt;0:30)</span>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-error">
                    22 <span className="font-normal text-on-surface-variant">(3.5%)</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] pl-4">
                  Flagged for 3-minute nudge trigger
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-outline"></span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Not Opened Yet</span>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-on-surface-variant">
                    108 <span className="font-normal">(17.4%)</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] pl-4">
                  Standby SMS &amp; WhatsApp escalation configured at T+15m
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary-fixed/30 text-on-primary-fixed-variant flex items-center gap-2.5">
              <StitchIcon name="replay" className="text-[20px] text-primary shrink-0" size={20} />
              <p className="font-body-sm text-body-sm leading-snug">
                <span className="font-semibold text-primary">134 students</span> replayed the{" "}
                <span className="font-code-sm font-semibold">0:24–0:38</span> timestamp (the &quot;Because test&quot; linkage formula).
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/admin/whatsapp-dispatch"
              className="py-3 px-4 rounded-xl bg-secondary-container text-on-secondary-container font-headline-sm text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:bg-secondary-container/90 transition-all text-center"
            >
              <StitchIcon name="chat" className="text-[18px]" size={18} />
              WhatsApp Escalation (108)
            </Link>
            <Link
              href="/admin/cohort-export"
              className="py-3 px-4 rounded-xl bg-surface-container-lowest text-on-surface font-headline-sm text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-xs border border-outline-variant/30 hover:bg-surface-container transition-all text-center"
            >
              <StitchIcon name="download" className="text-[18px]" size={18} />
              Export Full Telemetry CSV
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
