"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminRecipientsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([1, 2, 3]);

  const students = [
    {
      id: 1,
      roll: "#NEET-26-8842",
      name: "Aarav Sharma",
      center: "Kota South • Batch B8-A",
      tag: "Critical: Both Traps",
      tagColor: "bg-error-container text-on-error-container",
      tier: "Mid-Tier (Score: 574)",
      tierColor: "bg-primary-fixed text-on-primary-fixed",
      air: "AIR Est: ~21,400",
      drag: "-2.50m Net Drag",
      q1: "AR Q01: Picked Option B (44s)",
      q1Code: "Causal Fallacy",
      q2: "Multi Q05: Picked Option A (61s)",
      q2Code: "Functional Bias",
      statusText: "CBT App Active Now (Idle 4m)",
      statusColor: "text-secondary",
    },
    {
      id: 2,
      roll: "#NEET-26-4190",
      name: "Ananya Iyer",
      center: "Chennai Central • Batch B8-Alpha",
      tag: "AR Q01 Trap B Only",
      tagColor: "bg-surface-container-high text-on-surface",
      tier: "Top-5% Outlier (Score: 668 • AIR ~1,240)",
      tierColor: "bg-secondary-container text-on-secondary-container",
      air: "AIR Est: ~1,240",
      drag: "-1.25m Drag",
      q1: "AR Q01: Picked Option B (32s)",
      q1Code: "Rushed Causality",
      q2: "Multi Q05: Correct (Key C, 52s)",
      q2Code: "Mastered",
      statusText: "Last active 18m ago",
      statusColor: "text-on-surface-variant",
    },
    {
      id: 3,
      roll: "#NEET-26-6731",
      name: "Devendra Patel",
      center: "Ahmedabad East • Batch B8-C",
      tag: "Dual Trap + High Guess",
      tagColor: "bg-error text-on-error",
      tier: "Foundation Tier (Score: 442)",
      tierColor: "bg-error-container text-on-error-container",
      air: "AIR Est: ~48,200",
      drag: "-3.10m Drag",
      q1: "AR Q01: Picked Option B (18s - Guess)",
      q1Code: "Low Confidence",
      q2: "Multi Q05: Picked Option A (22s)",
      q2Code: "Heuristic Bias",
      statusText: "Queued for WhatsApp Escalation",
      statusColor: "text-error",
    },
  ];

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.center.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "both") return s.tag.includes("Both") || s.tag.includes("Dual");
    if (activeFilter === "mid") return s.tier.includes("Mid-Tier");
    if (activeFilter === "foundation") return s.tier.includes("Foundation");
    if (activeFilter === "top") return s.tier.includes("Top-5%");
    return true;
  });

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
        <main className="flex-1 w-full bg-surface pb-36 px-gutter space-y-space-md pt-2">
          {/* Breadcrumb & Top Bar */}
          <div className="pt-space-sm flex items-center justify-between text-on-surface-variant">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <Link href="/admin/broadcast" className="hover:text-primary flex items-center gap-1">
                <StitchIcon name="arrow_back" className="text-[15px] text-primary" size={15} />
                <span>Dispatch Simulator</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">620 Recipient Roster</span>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>Live Cohort Sync</span>
            </div>
          </div>

          {/* Cohort High-Density Overview Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs space-y-space-sm border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Target: Rankers Elite B8
                  </span>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    Test #4C
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Triggered by <span className="font-medium text-error">AR Q01 Trap B</span> +{" "}
                  <span className="font-medium text-error">Multi-Stmt Q05 Trap A</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-headline-md text-headline-md text-error tracking-tight font-bold">-1.32m</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg Drag</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
              <div className="bg-surface-container-low rounded-lg p-2 text-center">
                <p className="font-headline-sm text-headline-sm text-on-surface font-bold">620</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Flagged (50%)</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-2 text-center">
                <p className="font-headline-sm text-headline-sm text-error font-bold">142</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Dual Trap Hits</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-2 text-center">
                <p className="font-headline-sm text-headline-sm text-secondary font-bold">418</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">CBT App Active</p>
              </div>
            </div>
          </div>

          {/* Interactive Filters Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {[
              { id: "all", label: "All Targets", count: "620" },
              { id: "both", label: "Both Traps", count: "142" },
              { id: "mid", label: "Mid-Tier", count: "316" },
              { id: "foundation", label: "Foundation", count: "285" },
              { id: "top", label: "Top 5%", count: "19" },
            ].map((f) => (
              <button
                key={f.id}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-primary text-on-primary font-semibold"
                    : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                }`}
                onClick={() => setActiveFilter(f.id)}
                type="button"
              >
                <span>{f.label}</span>
                <span className="bg-white/20 px-1 rounded-full text-[10px]">{f.count}</span>
              </button>
            ))}
          </div>

          {/* Search & Sort Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface-container-lowest rounded-lg px-3 py-2 flex items-center gap-2 shadow-xs border border-outline-variant/30">
              <StitchIcon name="search" className="text-[18px] text-outline" size={18} />
              <input
                className="bg-transparent text-on-surface font-body-sm text-body-sm outline-none w-full placeholder:text-outline"
                placeholder="Roll No, student name, center..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <button
              className="bg-surface-container-lowest px-3 py-2 rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-1 shadow-xs shrink-0 border border-outline-variant/30 cursor-pointer"
              type="button"
            >
              <StitchIcon name="swap_vert" className="text-[16px] text-primary" size={16} />
              <span>Max Drag</span>
            </button>
          </div>

          {/* Selection Counter & Batch Selector */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface font-medium">
                {selectedStudents.length} of {students.length} Selected (620 Cohort Total)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="font-label-sm text-label-sm text-outline hover:text-on-surface cursor-pointer"
                onClick={() => setSelectedStudents([1, 2, 3])}
                type="button"
              >
                Select All
              </button>
              <span className="text-outline-variant">•</span>
              <button
                className="font-label-sm text-label-sm text-primary cursor-pointer"
                onClick={() => setSelectedStudents([])}
                type="button"
              >
                Deselect
              </button>
            </div>
          </div>

          {/* Aspirant Roster Stream */}
          <div className="space-y-space-sm">
            {filteredStudents.map((st) => {
              const isSelected = selectedStudents.includes(st.id);
              return (
                <div
                  key={st.id}
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs space-y-space-sm relative border border-outline-variant/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <button
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary text-on-primary" : "bg-surface-container border border-outline"
                        }`}
                        onClick={() => toggleStudent(st.id)}
                        type="button"
                      >
                        {isSelected && <StitchIcon name="check" className="text-[14px]" size={14} />}
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {st.name}
                          </span>
                          <span className="bg-surface-container text-on-surface-variant font-code-sm text-code-sm px-1.5 py-0.5 rounded">
                            {st.roll}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{st.center}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold shrink-0 ${st.tagColor}`}>
                      {st.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-medium ${st.tierColor}`}>
                      {st.tier}
                    </span>
                    <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded font-label-sm text-label-sm">
                      {st.air}
                    </span>
                    <span className="text-error font-label-sm text-label-sm font-semibold ml-auto">
                      {st.drag}
                    </span>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-2.5 space-y-1 font-body-sm text-body-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-on-surface font-medium flex items-center gap-1">
                        <StitchIcon name="close" className="text-[15px] text-error" size={15} />
                        {st.q1}
                      </span>
                      <span className="text-outline text-code-sm font-code-sm">{st.q1Code}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-on-surface font-medium flex items-center gap-1">
                        <StitchIcon name="close" className="text-[15px] text-error" size={15} />
                        {st.q2}
                      </span>
                      <span className="text-outline text-code-sm font-code-sm">{st.q2Code}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className={`flex items-center gap-1.5 font-label-sm text-label-sm ${st.statusColor}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>{st.statusText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/admin/push-telemetry" className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-0.5">
                        <span>Telemetry</span>
                        <StitchIcon name="visibility" className="text-[14px]" size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Sticky Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-gutter py-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
          <div className="flex items-center gap-space-sm max-w-2xl mx-auto">
            <Link
              href="/admin/broadcast"
              className="flex-1 h-12 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
            >
              <StitchIcon name="send" className="text-[20px]" size={20} />
              <span>Proceed to Dispatch ({selectedStudents.length} Selected)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
