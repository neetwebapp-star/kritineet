"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/stitch/AppShell";
import { StitchIcon } from "@/components/stitch/StitchIcon";

export default function PyqVaultPage() {
  const [activeTab, setActiveTab] = useState<"year" | "chapter" | "topic">("year");
  const [selectedTag, setSelectedTag] = useState<string>("10years");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const PAPERS = [
    {
      id: "neet-2024-p1",
      year: "2024",
      title: "NEET UG 2024 (Main Examination)",
      edition: "Paper Set Q1",
      questions: 200,
      marks: 720,
      duration: "200 Mins",
      status: "COMPLETED",
      score: 642,
      accuracy: 91,
      attemptDate: "Yesterday",
    },
    {
      id: "neet-2024-reneet",
      year: "2024",
      title: "NEET UG 2024 (Re-NEET Official)",
      edition: "Paper Set R4",
      questions: 200,
      marks: 720,
      duration: "200 Mins",
      status: "UNATTEMPTED",
      badge: "High Rigor",
    },
    {
      id: "neet-2023-main",
      year: "2023",
      title: "NEET UG 2023 (Official Paper)",
      edition: "Paper Set E6",
      questions: 200,
      marks: 720,
      duration: "200 Mins",
      status: "COMPLETED",
      score: 618,
      accuracy: 88,
      attemptDate: "Last Week",
    },
    {
      id: "neet-2022-main",
      year: "2022",
      title: "NEET UG 2022 (Official Extended Format)",
      edition: "Paper Set T2",
      questions: 200,
      marks: 720,
      duration: "200 Mins",
      status: "IN_PROGRESS",
      solved: 112,
      total: 200,
    },
    {
      id: "neet-2021-main",
      year: "2021",
      title: "NEET UG 2021 (Two-Section Pattern)",
      edition: "Paper Set M3",
      questions: 200,
      marks: 720,
      duration: "180 Mins",
      status: "UNATTEMPTED",
    },
    {
      id: "neet-2020-phase1",
      year: "2020",
      title: "NEET UG 2020 (Covid Special / Phase 1)",
      edition: "Paper Set G1",
      questions: 180,
      marks: 720,
      duration: "180 Mins",
      status: "UNATTEMPTED",
    },
  ];

  const CHAPTER_BUNDLES = [
    {
      id: 'ch-bot-01',
      subject: 'BOTANY',
      chapter: 'Biological Classification',
      questionsCount: 48,
      yearsSpan: '2010–2024',
      weightage: 'High Yield (3-4 Qs/yr)',
      mastery: 84,
    },
    {
      id: 'ch-bot-02',
      subject: 'BOTANY',
      chapter: 'Cell: The Unit of Life',
      questionsCount: 62,
      yearsSpan: '2008–2024',
      weightage: 'Very High (4-5 Qs/yr)',
      mastery: 78,
    },
    {
      id: 'ch-chem-01',
      subject: 'CHEMISTRY',
      chapter: 'Chemical Bonding & Molecular Structure',
      questionsCount: 54,
      yearsSpan: '2012–2024',
      weightage: 'High Yield (3-4 Qs/yr)',
      mastery: 90,
    },
    {
      id: 'ch-phy-01',
      subject: 'PHYSICS',
      chapter: 'Ray Optics & Optical Instruments',
      questionsCount: 42,
      yearsSpan: '2014–2024',
      weightage: 'High Yield (3 Qs/yr)',
      mastery: 65,
    },
    {
      id: 'ch-zoo-01',
      subject: 'ZOOLOGY',
      chapter: 'Human Reproduction & Health',
      questionsCount: 58,
      yearsSpan: '2010–2024',
      weightage: 'High Yield (4 Qs/yr)',
      mastery: 92,
    },
    {
      id: 'ch-phy-02',
      subject: 'PHYSICS',
      chapter: 'Current Electricity',
      questionsCount: 46,
      yearsSpan: '2011–2024',
      weightage: 'High Yield (3 Qs/yr)',
      mastery: 70,
    },
  ];

  return (
    <AppShell
      title="PYQ Vault"
      subtitle="2000–2026 Verified Official Papers"
      streakDays={7}
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/cbt"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3525cd] text-white hover:bg-[#2b1ea8] text-xs font-bold transition-all shadow-xs"
          >
            <StitchIcon name="quiz" size={14} />
            <span>Launch CBT Simulator</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Intro & Search Strip */}
        <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e1e8fd] text-[#3525cd] text-xs font-bold">
                <StitchIcon name="verified" size={13} />
                Official NTA Archives
              </span>
              <span className="text-xs text-[#777587]">26 Years Indexed • 100% NCERT Mapped</span>
            </div>
            <h1 className="font-headline font-bold text-xl text-[#141b2b] mt-1">
              NEET Previous Year Questions Vault
            </h1>
            <p className="text-xs text-[#777587]">
              Verified entrance papers with verbatim NCERT mapping and Step-by-Step AI Socratic hints.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <StitchIcon name="search" size={16} className="absolute left-3.5 top-3 text-[#777587]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search year, topic, or question..."
              className="w-full pl-9 pr-4 py-2 bg-[#f9f9ff] text-sm text-[#141b2b] rounded-xl border border-[#e9edff] focus:outline-none focus:border-[#3525cd]"
            />
          </div>
        </div>

        {/* High-Yield 2024 Exam Analysis Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#141b2b] text-white p-6 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                  2024 Trend Analysis
                </span>
                <span className="text-xs text-white/80 font-mono">NTA Pattern Shift</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Botany weightage increased by 8% • 35/45 questions verbatim from NCERT lines
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Emphasis shifted heavily toward Assertion-Reasoning and Multi-Statement questions in Plant Physiology and Cell Biology.
              </p>
            </div>
            <Link
              href="/cbt"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#3525cd] hover:bg-[#f1f3ff] text-xs font-bold shadow-xs transition-all flex-shrink-0"
            >
              <span>Solve 2024 CBT Paper</span>
              <StitchIcon name="arrow_forward" size={14} />
            </Link>
          </div>
        </div>

        {/* Tab & Filter Chips Ribbon */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-xl">
              {(["year", "chapter", "topic"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-[#3525cd] shadow-xs font-bold"
                      : "text-[#464555] hover:text-[#141b2b]"
                  }`}
                >
                  {tab}-wise
                </button>
              ))}
            </div>

            {/* Quick Filter Collections */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "10years", label: "Last 10 Years (2015-2024)", icon: "auto_awesome" },
                { id: "ar", label: "Assertion-Reason Special", icon: "warning" },
                { id: "statement", label: "Statement-Based", icon: "format_list_bulleted" },
                { id: "match", label: "Match The Columns", icon: "sync_alt" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedTag(filter.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTag === filter.id
                      ? "bg-[#3525cd] text-white shadow-xs"
                      : "bg-[#f1f3ff] text-[#464555] hover:bg-[#e1e8fd]"
                  }`}
                >
                  <StitchIcon name={filter.icon} size={13} />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Column Responsive Sets Grid (3 cols on lg) */}
        {activeTab === 'year' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAPERS.map((paper) => (
              <div
                key={paper.id}
                className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs flex flex-col justify-between gap-4 hover:border-[#c3c0ff] transition-all"
              >
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-lg text-[#141b2b]">
                      NEET {paper.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#f1f3ff] text-xs font-semibold text-[#464555]">
                      {paper.edition}
                    </span>
                  </div>
                  {paper.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffebee] text-[#ba1a1a] text-[10px] font-bold">
                      {paper.badge}
                    </span>
                  )}
                  {paper.status === "COMPLETED" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#006c49] text-[10px] font-bold">
                      Attempted
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#777587]">
                  {paper.title}
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#f9f9ff] text-[11px] font-medium text-[#464555] border border-[#e9edff]">
                    {paper.questions} Qs
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#f9f9ff] text-[11px] font-medium text-[#464555] border border-[#e9edff]">
                    {paper.marks} Marks
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#f9f9ff] text-[11px] font-medium text-[#464555] border border-[#e9edff]">
                    {paper.duration}
                  </span>
                </div>

                {/* Score or Progress indicator */}
                {paper.status === "COMPLETED" && (
                  <div className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-[#777587] block">Your Score:</span>
                      <span className="font-bold font-headline text-sm text-[#006c49]">
                        {paper.score} / {paper.marks}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#777587] block">Accuracy:</span>
                      <span className="font-bold text-sm text-[#3525cd]">
                        {paper.accuracy}%
                      </span>
                    </div>
                  </div>
                )}

                {paper.status === "IN_PROGRESS" && (
                  <div className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#777587]">Session in Progress</span>
                      <span className="font-bold text-[#3525cd]">
                        {paper.solved} / {paper.total} Solved
                      </span>
                    </div>
                    <div className="w-full bg-[#e9edff] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#3525cd] h-full rounded-full"
                        style={{ width: `${((paper.solved || 0) / (paper.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#f1f3ff] flex items-center justify-between gap-2">
                <Link
                  href="/cbt/results"
                  className="text-xs text-[#3525cd] hover:underline font-semibold flex items-center gap-1"
                >
                  <StitchIcon name="insights" size={14} />
                  <span>Breakdown</span>
                </Link>

                <Link
                  href="/cbt"
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                    paper.status === "COMPLETED"
                      ? "bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e1e8fd]"
                      : paper.status === "IN_PROGRESS"
                      ? "bg-[#006c49] text-white hover:bg-[#005a3b]"
                      : "bg-[#3525cd] text-white hover:bg-[#2b1ea8]"
                  }`}
                >
                  <StitchIcon name={paper.status === "IN_PROGRESS" ? "play_arrow" : "quiz"} size={14} />
                  <span>
                    {paper.status === "COMPLETED"
                      ? "Reattempt CBT"
                      : paper.status === "IN_PROGRESS"
                      ? "Resume Paper"
                      : "Start CBT"}
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHAPTER_BUNDLES.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs flex flex-col justify-between gap-4 hover:border-[#c3c0ff] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e1e8fd] text-[#3525cd] text-xs font-bold font-mono">
                    {bundle.subject}
                  </span>
                  <span className="text-[11px] font-bold text-[#006c49]">
                    Mastery: {bundle.mastery}%
                  </span>
                </div>

                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    {bundle.chapter}
                  </h3>
                  <p className="text-xs text-[#777587] mt-0.5">
                    Span: {bundle.yearsSpan} • {bundle.weightage}
                  </p>
                </div>

                <div className="w-full bg-[#f1f3ff] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#3525cd] h-full rounded-full"
                    style={{ width: `${bundle.mastery}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-[#464555]">
                  <span className="px-2 py-0.5 rounded bg-[#f9f9ff] border border-[#e9edff] font-semibold text-[11px]">
                    {bundle.questionsCount} Official PYQs
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#f9f9ff] border border-[#e9edff] font-semibold text-[11px]">
                    NCERT Indexed
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f1f3ff] flex items-center justify-between gap-2">
                <Link
                  href={`/ai-tutor?topic=${encodeURIComponent(bundle.chapter)}`}
                  className="text-xs text-[#3525cd] hover:underline font-semibold flex items-center gap-1"
                >
                  <StitchIcon name="smart_toy" size={14} />
                  <span>Topic Hints</span>
                </Link>
                <Link
                  href="/cbt"
                  className="px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <StitchIcon name="quiz" size={14} />
                  <span>Solve {bundle.questionsCount} Qs</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </AppShell>
  );
}
