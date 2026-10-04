'use client';

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';

export default function SyllabusMasteryTrackerPage() {
  const [activeSubject, setActiveSubject] = useState<'Botany' | 'Zoology' | 'Chemistry' | 'Physics'>('Botany');
  const [activeClass, setActiveClass] = useState<'11' | '12' | 'All'>('11');
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYield, setFilterYield] = useState<'All' | 'High Yield' | 'Critical'>('All');

  useEffect(() => {
    async function loadConcepts() {
      try {
        const res = await fetch('/api/student/analytics/concepts');
        if (res.ok) {
          const data = await res.json();
          setConcepts(data.concepts || []);
        }
      } catch (err) {
        console.error('Failed to load concepts', err);
      } finally {
        setLoading(false);
      }
    }
    loadConcepts();
  }, []);

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="Mastery"
      showBack={true}
      backHref="/"
    >
      <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6 pb-16">
          {/* Header Info & Breadcrumb */}
          <section className="flex flex-col pt-space-sm space-y-space-xs">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="font-label-sm text-label-sm tracking-wide uppercase text-primary font-semibold">
                NEET UG 2026
              </span>
              <span className="text-outline-variant font-label-sm text-label-sm">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <StitchIcon name="verified" className="text-[13px] text-secondary" size={13} />
                NCERT Rationalized
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Syllabus &amp; Mastery</h1>
              <button
                aria-label="Info on tracking"
                onClick={() => setShowInfoBanner(!showInfoBanner)}
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-transform cursor-pointer"
                title="Toggle Coverage Guide"
              >
                <StitchIcon name="analytics" className="text-[20px]" size={20} />
              </button>
            </div>
            {showInfoBanner && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-on-surface space-y-1 animate-fade-in">
                <span className="font-bold text-primary flex items-center gap-1">
                  <StitchIcon name="info" size={14} /> Syllabus Mastery Framework
                </span>
                <p className="text-on-surface-variant">
                  Real-time synchronization across line-by-line NCERT 2024-25 rationalized edition, daily practice problem (DPP) accuracy, and 24-year NEET/AIPMT pattern weightage.
                </p>
              </div>
            )}
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Coverage of line-by-line NCERT, Fingertips DPPs, and 24-year PYQ audit across 97 chapters.
            </p>
          </section>

          {/* Overall Progress Hero Card */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Overall Syllabus Mastery
                </span>
                <div className="flex items-baseline gap-space-xs mt-0.5">
                  <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-bold">
                    68<span className="text-primary text-headline-lg font-semibold">%</span>
                  </span>
                  <span className="font-label-md text-label-md text-secondary font-semibold flex items-center gap-0.5">
                    <StitchIcon name="trending_up" className="text-[15px]" size={15} /> +3.4% this week
                  </span>
                </div>
              </div>
              {/* Radial Progress Gauge (Inline SVG) */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="68, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-secondary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="48, 100"
                    strokeDashoffset="-20"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                </svg>
                <span className="absolute font-label-sm text-label-sm font-semibold text-on-surface">97 Ch</span>
              </div>
            </div>

            {/* Segmented Chapter Mastery Bar */}
            <div className="flex flex-col space-y-1.5">
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden flex">
                <div className="bg-secondary h-full" style={{ width: '49.5%' }} title="Mastered: 48 chapters"></div>
                <div className="bg-primary-container h-full" style={{ width: '32%' }} title="In Progress: 31 chapters"></div>
                <div className="bg-surface-variant h-full" style={{ width: '18.5%' }} title="Not Started: 18 chapters"></div>
              </div>
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span><strong className="text-on-surface font-semibold">48</strong> Mastered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  <span><strong className="text-on-surface font-semibold">31</strong> Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                  <span><strong className="text-on-surface font-semibold">18</strong> Pending</span>
                </div>
              </div>
            </div>

            {/* Exam Readiness Forecast Pill */}
            <div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 text-on-secondary-container">
                  <StitchIcon name="verified" className="text-[18px]" size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                    Target Score: 680+ Projected
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Completion Pace: 15 Feb 2026 (78 Days left)
                  </span>
                </div>
              </div>
              <Link href="/readiness">
                <StitchIcon name="arrow_forward" className="text-primary text-[20px] flex-shrink-0" size={20} />
              </Link>
            </div>
          </section>

          {/* Subject Filters & Class Switcher */}
          <section className="flex flex-col space-y-space-md">
            {/* Subject Horizontal Scroll */}
            <div className="flex items-center gap-space-sm overflow-x-auto no-scrollbar -mx-gutter px-gutter">
              {[
                { name: 'Botany', icon: 'local_florist', pct: '74%' },
                { name: 'Zoology', icon: 'pets', pct: '68%' },
                { name: 'Chemistry', icon: 'science', pct: '61%' },
                { name: 'Physics', icon: 'bolt', pct: '52%' },
              ].map((subj) => {
                const isActive = activeSubject === subj.name;
                return (
                  <button
                    key={subj.name}
                    onClick={() => setActiveSubject(subj.name as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full flex-shrink-0 shadow-sm transition-transform active:scale-95 ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <StitchIcon name={subj.icon} className={`text-[16px] ${isActive ? '' : 'text-on-surface-variant'}`} size={16} />
                    <span className="font-label-md text-label-md font-semibold">{subj.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-label-sm font-label-sm ${
                        isActive ? 'bg-on-primary/20' : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {subj.pct}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Class Sub-toggle & Filter Options */}
            <div className="flex items-center justify-between gap-space-sm">
              <div className="inline-flex bg-surface-container-high p-1 rounded-lg">
                <button
                  onClick={() => setActiveClass('11')}
                  className={`font-label-sm text-label-sm px-3 py-1.5 rounded-md font-semibold transition-all ${
                    activeClass === '11'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Class 11 (22)
                </button>
                <button
                  onClick={() => setActiveClass('12')}
                  className={`font-label-sm text-label-sm px-3 py-1.5 rounded-md transition-all ${
                    activeClass === '12'
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Class 12 (16)
                </button>
                <button
                  onClick={() => setActiveClass('All')}
                  className={`font-label-sm text-label-sm px-3 py-1.5 rounded-md transition-all ${
                    activeClass === 'All'
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-8 px-2.5 rounded-lg flex items-center gap-1 text-label-sm font-label-sm shadow-sm transition-colors cursor-pointer ${
                    showFilters || filterYield !== 'All'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary'
                  }`}
                  title="Toggle chapter filters"
                >
                  <StitchIcon name="filter_list" className="text-[16px]" size={16} />
                  <span>Filters{filterYield !== 'All' ? ` (${filterYield})` : ''}</span>
                </button>
                <button
                  aria-label="Search Chapters"
                  onClick={() => setIsSearching(!isSearching)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
                    isSearching
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary'
                  }`}
                  title="Search chapters"
                >
                  <StitchIcon name="search" className="text-[18px]" size={18} />
                </button>
              </div>
            </div>

            {/* Expandable Filter & Search Controls */}
            {showFilters && (
              <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-xl shadow-xs animate-fade-in text-xs">
                <span className="font-bold text-on-surface-variant">Yield Priority:</span>
                {(['All', 'High Yield', 'Critical'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterYield(lvl)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      filterYield === lvl
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="relative animate-fade-in">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in chapters, NCERT figures, and PYQ topics..."
                  className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest rounded-xl border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"
                  autoFocus
                />
                <StitchIcon name="search" size={16} className="absolute left-3 top-2.5 text-on-surface-variant" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-on-surface-variant hover:text-on-surface"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Unit & Chapter Breakdown */}
          <section className="flex flex-col space-y-space-md">
            {/* Unit Header */}
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                  Unit 01
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Diversity in the Living World</h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">NEET Weightage</span>
                <span className="font-label-md text-label-md font-semibold text-secondary">12-14% (3-4 Qs)</span>
              </div>
            </div>

            {/* Chapter 1: Mastered State */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm transition-all">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary-container/60 text-secondary flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="check_circle" className="text-[18px]" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Chapter 01</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold">
                        Mastered 100%
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-0.5">The Living World</h3>
                  </div>
                </div>
                <button aria-label="Expand chapter details" className="text-on-surface-variant p-1 hover:text-on-surface">
                  <StitchIcon name="keyboard_arrow_down" className="text-[20px]" size={20} />
                </button>
              </div>

              {/* Quick Sub-Milestone Indicators */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-label-sm text-label-sm">
                <div className="bg-surface-container-low p-1.5 rounded-md flex flex-col items-center">
                  <StitchIcon name="book_4" className="text-[15px] text-secondary" size={15} />
                  <span className="text-on-surface font-medium mt-0.5 text-[10px]">NCERT 100%</span>
                </div>
                <div className="bg-surface-container-low p-1.5 rounded-md flex flex-col items-center">
                  <StitchIcon name="fact_check" className="text-[15px] text-secondary" size={15} />
                  <span className="text-on-surface font-medium mt-0.5 text-[10px]">DPP 96%</span>
                </div>
                <div className="bg-surface-container-low p-1.5 rounded-md flex flex-col items-center">
                  <StitchIcon name="history_edu" className="text-[15px] text-secondary" size={15} />
                  <span className="text-on-surface font-medium mt-0.5 text-[10px]">2010-24 PYQ</span>
                </div>
                <div className="bg-surface-container-low p-1.5 rounded-md flex flex-col items-center">
                  <StitchIcon name="style" className="text-[15px] text-secondary" size={15} />
                  <span className="text-on-surface font-medium mt-0.5 text-[10px]">SRS Clear</span>
                </div>
              </div>
            </div>

            {/* Chapter 2: In-Progress State (Primary Focus Module) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md space-y-space-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div className="flex items-start justify-between gap-space-sm pt-0.5">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 text-primary">
                    <StitchIcon name="timelapse" className="text-[18px]" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Chapter 02</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-fixed text-primary font-semibold">
                        In Progress 70%
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-label-sm font-label-sm bg-error-container text-on-error-container font-semibold">
                        High Yield • 3 Qs
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
                      Biological Classification
                    </h3>
                  </div>
                </div>
              </div>

              {/* Multi-Factor Mastery Checklist */}
              <div className="bg-surface-container-low rounded-lg p-space-md space-y-2.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold block">
                  Mastery Milestone Gates
                </span>
                <div className="space-y-2 font-body-sm text-body-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <StitchIcon name="check_circle" className="text-[17px] text-secondary flex-shrink-0" size={17} />
                      <span className="text-on-surface truncate">NCERT Line Reading (pp. 23-34)</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">Completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <StitchIcon name="check_circle" className="text-[17px] text-secondary flex-shrink-0" size={17} />
                      <span className="text-on-surface truncate">Fingertips DPP (25 Qs)</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">84% Acc.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <StitchIcon name="check_circle" className="text-[17px] text-secondary flex-shrink-0" size={17} />
                      <span className="text-on-surface truncate">Mind Map Visual Synthesized</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">Saved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <StitchIcon name="sync" className="text-[17px] text-primary flex-shrink-0" size={17} />
                      <span className="text-on-surface truncate">20 Active Recall Cards (Box 3)</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-primary font-semibold">Due in 4h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <StitchIcon name="radio_button_unchecked" className="text-[17px] text-on-surface-variant flex-shrink-0" size={17} />
                      <span className="text-on-surface truncate">PYQs 2000-2024 (16 / 32 Done)</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">50%</span>
                  </div>
                  <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2 min-w-0">
                      <StitchIcon name="lock" className="text-[17px] text-outline flex-shrink-0" size={17} />
                      <span className="text-on-surface truncate">Chapter Mastery Exam (30 Min)</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">Unlocks at 80% PYQ</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/ncert/monera-archaebacteria"
                  className="flex-1 bg-primary text-on-primary py-2.5 px-4 rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
                >
                  <span>Continue Chapter</span>
                  <StitchIcon name="play_circle" className="text-[18px]" size={18} />
                </Link>
                <Link
                  href="/flashcards"
                  className="h-10 px-3 bg-surface-container text-on-surface rounded-lg font-label-md text-label-md flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  title="View Flashcards"
                >
                  <StitchIcon name="style" className="text-[18px]" size={18} />
                </Link>
              </div>
            </div>

            {/* Chapter 3: Needs Attention / Error Prone */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="warning" className="text-[18px]" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Chapter 03</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-error-container text-on-error-container font-semibold">
                        Needs Attention • 40%
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-0.5">Plant Kingdom</h3>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm font-semibold text-error">3-4 Qs</span>
              </div>
              <div className="bg-error-container/40 p-2.5 rounded-lg flex items-center gap-2">
                <StitchIcon name="priority_high" className="text-[18px] text-error flex-shrink-0" size={18} />
                <span className="font-body-sm text-body-sm text-on-surface">
                  <strong>Algae Pigmentation &amp; Life Cycles:</strong> 40% error rate detected in recent mock.
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/drills/pyq-drill"
                  className="flex-1 bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary py-2 px-3 rounded-lg font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <StitchIcon name="bolt" className="text-[16px]" size={16} />
                  <span>Launch Weak Drill (10 Qs)</span>
                </Link>
                <Link
                  href="/ncert"
                  className="bg-surface-container-low text-on-surface-variant px-3 py-2 rounded-lg font-label-sm text-label-sm font-medium hover:text-on-surface"
                >
                  NCERT p. 30
                </Link>
              </div>
            </div>

            {/* Chapter 4: Not Started */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm opacity-85">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="radio_button_unchecked" className="text-[18px]" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Chapter 04</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-semibold">
                        Not Started (0%)
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-0.5">
                      Morphology of Flowering Plants
                    </h3>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">4 Qs</span>
              </div>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant pt-1 px-1">
                <span>Estimated Study Time: ~4.5 hrs</span>
                <Link href="/ncert" className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                  Start Chapter <StitchIcon name="chevron_right" className="text-[14px]" size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* Educational Mastery Standard Insight Card */}
          <section className="bg-surface-container-low rounded-xl p-space-lg space-y-space-sm">
            <div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-bold">
              <StitchIcon name="verified_user" className="text-[20px]" size={20} />
              <h4>Strict NEET Mastery Rules</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              In Kriti NEET OS, a chapter is certified <strong className="text-secondary font-semibold">Mastered</strong> only after fulfilling all four prerequisites:
            </p>
            <ul className="font-body-sm text-body-sm text-on-surface space-y-1.5 list-none pl-0">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                <span>100% verified NCERT paragraph tracking completed.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                <span>Fingertips DPP accuracy maintained above 90%.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                <span>All 10-year official PYQs resolved without hints.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                <span>Spaced Repetition Flashcard deck cleared through Stage 3.</span>
              </li>
            </ul>
          </section>

          {/* Bottom Action Card */}
          <section className="pt-space-xs pb-space-sm">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <StitchIcon name="psychology" className="text-[22px]" size={22} />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Target Weak Chapters</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Compile an adaptive test from low-mastery modules.</p>
                  </div>
                </div>
              </div>
              <Link
                href="/drills/assertion-reason"
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 px-4 rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-transform text-center"
              >
                <StitchIcon name="auto_fix_high" className="text-[18px]" size={18} />
                <span>Generate AI Diagnostic on Incomplete Topics</span>
              </Link>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
                className="w-full bg-transparent text-on-surface-variant hover:text-primary py-1 font-label-sm text-label-sm text-center cursor-pointer transition-colors"
                title="Print or Save Syllabus Checklist"
              >
                Download / Print Rationalized Syllabus Checklist (PDF)
              </button>
            </div>
          </section>
      </div>
    </AppShell>
  );
}
