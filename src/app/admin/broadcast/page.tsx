"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminBroadcastPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [audioSpeed, setAudioSpeed] = useState<string>("1.25x");
  const [previewTab, setPreviewTab] = useState<"lockscreen" | "inapp">("lockscreen");
  const [dispatchPolicy, setDispatchPolicy] = useState<string>("instant");
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  const toggleSpeed = () => {
    const speeds = ["1.0x", "1.25x", "1.5x", "2.0x"];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    setAudioSpeed(speeds[nextIdx]);
  };

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }, 1000);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <button
                aria-label="Go Back"
                className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-[24px]" size={24} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight">
                  Remediation Audio Dispatch
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Targeted Push to 620 Affected Aspirants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <StitchIcon name="person" className="text-[18px]" size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full bg-surface pb-36 px-gutter space-y-space-lg pt-space-md">
          {/* Segment & Target Alert Header */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs space-y-space-md border border-outline-variant/30">
            <div className="flex items-start justify-between gap-space-sm flex-wrap">
              <div className="space-y-space-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-label-sm font-label-sm font-semibold">
                  <StitchIcon name="bolt" className="text-[14px]" size={14} />
                  Targeted Remediation Dispatch
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface leading-snug font-semibold">
                  Active Trigger: AR Q01 Trap B + Multi Q05 Trap A
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                  High Negative Hazard
                </span>
              </div>
            </div>

            {/* Cohort Stat Banner */}
            <div className="bg-surface-container rounded-lg p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline-sm">
                  <StitchIcon name="groups" className="text-[20px]" size={20} />
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface flex items-baseline gap-1.5 font-bold">
                    620 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/ 1,240 Aspirants</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">50.0% of cohort targeted for remedial audio</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-label-md text-label-md text-error flex items-center gap-0.5 justify-end font-bold">
                  <StitchIcon name="trending_down" className="text-[15px]" size={15} />
                  -1.32m
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block">Avg Drag</span>
              </div>
            </div>

            {/* Segment Breakdown Multi-Bar */}
            <div className="space-y-space-xs pt-1">
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <span>Segment Vulnerability Distribution</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">3 Cohort Bands</span>
              </div>
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: "51%" }} title="Mid-Tier: 51%"></div>
                <div className="bg-tertiary-container h-full" style={{ width: "46%" }} title="Foundation: 46%"></div>
                <div className="bg-secondary h-full" style={{ width: "3%" }} title="Top 5% Boundary: 3%"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-surface-container-low p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">Mid-Tier</span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-semibold">
                    316 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(51%)</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">Foundation</span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-semibold">
                    285 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(46%)</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">Top-5%</span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-semibold">
                    19 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(3%)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Asset Card with Waveform */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs space-y-space-md border border-outline-variant/30">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                  <StitchIcon name="graphic_eq" className="text-primary text-[24px]" size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm mb-0.5 font-semibold">
                    <StitchIcon name="school" className="text-[14px]" size={14} />
                    Faculty Voice Memo • NCERT Ch 13, p. 214
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Prof. Verma&apos;s 50s Causality Bridge: CF₀-CF₁ Rotary Catalysis
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    0:52 • Master Audio Note • With Synchronized Visual Flashcard
                  </p>
                </div>
              </div>
            </div>

            {/* Waveform & Scrubbing UI */}
            <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-md">
              <div className="flex items-center justify-between gap-1 h-12 px-2">
                {[12, 20, 32, 44, 24, 36, 16, 28, 40, 48, 32, 20].map((h, i) => (
                  <span
                    key={`p-${i}`}
                    className="w-1 rounded-full bg-primary"
                    style={{ height: `${h}px` }}
                  ></span>
                ))}
                <span className="w-1.5 h-12 rounded-full bg-primary-container shadow-xs"></span>
                {[28, 36, 44, 24, 32, 20, 36, 16, 28, 40, 20, 12].map((h, i) => (
                  <span
                    key={`u-${i}`}
                    className="w-1 rounded-full bg-outline-variant"
                    style={{ height: `${h}px` }}
                  ></span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-primary font-medium">0:24</span>
                <div className="flex items-center gap-space-md">
                  <button
                    aria-label="Skip Back 10 Seconds"
                    className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    type="button"
                  >
                    <StitchIcon name="replay_10" className="text-[18px]" size={18} />
                  </button>
                  <button
                    aria-label="Play or Pause"
                    className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
                    onClick={() => setIsPlaying(!isPlaying)}
                    type="button"
                  >
                    <StitchIcon name={isPlaying ? "pause" : "play_arrow"} className="text-[26px]" size={26} />
                  </button>
                  <button
                    aria-label="Skip Forward 10 Seconds"
                    className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    type="button"
                  >
                    <StitchIcon name="forward_10" className="text-[18px]" size={18} />
                  </button>
                </div>
                <button
                  className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high cursor-pointer font-medium"
                  onClick={toggleSpeed}
                  type="button"
                >
                  {audioSpeed}
                </button>
              </div>
            </div>

            {/* Audio Excerpt */}
            <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-xs border border-outline-variant/20">
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1">
                  <StitchIcon name="format_quote" className="text-[16px] text-primary" size={16} />
                  Direct Protocol Excerpt
                </span>
                <span className="text-secondary font-label-sm font-semibold">High-Retention Anchor</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                &quot;...Notice how both statements are true NCERT facts, but to avoid Trap Option B, insert the word{" "}
                <span className="bg-secondary-fixed text-on-secondary-fixed font-semibold px-1 rounded">BECAUSE</span>. ATP
                synthesis occurs PRECISELY BECAUSE the proton collapse through CF₀ drives the CF₁ headpiece conformation...&quot;
              </p>
            </div>
          </div>

          {/* Realtime Device Push Simulator */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs space-y-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Push Notification Simulator
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Live preview of student viewport delivery</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Ready to Fire
              </span>
            </div>

            <div className="grid grid-cols-2 p-1 bg-surface-container rounded-lg">
              <button
                className={`py-1.5 text-label-md font-label-md rounded-md text-center cursor-pointer transition-all ${
                  previewTab === "lockscreen"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => setPreviewTab("lockscreen")}
                type="button"
              >
                Lock Screen Banner
              </button>
              <button
                className={`py-1.5 text-label-md font-label-md rounded-md text-center cursor-pointer transition-all ${
                  previewTab === "inapp"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => setPreviewTab("inapp")}
                type="button"
              >
                In-App CBT Toast
              </button>
            </div>

            {previewTab === "lockscreen" ? (
              <div className="bg-surface-variant rounded-2xl p-space-md space-y-space-sm shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-1 font-code-sm">
                  <span>09:41 AM</span>
                  <div className="flex items-center gap-1">
                    <StitchIcon name="wifi" className="text-[13px]" size={13} />
                    <StitchIcon name="battery_full" className="text-[13px]" size={13} />
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md space-y-space-sm border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-on-primary">
                        <StitchIcon name="medical_services" className="text-[12px]" size={12} />
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface font-bold tracking-wide uppercase">
                        KRITI NEET OS
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Just now</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-error flex items-center gap-1 font-bold">
                      <StitchIcon name="priority_high" className="text-[16px]" size={16} />
                      Critical Concept Fix: AR Q01 Trap Alert
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface mt-1 leading-snug">
                      Prof. Verma just sent you a 50s voice breakdown: Master the &quot;Because&quot; causality bridge to stop losing 5 marks on Assertion-Reason.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button className="bg-primary text-on-primary py-2 px-2 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-1 shadow-xs cursor-pointer font-semibold">
                      <StitchIcon name="play_arrow" className="text-[16px]" size={16} />
                      Listen Now (50s)
                    </button>
                    <Link
                      href="/drills/assertion-reason"
                      className="bg-surface-container text-on-surface py-2 px-2 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-1 font-semibold"
                    >
                      <StitchIcon name="quiz" className="text-[16px]" size={16} />
                      3-Q Mini-Drill
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-variant rounded-2xl p-space-md space-y-space-sm shadow-inner">
                <div className="bg-surface-container-lowest rounded-xl p-3 shadow-md flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-9 h-9 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                    <StitchIcon name="voice_selection" className="text-[18px]" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-error font-bold">Cognitive Trap Warning</span>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">Live Toast</span>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-on-surface text-[13px] leading-tight mt-0.5 font-semibold">
                      Repeated Option B Error detected on Mitchell Chemiosmosis
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[11px]">
                      Tap to inject Prof. Verma&apos;s 50s rule onto your current CBT Split Screen.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dispatch Policy & Mode */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs space-y-space-md border border-outline-variant/30">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Dispatch Mode &amp; Delivery Policy
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Select audience pacing and device triggers</p>
            </div>
            <div className="space-y-space-sm">
              {[
                {
                  id: "instant",
                  title: "Instant Priority Broadcast",
                  tag: "98.4% Reach / 90s",
                  tagColor: "text-secondary",
                  desc: "Immediate device push notification + overlay toast on currently active mobile app sessions.",
                },
                {
                  id: "preroll",
                  title: "Next CBT Session Pre-Roll",
                  tag: "Session Intercept",
                  tagColor: "text-on-surface-variant",
                  desc: "Audio clip automatically plays before student initiates their next Botany Daily Practice Paper (DPP).",
                },
                {
                  id: "evening",
                  title: "Smart Evening Batching",
                  tag: "7:00 PM Window",
                  tagColor: "text-on-surface-variant",
                  desc: "Deliver during peak cognitive revision slots when attention retention is historically 22% higher.",
                },
              ].map((policy) => (
                <label
                  key={policy.id}
                  className={`flex items-start gap-space-sm p-space-md rounded-xl cursor-pointer transition-colors border ${
                    dispatchPolicy === policy.id
                      ? "bg-surface-container-low border-primary/40"
                      : "bg-surface-container-low border-transparent hover:bg-surface-container"
                  }`}
                >
                  <input
                    type="radio"
                    name="dispatch_policy"
                    className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                    checked={dispatchPolicy === policy.id}
                    onChange={() => setDispatchPolicy(policy.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">
                        {policy.title}
                      </span>
                      <span className={`font-label-sm text-label-sm font-semibold ${policy.tagColor}`}>
                        {policy.tag}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{policy.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Quick Links to Telemetry & Recipients */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                href="/admin/recipients"
                className="p-2.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-between hover:bg-surface-container-high transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <StitchIcon name="groups" className="text-[16px] text-primary" size={16} />
                  620 Recipient Roster
                </span>
                <StitchIcon name="chevron_right" className="text-[16px]" size={16} />
              </Link>
              <Link
                href="/admin/push-telemetry"
                className="p-2.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-between hover:bg-surface-container-high transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <StitchIcon name="sensors" className="text-[16px] text-secondary" size={16} />
                  Live Telemetry Stream
                </span>
                <StitchIcon name="chevron_right" className="text-[16px]" size={16} />
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-space-sm pt-2">
            <button
              className="w-full bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary py-3.5 px-space-lg rounded-xl font-headline-sm text-headline-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold"
              onClick={handleDispatch}
              disabled={isDispatching}
              type="button"
            >
              {isDispatching ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Transmitting to 620 Mobile Devices...</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-fixed"></span>
                  </span>
                  <span>Dispatch Live Push to 620 Aspirants Now</span>
                </>
              )}
            </button>
            <Link
              href="/admin/whatsapp-dispatch"
              className="w-full bg-surface-container-lowest text-on-surface hover:bg-surface-container-low py-3 px-space-lg rounded-xl font-label-md text-label-md transition-colors text-center shadow-xs border border-outline-variant/30 flex items-center justify-center gap-1.5 font-semibold"
            >
              <StitchIcon name="chat" className="text-[18px] text-secondary" size={18} />
              <span>Open WhatsApp Escalation Fallback</span>
            </Link>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl shadow-2xl flex items-center justify-between z-50 animate-bounce">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <StitchIcon name="check" className="text-[16px]" size={16} />
                </div>
                <div>
                  <p className="font-label-md text-label-md font-bold">Push Broadcast Queued!</p>
                  <p className="font-body-sm text-body-sm opacity-80">Transmitting to 620 mobile devices in background...</p>
                </div>
              </div>
              <button
                className="text-inverse-on-surface opacity-70 hover:opacity-100 p-1 cursor-pointer"
                onClick={() => setShowToast(false)}
                type="button"
              >
                <StitchIcon name="close" className="text-[18px]" size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
