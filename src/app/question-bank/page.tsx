"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/stitch/AppShell";

export default function QuestionBankPage() {
  const [activeTab, setActiveTab] = useState<"bank" | "schema" | "batch" | "qa">("bank");
  const [searchQuery, setSearchQuery] = useState<string>("Archaebacteria lipid ether");
  const [selectedIds, setSelectedIds] = useState<string[]>(["QID-BOT-1102-042"]);
  const [isTaxonomyOpen, setIsTaxonomyOpen] = useState<boolean>(true);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <AppShell
      title="Question Bank & Taxonomy"
      subtitle="12,548 Items • QA & NCERT Tagging"
      streakDays={7}
      fluid={true}
    >
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-20">
            {/* Sub-Header Context Bar */}
            <div className="px-gutter pt-space-md pb-space-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                    <StitchIcon name="admin_panel_settings" className="text-[13px]" size={13} />
                    Admin QA Hub
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">• 12,548 Items Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-sm text-label-sm font-semibold text-secondary">Synced</span>
                </div>
              </div>
              <div className="flex flex-col mt-0.5">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Question Bank &amp; Taxonomy
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Granular multi-dimensional search, NCERT paragraph tags, Bloom taxonomy, cognitive traps &amp; audit status.
                </p>
              </div>
            </div>

            {/* Segmented Sub-Navigation Bar */}
            <div className="px-gutter py-space-xs">
              <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab("bank")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-headline-sm text-headline-sm whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === "bank"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <StitchIcon name="menu_book" className="text-[16px]" size={16} />
                  Question Bank
                </button>
                <Link
                  href="/admin/taxonomy"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md whitespace-nowrap hover:text-on-surface"
                >
                  <StitchIcon name="account_tree" className="text-[16px]" size={16} />
                  Taxonomy Schema
                </Link>
                <Link
                  href="/admin/commit-audit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md whitespace-nowrap hover:text-on-surface"
                >
                  <StitchIcon name="sell" className="text-[16px]" size={16} />
                  Batch Tagging
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab("qa")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === "qa"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <StitchIcon name="fact_check" className="text-[16px]" size={16} />
                  QA Queue
                  <span className="px-1.5 py-0.2 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm text-[10px]">
                    1,120
                  </span>
                </button>
              </div>
            </div>

            {/* Search & Omnibox Filter Strip */}
            <div className="px-gutter pt-space-sm pb-space-xs flex flex-col gap-space-sm">
              {/* Omnibox Input Field */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <StitchIcon name="search" className="text-[18px]" size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question stem, keywords (e.g. 'Methanogens')..."
                  className="w-full pl-9 pr-24 py-2.5 bg-surface-container-lowest rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
                <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 rounded-lg hover:bg-surface-container-high text-outline transition-colors"
                  >
                    <StitchIcon name="mic" className="text-[18px]" size={18} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm cursor-pointer"
                  >
                    <StitchIcon name="tune" className="text-[14px]" size={14} />
                    <span className="px-1 rounded-full bg-primary text-on-primary text-[10px]">4</span>
                  </button>
                </div>
              </div>

              {/* Active Multi-Dimensional Filter Chips Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Botany • Ch 2 (Bio Classification)</span>
                  <button type="button" className="hover:text-error transition-colors ml-0.5 text-on-surface-variant flex items-center">
                    <StitchIcon name="close" className="text-[14px]" size={14} />
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm whitespace-nowrap shadow-xs">
                  <StitchIcon name="psychology_alt" className="text-[12px]" size={12} />
                  <span>Conceptual Trap</span>
                  <button type="button" className="hover:text-error transition-colors ml-0.5 flex items-center">
                    <StitchIcon name="close" className="text-[14px]" size={14} />
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
                  <span>NCERT p. 19–21</span>
                  <button type="button" className="hover:text-error transition-colors ml-0.5 flex items-center">
                    <StitchIcon name="close" className="text-[14px]" size={14} />
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
                  <span>NEET Actual (Tier 2)</span>
                  <button type="button" className="hover:text-error transition-colors ml-0.5 flex items-center">
                    <StitchIcon name="close" className="text-[14px]" size={14} />
                  </button>
                </div>
              </div>

              {/* Quick Toggle Pills Row */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1 hover:bg-surface-container cursor-pointer"
                >
                  <StitchIcon name="rule" className="text-[14px]" size={14} />
                  Unverified QA Only
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1 hover:bg-surface-container cursor-pointer"
                >
                  <StitchIcon name="history_edu" className="text-[14px]" size={14} />
                  PYQ Linked (2000-2025)
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1 hover:bg-surface-container cursor-pointer"
                >
                  <StitchIcon name="functions" className="text-[14px]" size={14} />
                  With LaTeX
                </button>
              </div>
            </div>

            {/* Aggregation & Metrics Strip */}
            <div className="px-gutter py-space-sm">
              <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">142</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Questions matching criteria</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm">
                    <StitchIcon name="verified" className="text-[13px]" size={13} />
                    92% Audited
                  </div>
                </div>

                <div className="flex items-center h-2 w-full rounded-full bg-surface-container overflow-hidden gap-0.5">
                  <div className="h-full bg-secondary-fixed-dim" style={{ width: "20%" }} title="Easy: 28"></div>
                  <div className="h-full bg-primary-fixed" style={{ width: "45%" }} title="Moderate: 64"></div>
                  <div className="h-full bg-primary-container" style={{ width: "29%" }} title="NEET Actual: 42"></div>
                  <div className="h-full bg-error" style={{ width: "6%" }} title="Challenger: 8"></div>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span> Easy: 28
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span> Mod: 64
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> NEET: 42
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Chlg: 8
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Question Bank Cards Container */}
            <div className="px-gutter flex flex-col gap-space-md pb-24">
              {/* Card 1: Comprehensive Item with Deep Taxonomy Drawer */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm relative">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes("QID-BOT-1102-042")}
                      onChange={() => toggleSelect("QID-BOT-1102-042")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container bg-surface-container-low cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-code-sm text-code-sm text-primary font-semibold">QID-BOT-1102-042</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Class 11 Botany • Chapter 2 (Biological Classification)
                      </span>
                    </div>
                  </div>
                  <button type="button" className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer">
                    <StitchIcon name="more_vert" className="text-[18px]" size={18} />
                  </button>
                </div>

                {/* Badge Strip */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm">
                    <StitchIcon name="check_circle" className="text-[12px]" size={12} />
                    Verified (Faculty Approved)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                    <StitchIcon name="history" className="text-[12px]" size={12} />
                    PYQ 2024 Re-Test
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    <StitchIcon name="bookmark" className="text-[12px]" size={12} />
                    NCERT Line Tagged
                  </span>
                </div>

                {/* Question Stem */}
                <div className="bg-surface-container-low/60 rounded-lg p-space-sm text-on-surface">
                  <p className="font-body-md text-body-md font-semibold leading-snug">
                    Which of the following cellular characteristics distinguishes{" "}
                    <span className="bg-primary-fixed/60 px-1 py-0.5 rounded text-on-primary-fixed">Archaebacteria</span> from{" "}
                    <span className="bg-primary-fixed/60 px-1 py-0.5 rounded text-on-primary-fixed">Eubacteria</span> and confers resilience to extreme environmental temperatures?
                  </p>
                </div>

                {/* 4-Option List */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-body-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm">
                      A
                    </span>
                    <div className="flex-1 min-w-0">
                      <span>Presence of peptidoglycan in cell wall</span>
                      <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-error-container text-on-error-container text-[10px] font-semibold">
                        <StitchIcon name="warning" className="text-[10px]" size={10} />
                        Distractor (34% Student Error Trap)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-primary-fixed/40 text-on-surface text-body-sm font-body-sm shadow-xs">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                      B
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-primary">
                        Branched chain lipids with ether linkages in cell membrane
                      </span>
                      <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[10px] font-semibold">
                        <StitchIcon name="done_all" className="text-[10px]" size={10} />
                        Correct Answer Key ✅
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-body-sm opacity-80">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm">
                      C
                    </span>
                    <div className="flex-1 min-w-0">
                      <span>Unbranched fatty acid esters with 80S ribosomes</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-body-sm opacity-80">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm">
                      D
                    </span>
                    <div className="flex-1 min-w-0">
                      <span>Absence of intracellular genetic material</span>
                    </div>
                  </div>
                </div>

                {/* Deep Taxonomy Drawer */}
                <div className="p-space-sm rounded-lg bg-surface-container-high/40 flex flex-col gap-2">
                  <div
                    onClick={() => setIsTaxonomyOpen(!isTaxonomyOpen)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                      <StitchIcon name="analytics" className="text-[16px] text-primary" size={16} />
                      Taxonomy &amp; NCERT Audit Card
                    </span>
                    <span className="font-label-sm text-label-sm text-primary font-semibold">
                      {isTaxonomyOpen ? "Hide" : "Expanded"}
                    </span>
                  </div>

                  {isTaxonomyOpen && (
                    <div className="grid grid-cols-1 gap-1.5 text-body-sm font-body-sm">
                      <div className="flex items-start gap-2 bg-surface-container-lowest p-2 rounded-md">
                        <StitchIcon name="menu_book" className="text-[16px] text-on-surface-variant flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <span className="font-semibold text-on-surface">NCERT Citation:</span>
                          <p className="text-on-surface-variant text-body-sm font-body-sm">
                            Class 11 Biology, Rationalized Ed., Chapter 2, Page 19, Paragraph 3, Line 12–16.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-surface-container-lowest p-2 rounded-md">
                        <StitchIcon name="psychology" className="text-[16px] text-on-surface-variant flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <span className="font-semibold text-on-surface">Bloom Level &amp; Trap:</span>
                          <p className="text-on-surface-variant text-body-sm font-body-sm">
                            Analysis (L4) • Primary Trap: Students misattribute peptidoglycan to Archaea cell envelope.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-surface-container-lowest p-2 rounded-md">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Aspirant Accuracy</span>
                          <p className="font-headline-sm text-headline-sm text-primary font-bold">64.2%</p>
                          <span className="text-[10px] text-on-surface-variant">Avg Time: 42s</span>
                        </div>
                        <div className="bg-surface-container-lowest p-2 rounded-md">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Exam Track</span>
                          <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">NEET 2024</p>
                          <span className="text-[10px] text-on-surface-variant">Also in AIPMT 2012</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <StitchIcon name="edit_note" className="text-[14px]" size={14} />
                      Edit / LaTeX
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1 cursor-pointer"
                    >
                      <StitchIcon name="lightbulb" className="text-[14px]" size={14} />
                      Explanations (3)
                    </button>
                  </div>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant cursor-pointer">
                    <StitchIcon name="history" className="text-[18px]" size={18} />
                  </button>
                </div>
              </div>

              {/* Card 2: Diagram / Image-Based Question */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes("QID-BOT-1102-089")}
                      onChange={() => toggleSelect("QID-BOT-1102-089")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container bg-surface-container-low cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-code-sm text-code-sm text-on-surface font-semibold">QID-BOT-1102-089</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Botany • Kingdom Protista</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                      <StitchIcon name="pending_actions" className="text-[12px]" size={12} />
                      QA Review Pending
                    </span>
                  </div>
                </div>

                <p className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                  Identify the organism depicted in the given diagram and select the statement describing its nutritional mode and pellicle structure:
                </p>

                {/* Diagram visual preview */}
                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-surface-container-high flex flex-col justify-end p-2.5">
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <StitchIcon name="biotech" className="text-primary/40 text-[64px]" size={64} />
                  </div>
                  <div className="relative z-10 bg-inverse-surface/80 backdrop-blur-md rounded-md px-2 py-1 flex items-center justify-between text-inverse-on-surface">
                    <span className="font-label-sm text-label-sm flex items-center gap-1">
                      <StitchIcon name="image" className="text-[14px]" size={14} />
                      NCERT Fig 2.4 (Page 21)
                    </span>
                    <span className="font-label-sm text-label-sm opacity-80">Euglena viridis</span>
                  </div>
                </div>

                {/* Mini options preview */}
                <div className="p-2 rounded-lg bg-surface-container-low text-body-sm font-body-sm text-on-surface flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface font-medium">Key: (C) Mixotrophic nutrition with protein-rich flexible pellicle</span>
                    <span className="text-secondary font-semibold text-[11px]">Correct</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
                    <span>Bloom: Recall &amp; Recognition</span>
                    <span>•</span>
                    <span>Peer Difficulty: 48% Acc</span>
                  </div>
                </div>

                {/* Quick actions for QA Review */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <StitchIcon name="check" className="text-[14px]" size={14} />
                      Approve Question
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1 cursor-pointer"
                    >
                      <StitchIcon name="label" className="text-[14px]" size={14} />
                      Edit Tags
                    </button>
                  </div>
                  <button type="button" className="p-1.5 text-error rounded-lg hover:bg-error-container/20 cursor-pointer">
                    <StitchIcon name="flag" className="text-[18px]" size={18} />
                  </button>
                </div>
              </div>

              {/* Card 3: Assertion-Reason / Multi-Statement Question */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes("QID-CHEM-1104-105")}
                      onChange={() => toggleSelect("QID-CHEM-1104-105")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container bg-surface-container-low cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-code-sm text-code-sm text-on-surface font-semibold">QID-CHEM-1104-105</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Class 11 Chemistry • Chemical Bonding (MOT)
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                    Challenger Tier
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface">
                  <p>
                    <span className="font-semibold text-primary">Assertion (A):</span> O₂ molecule is paramagnetic in nature despite having an even number of electrons.
                  </p>
                  <p>
                    <span className="font-semibold text-primary">Reason (R):</span> Molecular orbital configuration shows two unpaired electrons in degenerate antibonding π*2p orbitals.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    NCERT Ch 4 p. 128
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    MOT Spaced Flashcard
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    Formula Engine Synced
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-primary font-label-md text-label-md flex items-center gap-1 cursor-pointer">
                      <StitchIcon name="add" className="text-[16px]" size={16} />
                      Add Custom Tag
                    </button>
                    <span className="text-on-surface-variant opacity-40">•</span>
                    <button type="button" className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1 cursor-pointer">
                      <StitchIcon name="assignment_add" className="text-[16px]" size={16} />
                      Map to DPP
                    </button>
                  </div>
                  <button type="button" className="p-1 rounded-md text-on-surface-variant hover:text-on-surface cursor-pointer">
                    <StitchIcon name="content_copy" className="text-[18px]" size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Admin Batch Operations Floating Strip */}
            {selectedIds.length > 0 && (
              <div className="sticky bottom-16 w-full px-gutter py-2 z-40 bg-surface/90 backdrop-blur-md">
                <div className="p-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-sm text-label-sm">
                      {selectedIds.length}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold">
                        {selectedIds.length} {selectedIds.length === 1 ? "Item Selected" : "Items Selected"}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-primary-container text-[11px]">
                        from 142 Results
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/admin/taxonomy"
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center gap-1 shadow-sm"
                    >
                      <StitchIcon name="label" className="text-[14px]" size={14} />
                      Re-Tag
                    </Link>
                    <Link
                      href="/dpp"
                      className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm"
                    >
                      <StitchIcon name="post_add" className="text-[14px]" size={14} />
                      Assign Mock
                    </Link>
                  </div>
                </div>
              </div>
            )}
      </div>
    </AppShell>
  );
}
