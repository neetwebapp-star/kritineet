"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/stitch/AppShell";
import { StitchIcon } from "@/components/stitch/StitchIcon";

export default function AiTutorContextChatPage() {
  const [snippetOpen, setSnippetOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>("");

  return (
    <AppShell
      title="AI Context Chat"
      subtitle="Class 11 Bio • Ch 2 • Page 19"
      showBack={true}
      backHref="/ai-tutor"
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Voice Mode"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#e9edff] text-[#3525cd] hover:bg-[#f1f3ff] transition-colors cursor-pointer"
          >
            <StitchIcon name="record_voice_over" size={18} />
          </button>
          <Link
            href="/ncert/monera-archaebacteria"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e8fd] text-[#3525cd] hover:bg-[#d4defb] text-xs font-bold transition-all"
          >
            <StitchIcon name="menu_book" size={14} />
            <span>Open Reader</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto w-full space-y-5 pb-16">
        {/* Sticky Context Dock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e9edff] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-[#e1e8fd] flex items-center justify-center text-[#3525cd] shrink-0">
                <StitchIcon name="menu_book" size={18} />
              </span>
              <div>
                <h1 className="font-bold text-sm text-[#141b2b] truncate">
                  NCERT Class 11 Bio • Ch 2 Biological Classification • P.19
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
                  <span>Socratic Context Loaded &amp; Active</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSnippetOpen(!snippetOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e1e8fd] transition-colors text-[#3525cd] shrink-0 text-xs font-bold cursor-pointer"
            >
              <span>{snippetOpen ? "Hide Snippet" : "View Snippet"}</span>
              <StitchIcon name={snippetOpen ? "expand_less" : "open_in_new"} size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6cf8bb]/30 text-[#006c49] font-bold shrink-0">
              <StitchIcon name="verified" size={13} />
              High Yield (5-8 Qs)
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#f1f3ff] text-[#464555] font-medium shrink-0">
              Monera Core
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffebee] text-[#ba1a1a] font-bold shrink-0">
              <StitchIcon name="warning" size={13} />
              Trap: Ether vs Ester
            </span>
          </div>

          {/* Collapsible NCERT Snippet Drawer */}
          {snippetOpen && (
            <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587]">
                  NCERT Line 14-22 Extract
                </span>
                <button
                  type="button"
                  onClick={() => setSnippetOpen(false)}
                  className="text-[#777587] hover:text-[#141b2b] text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <p className="text-xs text-[#464555] italic leading-relaxed">
                “These bacteria are special since they live in some of the most harsh habitats such as extreme salty areas (halophiles), hot springs (thermoacidophiles) and marshy areas (methanogens). Archaebacteria differ from other bacteria in having a different cell wall structure and this feature is responsible for their survival in extreme conditions...”
              </p>
            </div>
          )}
        </div>

        {/* Quick Prompts Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587]">
            Suggested Concept Queries
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { text: "Why branched ether lipids survive extreme heat?", icon: "thermostat" },
              { text: "Pseudomurein vs Peptidoglycan distinction", icon: "difference" },
              { text: "Woese 3-Domain system justification", icon: "schema" },
              { text: "Solve NEET 2020 Halophile Q", icon: "quiz" },
            ].map((chip) => (
              <button
                key={chip.text}
                type="button"
                onClick={() => setInputVal(chip.text)}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e9edff] hover:bg-[#e1e8fd] shadow-xs active:scale-95 transition-all shrink-0 text-left cursor-pointer"
              >
                <StitchIcon name={chip.icon} size={15} className="text-[#3525cd]" />
                <span className="text-xs font-semibold text-[#141b2b] group-hover:text-[#3525cd] whitespace-nowrap">
                  {chip.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Socratic Chat Stream */}
        <div className="space-y-4">
          {/* AI Welcome Message */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <StitchIcon name="smart_toy" size={20} />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-xs text-[#141b2b]">Kriti AI Tutor</span>
                <span className="text-[11px] text-[#777587]">Just now</span>
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-[#e9edff] shadow-xs space-y-2.5 text-[#141b2b]">
                <p className="text-sm leading-relaxed">
                  Hello Kriti! I see you are exploring{" "}
                  <strong className="text-[#3525cd]">NCERT Page 19 (Kingdom Monera: Archaebacteria)</strong>.
                </p>
                <div className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex items-center gap-2">
                  <StitchIcon name="verified_user" size={18} className="text-[#3525cd] shrink-0" />
                  <p className="text-xs text-[#464555]">
                    Loaded: <strong>Line-by-line statements</strong>, <strong>8 Past NEET PYQs</strong>, and{" "}
                    <strong>NTA distractor traps</strong> for P.19.
                  </p>
                </div>
                <p className="text-sm text-[#141b2b]">
                  What would you like to clarify or test yourself on first?
                </p>
              </div>
            </div>
          </div>

          {/* Student Query Bubble */}
          <div className="flex flex-col items-end pl-8">
            <div className="bg-[#3525cd] text-white rounded-2xl rounded-tr-xs p-4 shadow-xs max-w-[85%]">
              <p className="text-sm leading-relaxed">
                Why does Archaebacteria membrane lipid branching increase thermostability compared to straight-chain bacterial fatty acids?
              </p>
            </div>
            <div className="flex items-center gap-1 mt-1 pr-1 text-[11px] text-[#777587]">
              <span>11:45 AM</span>
              <StitchIcon name="done_all" size={13} className="text-[#006c49]" />
            </div>
          </div>

          {/* AI Response Bubble */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <StitchIcon name="neurology" size={20} />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-xs text-[#141b2b]">Kriti AI Tutor</span>
                <span className="text-[11px] text-[#777587]">11:45 AM</span>
              </div>
              <div className="bg-white p-5 rounded-2xl rounded-tl-xs border border-[#e9edff] shadow-xs space-y-4 text-[#141b2b]">
                <div className="flex items-center justify-between pb-1 border-b border-[#f1f3ff]">
                  <span className="text-xs font-bold text-[#3525cd] flex items-center gap-1">
                    <span>🔬</span> Molecular Biophysics Insight
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/40 text-[#006c49] text-[11px] font-bold">
                    NEET 2017 Ref
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[#464555]">
                  In Eubacteria, straight hydrocarbon chains are joined via <strong>ester bonds</strong>. High temperature makes straight chains excessively fluid and leaky.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-xs font-bold text-[#3525cd] block mb-1">ARCHAEA (Branched Ether)</span>
                    <p className="text-xs text-[#464555] leading-relaxed">
                      Phytanyl chains contain methyl branches that prevent thermal crystallization and membrane peeling. In thermophiles, they form covalent <strong>tetraether monolayers</strong> that never melt even at 100°C.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-xs font-bold text-[#141b2b] block mb-1">BACTERIA (Unbranched Ester)</span>
                    <p className="text-xs text-[#464555] leading-relaxed">
                      Ester bonds hydrolyze under low pH and extreme heat. Fatty acid bilayers lose proton-motive force above 70°C.
                    </p>
                  </div>
                </div>

                {/* NTA Trap Alert */}
                <div className="p-3.5 rounded-xl bg-[#fff8e1] border border-[#ffe082] flex items-start gap-2.5">
                  <StitchIcon name="warning" size={18} className="text-[#b78103] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#b78103]">
                      NTA Assertion-Reason Trap
                    </span>
                    <p className="text-xs text-[#464555] leading-relaxed">
                      If an exam question states: <em>“Assertion: Archaebacteria survive harsh habitats due to peptidoglycan cell walls”</em> — mark it <strong>FALSE</strong> immediately. They contain <strong>pseudomurein</strong> or complex protein lattices, never true peptidoglycan.
                    </p>
                  </div>
                </div>

                {/* Inline Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-[#f1f3ff]">
                  <Link
                    href="/ai-tutor/diagnostic"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1ea8] active:scale-95 transition-all shadow-xs"
                  >
                    <StitchIcon name="quiz" size={15} />
                    <span>Test My Concept (1 MCQ)</span>
                  </Link>
                  <Link
                    href="/ncert/monera-archaebacteria"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f1f3ff] text-[#141b2b] text-xs font-bold hover:bg-[#e1e8fd] transition-colors"
                  >
                    <StitchIcon name="menu_book" size={15} className="text-[#3525cd]" />
                    <span>Return to NCERT</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-white rounded-2xl p-3 border border-[#e9edff] shadow-xs">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything about P.19 Monera..."
              className="flex-1 px-4 py-2.5 bg-[#f9f9ff] text-sm text-[#141b2b] rounded-xl border border-[#e9edff] focus:outline-none focus:border-[#3525cd]"
            />
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center hover:bg-[#2b1ea8] transition-colors cursor-pointer shrink-0"
              aria-label="Send query"
            >
              <StitchIcon name="send" size={18} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
