"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/stitch/AppShell";
import { StitchIcon } from "@/components/stitch/StitchIcon";

export default function AiTutorDiagnosticAnsweredPage() {
  const [selectedOption, setSelectedOption] = useState<number>(1);

  return (
    <AppShell
      title="AI Diagnostic Drill"
      subtitle="Recall & Concept Verification"
      showBack={true}
      backHref="/ai-tutor"
      rightAction={
        <Link
          href="/ncert/monera-archaebacteria"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e8fd] text-[#3525cd] hover:bg-[#d4defb] text-xs font-bold transition-all"
        >
          <StitchIcon name="menu_book" size={14} />
          <span>NCERT Reader</span>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto w-full space-y-6 pb-16">
        {/* Top Diagnostic Confirmation Banner */}
        <div className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
              <StitchIcon name="verified" size={22} />
            </div>
            <div>
              <h1 className="font-bold text-base text-[#141b2b]">Diagnostic Drill Verified</h1>
              <span className="text-xs font-bold text-[#006c49]">+4 Marks Recovered • Accuracy 100%</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#e1e8fd] text-[#3525cd] text-xs font-bold">
            NCERT Line 14-22
          </span>
        </div>

        {/* Answered MCQ Interactive Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#e9edff] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider flex items-center gap-1.5">
              <StitchIcon name="quiz" size={15} />
              NEET Diagnostic Drill Question
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#006c49] font-bold">
              +4 Marks Awarded
            </span>
          </div>

          <p className="text-sm font-medium text-[#141b2b] leading-relaxed">
            Which biochemical structural characteristic of Archaebacteria is primarily responsible for their extreme thermostability and acid resistance?
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {[
              { id: 0, text: "A. Presence of true peptidoglycan with β-1,4 glycosidic bonds", correct: false },
              { id: 1, text: "B. Branched ether-linked lipids forming monolayer membranes", correct: true },
              { id: 2, text: "C. Unbranched ester-linked fatty acids with high cholesterol", correct: false },
              { id: 3, text: "D. Thick cellulose sheath around the cell envelope", correct: false },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  opt.correct
                    ? "bg-[#e8f5e9] border-[#a5d6a7] text-[#1b5e20]"
                    : selectedOption === opt.id
                    ? "bg-[#ffebee] border-[#ef9a9a] text-[#b71c1c]"
                    : "bg-[#f9f9ff] border-[#e9edff] text-[#464555]"
                }`}
              >
                <span className="text-xs font-medium">{opt.text}</span>
                {opt.correct && (
                  <span className="flex items-center gap-1 text-xs font-bold text-[#006c49]">
                    <StitchIcon name="check_circle" size={16} />
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Solution Explanation Callout */}
          <div className="p-4 rounded-xl bg-[#f1f3ff] border border-[#d4defb] text-xs text-[#464555] space-y-1.5">
            <span className="font-bold text-[#3525cd] flex items-center gap-1">
              <StitchIcon name="lightbulb" size={15} />
              NCERT Rationalized Analysis:
            </span>
            <p className="leading-relaxed">
              Archaebacteria membrane lipids contain <strong>branched hydrocarbon chains linked to glycerol by ether bonds</strong> instead of ester bonds. In extreme thermophiles, these form continuous monolayers that resist thermal peeling and extreme acid hydrolysis.
            </p>
          </div>
        </div>

        {/* AI Tutor Feedback Bubble */}
        <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
            <StitchIcon name="psychology" size={22} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#141b2b]">Kriti AI Feedback</span>
              <span className="text-xs font-bold text-[#006c49]">Recall Confirmed (92%)</span>
            </div>
            <p className="text-sm text-[#464555] leading-relaxed">
              Superb grasp, Kriti! 🎯 You nailed the exact biochemical distinction that NTA repeatedly tests. Your active recall score for Page 19 is now <strong className="text-[#006c49]">92%</strong>.
            </p>
          </div>
        </div>

        {/* Quick Next Action Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/drills/pyq-drill"
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#e9edff] hover:bg-[#e1e8fd] shadow-xs transition-all group"
          >
            <div>
              <span className="block text-xs font-bold text-[#141b2b] group-hover:text-[#3525cd]">
                ⚡ NEET 2017 PYQ
              </span>
              <span className="text-[11px] text-[#777587]">Assertion-Reasoning</span>
            </div>
            <StitchIcon name="arrow_forward" size={18} className="text-[#777587] group-hover:text-[#3525cd]" />
          </Link>

          <Link
            href="/mnemonics"
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#e9edff] hover:bg-[#e1e8fd] shadow-xs transition-all group"
          >
            <div>
              <span className="block text-xs font-bold text-[#141b2b] group-hover:text-[#3525cd]">
                🎧 38s Audio Note
              </span>
              <span className="text-[11px] text-[#777587]">Archaea vs Bacteria</span>
            </div>
            <StitchIcon name="volume_up" size={18} className="text-[#777587] group-hover:text-[#3525cd]" />
          </Link>

          <Link
            href="/ncert/monera-archaebacteria"
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#e9edff] hover:bg-[#6cf8bb]/20 shadow-xs transition-all group"
          >
            <div>
              <span className="block text-xs font-bold text-[#141b2b] group-hover:text-[#006c49]">
                📖 Back to NCERT
              </span>
              <span className="text-[11px] text-[#777587]">Page 19 Reader</span>
            </div>
            <StitchIcon name="menu_book" size={18} className="text-[#777587] group-hover:text-[#006c49]" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
