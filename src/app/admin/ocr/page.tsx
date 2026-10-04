"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminOcrPage() {
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(3);
  const [viewMode, setViewMode] = useState<"side" | "preview">("side");
  const [selectedOption, setSelectedOption] = useState<string>("B");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setApproved(true);
      setTimeout(() => {
        setApproved(false);
        setSelectedQuestion(4);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
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
                OCR Verification Workbench
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

        {/* Main Content */}
        <main className="flex flex-col relative w-full bg-surface pb-36">
          {/* Top Meta / Batch Info Card */}
          <section className="px-gutter pt-3 pb-2">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-container text-on-primary font-semibold">
                      Live Ingestion
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant truncate">
                      Allen_AITS_Major_08_PCB
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1 truncate">
                    42 Questions Extracted
                  </h2>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="inline-flex items-center gap-1 text-label-sm font-label-sm px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                    <StitchIcon name="verified" className="text-[14px]" size={14} />
                    96.4% Acc.
                  </span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                    12 of 42 Done
                  </span>
                </div>
              </div>

              {/* Linear Progress */}
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: "28.5%" }}></div>
                <div className="bg-error/70 h-full rounded-full" style={{ width: "4.5%" }}></div>
              </div>
            </div>
          </section>

          {/* Sticky Question Carousel Navigator */}
          <section className="sticky top-16 z-30 bg-surface/95 backdrop-blur-md px-gutter py-2.5">
            <div className="flex items-center justify-between gap-space-sm mb-1.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Queue Navigator
              </span>
              <button
                className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                onClick={() => setSelectedQuestion(3)}
                type="button"
              >
                <span>Jump to Next Unverified</span>
                <StitchIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 1, label: "Q1", status: "verified" },
                { id: 2, label: "Q2", status: "verified" },
                { id: 3, label: "Q3 (Active)", status: "active" },
                { id: 4, label: "Q4 Pending", status: "pending" },
                { id: 5, label: "Q5 Flagged", status: "flagged" },
                { id: 6, label: "Q6", status: "pending" },
                { id: 7, label: "Q7", status: "pending" },
              ].map((q) => {
                const isActive = selectedQuestion === q.id;
                return (
                  <button
                    key={q.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm font-label-sm shrink-0 cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary text-on-primary shadow-xs font-semibold"
                        : q.status === "verified"
                        ? "bg-surface-container text-on-surface"
                        : q.status === "flagged"
                        ? "bg-error-container text-on-error-container"
                        : "bg-surface-container-high text-on-surface"
                    }`}
                    onClick={() => setSelectedQuestion(q.id)}
                    type="button"
                  >
                    {q.status === "verified" && (
                      <StitchIcon name="check_circle" className="text-sm text-secondary" />
                    )}
                    {q.status === "active" && (
                      <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
                    )}
                    {q.status === "flagged" && (
                      <StitchIcon name="flag" className="text-sm" />
                    )}
                    {q.status === "pending" && (
                      <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                    )}
                    <span>{q.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Main Active Question Verification Workbench */}
          <section className="px-gutter flex flex-col gap-space-md mt-1">
            {/* Active Question Master Header */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Question 0{selectedQuestion}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    Botany • Single MCQ
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-label-sm font-label-sm border border-amber-200">
                    <StitchIcon name="report" className="text-sm text-amber-600" />
                    Stem OCR: 78% Conf.
                  </span>
                </div>
              </div>

              {/* Segmented View Controller */}
              <div className="mt-3 bg-surface-container rounded-lg p-1 flex">
                <button
                  className={`flex-1 py-1.5 rounded text-center text-label-sm font-label-sm transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    viewMode === "side"
                      ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  onClick={() => setViewMode("side")}
                  type="button"
                >
                  <StitchIcon name="compare" className="text-[16px]" size={16} />
                  <span>Side-by-Side (Scan vs OCR)</span>
                </button>
                <button
                  className={`flex-1 py-1.5 rounded text-center text-label-sm font-label-sm transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    viewMode === "preview"
                      ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  onClick={() => setViewMode("preview")}
                  type="button"
                >
                  <StitchIcon name="visibility" className="text-[16px]" size={16} />
                  <span>Student CBT View</span>
                </button>
              </div>
            </div>

            {/* Panel 1: Original Scanned Snippet View */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StitchIcon name="document_scanner" className="text-on-surface-variant text-[18px]" size={18} />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Original PDF Scan Snippet
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-surface-container text-on-surface-variant cursor-pointer" title="Magnify scan" type="button">
                    <StitchIcon name="zoom_in" className="text-sm" />
                  </button>
                  <button className="px-2 py-1 rounded bg-surface-container-low text-primary text-label-sm font-label-sm flex items-center gap-1 cursor-pointer" type="button">
                    <StitchIcon name="crop" className="text-[14px]" size={14} />
                    <span>Re-Crop</span>
                  </button>
                </div>
              </div>

              {/* Scanned Paper Texture Canvas Simulation */}
              <div className="relative rounded-lg overflow-hidden bg-[#e5e5dc] p-3 shadow-inner">
                <div className="bg-[#faf8f1] rounded p-3 shadow-xs font-serif text-[13px] leading-tight text-neutral-800">
                  <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-mono mb-1">
                    Allen AITS Major Test Series • PCB Booklet code: 82-X
                  </div>
                  <p className="font-medium text-neutral-900">
                    <span className="font-bold">3.</span> Consider the diagram given below representing an organelle from higher plant mesophyll cells. Which marked structure exhibits synthesis of ATP via photophosphorylation when ΔpH is maintained across its membrane?
                  </p>

                  {/* Diagram inside scan with auto-crop boundary */}
                  <div className="relative my-2.5 mx-auto max-w-[280px] bg-[#f2efe4] rounded p-2 border border-neutral-300">
                    <div className="w-full h-32 flex items-center justify-center text-primary/70">
                      <StitchIcon name="spa" className="text-[64px]" size={64} />
                    </div>
                    <div className="absolute inset-1.5 rounded pointer-events-none flex flex-col justify-between p-1 bg-secondary/10 border border-secondary/40">
                      <div className="flex items-center justify-between">
                        <span className="bg-secondary text-on-secondary font-label-sm text-[10px] px-1 rounded shadow-xs font-semibold">
                          Diagram Auto-Cropped (480×320)
                        </span>
                        <span className="bg-surface-container-lowest text-on-surface font-code-sm text-[10px] px-1 rounded shadow-xs">
                          IoU: 0.98
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[10px] font-mono bg-surface-container-highest/90 text-on-surface px-1 rounded">
                          Fig. 3.1 Clp-Organelle
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[12px] text-neutral-700 font-sans">
                    <div>(A) Stroma Matrix (Label I)</div>
                    <div>(B) Thylakoid lumen &amp; Grana (Label II)</div>
                    <div>(C) Outer Porin Envelope (Label III)</div>
                    <div>(D) Ribosomal 70S Granule (Label IV)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <span>Scan source: Page 2, Segment #3</span>
                <span className="font-code-sm text-code-sm text-secondary font-semibold">DPI: 300 (Clean Deskewed)</span>
              </div>
            </div>

            {/* Panel 2: Smart OCR Output & Inline Math Editor */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StitchIcon name="edit_note" className="text-primary text-[18px]" size={18} />
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Digital Stem &amp; Formulas
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-container bg-surface-container px-2 py-0.5 rounded-full font-medium">
                  <StitchIcon name="functions" className="text-[13px]" size={13} />
                  LaTeX Engine Active
                </span>
              </div>

              {/* Editable Question Stem Text Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-label-sm text-on-surface-variant">
                  Detected Stem Content (Tap text to fix OCR errors)
                </label>
                <div className="p-3 bg-surface-container-low rounded-lg text-body-md font-body-md text-on-surface relative focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-lowest transition-all">
                  <span>Consider the diagram given below representing an organelle from higher plant mesophyll cells. Which marked structure exhibits synthesis of ATP via photophosphorylation when </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-code-sm text-code-sm font-semibold underline decoration-wavy decoration-amber-500 cursor-pointer" title="OCR confidence: 72%. Click to verify LaTeX syntax.">
                    \(\Delta\mathrm&#123;pH&#125; \approx 3.0\)
                  </span>
                  <span> is maintained across its membrane?</span>
                </div>
              </div>

              {/* Extracted Diagram Asset Card */}
              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-14 h-12 bg-surface-container-lowest rounded overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/30 text-secondary">
                    <StitchIcon name="spa" className="text-[28px]" size={28} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                        Asset: bio_thylakoid_03.webp
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-label-sm bg-secondary-container text-on-secondary-container">
                        SVG Ready
                      </span>
                    </div>
                    <p className="text-body-sm font-body-sm text-on-surface-variant truncate">
                      480 × 320 px • 18.4 KB (Alpha masked)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer" title="Refine Mask" type="button">
                    <StitchIcon name="brush" className="text-[18px]" size={18} />
                  </button>
                  <button className="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer" title="Preview Fullscreen" type="button">
                    <StitchIcon name="fullscreen" className="text-[18px]" size={18} />
                  </button>
                </div>
              </div>

              {/* MCQ Options Validation Block */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Option Isolation &amp; Official Key (Mark Correct)
                  </span>
                  <span className="text-label-sm font-label-sm text-secondary font-semibold">
                    AI Key Pred: Option B (98%)
                  </span>
                </div>

                {[
                  { key: "A", text: "Stroma Matrix (Label I)", conf: "99% Conf", note: "" },
                  { key: "B", text: "Thylakoid lumen & Grana (Label II)", conf: "98% Conf", note: "Verified Key" },
                  { key: "C", text: "Outer Porin Envelope (Label III)", conf: "Manual Fix", note: "Edited (was 84%)" },
                  { key: "D", text: "Ribosomal 70S Granule (Label IV)", conf: "99% Conf", note: "" },
                ].map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-primary-fixed/30 border-primary shadow-xs"
                          : "bg-surface-container-low border-transparent hover:bg-surface-container"
                      }`}
                    >
                      <input
                        type="radio"
                        name="verified_key"
                        className="mt-1 accent-primary w-4 h-4 cursor-pointer"
                        checked={isSelected}
                        onChange={() => setSelectedOption(opt.key)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-label-sm text-label-sm ${isSelected ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                              Option {opt.key}
                            </span>
                            {opt.note && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-label-sm ${
                                opt.key === "B"
                                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                                  : "bg-amber-100 text-amber-900"
                              }`}>
                                {opt.note}
                              </span>
                            )}
                          </div>
                          <span className="text-label-sm font-label-sm text-secondary font-semibold">
                            {opt.conf}
                          </span>
                        </div>
                        <p className={`font-body-md text-body-md mt-0.5 ${isSelected ? "text-on-surface font-medium" : "text-on-surface"}`}>
                          {opt.text}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        {/* Sticky Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-gutter py-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
          <div className="flex items-center gap-space-sm max-w-2xl mx-auto">
            <button
              className="px-3.5 h-12 rounded-lg bg-surface-container text-on-surface-variant font-label-sm flex items-center justify-center gap-1 hover:text-error hover:bg-error-container/30 transition-colors cursor-pointer"
              type="button"
            >
              <StitchIcon name="flag" className="text-[18px]" size={18} />
              <span>Flag</span>
            </button>
            <button
              className={`flex-1 h-12 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer ${
                approved
                  ? "bg-secondary text-on-secondary"
                  : "bg-primary-container text-on-primary hover:bg-primary-container/90"
              }`}
              onClick={handleApprove}
              disabled={isApproving}
              type="button"
            >
              {isApproving ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Verifying &amp; Committing...</span>
                </>
              ) : approved ? (
                <>
                  <StitchIcon name="check_circle" className="text-[20px]" size={20} />
                  <span>Question Approved &amp; Saved!</span>
                </>
              ) : (
                <>
                  <StitchIcon name="check" className="text-[20px]" size={20} />
                  <span>Approve &amp; Push to Bank</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
