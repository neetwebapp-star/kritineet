"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ExportRigorReportPage() {
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "csv">("pdf");
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([
    "stems",
    "di_curves",
    "misdirection",
    "remediation",
  ]);
  const [exportChannel, setExportChannel] = useState<string>("download");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const toggleInclusion = (id: string) => {
    setSelectedInclusions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      if (exportChannel === "print" && typeof window !== "undefined") {
        window.print();
      } else if (typeof window !== "undefined") {
        const reportContent = `Comparative Cognitive Rigor Report\nCandidate: Kriti (NEET UG Aspirant)\nInclusions: ${selectedInclusions.join(', ')}\nGenerated: ${new Date().toLocaleString()}`;
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rigor-report-dossier.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col items-center font-body-md">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Close modal"
                className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="close" className="text-[24px]" size={24} />
              </button>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate tracking-tight">
                  Export Comparative Rigor Report
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Export &amp; Document Generation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Help with export"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                type="button"
              >
                <StitchIcon name="help_outline" className="text-[20px]" size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex flex-col relative w-full pt-2 bg-surface pb-safe min-h-screen">
          <div className="flex flex-col w-full pb-10">
            {/* Subtitle & Context Banner */}
            <section className="px-gutter pt-space-md pb-space-sm">
              <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm bg-secondary-fixed/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Live Psychometric Audit
                  </span>
                  <span className="text-on-surface-variant font-code-sm text-code-sm">Batch #8A49</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                  AR Q01 <span className="text-outline font-normal">vs</span> Multi-Statement Q05
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Rankers Elite B8 • N=1,240 aspirants tested • Target NEET 2026
                </p>
              </div>
            </section>

            {/* Live Document Mockup Card */}
            <section className="px-gutter my-space-xs">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between gap-space-md">
                  <div className="flex gap-space-md items-center min-w-0">
                    <div className="relative w-14 h-18 bg-surface-container-high rounded-lg p-1.5 shadow-sm flex flex-col justify-between shrink-0">
                      <div className="w-full flex justify-between items-center">
                        <span className="w-4 h-1 bg-primary rounded-full"></span>
                        <StitchIcon name="analytics" className="text-[10px] text-primary" size={10} fill />
                      </div>
                      <div className="space-y-1 my-auto">
                        <div className="h-1 bg-outline-variant/60 rounded-full w-full"></div>
                        <div className="h-1 bg-outline-variant/40 rounded-full w-3/4"></div>
                        <div className="flex items-end gap-0.5 h-4 pt-1">
                          <span className="w-1.5 h-2 bg-secondary rounded-xs"></span>
                          <span className="w-1.5 h-3.5 bg-primary rounded-xs"></span>
                          <span className="w-1.5 h-2.5 bg-primary-container rounded-xs"></span>
                          <span className="w-1.5 h-1.5 bg-outline-variant rounded-xs"></span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[6px] text-on-surface-variant font-code-sm">
                        <span>p.1</span>
                        <span>NEET</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                          Kriti_NEET_Comparative_Rigor_Report_v4.2.{selectedFormat}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-on-secondary-container bg-secondary-container/30 font-label-sm text-label-sm px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <StitchIcon name="verified" className="text-[12px]" size={12} /> 100% Vector Quality
                        </span>
                        <span className="text-on-surface-variant font-code-sm text-code-sm">
                          {selectedFormat === "pdf" ? "1.4 MB • 4 Pages" : "185 KB • CSV"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-space-md pt-space-sm bg-surface-container-low rounded-lg px-space-md py-2 flex items-center justify-between text-on-surface">
                  <div className="flex items-center gap-1.5">
                    <StitchIcon name="trending_down" className="text-[16px] text-secondary" size={16} />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Cognitive Drag:</span>
                    <span className="font-label-md text-label-md text-secondary">+11.8%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StitchIcon name="psychology" className="text-[16px] text-primary" size={16} />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Trap Gravity:</span>
                    <span className="font-label-md text-label-md text-primary">+5.4%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 1: Export Format Selection */}
            <section className="px-gutter mt-space-lg">
              <div className="flex items-center justify-between mb-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Export Format</h2>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Select Mode</span>
              </div>
              <div className="space-y-space-sm">
                {/* PDF */}
                <div
                  onClick={() => setSelectedFormat("pdf")}
                  className={`p-space-md rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedFormat === "pdf"
                      ? "bg-surface-container-lowest shadow-md ring-2 ring-primary"
                      : "bg-surface-container-lowest shadow-sm hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-space-md min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <StitchIcon name="picture_as_pdf" className="text-[22px]" size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline-sm text-headline-sm text-on-surface">Executive PDF Dossier</span>
                          <span className="font-label-sm text-label-sm bg-primary-fixed text-primary px-2 py-0.5 rounded-full">
                            Faculty &amp; Board Ready
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                          Print-friendly vector charts, student quartile distributions, pedagogical remediation protocols, and faculty sign-off seal.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        selectedFormat === "pdf"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-transparent"
                      }`}
                    >
                      <StitchIcon name="check" className="text-[16px]" size={16} />
                    </div>
                  </div>
                </div>

                {/* CSV */}
                <div
                  onClick={() => setSelectedFormat("csv")}
                  className={`p-space-md rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedFormat === "csv"
                      ? "bg-surface-container-lowest shadow-md ring-2 ring-primary"
                      : "bg-surface-container-lowest shadow-sm hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-space-md min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0 mt-0.5">
                        <StitchIcon name="dataset" className="text-[22px]" size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline-sm text-headline-sm text-on-surface">Raw Psychometric CSV</span>
                          <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                            Data Pipeline Ready
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                          Item-level response strings, distractor probability indices, Item Response Theory parameters, &amp; mistake vectors.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        selectedFormat === "csv"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-transparent"
                      }`}
                    >
                      <StitchIcon name="check" className="text-[16px]" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Rigor Sections & Inclusions */}
            <section className="px-gutter mt-space-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
                2. Report Inclusions
              </h2>
              <div className="space-y-2">
                {[
                  { id: "stems", label: "Question Stems & NCERT Provenance", desc: "Verbatim Class 11 Bio citations" },
                  { id: "di_curves", label: "Discrimination Index (DI) Curves", desc: "Quartile slices & Upper vs Lower separation" },
                  { id: "misdirection", label: "Faculty Peer Misdirection Matrix", desc: "Detailed distractor attraction scores" },
                  { id: "remediation", label: "Automated Student Remediation Scripts", desc: "Dr. Sharma 38s Audio links & Leitner sync" },
                ].map((inc) => {
                  const isChecked = selectedInclusions.includes(inc.id);
                  return (
                    <div
                      key={inc.id}
                      onClick={() => toggleInclusion(inc.id)}
                      className="bg-surface-container-lowest p-3 rounded-xl shadow-xs flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="font-headline-sm text-headline-sm text-on-surface">{inc.label}</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{inc.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          isChecked ? "bg-primary text-on-primary" : "border border-outline bg-transparent"
                        }`}
                      >
                        {isChecked && <StitchIcon name="check" className="text-[16px]" size={16} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="px-gutter pt-space-md flex items-center gap-space-sm">
              <Link
                href="/psychometrics/cognitive-audit"
                className="py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 py-3 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm text-center shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <StitchIcon name={isExporting ? "sync" : "download"} className="text-[20px]" size={20} />
                <span>{isExporting ? "Generating Dossier..." : "Export Rigor Report"}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
