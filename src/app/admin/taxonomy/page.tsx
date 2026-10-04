"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminTaxonomyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bulk" | "schema">("bulk");
  const [selectedBloom, setSelectedBloom] = useState<string>("L2 Understanding");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("NEET Actual (Standard)");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Thylakoid Membrane",
    "Chemiosmosis",
    "Proton Gradient",
    "CF0-CF1 Synthase",
    "Photophosphorylation",
  ]);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        router.back();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs pb-32">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <button
                aria-label="Go back"
                className="w-11 h-11 -ml-2 flex items-center justify-center text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-2xl" />
              </button>
              <Image
                alt="Kriti NEET Logo"
                className="h-7 w-auto object-contain"
                src="/stitch/logo.png"
                width={28}
                height={28}
              />
              <h1 className="font-headline-sm text-headline-sm text-on-surface truncate ml-1">
                Batch Taxonomy Manager
              </h1>
            </div>
            <div className="flex items-center gap-space-sm">
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/20"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Modal / Main Container Frame */}
        <main className="flex flex-col relative w-full pt-2 px-gutter flex-1 gap-space-md">
          {/* Header Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <StitchIcon name="account_tree" className="text-lg" />
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Batch Re-Tag &amp; Taxonomy Schema
                </h2>
              </div>
              <button
                aria-label="Dismiss"
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-lg" />
              </button>
            </div>

            {/* Context Bar & AI Status */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm shadow-xs font-medium">
                <StitchIcon name="checklist" className="text-sm" />
                18 Questions Selected • Class 11 Botany &amp; Cell Biology
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-medium">
                <StitchIcon name="auto_awesome" className="text-sm animate-pulse" />
                Auto-AI Taxonomy Predictor Active
              </span>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="p-1 rounded-xl bg-surface-container flex items-center gap-1 mt-1">
              <button
                className={`flex-1 py-1.5 px-3 rounded-lg font-label-md text-label-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "bulk"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => setActiveTab("bulk")}
                type="button"
              >
                <StitchIcon name="sell" className="text-base" />
                Bulk Re-Tagging (Active)
              </button>
              <button
                className={`flex-1 py-1.5 px-3 rounded-lg font-label-md text-label-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "schema"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => setActiveTab("schema")}
                type="button"
              >
                <StitchIcon name="schema" className="text-base" />
                Taxonomy Schema Hierarchy
              </button>
            </div>
          </div>

          {/* Visual Curator Micro-Card Banner */}
          <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md shadow-xs border border-outline-variant/30">
            <div className="w-14 h-14 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <StitchIcon name="science" className="text-[32px]" size={32} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  Active Cohort Target
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                NCERT Class 11 Units I &amp; II Micro-Curriculum
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Changes apply simultaneously to Question Bank v2.4 revision queues
              </p>
            </div>
          </div>

          {/* SECTION 1: Standardized NCERT Mapping & Curricular Metadata */}
          <section className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StitchIcon name="menu_book" className="text-primary text-xl" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  NCERT Mapping &amp; Syllabus Alignment
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded-full font-semibold">
                NMC 2026 Core
              </span>
            </div>

            <div className="flex flex-col gap-space-xs mt-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Target Curricular Framework
              </label>
              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  Rationalized NEET UG 2026 (NMC Guidelines)
                </span>
                <StitchIcon name="verified" className="text-primary text-base" />
              </div>
            </div>

            {/* Hierarchical Pickers Grid */}
            <div className="grid grid-cols-1 gap-space-xs">
              <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Class &amp; Subject</span>
                <select className="bg-transparent font-headline-sm text-body-md text-on-surface font-semibold focus:outline-none cursor-pointer">
                  <option>Class 11 • Biology (Botany &amp; Zoology)</option>
                  <option>Class 11 • Physics</option>
                  <option>Class 11 • Chemistry</option>
                  <option>Class 12 • Biology</option>
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Target Chapter</span>
                <select className="bg-transparent font-headline-sm text-body-md text-on-surface font-semibold focus:outline-none cursor-pointer">
                  <option>Chapter 13: Photosynthesis in Higher Plants</option>
                  <option>Chapter 8: Cell - The Unit of Life</option>
                  <option>Chapter 2: Biological Classification</option>
                  <option>Chapter 14: Respiration in Plants</option>
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Curriculum Subtopic</span>
                <select className="bg-transparent font-headline-sm text-body-md text-on-surface font-semibold focus:outline-none cursor-pointer">
                  <option>13.6 Where are ATP and NADPH Used? (Chemiosmosis)</option>
                  <option>13.4 The Electron Transport Chain &amp; Cyclic Photophosphorylation</option>
                  <option>13.7 The C4 Pathway</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 2: Cognitive Bloom & Difficulty Level */}
          <section className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StitchIcon name="psychology" className="text-primary text-xl" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Cognitive Taxonomy &amp; Rigor
                </h3>
              </div>
              <span className="font-label-sm text-[11px] text-primary font-semibold">{selectedBloom}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { lvl: "L1 Recall", label: "L1 Knowledge" },
                { lvl: "L2 Understanding", label: "L2 Conceptual" },
                { lvl: "L3/L4 Analysis", label: "L3/L4 Analytical" },
              ].map((item) => (
                <button
                  key={item.lvl}
                  className={`p-2 rounded-lg text-center font-label-sm text-label-sm transition-all cursor-pointer ${
                    selectedBloom === item.lvl
                      ? "bg-primary-fixed text-on-primary-fixed-variant font-bold border border-primary/30"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                  onClick={() => setSelectedBloom(item.lvl)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1 pt-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Difficulty Level Calibration</span>
              <div className="grid grid-cols-3 gap-1.5">
                {["Easy", "NEET Actual (Standard)", "Tier-1 Challenger"].map((diff) => (
                  <button
                    key={diff}
                    className={`py-2 px-1 rounded-lg text-center font-label-sm text-[11px] transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? "bg-secondary-container text-on-secondary-container font-bold border border-secondary/30"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                    onClick={() => setSelectedDifficulty(diff)}
                    type="button"
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: Tag Cloud & Micro-Concept Mapping */}
          <section className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StitchIcon name="label" className="text-primary text-xl" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Micro-Concepts &amp; Distractor Tags
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-outline">{selectedTags.length} active</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Thylakoid Membrane",
                "Chemiosmosis",
                "Proton Gradient",
                "CF0-CF1 Synthase",
                "Photophosphorylation",
                "Stroma Lamellae",
                "Rubisco Trap",
                "Photosystem II",
                "NADP Reductase",
              ].map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    className={`px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary font-semibold shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                    onClick={() => toggleTag(tag)}
                    type="button"
                  >
                    <span>{tag}</span>
                    {isSelected && (
                      <StitchIcon name="check" className="text-[13px]" size={13} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        {/* Sticky Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-gutter py-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
          <div className="flex items-center gap-space-sm max-w-2xl mx-auto">
            <button
              className="px-4 h-12 rounded-lg bg-surface-container text-on-surface font-label-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              onClick={() => setSelectedTags(["Thylakoid Membrane", "Chemiosmosis"])}
              type="button"
            >
              Reset
            </button>
            <button
              className={`flex-1 h-12 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer ${
                applied
                  ? "bg-secondary text-on-secondary"
                  : "bg-primary-container text-on-primary hover:bg-primary-container/90"
              }`}
              onClick={handleApply}
              disabled={isApplying}
              type="button"
            >
              {isApplying ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Applying Schema to 18 Questions...</span>
                </>
              ) : applied ? (
                <>
                  <StitchIcon name="check_circle" className="text-[20px]" size={20} />
                  <span>Taxonomy Updated!</span>
                </>
              ) : (
                <>
                  <StitchIcon name="save" className="text-[20px]" size={20} />
                  <span>Apply Taxonomy to 18 Questions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
