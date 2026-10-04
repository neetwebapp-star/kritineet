"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/stitch/AppShell";
import { StitchIcon } from "@/components/stitch/StitchIcon";

interface MistakeItem {
  id: string;
  questionId: string;
  chapter?: string | { title?: string; subjectName?: string };
  subject?: string;
  box?: number;
  daysDue?: string;
  errorTag?: string;
  mistakeType?: string;
  stem?: string;
  questionText?: string;
  userSelected?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  correctOption?: string;
  explanation?: string;
  evidence?: string;
  ncertRef?: string;
  sourceBadge?: string;
  sourceType?: string;
  mistakeCount?: number;
  confidence?: string;
  isLearned?: boolean;
}

export default function ErrorBookPage() {
  const [items, setItems] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"vault" | "revision">("vault");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  const getChapterTitle = (item: MistakeItem): string => {
    if (!item.chapter) return item.subject || "General";
    if (typeof item.chapter === "string") return item.chapter;
    if (typeof item.chapter === "object" && item.chapter !== null) {
      return item.chapter.title || item.chapter.subjectName || item.subject || "General";
    }
    return "General";
  };

  const getQuestionStem = (item: MistakeItem): string => {
    return item.questionText || item.stem || "Question content unavailable";
  };

  const getUserAnswer = (item: MistakeItem): string => {
    return item.studentAnswer || item.userSelected || "Not selected";
  };

  const getCorrectAnswer = (item: MistakeItem): string => {
    return item.correctOption || item.correctAnswer || "See explanation";
  };

  const getErrorTag = (item: MistakeItem): string => {
    if (item.errorTag) return item.errorTag;
    if (item.mistakeType && item.mistakeType !== "UNKNOWN") {
      const formatted = item.mistakeType.replace(/_/g, " ").toLowerCase();
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    if (item.sourceBadge) return item.sourceBadge;
    return "Conceptual Trap";
  };

  const fetchItems = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "ALL") params.set("category", activeCategory);
    if (selectedSubject !== "ALL") params.set("subject", selectedSubject);

    fetch(`/api/student/mistakes?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setItems(json.items || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [activeCategory, selectedSubject]);

  const handleMarkLearned = async (questionId: string) => {
    try {
      await fetch("/api/student/mistakes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action: "MARK_LEARNED" }),
      });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  // Fallback cards if database is freshly seeded and has no logged mistakes yet
  const displayItems: MistakeItem[] =
    items.length > 0
      ? items
      : [
          {
            id: "m-01",
            questionId: "q-bot-01",
            chapter: "Ch. 2: Biological Classification",
            subject: "BOTANY",
            box: 1,
            daysDue: "Today",
            errorTag: "Conceptual Trap",
            stem: "Which of the following cellular characteristics distinguishes Archaebacteria from Eubacteria and confers resilience to extreme temperatures?",
            userSelected: "Peptidoglycan wall with sterol lipids",
            correctAnswer: "Branched chain lipids with ether linkages in membrane",
            explanation: "Archaebacteria have pseudomurein cell walls and ether-linked branched phytanyl lipids.",
            ncertRef: "NCERT Class 11 • Page 19",
          },
          {
            id: "m-02",
            questionId: "q-chem-02",
            chapter: "Ch. 4: Chemical Bonding & Molecular Structure",
            subject: "CHEMISTRY",
            box: 2,
            daysDue: "In 2 days",
            errorTag: "Calculation Slip",
            stem: "Calculate the formal charge on the central oxygen atom in the Ozone (O₃) resonance hybrid structure.",
            userSelected: "-1",
            correctAnswer: "+1",
            explanation: "Formal charge on central O = 6 - 2 - (6/2) = +1.",
            ncertRef: "NCERT Class 11 • Page 105",
          },
          {
            id: "m-03",
            questionId: "q-phy-03",
            chapter: "Ch. 3: Motion in a Straight Line",
            subject: "PHYSICS",
            box: 1,
            daysDue: "Today",
            errorTag: "Formula Confusion",
            stem: "A ball is thrown vertically upwards with velocity u. It passes three points A, B, C separated by equal distances h. Find the ratio of times taken.",
            userSelected: "1 : 2 : 3",
            correctAnswer: "(√3 - √2) : (√2 - 1) : 1",
            explanation: "Use kinematic relation v² - u² = 2as and step-by-step velocity substitution at equidistant segments.",
            ncertRef: "NCERT Class 11 • Page 48",
          },
          {
            id: "m-04",
            questionId: "q-bot-04",
            chapter: "Ch. 8: Cell - The Unit of Life",
            subject: "BOTANY",
            box: 3,
            daysDue: "In 4 days",
            errorTag: "Overconfidence",
            stem: "Which of the following cellular organelles possesses 70S ribosomes in eukaryotic plant cells?",
            userSelected: "Endoplasmic Reticulum & Cytosol",
            correctAnswer: "Chloroplasts & Mitochondria",
            explanation: "Semi-autonomous organelles contain 70S prokaryotic-like ribosomes, while cytoplasm contains 80S.",
            ncertRef: "NCERT Class 11 • Page 135",
          },
        ];

  return (
    <AppShell
      title="Mistake Notebook"
      subtitle="Zero-Mistake Remediation & Spaced Repetition"
      streakDays={7}
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/drills/rapid-drill"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3525cd] text-white hover:bg-[#2b1ea8] text-xs font-bold transition-all shadow-xs"
          >
            <StitchIcon name="bolt" size={14} />
            <span>Launch Rapid Drill</span>
          </Link>
          <button
            type="button"
            onClick={fetchItems}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#f1f3ff] transition-colors cursor-pointer"
            title="Refresh Mistakes"
          >
            <StitchIcon name="refresh" size={18} />
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Intro & Tab Switcher */}
        <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e1e8fd] text-[#3525cd] text-xs font-bold">
                <StitchIcon name="psychology" size={13} />
                Cognitive Retest Loop
              </span>
              <span className="inline-flex items-center gap-1 text-[#006c49] text-xs font-semibold">
                <StitchIcon name="verified" size={14} />
                Adaptive Leitner SRS Active
              </span>
            </div>
            <h1 className="font-headline font-bold text-xl text-[#141b2b] mt-1">
              Mistake Book &amp; Smart Revision
            </h1>
            <p className="text-xs text-[#777587]">
              Zero-mistake remediation loop with 4–5 day adaptive spaced repetition intervals.
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "vault"
                  ? "bg-white text-[#3525cd] shadow-xs"
                  : "text-[#464555] hover:text-[#141b2b]"
              }`}
            >
              <StitchIcon name="menu_book" size={16} />
              <span>Mistake Vault</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#e1e8fd] text-[#3525cd] text-[10px]">
                38
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("revision")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "revision"
                  ? "bg-white text-[#ba1a1a] shadow-xs"
                  : "text-[#464555] hover:text-[#141b2b]"
              }`}
            >
              <StitchIcon name="history_edu" size={16} />
              <span>Smart Revision</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#ffebee] text-[#ba1a1a] text-[10px]">
                14 Due
              </span>
            </button>
          </div>
        </div>

        {/* Top 3 KPI Stats + Priority Weakness Spotlight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* KPI Cards: 3 cards taking 6 cols on lg */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587]">
                  Unresolved
                </span>
                <StitchIcon name="warning" size={18} className="text-[#ba1a1a]" />
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-headline text-[#141b2b]">38</span>
                <span className="text-xs text-[#777587] block">Mistakes</span>
              </div>
              <span className="text-[11px] font-bold text-[#006c49] flex items-center gap-1">
                <StitchIcon name="trending_down" size={13} />
                -12 this week
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587]">
                  Due Today
                </span>
                <StitchIcon name="update" size={18} className="text-[#3525cd]" />
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-headline text-[#ba1a1a]">14</span>
                <span className="text-xs text-[#777587] block">Spaced Rep</span>
              </div>
              <span className="text-[11px] font-medium text-[#3525cd]">
                4–5d cycle
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587]">
                  Accuracy
                </span>
                <StitchIcon name="verified" size={18} className="text-[#006c49]" />
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-headline text-[#006c49]">89%</span>
                <span className="text-xs text-[#777587] block">Retest score</span>
              </div>
              <span className="text-[11px] text-[#777587]">
                Target 90%+
              </span>
            </div>
          </div>

          {/* Priority Weakness Spotlight: 6 cols on lg */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#f1f3ff] to-white rounded-2xl p-5 border border-[#d4defb] shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3525cd]">
                  HIGH PRIORITY REVISION TARGET
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffebee] text-[#ba1a1a] text-[10px] font-bold">
                  Critical
                </span>
              </div>
              <h2 className="text-base font-bold text-[#141b2b]">
                Botany (Monera &amp; Cell Structure)
              </h2>
              <p className="text-xs text-[#464555]">
                14 mistakes logged across your last 3 DPPs. Recommended for Socratic review.
              </p>
            </div>
            <Link
              href="/drills/rapid-drill"
              className="px-4 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all flex-shrink-0"
            >
              <StitchIcon name="bolt" size={15} />
              <span>Launch 10-Q Drill</span>
            </Link>
          </div>
        </div>

        {/* Filter Pills Ribbon */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777587]">
              Filter Questions
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("ALL");
                setSelectedSubject("ALL");
              }}
              className="text-xs font-bold text-[#3525cd] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          {/* Error Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "ALL", label: "All Mistake Types (38)" },
              { id: "CONCEPTUAL", label: "Conceptual Trap (18)", icon: "psychology" },
              { id: "CALCULATION", label: "Calculation Slip (8)", icon: "calculate" },
              { id: "OVERCONFIDENCE", label: "Overconfidence (6)", icon: "warning" },
              { id: "MISREAD", label: "Misread Question (6)", icon: "visibility_off" },
            ].map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#3525cd] text-white shadow-xs"
                      : "bg-[#f1f3ff] text-[#464555] hover:bg-[#e1e8fd]"
                  }`}
                >
                  {cat.icon && <StitchIcon name={cat.icon} size={14} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: "ALL", label: "All Subjects" },
              { id: "BOTANY", label: "Botany (16)" },
              { id: "CHEMISTRY", label: "Chemistry (12)" },
              { id: "PHYSICS", label: "Physics (10)" },
            ].map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#e1e8fd] text-[#3525cd] font-bold"
                      : "bg-[#f9f9ff] text-[#777587] hover:bg-[#f1f3ff]"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Responsive Mistake Cards Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayItems.map((item) => {
            const chapterTitle = getChapterTitle(item);
            const questionStem = getQuestionStem(item);
            const userAnswer = getUserAnswer(item);
            const correctAnswer = getCorrectAnswer(item);
            const errorTag = getErrorTag(item);
            const leitnerBox = item.box || (item.mistakeCount ? Math.max(1, 5 - item.mistakeCount) : 1);
            const dueText = item.daysDue || (item.isLearned ? "Mastered" : "Today");
            const explanation = item.explanation || item.evidence;
            const ncertReference = item.ncertRef || (item.sourceBadge ? `NCERT • ${item.sourceBadge}` : "NCERT Page Reference");

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs flex flex-col justify-between gap-4 hover:border-[#c3c0ff] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#141b2b] text-xs font-semibold">
                        {chapterTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#006c49] text-xs font-bold">
                        Leitner Box {leitnerBox}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#ba1a1a]">
                      Due: {dueText}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[#141b2b] leading-relaxed">
                    {questionStem}
                  </p>

                  {/* Incorrect vs Correct comparison box */}
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#ba1a1a] font-semibold">
                      <StitchIcon name="cancel" size={15} />
                      <span>Your Choice: {userAnswer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#006c49] font-bold">
                      <StitchIcon name="check_circle" size={15} />
                      <span>Correct Answer: {correctAnswer}</span>
                    </div>
                    {explanation && (
                      <p className="text-[#464555] pt-1 text-[11px] leading-relaxed border-t border-[#e9edff] mt-1">
                        {explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#777587]">
                    <span className="text-[#3525cd] font-semibold flex items-center gap-1">
                      <StitchIcon name="menu_book" size={14} />
                      {ncertReference}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-semibold">
                      {errorTag}
                    </span>
                  </div>
                </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-[#f1f3ff] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/ai-tutor"
                    className="px-3 py-1.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#3525cd] text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <StitchIcon name="smart_toy" size={14} />
                    <span>Ask AI</span>
                  </Link>
                  <Link
                    href="/mnemonics"
                    className="px-3 py-1.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#464555] text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <StitchIcon name="volume_up" size={14} />
                    <span>Mnemonic</span>
                  </Link>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMarkLearned(item.questionId)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#e9edff] hover:bg-[#6cf8bb]/20 text-[#006c49] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <StitchIcon name="check" size={14} />
                    <span>Mastered</span>
                  </button>
                  <Link
                    href="/drills/retest"
                    className="px-3 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                  >
                    <StitchIcon name="refresh" size={14} />
                    <span>Retest</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </AppShell>
  );
}
