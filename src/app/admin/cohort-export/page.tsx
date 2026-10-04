"use client";

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminCohortExportPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState<boolean>(false);

  const sampleRows = [
    {
      id: "#NEET-26-8842",
      name: "Aarav Sharma",
      center: "Kota South",
      baseline: 574,
      trap: "AR Q01 + Multi Q05",
      listen: "50s (100%)",
      wa: "No (In-App)",
      drill: "3/3 (100%)",
      status: "Remediated (+5m)",
      statusType: "success",
    },
    {
      id: "#NEET-26-4190",
      name: "Ananya Iyer",
      center: "Chennai Central",
      baseline: 668,
      trap: "AR Q01 Trap B",
      listen: "50s (100%)",
      wa: "No (In-App)",
      drill: "3/3 (100%)",
      status: "Remediated (+5m)",
      statusType: "success",
    },
    {
      id: "#NEET-26-6731",
      name: "Devendra Patel",
      center: "Ahmedabad East",
      baseline: 442,
      trap: "AR Q01 + Multi Q05",
      listen: "50s (100%)",
      wa: "Yes (T+06m)",
      drill: "2/3 (66%)",
      status: "Remediated (+3m)",
      statusType: "success",
    },
    {
      id: "#NEET-26-3094",
      name: "Pooja Deshmukh",
      center: "Pune Kothrud",
      baseline: 538,
      trap: "Multi Q05 Trap A",
      listen: "50s (2 Replays)",
      wa: "No (In-App)",
      drill: "3/3 (100%)",
      status: "Remediated (+5m)",
      statusType: "success",
    },
    {
      id: "#NEET-26-9125",
      name: "Rohan Mukherjee",
      center: "Kolkata Salt Lake",
      baseline: 489,
      trap: "AR Q01 Trap B",
      listen: "18s (Drop-off)",
      wa: "Yes (T+08m)",
      drill: "1/3 (33%)",
      status: "Faculty Sync Flagged",
      statusType: "error",
    },
    {
      id: "#NEET-26-5541",
      name: "Rhea Sen",
      center: "Kolkata",
      baseline: 582,
      trap: "AR Q01 Trap B",
      listen: "50s (100%)",
      wa: "Yes (T+05m)",
      drill: "3/3 (100%)",
      status: "Remediated (+5m)",
      statusType: "success",
    },
    {
      id: "#NEET-26-7720",
      name: "Shreya Gupta",
      center: "Jaipur",
      baseline: 512,
      trap: "AR Q01 + Multi Q05",
      listen: "50s (100%)",
      wa: "Yes (T+07m)",
      drill: "3/3 (100%)",
      status: "Remediated (+5m)",
      statusType: "success",
    },
  ];

  const filteredRows = sampleRows.filter((row) => {
    const matchSearch =
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.center.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.trap.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === "remediated") return row.status.includes("Remediated");
    if (activeFilter === "dual") return row.trap.includes("AR Q01 + Multi");
    if (activeFilter === "wa") return row.wa.includes("Yes");
    if (activeFilter === "unresolved") return row.statusType === "error";
    return true;
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    }, 1200);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative bg-surface shadow-xs">
        {/* Header */}
        <header className="sticky top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <button
                aria-label="Go Back"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => router.back()}
                type="button"
              >
                <StitchIcon name="arrow_back" className="text-[22px]" size={22} />
              </button>
            </div>
            <div className="flex-1 min-w-0 px-space-xs text-center">
              <h1 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                Cohort Telemetry CSV Export
              </h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Rankers Elite B8 • 620 Rows Raw Dataset
              </p>
            </div>
            <div className="flex items-center gap-space-xs justify-end">
              <Image
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                src="/stitch/avatar.png"
                width={32}
                height={32}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col relative w-full pt-2 pb-36 bg-surface min-h-screen">
          {/* System Status Banner */}
          <div className="px-margin pt-space-md">
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-xs border border-outline-variant/30">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between gap-space-sm flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    <span className="font-label-sm text-label-sm tracking-wide uppercase">
                      DATASET READY FOR EXPORT • 620 RECORDS
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant font-code-sm text-code-sm">
                    <StitchIcon name="verified" className="text-[15px] text-secondary" size={15} />
                    <span>SHA-256 Verified</span>
                  </div>
                </div>
                <div className="mt-1 flex flex-col gap-0.5">
                  <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Botany CBT Test #4C (AR Q01 &amp; Multi Q05)
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Cohort: <span className="text-on-surface font-label-md font-semibold">Rankers Elite B8</span> • Payload Size:{" "}
                    <span className="text-on-surface font-label-md font-semibold">184 KB</span> • Schema v2.4
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top KPI Summary Cards (2x2 Grid) */}
          <div className="px-margin pt-space-md">
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col justify-between border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Export Volume
                  </span>
                  <StitchIcon name="table_rows" className="text-primary text-[18px]" size={18} />
                </div>
                <div className="mt-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    620 <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Rows</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">100% Cohort (16 fields/row)</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col justify-between border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Payload Format
                  </span>
                  <StitchIcon name="description" className="text-primary-container text-[18px]" size={18} />
                </div>
                <div className="mt-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface truncate font-bold">CSV / UTF-8</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">RFC-4180 Compliant</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col justify-between border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Resolution
                  </span>
                  <StitchIcon name="check_circle" className="text-secondary text-[18px]" size={18} />
                </div>
                <div className="mt-2">
                  <div className="font-headline-lg text-headline-lg text-secondary font-bold">96.5%</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">598 / 620 Remediated</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col justify-between border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Net Marks Recov.
                  </span>
                  <StitchIcon name="trending_up" className="text-primary text-[18px]" size={18} />
                </div>
                <div className="mt-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-bold">+3,840</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">+6.2 avg per student</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schema Inspector Accordion */}
          <div className="px-margin pt-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-outline-variant/30">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsSchemaOpen(!isSchemaOpen)}
              >
                <div className="flex items-center gap-space-xs">
                  <StitchIcon name="schema" className="text-primary text-[20px]" size={20} />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Data Schema Inspector
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
                    16 Columns
                  </span>
                </div>
                <StitchIcon name="expand_more" className={`text-on-surface-variant text-[20px] transition-transform duration-200 ${ isSchemaOpen ? 'rotate-180' : '' }`} size={20} />
              </div>
              {isSchemaOpen && (
                <div className="pt-space-sm flex flex-wrap gap-1.5 transition-all duration-300">
                  {[
                    "std_id",
                    "roll_no",
                    "name",
                    "test_center",
                    "baseline_score",
                    "air_est",
                    "flagged_trap",
                    "initial_listen_s",
                    "replay_count",
                    "wa_escalated",
                    "drill_submitted",
                    "drill_score_pct",
                    "post_retrial_status",
                    "net_drag_delta",
                    "timestamp_iso",
                    "lms_sync_id",
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-1 rounded bg-surface-container-high text-on-surface font-code-sm text-code-sm font-medium"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search & Segment Controls */}
          <div className="px-margin pt-space-md flex flex-col gap-space-sm">
            <div className="relative w-full">
              <StitchIcon name="search" className="absolute left-3 top-2.5 text-on-surface-variant text-[20px]" size={20} />
              <input
                className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant shadow-xs border border-outline-variant/30 focus:outline-none focus:bg-surface-container-low transition-colors"
                placeholder="Search Roll No, Student Name, Center, or Trap Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
              />
              {searchTerm && (
                <button
                  aria-label="Clear Search"
                  className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  onClick={() => setSearchTerm("")}
                  type="button"
                >
                  <StitchIcon name="cancel" className="text-[18px]" size={18} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "all", label: "All Rows (620)" },
                { id: "remediated", label: "Remediated (598)" },
                { id: "dual", label: "Dual Trap (142)" },
                { id: "wa", label: "WhatsApp Escalated (108)" },
                { id: "unresolved", label: "Unresolved (22)" },
              ].map((f) => (
                <button
                  key={f.id}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === f.id
                      ? "bg-primary text-on-primary shadow-xs font-semibold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                  onClick={() => setActiveFilter(f.id)}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Raw CSV Data Table Card */}
          <div className="px-margin pt-space-sm">
            <div className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden border border-outline-variant/30">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Roll / ID</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Student Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Center</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Baseline</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Initial Trap</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Audio Listen</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">WA Escal.</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Drill</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm">
                    {filteredRows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-surface-container-high transition-colors ${
                          i % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low/50"
                        }`}
                      >
                        <td className="py-3 px-3 font-code-sm text-code-sm text-primary font-medium whitespace-nowrap">
                          {row.id}
                        </td>
                        <td className="py-3 px-3 font-medium text-on-surface whitespace-nowrap">{row.name}</td>
                        <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">{row.center}</td>
                        <td className="py-3 px-3 font-code-sm text-code-sm text-on-surface whitespace-nowrap">
                          {row.baseline}
                        </td>
                        <td className="py-3 px-3 text-on-surface whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm">
                            {row.trap}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-code-sm text-code-sm text-on-surface whitespace-nowrap">
                          {row.listen}
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">{row.wa}</td>
                        <td className="py-3 px-3 font-code-sm text-code-sm text-secondary font-medium whitespace-nowrap">
                          {row.drill}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                              row.statusType === "success"
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-error-container text-on-error-container"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-gutter py-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
          <div className="flex items-center gap-space-sm max-w-2xl mx-auto">
            <button
              className={`flex-1 h-12 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer ${
                exported
                  ? "bg-secondary text-on-secondary"
                  : "bg-primary text-on-primary hover:bg-primary/90"
              }`}
              onClick={handleExport}
              disabled={isExporting}
              type="button"
            >
              {isExporting ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Generating CSV Dataset...</span>
                </>
              ) : exported ? (
                <>
                  <StitchIcon name="check_circle" className="text-[20px]" size={20} />
                  <span>Downloaded 620 Rows!</span>
                </>
              ) : (
                <>
                  <StitchIcon name="download" className="text-[20px]" size={20} />
                  <span>Download Complete CSV (184 KB)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
