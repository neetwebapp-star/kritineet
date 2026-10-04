'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function AdminHubPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'generator' | 'ocr'>('overview');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Physics',
    'Chemistry',
    'Botany',
    'Zoology',
  ]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('NEET Actual');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generated, setGenerated] = useState<boolean>(false);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 2500);
    }, 1200);
  };

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="Super Admin & Content Hub"
      showBack={true}
      backHref="/"
      fluid={true}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Context Banner */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e9edff] shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3525cd] text-xs font-bold">
              <StitchIcon name="shield_person" size={16} />
              <span>Super Admin • Content &amp; System Control</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6cf8bb]/30 text-[#00714d] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
              <span>Sync Live (Auto)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] tracking-tight">
                Admin &amp; Content Hub
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] mt-1">
                System overview, rationalized NCERT library, automated OCR question extraction &amp; health diagnostics.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f1f3ff] text-[#141b2b] text-xs border border-[#e1e8fd] self-start sm:self-auto">
              <StitchIcon name="dns" size={16} className="text-[#3525cd]" />
              <span>
                Target: <strong className="font-semibold text-[#3525cd]">Production • NEET UG 2027 Engine</strong>
              </span>
              <span className="font-mono text-[#777587] ml-1">v4.8.2-rt</span>
            </div>
          </div>

          {/* Segment Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#f1f3ff]">
            {[
              { id: 'overview', label: 'Overview', icon: 'grid_view' },
              { id: 'content', label: 'Content Library', icon: 'menu_book' },
              { id: 'generator', label: 'Question Bank', icon: 'psychology' },
              { id: 'ocr', label: 'Import & OCR', icon: 'document_scanner' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-headline font-semibold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#4f46e5] text-white shadow-sm'
                      : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e1e8fd] hover:text-[#141b2b]'
                  }`}
                >
                  <StitchIcon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 1: OPERATIONS KPI METRICS (4 Columns on Desktop) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#141b2b] flex items-center gap-2">
              <StitchIcon name="analytics" size={19} className="text-[#3525cd]" />
              <span>Platform Operations</span>
            </h2>
            <span className="text-xs text-[#777587]">Live updates • Every 15s</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#464555]">Total Questions</span>
                <div className="p-1.5 rounded-lg bg-[#e1e8fd] text-[#3525cd]">
                  <StitchIcon name="quiz" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-bold text-2xl sm:text-3xl text-[#141b2b] tracking-tight">
                  12,548
                </span>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#6cf8bb]/30 text-[#00714d] text-xs font-semibold">
                  <StitchIcon name="trending_up" size={13} />
                  <span>+340 this week</span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#464555]">Verified &amp; Audited</span>
                <div className="p-1.5 rounded-lg bg-[#6cf8bb]/30 text-[#00714d]">
                  <StitchIcon name="verified" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-bold text-2xl sm:text-3xl text-[#141b2b] tracking-tight">
                  10,092
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="w-full bg-[#f1f3ff] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#006c49] h-full rounded-full" style={{ width: '80.4%' }} />
                  </div>
                  <span className="text-xs text-[#006c49] font-bold">80.4%</span>
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#464555]">Pending QA</span>
                <div className="p-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a]">
                  <StitchIcon name="assignment" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-bold text-2xl sm:text-3xl text-[#141b2b] tracking-tight">
                  1,120
                </span>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
                  <StitchIcon name="warning" size={13} />
                  <span>Needs Review</span>
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#464555]">Live Test Papers</span>
                <div className="p-1.5 rounded-lg bg-[#e2dfff] text-[#3525cd]">
                  <StitchIcon name="filetext" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-headline font-bold text-2xl sm:text-3xl text-[#141b2b] tracking-tight">
                  148
                </span>
                <span className="text-xs text-[#777587] block mt-1.5">
                  Full Mocks &amp; DPPs Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Activity Chart & Content Library (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Content Ingestion Activity Chart */}
            <section className="p-5 sm:p-6 rounded-2xl bg-white shadow-xs border border-[#e9edff] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Content Upload Activity
                  </h3>
                  <p className="text-xs text-[#464555]">Weekly ingestion throughput (Mon–Sun)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#f1f3ff] text-[#3525cd] text-xs font-bold">
                  +18.4%
                </span>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <div className="h-24 w-full relative">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 80">
                    <defs>
                      <linearGradient id="adminChartGrad2" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,60 Q 25,48 53,52 T 106,35 T 160,42 T 213,20 T 266,28 T 320,10 L 320,80 L 0,80 Z"
                      fill="url(#adminChartGrad2)"
                    />
                    <path
                      d="M 0,60 Q 25,48 53,52 T 106,35 T 160,42 T 213,20 T 266,28 T 320,10"
                      fill="none"
                      stroke="#4f46e5"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />
                    <circle cx="106" cy="35" fill="#4f46e5" r="4" />
                    <circle cx="213" cy="20" fill="#4f46e5" r="4" />
                    <circle cx="320" cy="10" fill="#3525cd" r="5" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex justify-between items-center px-1 text-[#777587] text-xs">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span className="text-[#3525cd] font-bold">Sun</span>
                </div>
              </div>
            </section>

            {/* Rationalized NCERT Content Library */}
            <section className="p-5 sm:p-6 rounded-2xl bg-white shadow-xs border border-[#e9edff] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b] flex items-center gap-2">
                    <StitchIcon name="folder_special" size={18} className="text-[#3525cd]" />
                    <span>NCERT Rationalized Library</span>
                  </h3>
                  <p className="text-xs text-[#464555]">
                    Class 11 &amp; 12 synchronized with latest NMC guidelines
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-[#f1f3ff] text-[#464555]"
                  type="button"
                  title="Filter Library"
                >
                  <StitchIcon name="filter_list" size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Physics */}
                <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
                        <StitchIcon name="blur_on" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-sm text-[#141b2b]">NCERT Physics</span>
                        <span className="text-xs text-[#464555]">Class 11 &amp; 12 • 29 Chapters</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#00714d] text-xs font-bold">
                      100% Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e9edff]/60">
                    <span className="text-[#3525cd] font-semibold">4,120 Questions active</span>
                    <Link href="/ncert" className="text-[#3525cd] font-bold flex items-center gap-1 hover:underline">
                      Manage
                      <StitchIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                </div>

                {/* Chemistry */}
                <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
                        <StitchIcon name="science" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-sm text-[#141b2b]">NCERT Chemistry</span>
                        <span className="text-xs text-[#464555]">Class 11 &amp; 12 • 20 Chapters</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#00714d] text-xs font-bold">
                      100% Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e9edff]/60">
                    <span className="text-[#3525cd] font-semibold">3,850 Questions active</span>
                    <Link href="/ncert" className="text-[#3525cd] font-bold flex items-center gap-1 hover:underline">
                      Manage
                      <StitchIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                </div>

                {/* Biology */}
                <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6cf8bb]/30 flex items-center justify-center text-[#006c49]">
                        <StitchIcon name="eco" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-sm text-[#141b2b]">NCERT Biology</span>
                        <span className="text-xs text-[#464555]">Botany &amp; Zoology • 38 Chapters</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#00714d] text-xs font-bold">
                      100% Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e9edff]/60">
                    <span className="text-[#006c49] font-semibold">4,578 Questions active</span>
                    <Link href="/ncert/monera-archaebacteria" className="text-[#3525cd] font-bold flex items-center gap-1 hover:underline">
                      Manage
                      <StitchIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/admin/ocr"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4f46e5] text-white text-xs font-headline font-semibold shadow-xs hover:bg-[#4338ca] transition-all"
                >
                  <StitchIcon name="upload_file" size={16} />
                  <span>+ Upload PDF</span>
                </Link>
                <Link
                  href="/admin/taxonomy"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-[#141b2b] text-xs font-headline font-semibold shadow-xs border border-[#e9edff] hover:bg-[#f1f3ff] transition-all"
                >
                  <StitchIcon name="edit_note" size={16} />
                  <span>Bulk Edit Meta</span>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Question Bank Generator & Smart OCR Pipeline (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Test Paper Assembly Generator */}
            <section className="p-5 sm:p-6 rounded-2xl bg-white shadow-xs border border-[#e9edff] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                    <StitchIcon name="bolt" size={18} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-base text-[#141b2b]">
                      Test Paper Assembly
                    </h3>
                    <p className="text-xs text-[#464555]">
                      Instant algorithm-backed question generation
                    </p>
                  </div>
                </div>
                <div className="p-1 rounded-full bg-[#f1f3ff] text-[#464555]">
                  <StitchIcon name="tune" size={16} />
                </div>
              </div>

              {/* Subject selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141b2b]">Included Subjects</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Physics', 'Chemistry', 'Botany', 'Zoology'].map((sub) => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`p-2.5 rounded-xl text-xs font-headline font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e2dfff] text-[#3525cd] border border-[#c3c0ff]'
                            : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <StitchIcon
                            name={isSelected ? 'check_circle' : 'radio_button_unchecked'}
                            size={14}
                            className={isSelected ? 'text-[#3525cd]' : 'text-[#777587]' } />
                          {sub}
                        </span>
                        <span className="text-[10px] opacity-75">45 Qs</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Blueprint select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141b2b]">Test Blueprint Structure</label>
                <div className="relative w-full">
                  <select className="w-full h-10 px-3 pr-8 rounded-xl bg-[#f1f3ff] text-[#141b2b] text-xs font-medium appearance-none focus:outline-none border border-[#e1e8fd]">
                    <option>Full Syllabus Mock (180 Qs / 720 Marks)</option>
                    <option>High-Yield Chapterwise DPP (45 Qs / 180 Marks)</option>
                    <option>Unit Cumulative Revision Mock (90 Qs / 360 Marks)</option>
                    <option>NEET 2024 Retest Pattern (200 Qs with Optional)</option>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-[#777587]">
                    <StitchIcon name="expand_more" size={16} />
                  </div>
                </div>
              </div>

              {/* Difficulty spectrum */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#141b2b]">Complexity Spectrum</span>
                  <span className="text-[#3525cd] font-bold">{selectedDifficulty}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#f1f3ff] border border-[#e1e8fd]">
                  {['Easy', 'Moderate', 'NEET Actual', 'Challenger'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedDifficulty(lvl)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-headline font-semibold text-center transition-all cursor-pointer ${
                        selectedDifficulty === lvl
                          ? 'bg-white text-[#3525cd] shadow-xs'
                          : 'text-[#464555] hover:text-[#141b2b]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-[#4f46e5] text-white font-headline font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#4338ca] active:scale-[0.98] transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <StitchIcon name="refresh" size={18} className="animate-spin" />
                    <span>Assembling Mock Paper...</span>
                  </>
                ) : generated ? (
                  <>
                    <StitchIcon name="check" size={18} />
                    <span>Test Paper Generated!</span>
                  </>
                ) : (
                  <>
                    <StitchIcon name="auto_awesome" size={18} />
                    <span>Generate Test Paper</span>
                  </>
                )}
              </button>
            </section>

            {/* Smart OCR Pipeline */}
            <section className="p-5 sm:p-6 rounded-2xl bg-white shadow-xs border border-[#e9edff] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b] flex items-center gap-2">
                    <StitchIcon name="document_scanner" size={18} className="text-[#3525cd]" />
                    <span>Smart OCR Ingestion</span>
                  </h3>
                  <p className="text-xs text-[#464555]">Automated diagram extraction &amp; LaTeX mapping</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#3525cd] font-mono text-[11px] font-bold">
                  OCR v3.4
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="description" size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline font-bold text-xs text-[#141b2b] truncate">
                      Allen_AITS_Major_08_PCB.pdf
                    </span>
                    <span className="text-[11px] text-[#777587]">
                      48 Pages • 18.2 MB • Scanned 300 DPI
                    </span>
                  </div>
                </div>
                <StitchIcon name="task_alt" size={18} className="text-[#006c49] flex-shrink-0" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#141b2b]">
                  <span className="flex items-center gap-2">
                    <StitchIcon name="check_circle" size={15} className="text-[#006c49]" />
                    <span>Extract text, equations &amp; diagrams</span>
                  </span>
                  <span className="font-mono text-[#006c49] font-bold">100%</span>
                </div>
                <div className="flex items-center justify-between text-[#141b2b]">
                  <span className="flex items-center gap-2">
                    <StitchIcon name="check_circle" size={15} className="text-[#006c49]" />
                    <span>Detect question markers &amp; 4-option stems</span>
                  </span>
                  <span className="font-mono text-[#006c49] font-bold">100%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[#141b2b]">
                    <span className="flex items-center gap-2">
                      <StitchIcon name="refresh" size={15} className="text-[#3525cd] animate-spin" />
                      <span>Mapping NCERT page references</span>
                    </span>
                    <span className="font-mono text-[#3525cd] font-bold">85%</span>
                  </div>
                  <div className="w-full bg-[#e1e8fd] rounded-full h-1.5 overflow-hidden ml-6 max-w-[calc(100%-24px)]">
                    <div className="bg-[#3525cd] h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>

              <Link
                href="/admin/ocr"
                className="w-full py-2.5 px-4 rounded-xl bg-[#6cf8bb]/30 hover:bg-[#6cf8bb]/40 text-[#00714d] text-xs font-headline font-bold flex items-center justify-center gap-2 transition-all"
              >
                <span>View Real-Time OCR Telemetry</span>
                <StitchIcon name="arrow_forward" size={14} />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
