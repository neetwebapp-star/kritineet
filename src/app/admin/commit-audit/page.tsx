"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminCommitAuditPage() {
  const router = useRouter();
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [committed, setCommitted] = useState<boolean>(false);
  const [deployToggles, setDeployToggles] = useState({
    dpp: true,
    srs: true,
    pyq: true,
    push: false,
  });

  const handleCommit = () => {
    setIsCommitting(true);
    setTimeout(() => {
      setIsCommitting(false);
      setCommitted(true);
      setTimeout(() => {
        setCommitted(false);
      }, 3000);
    }, 1200);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <button
                aria-label="Close modal"
                className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-[24px]" size={24} />
              </button>
              <div className="flex flex-col min-w-0">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Batch Commit Audit
                </h1>
                <p className="font-label-sm text-label-sm text-outline truncate">
                  Allen AITS Major 08 • 42 Questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <StitchIcon name="person" className="text-[18px]" size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col relative w-full bg-surface pb-36">
          {/* Status & Context Pill Header */}
          <section className="p-gutter flex flex-col gap-space-sm bg-surface-container-low border-b border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-surface-container-lowest shadow-xs">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  Live Sync Ready
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">Batch #2026-B8</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-xs flex-wrap">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Allen AITS Major 08 (PCB)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                  42 Items
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <StitchIcon name="database" className="text-[16px] text-tertiary" size={16} />
                Target: Production Question Bank (Kriti NEET Engine v4.8.2)
              </p>
            </div>

            {/* Health Banner */}
            <div className="mt-space-xs p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-between gap-space-md border border-outline-variant/30">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <StitchIcon name="verified" className="text-[24px]" size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                    Pre-Commit Health Check
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary font-medium">
                    98.4% Confidence Score • Ready
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">42/42</span>
                <p className="font-label-sm text-label-sm text-outline">Valid Stems</p>
              </div>
            </div>
          </section>

          {/* Section 1: Ingestion Guardrails (2x2 Grid) */}
          <section className="px-gutter pt-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <StitchIcon name="security" className="text-primary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Integrity Guardrails</h3>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                Pass (4/4)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex flex-col justify-between min-h-[110px] border border-outline-variant/30">
                <div className="flex items-start justify-between">
                  <StitchIcon name="code" className="text-secondary text-[20px]" size={20} />
                  <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                    <StitchIcon name="check" className="text-[13px]" size={13} />
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">LaTeX &amp; Stems</h4>
                  <p className="font-body-sm text-body-sm text-outline mt-0.5">42/42 Tokens Pure</p>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex flex-col justify-between min-h-[110px] border border-outline-variant/30">
                <div className="flex items-start justify-between">
                  <StitchIcon name="image_search" className="text-secondary text-[20px]" size={20} />
                  <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                    <StitchIcon name="check" className="text-[13px]" size={13} />
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">Vectorized Crops</h4>
                  <p className="font-body-sm text-body-sm text-outline mt-0.5">14/14 Deskewed</p>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex flex-col justify-between min-h-[110px] border border-outline-variant/30">
                <div className="flex items-start justify-between">
                  <StitchIcon name="checklist" className="text-secondary text-[20px]" size={20} />
                  <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                    <StitchIcon name="check" className="text-[13px]" size={13} />
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">Answer Distractors</h4>
                  <p className="font-body-sm text-body-sm text-outline mt-0.5">42 Valid Keys • 4 Traps</p>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex flex-col justify-between min-h-[110px] border border-outline-variant/30">
                <div className="flex items-start justify-between">
                  <StitchIcon name="menu_book" className="text-tertiary text-[20px]" size={20} />
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-tertiary flex items-center justify-center font-label-sm text-label-sm font-bold">
                    !
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">NCERT Citations</h4>
                  <p className="font-body-sm text-body-sm text-tertiary mt-0.5">40 Exact • 2 Inferred</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Subject & Curricular Taxonomy Balance */}
          <section className="px-gutter pt-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <StitchIcon name="tune" className="text-primary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Curricular Taxonomy Matrix</h3>
              </div>
              <span className="font-code-sm text-code-sm text-outline">NMC 2024.3</span>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-space-md border border-outline-variant/30">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant font-medium">
                  <span>Subject Split</span>
                  <span>42 Total</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-container flex overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: "43%" }} title="Botany 18"></div>
                  <div className="h-full bg-primary" style={{ width: "28%" }} title="Zoology 12"></div>
                  <div className="h-full bg-tertiary" style={{ width: "17%" }} title="Chemistry 7"></div>
                  <div className="h-full bg-surface-dim" style={{ width: "12%" }} title="Physics 5"></div>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant pt-1 text-[11px] font-medium">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span>Botany (18)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>Zoo (12)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span>Chem (7)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-dim"></span>Phy (5)</span>
                </div>
              </div>

              <div className="flex flex-col gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Botany • 18 Qs</span>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">High Yield</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ch 2 Biological Classif. (8) • Ch 8 Cell Unit (6) • Ch 11 Photosynthesis (4)
                  </p>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Zoology • 12 Qs</span>
                    <span className="font-label-sm text-label-sm text-primary font-semibold">Core Systems</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ch 4 Animal Kingdom (7) • Ch 17 Breathing &amp; Exchange (5)
                  </p>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Chemistry • 7 Qs</span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">Physical &amp; Inorganic</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Chemical Bonding (MOT) (4) • Thermodynamics (3)
                  </p>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Physics • 5 Qs</span>
                    <span className="font-label-sm text-label-sm text-outline font-semibold">Formula Weighted</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Electromagnetism &amp; Biot-Savart Law (5)
                  </p>
                </div>
              </div>

              {/* Cognitive Balance: Bloom Taxonomy */}
              <div className="pt-space-sm flex flex-col gap-space-xs">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Bloom Cognitive Distribution</span>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="p-1.5 rounded-lg bg-surface-container flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">12</span>
                    <span className="font-label-sm text-label-sm text-outline text-[10px]">L1 Recall (28%)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-container flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">15</span>
                    <span className="font-label-sm text-label-sm text-outline text-[10px]">L2 Comp (36%)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-container flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">9</span>
                    <span className="font-label-sm text-label-sm text-outline text-[10px]">L3 Apply (21%)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-container flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-tertiary font-bold">6</span>
                    <span className="font-label-sm text-label-sm text-outline text-[10px]">L4/5 Synth (15%)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Flagged Action Items */}
          <section className="px-gutter pt-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <StitchIcon name="assignment_late" className="text-tertiary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Auditor Action Log</h3>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold">
                2 Sign-Offs
              </span>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-code-sm text-code-sm flex items-center justify-center font-bold">
                    19
                  </span>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface text-[15px] font-semibold">
                      Chemistry • Thermodynamics
                    </h4>
                    <p className="font-body-sm text-body-sm text-outline">Item UID: #CHEM-TH-0819</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm shrink-0">
                  Inferred NCERT
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface">
                &quot;Calculate standard entropy change (\(\Delta S^\circ\)) during the sublimation of dry ice at 195 K given \(\Delta H_{`{sub}`} = 25.2\text&#123; kJ/mol&#125;\)...&quot;
              </div>
              <div className="p-space-xs rounded-lg bg-surface flex flex-col gap-1 text-[12px]">
                <div className="flex items-center justify-between text-on-surface-variant font-body-sm">
                  <span>Inferred NCERT Reference:</span>
                  <span className="font-semibold text-on-surface">Class 11, Ch 6, Page 164</span>
                </div>
                <div className="flex items-center justify-between text-outline text-[11px]">
                  <span>Confidence: 88% (Textual variance from 2024 rationalized reprint)</span>
                </div>
              </div>
              <div className="pt-space-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-secondary">
                  <StitchIcon name="verified_user" className="text-[18px]" size={18} />
                  <span className="font-label-sm text-label-sm font-semibold">Approved by Dr. R. Sharma</span>
                </div>
                <button className="px-3 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm active:scale-95 transition-transform cursor-pointer" type="button">
                  Edit Mapping
                </button>
              </div>
            </div>

            {/* Flagged Card 2 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded-md bg-secondary-container text-on-secondary-container font-code-sm text-code-sm flex items-center justify-center font-bold">
                    03
                  </span>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface text-[15px] font-semibold">
                      Botany • Cell Biology
                    </h4>
                    <p className="font-body-sm text-body-sm text-outline">Item UID: #BOT-CELL-0803</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shrink-0 font-semibold">
                  SVG Verified
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-md">
                <div className="w-16 h-16 rounded bg-surface-container-lowest flex items-center justify-center shrink-0 border border-outline-variant/30">
                  <StitchIcon name="schema" className="text-primary text-[32px]" size={32} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">bio_thylakoid_03.svg</span>
                  <span className="font-body-sm text-body-sm text-outline truncate">Vectorized Deskewed • 480x320</span>
                  <span className="font-label-sm text-label-sm text-secondary mt-0.5 font-semibold">NCERT Page 136 Exact Anchor</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-outline text-[12px] pt-1">
                <span>Bloom: L4 Analysis • Multi-Step Reasoning</span>
                <span className="font-code-sm text-code-sm text-primary font-bold">Key: Option C</span>
              </div>
            </div>
          </section>

          {/* Section 4: Downstream Deployment Routing */}
          <section className="px-gutter pt-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <StitchIcon name="hub" className="text-primary text-[20px]" size={20} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Downstream Deployment</h3>
              </div>
              <span className="font-label-sm text-label-sm text-outline">Automated Pipelines</span>
            </div>
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-space-md border border-outline-variant/30">
              <label className="flex items-start justify-between gap-space-sm cursor-pointer">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">
                    Daily Practice Problems (DPP) Generator
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Seeds 3 new adaptive Botany DPP sets for Rankers Batch immediately.
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 accent-primary shrink-0 cursor-pointer rounded"
                  checked={deployToggles.dpp}
                  onChange={(e) => setDeployToggles({ ...deployToggles, dpp: e.target.checked })}
                />
              </label>
              <div className="h-[1px] bg-surface-container"></div>

              <label className="flex items-start justify-between gap-space-sm cursor-pointer">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">
                    Spaced Repetition (SRS Engine Box 1)
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Enqueues 18 Botany taxonomy flashcards into revision cycles.
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 accent-primary shrink-0 cursor-pointer rounded"
                  checked={deployToggles.srs}
                  onChange={(e) => setDeployToggles({ ...deployToggles, srs: e.target.checked })}
                />
              </label>
              <div className="h-[1px] bg-surface-container"></div>

              <label className="flex items-start justify-between gap-space-sm cursor-pointer">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">
                    PYQ 2026 Predictive AI Model
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Weights Biot-Savart &amp; Thermodynamics frequency vectors.
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 accent-primary shrink-0 cursor-pointer rounded"
                  checked={deployToggles.pyq}
                  onChange={(e) => setDeployToggles({ ...deployToggles, pyq: e.target.checked })}
                />
              </label>
              <div className="h-[1px] bg-surface-container"></div>

              <label className="flex items-start justify-between gap-space-sm cursor-pointer">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface text-[14px] font-semibold">
                    Immediate Push Notification to Aspirants
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Notify students that Allen Major 08 paper analysis is live.
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 accent-primary shrink-0 cursor-pointer rounded"
                  checked={deployToggles.push}
                  onChange={(e) => setDeployToggles({ ...deployToggles, push: e.target.checked })}
                />
              </label>
            </div>
          </section>

          {/* Section 5: Cold Storage Rollback & Cryptographic Hash */}
          <section className="px-gutter pt-space-xl flex flex-col gap-space-sm">
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-outline-variant/30">
              <div className="flex items-center gap-space-xs text-outline">
                <StitchIcon name="lock_clock" className="text-[16px]" size={16} />
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  Immutable Snapshot Hash
                </span>
              </div>
              <p className="font-code-sm text-code-sm text-on-surface font-mono break-all font-semibold">
                sha256:7f9a8c142b91830eec4188fa6c2b192801e09c
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">72-Hour Instant Rollback Active</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Verified S3 Cold</span>
              </div>
            </div>
          </section>
        </main>

        {/* Persistent Bottom Action Card */}
        <div className="fixed bottom-0 left-0 right-0 p-gutter bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 flex flex-col gap-space-xs pb-safe">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-[11px] text-outline px-1">
              <span className="flex items-center gap-1 font-label-sm text-label-sm">
                <StitchIcon name="shield" className="text-[14px] text-secondary" size={14} />
                Sign-off ID: #FAC-QA-8841
              </span>
              <span>Locks 8 cohort curriculum tracks</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Export audit log"
                className="w-12 h-12 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 active:scale-95 transition-transform cursor-pointer"
                type="button"
              >
                <StitchIcon name="download" className="text-[20px]" size={20} />
              </button>
              <button
                className={`flex-1 h-12 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-md transition-all cursor-pointer ${
                  committed
                    ? "bg-secondary text-on-secondary"
                    : "bg-primary text-on-primary hover:bg-primary/90"
                }`}
                onClick={handleCommit}
                disabled={isCommitting}
                type="button"
              >
                {isCommitting ? (
                  <>
                    <StitchIcon name="progress_activity" className="animate-spin text-[18px]" size={18} />
                    <span>Committing to Production...</span>
                  </>
                ) : committed ? (
                  <>
                    <StitchIcon name="done_all" className="text-[18px]" size={18} />
                    <span>Batch Committed Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Commit 42 Questions</span>
                    <StitchIcon name="rocket_launch" className="text-[18px]" size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
