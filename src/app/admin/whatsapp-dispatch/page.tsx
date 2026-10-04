"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminWhatsAppDispatchPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSeconds, setAudioSeconds] = useState<number>(50);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatched, setDispatched] = useState<boolean>(false);
  const [testDispatched, setTestDispatched] = useState<boolean>(false);
  const [pacingMode, setPacingMode] = useState<"instant" | "throttled">("instant");
  const [routeStudent, setRouteStudent] = useState<boolean>(true);
  const [routeParent, setRouteParent] = useState<boolean>(true);
  const [routeSms, setRouteSms] = useState<boolean>(true);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatched(true);
      setTimeout(() => setDispatched(false), 3000);
    }, 1400);
  };

  const handleTestToPhone = () => {
    setTestDispatched(true);
    setTimeout(() => setTestDispatched(false), 3000);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs pb-36">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="h-16 px-margin flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Back"
                className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[24px]" size={24} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <h1 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-semibold">
                    WhatsApp Escalation Dispatch
                  </h1>
                  <div
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container"
                    title="Verified WhatsApp Business"
                  >
                    <StitchIcon name="verified" className="text-[14px]" size={14} />
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Kriti NEET OS Administrative Dispatch
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary">
              <StitchIcon name="person" className="text-[18px]" size={18} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
          <div className="flex flex-col w-full pb-10 space-y-4 px-margin pt-3">
            {/* Cohort & Trigger Context Banner */}
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xs space-y-3 relative overflow-hidden border border-outline-variant/30">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container">
                  <StitchIcon name="crisis_alert" className="text-[14px]" size={14} />
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                    Urgent Escalation • Concept Fallacy Fix
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                  T+04m
                </span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  108 Offline / Unopened Aspirants
                </h2>
                <p className="font-label-md text-label-md text-primary font-medium mt-0.5">
                  Cohort: Rankers Elite B8 • Botany CBT Audit
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  Standby escalation triggered automatically. Initial push notifications delivered or cellular-buffered with remedial audio unplayed.
                </p>
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 bg-surface-container-lowest rounded-lg p-2.5 border border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Queued Targets</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">108</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Avg Read Rate</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">89.4%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Est. Recovery</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary-container font-bold">~90s</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Business Template Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StitchIcon name="verified_user" className="text-primary text-[18px]" size={18} />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Official WhatsApp Template</span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium">
                  Meta Approved
                </span>
              </div>

              {/* Horizontal Template Scroll */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-margin px-margin no-scrollbar">
                {[
                  {
                    id: 1,
                    label: "Template 01 • Active",
                    title: "High-Yield Audio Remediation",
                    desc: "Includes 1-tap 50s Prof. Verma note and instant 3-Q mini-drill web deep link.",
                    badge: "Zero Spam Penalty",
                    urgency: "High Urgency",
                  },
                  {
                    id: 2,
                    label: "Template 02",
                    title: "Direct Faculty Voice Note Card",
                    desc: "Standalone native WhatsApp voice bubble with inline waveform visualization.",
                    badge: "Standard SLA",
                    urgency: "",
                  },
                  {
                    id: 3,
                    label: "Template 03",
                    title: "Parent-Synced Revision Nudge",
                    desc: "Bilingual dispatch informing guardian of missed critical negative mark safeguard.",
                    badge: "Bilingual Support",
                    urgency: "",
                  },
                ].map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      className={`shrink-0 w-64 p-3 rounded-xl text-left shadow-xs transition-transform active:scale-98 cursor-pointer border ${
                        isSelected
                          ? "bg-primary-container text-on-primary border-transparent"
                          : "bg-surface-container-lowest text-on-surface border-outline-variant/30"
                      }`}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-surface-container-lowest/20 text-on-primary"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {tpl.label}
                        </span>
                        <StitchIcon name={isSelected ? "check_circle" : "radio_button_unchecked"} className="text-[16px]" size={16} />
                      </div>
                      <p className="font-headline-sm text-headline-sm line-clamp-1 font-semibold">{tpl.title}</p>
                      <p className={`font-body-sm text-body-sm mt-1 line-clamp-2 ${isSelected ? "text-on-primary-container" : "text-on-surface-variant"}`}>
                        {tpl.desc}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className={`font-label-sm text-label-sm font-medium ${isSelected ? "text-secondary-fixed" : "text-on-surface-variant"}`}>
                          {tpl.badge}
                        </span>
                        {tpl.urgency && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-on-primary/50"></span>
                            <span className="font-label-sm text-label-sm text-on-primary/80">{tpl.urgency}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive WhatsApp Message Preview Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <StitchIcon name="visibility" className="text-[16px] text-secondary" size={16} />
                  Live Dispatch Preview (WhatsApp Chat)
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Sender ID: Kriti Academic</span>
              </div>

              {/* Authentic WhatsApp Mock Canvas */}
              <div className="bg-surface-container rounded-2xl p-3.5 shadow-xs space-y-3 border border-outline-variant/30">
                <div className="flex items-center gap-2.5 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0 shadow-xs">
                    <StitchIcon name="school" className="text-[20px]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        Kriti Academic Desk (Prof. Verma)
                      </span>
                      <StitchIcon name="check_circle" className="text-secondary text-[14px] shrink-0" size={14} />
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Official Verified Business Account</p>
                  </div>
                </div>

                <div className="flex flex-col items-start max-w-[94%] bg-surface-container-lowest rounded-2xl rounded-tl-sm p-3.5 shadow-xs space-y-2.5 border border-outline-variant/20">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container w-fit">
                    <StitchIcon name="notification_important" className="text-[13px]" size={13} />
                    <span className="font-label-sm text-label-sm font-bold tracking-tight">URGENT NEET CONCEPT ALERT</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface leading-snug">
                    Dear Aspirant, during today&apos;s Botany CBT audit,{" "}
                    <span className="font-semibold text-error">51% of Rankers Elite B8</span> fell into the{" "}
                    <span className="font-semibold text-primary">AR Q01 Monolithic Trap B</span> (CF₀-CF₁ ATP Synthase Causality link).
                  </p>

                  {/* Voice Note Snippet */}
                  <div className="w-full bg-surface-container-low rounded-xl p-2.5 flex items-center gap-2.5 border border-outline-variant/20">
                    <button
                      className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 active:scale-95 transition-transform cursor-pointer"
                      onClick={toggleAudio}
                      type="button"
                    >
                      <StitchIcon name={isPlayingAudio ? "pause" : "play_arrow"} className="text-[20px]" size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-on-surface">
                        <span className="font-label-sm text-label-sm font-medium">Prof. Verma Audio Note</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">0:{audioSeconds}</span>
                      </div>
                      <div className="flex items-center gap-0.5 h-4 mt-1">
                        <span className="w-1 h-2 bg-secondary rounded-full"></span>
                        <span className="w-1 h-3.5 bg-secondary rounded-full"></span>
                        <span className="w-1 h-2 bg-secondary rounded-full"></span>
                        <span className="w-1 h-4 bg-secondary rounded-full"></span>
                        <span className="w-1 h-1.5 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-3 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-2 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-3.5 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-4 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-2 bg-outline-variant rounded-full"></span>
                        <span className="w-1 h-3 bg-outline-variant rounded-full"></span>
                      </div>
                    </div>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                    🎧 <span className="font-medium">Prof. Verma has recorded an exclusive 50-second voice breakdown</span> revealing how to instantly eliminate this trap using the &quot;Because&quot; linkage rule.
                  </p>

                  <div className="p-2 rounded-lg bg-surface-container w-full">
                    <p className="font-code-sm text-code-sm text-primary font-medium truncate">
                      👉 kriti.ai/remedy/ar-q01-b8
                    </p>
                    <p className="font-label-sm text-label-sm text-secondary font-medium mt-0.5">
                      ⚡ Saves ~5 negative marks on Sunday Full Mock
                    </p>
                  </div>

                  <div className="w-full flex items-center justify-end gap-1 pt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">10:14 AM</span>
                    <StitchIcon name="done_all" className="text-secondary text-[14px]" size={14} />
                  </div>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <button
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest text-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer font-semibold"
                    type="button"
                  >
                    <StitchIcon name="play_circle" className="text-[18px]" size={18} />
                    Play Audio Note (50s)
                  </button>
                  <Link
                    href="/drills/assertion-reason"
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest text-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 font-semibold"
                  >
                    <StitchIcon name="quiz" className="text-[18px]" size={18} />
                    Start 3-Q Verification Drill
                  </Link>
                </div>
              </div>
            </div>

            {/* Routing & Pacing Options */}
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xs space-y-3.5 border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <StitchIcon name="alt_route" className="text-primary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Escalation Routing &amp; Multi-Channel Fallback
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                  <div className="min-w-0 pr-2">
                    <p className="font-label-md text-label-md text-on-surface font-semibold">Student Primary WhatsApp</p>
                    <p className="font-body-sm text-body-sm text-secondary font-medium">108/108 numbers reachable &amp; validated</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                    checked={routeStudent}
                    onChange={(e) => setRouteStudent(e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                  <div className="min-w-0 pr-2">
                    <p className="font-label-md text-label-md text-on-surface font-semibold">CC Academic Parent Contact</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">96/108 consented for critical test alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                    checked={routeParent}
                    onChange={(e) => setRouteParent(e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                  <div className="min-w-0 pr-2">
                    <p className="font-label-md text-label-md text-on-surface font-semibold">Fallback Carrier SMS</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Auto-fire shortlink if undelivered at T+3m</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                    checked={routeSms}
                    onChange={(e) => setRouteSms(e.target.checked)}
                  />
                </div>
              </div>

              <div className="pt-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium block mb-2">
                  API Dispatch Pacing Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`p-2.5 rounded-xl cursor-pointer flex flex-col justify-between transition-colors border ${
                      pacingMode === "instant"
                        ? "bg-surface-container-highest border-primary/40"
                        : "bg-surface-container-lowest border-outline-variant/30 opacity-80"
                    }`}
                    onClick={() => setPacingMode("instant")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Instant Burst</span>
                      <StitchIcon name={pacingMode === "instant" ? "radio_button_checked" : "radio_button_unchecked"} className="text-primary text-[18px]" size={18} />
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      All 108 delivered synchronously within 4 seconds.
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl cursor-pointer flex flex-col justify-between transition-colors border ${
                      pacingMode === "throttled"
                        ? "bg-surface-container-highest border-primary/40"
                        : "bg-surface-container-lowest border-outline-variant/30 opacity-80"
                    }`}
                    onClick={() => setPacingMode("throttled")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Throttled Safe</span>
                      <StitchIcon name={pacingMode === "throttled" ? "radio_button_checked" : "radio_button_unchecked"} className="text-primary text-[18px]" size={18} />
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      25 msgs / 10s queue to safeguard Meta score.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry & Impact Projection Card */}
            <div className="bg-surface-container rounded-xl p-space-lg shadow-xs space-y-3 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-1.5">
                  <StitchIcon name="insights" className="text-secondary text-[20px]" size={20} />
                  Cohort Impact Projection
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">AI Diagnostic Engine</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col justify-center border border-outline-variant/20">
                  <span className="font-headline-md text-headline-md text-primary font-bold">94%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Read &lt; 5m</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col justify-center border border-outline-variant/20">
                  <span className="font-headline-md text-headline-md text-secondary font-bold">+420</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Cohort Marks</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col justify-center border border-outline-variant/20">
                  <span className="font-headline-md text-headline-md text-tertiary font-bold">₹28.40</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">108 API Credits</span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-lowest/60 p-2.5 rounded-lg leading-relaxed">
                By delivering Prof. Verma&apos;s voice model directly to WhatsApp notifications, unblocking the ATP Synthase fallacy averts an estimated 21 missed rank positions.
              </p>
            </div>

            {/* Action Footer */}
            <div className="pt-2 space-y-2.5">
              <button
                className={`w-full py-3.5 px-4 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer font-semibold ${
                  dispatched
                    ? "bg-secondary text-on-secondary"
                    : "bg-primary text-on-primary hover:bg-primary/90"
                }`}
                onClick={handleDispatch}
                disabled={isDispatching}
                type="button"
              >
                {isDispatching ? (
                  <>
                    <StitchIcon name="sync" className="text-[20px] animate-spin" size={20} />
                    <span>Broadcasting to 108 Aspirants...</span>
                  </>
                ) : dispatched ? (
                  <>
                    <StitchIcon name="check_circle" className="text-[20px]" size={20} />
                    <span>Dispatched Successfully!</span>
                  </>
                ) : (
                  <>
                    <StitchIcon name="rocket_launch" className="text-[20px]" size={20} />
                    <span>Dispatch WhatsApp Nudge (108 Aspirants)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  className="flex-1 py-2.5 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer font-medium hover:bg-surface-container-high transition-colors"
                  onClick={handleTestToPhone}
                  type="button"
                >
                  <StitchIcon name="send_to_mobile" className="text-[16px]" size={16} />
                  <span>Test to My Phone (+91 98***)</span>
                </button>
                <button
                  className="py-2.5 px-3 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md hover:text-on-surface active:scale-98 cursor-pointer border border-outline-variant/30"
                  onClick={() => router.back()}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
