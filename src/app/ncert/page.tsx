'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { MindMapLightboxViewer } from '@/components/mindmaps/MindMapLightboxViewer';
import {
  getMindMapForChapter,
  PhysicsMindMapMeta,
} from '@/lib/mindmaps/physics-mindmap-registry';
import {
  getChemistryMindMapForChapter,
  ChemistryMindMapMeta,
} from '@/lib/mindmaps/chemistry-mindmap-registry';

interface TopicSummary {
  id: string;
  topicNumber: string;
  title: string;
  slug: string;
  orderIndex: number;
  pageStart: number;
  pageEnd: number;
  subtopicCount: number;
  questionCount: number;
  progress: {
    status: string;
    contentRead: boolean;
    dppCompleted: boolean;
    dppScore: number | null;
  };
}

interface ChapterSummary {
  id: string;
  chapterNumber: number;
  ncertBookCode: string;
  title: string;
  slug: string;
  topicsCount: number;
  completedTopicsCount: number;
  isCompleted: boolean;
  topics: TopicSummary[];
}

interface UnitSummary {
  id: string;
  unitNumber: number;
  title: string;
  chapters: ChapterSummary[];
}

interface SubjectSummary {
  id: string;
  name: string;
  code: string;
  units: UnitSummary[];
}

interface ClassSummary {
  id: string;
  name: string;
  code: string;
  order: number;
  subjects: SubjectSummary[];
}

export default function NcertHubPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [stats, setStats] = useState<{
    totalChapters: number;
    totalTopics: number;
    completedTopics: number;
    percentComplete: number;
  }>({ totalChapters: 79, totalTopics: 426, completedTopics: 0, percentComplete: 0 });

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('CLASS_11');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    // Expand Chapter 2 by default
    cmunm1fel000hevz0sh4z7eiw: true,
  });

  // Direct Mind Map Lightbox Viewer State
  const [selectedMindMap, setSelectedMindMap] = useState<PhysicsMindMapMeta | ChemistryMindMapMeta | null>(null);
  const [isMindMapViewerOpen, setIsMindMapViewerOpen] = useState(false);
  const [missingMindMapInfo, setMissingMindMapInfo] = useState<{ chapterTitle: string } | null>(null);

  const handleOpenMindMap = (ch: ChapterSummary, subjectName: string, className: string) => {
    const classNum = className.includes('12') ? 12 : 11;

    // 1. Check Chemistry Mind Maps
    const chemMatch = getChemistryMindMapForChapter({
      id: ch.id,
      slug: ch.slug,
      title: ch.title,
      chapterNumber: ch.chapterNumber,
      classLevel: classNum,
      subjectName: subjectName,
    });

    if (chemMatch) {
      setSelectedMindMap(chemMatch);
      setIsMindMapViewerOpen(true);
      return;
    }

    // 2. Check Physics Mind Maps
    const match = getMindMapForChapter({
      id: ch.id,
      slug: ch.slug,
      title: ch.title,
      chapterNumber: ch.chapterNumber,
      classLevel: classNum,
      subjectName: subjectName,
    });

    if (match) {
      setSelectedMindMap(match);
      setIsMindMapViewerOpen(true);
    } else {
      setMissingMindMapInfo({ chapterTitle: ch.title });
    }
  };

  // Fetch full hierarchy
  useEffect(() => {
    async function loadHierarchy() {
      setLoading(true);
      try {
        const res = await fetch('/api/ncert/hierarchy');
        const data = await res.json();
        if (data.success) {
          setClasses(data.hierarchy);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load NCERT hierarchy:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHierarchy();
  }, []);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Find active class
  const activeClassData = classes.find(
    (c) => c.code === selectedClass || c.name.toLowerCase().includes(selectedClass.toLowerCase())
  ) || classes[0];

  // Filter subjects within active class
  const filteredSubjects = activeClassData?.subjects.filter((s) => {
    if (selectedSubject === 'ALL') return true;
    return s.code.toUpperCase() === selectedSubject.toUpperCase();
  }) || [];

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="NCERT Complete Learning System"
      showBack={true}
      backHref="/"
    >
      <div className="space-y-6 pb-20">
        {/* Hub Header & Overall Progress Banner */}
        <section className="bg-gradient-to-r from-[#eef2ff] via-[#f1f3ff] to-[#e7fbf1] rounded-3xl p-5 sm:p-7 border border-[#e1e8fd] shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-[#3525cd] text-white flex items-center justify-center shadow-xs">
                <StitchIcon name="auto_stories" size={22} />
              </span>
              <div>
                <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider block">
                  NCERT 2024-25 Rationalised Edition
                </span>
                <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b]">
                  NEET UG 2027 NCERT Repository
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-[#e9edff] text-right shadow-2xs">
                <span className="text-[11px] font-bold text-[#777587] block uppercase">
                  Ingested Syllabus
                </span>
                <span className="text-base font-bold text-[#3525cd]">
                  {stats.totalChapters} Chapters • {stats.totalTopics} Topics
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#464555]">
              <span>Overall NCERT Mastery</span>
              <span>
                {stats.completedTopics} of {stats.totalTopics} Topics ({stats.percentComplete}%)
              </span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden border border-[#dce2f7]">
              <div
                className="bg-[#006c49] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats.percentComplete, 2)}%` }}
              />
            </div>
          </div>
        </section>

        {/* High-Yield Quick Link Banner: Chapter 2 Monera */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e9edff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#e7fbf1] text-[#006c49] flex items-center justify-center flex-shrink-0">
              <StitchIcon name="science" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-[#6cf8bb]/40 text-[#00714d] px-2 py-0.5 rounded-full">
                  High Yield Target
                </span>
                <span className="text-xs text-[#777587]">Biology • Class 11</span>
              </div>
              <h3 className="font-headline font-bold text-sm sm:text-base text-[#141b2b] mt-0.5">
                Ch 2: Biological Classification — 2.1 Kingdom Monera
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/ncert/monera-archaebacteria"
              className="bg-[#f1f3ff] text-[#3525cd] hover:bg-[#e2dfff] px-3 py-2 rounded-xl text-xs font-bold transition-all border border-[#e1e8fd]"
            >
              Interactive Reader (p. 19)
            </Link>
            <Link
              href="/ncert/topic/2.1"
              className="bg-[#3525cd] text-white hover:bg-[#2b1ea8] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Resume Topic 2.1</span>
              <StitchIcon name="arrow_forward" size={15} />
            </Link>
          </div>
        </section>

        {/* Physics Mind Maps Banner */}
        <div className="bg-gradient-to-r from-[#e9edff] via-white to-[#f1f3ff] rounded-2xl p-4 sm:p-5 border border-[#dce2f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <StitchIcon name="account_tree" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#3525cd] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  28 Physics Mind Maps Ready
                </span>
                <span className="text-xs text-[#777587]">Class 11 &amp; Class 12 Physics</span>
              </div>
              <p className="text-xs font-semibold text-[#141b2b] mt-0.5">
                Every chapter in NEET Physics has its dedicated high-resolution visual mind map with zoom, pan, and download.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSubject('PHYSICS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
              selectedSubject === 'PHYSICS'
                ? 'bg-[#006c49] text-white'
                : 'bg-[#3525cd] hover:bg-[#2b1ea8] text-white shadow-xs'
            }`}
          >
            <span>{selectedSubject === 'PHYSICS' ? '✓ Showing Physics Chapters' : 'View Physics Chapters & Maps'}</span>
            <StitchIcon name="arrow_forward" size={14} />
          </button>
        </div>

        {/* Filter Toolbar: Class & Subject Selector */}
        <section className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Class Tabs */}
            <div className="flex items-center bg-[#f1f3ff] p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setSelectedClass('CLASS_11')}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  selectedClass === 'CLASS_11'
                    ? 'bg-white text-[#3525cd] shadow-2xs'
                    : 'text-[#464555] hover:text-[#3525cd]'
                }`}
              >
                Class 11 NCERT
              </button>
              <button
                onClick={() => setSelectedClass('CLASS_12')}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  selectedClass === 'CLASS_12'
                    ? 'bg-white text-[#3525cd] shadow-2xs'
                    : 'text-[#464555] hover:text-[#3525cd]'
                }`}
              >
                Class 12 NCERT
              </button>
            </div>

            {/* Subject Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'].map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedSubject === subj
                      ? 'bg-[#3525cd] text-white shadow-xs'
                      : 'bg-[#f9f9ff] text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff]'
                  }`}
                >
                  <span>
                    {subj === 'ALL'
                      ? 'All Subjects'
                      : subj === 'BIOLOGY'
                      ? 'Biology'
                      : subj === 'CHEMISTRY'
                      ? 'Chemistry'
                      : 'Physics'}
                  </span>
                  {subj === 'PHYSICS' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        selectedSubject === 'PHYSICS'
                          ? 'bg-white/20 text-white'
                          : 'bg-[#e2dfff] text-[#3525cd]'
                      }`}
                    >
                      🗺️ 28 Maps
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative pt-1">
            <span className="absolute inset-y-0 left-0 pl-3 pt-1 flex items-center pointer-events-none text-[#777587]">
              <StitchIcon name="search" size={17} />
            </span>
            <input
              type="text"
              placeholder="Search chapters, topics (e.g. 2.1, Kingdom Monera, Chemical Bonding, Optics)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9f9ff] border border-[#e9edff] rounded-xl text-xs sm:text-sm text-[#141b2b] placeholder-[#777587] focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all"
            />
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#777587]">
              Loading verified NCERT syllabus...
            </p>
          </div>
        )}

        {/* Units & Chapters Tree */}
        {!loading && (
          <div className="space-y-6">
            {filteredSubjects.map((subjectItem) => (
              <div key={subjectItem.id} className="space-y-4">
                <div className="flex items-center gap-2 pt-2">
                  <span className="w-3 h-3 rounded-full bg-[#3525cd]" />
                  <h2 className="font-headline font-bold text-base sm:text-lg text-[#141b2b]">
                    {subjectItem.name}
                  </h2>
                  <span className="text-xs bg-[#e2dfff] text-[#3525cd] px-2 py-0.5 rounded-full font-bold">
                    {subjectItem.units.reduce(
                      (acc, u) => acc + u.chapters.length,
                      0
                    )}{' '}
                    Chapters
                  </span>
                </div>

                {subjectItem.units.map((unitItem) => {
                  // Filter chapters by search query
                  const filteredChapters = unitItem.chapters.filter((ch) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      ch.title.toLowerCase().includes(q) ||
                      ch.chapterNumber.toString().includes(q) ||
                      ch.topics.some(
                        (t) =>
                          t.title.toLowerCase().includes(q) ||
                          t.topicNumber.toLowerCase().includes(q)
                      )
                    );
                  });

                  if (filteredChapters.length === 0) return null;

                  return (
                    <div
                      key={unitItem.id}
                      className="bg-white rounded-2xl border border-[#e9edff] shadow-xs overflow-hidden"
                    >
                      {/* Unit Header */}
                      <div className="bg-[#f1f3ff] px-4 sm:px-5 py-3 border-b border-[#e1e8fd] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-[#3525cd] text-white px-2 py-0.5 rounded-md">
                            Unit {unitItem.unitNumber}
                          </span>
                          <h3 className="font-headline font-bold text-xs sm:text-sm text-[#141b2b]">
                            {unitItem.title}
                          </h3>
                        </div>
                        <span className="text-xs text-[#777587]">
                          {filteredChapters.length} Chapters
                        </span>
                      </div>

                      {/* Chapters Grid / List */}
                      <div className="divide-y divide-[#f1f3ff]">
                        {filteredChapters.map((ch) => {
                          const isExpanded = expandedChapters[ch.id] ?? false;

                          return (
                            <div key={ch.id} className="p-4 sm:p-5 space-y-3">
                              <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-[#f1f3ff] text-[#3525cd] px-2 py-0.5 rounded-md">
                                      Chapter {ch.chapterNumber}
                                    </span>
                                    {ch.isCompleted ? (
                                      <span className="text-[11px] font-bold bg-[#e7fbf1] text-[#00714d] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <StitchIcon name="check_circle" size={12} />
                                        <span>Completed</span>
                                      </span>
                                    ) : ch.completedTopicsCount > 0 ? (
                                      <span className="text-[11px] font-bold bg-[#fff0c0] text-[#745500] px-2 py-0.5 rounded-full">
                                        {ch.completedTopicsCount}/{ch.topicsCount} Topics
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-[#777587]">
                                        {ch.topicsCount} Topics
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-headline font-bold text-sm sm:text-base text-[#141b2b] hover:text-[#3525cd] transition">
                                    <Link href={`/ncert/chapter/${ch.id}`}>
                                      {ch.title}
                                    </Link>
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2 self-start">
                                  {ch.topics.length > 0 && (
                                    <Link
                                      href={`/ncert/topic/${ch.topics[0].id}`}
                                      className="bg-[#3525cd] text-white hover:bg-[#2b1ea8] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                                    >
                                      <StitchIcon name="play_arrow" size={14} />
                                      <span>Read Chapter</span>
                                    </Link>
                                  )}
                                  <button
                                    onClick={() => toggleChapter(ch.id)}
                                    className="p-1.5 rounded-xl bg-[#f9f9ff] text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff] transition-all"
                                    title={isExpanded ? 'Collapse' : 'Expand topics'}
                                  >
                                    <StitchIcon
                                      name={isExpanded ? 'expand_less' : 'expand_more'}
                                      size={18}
                                    />
                                  </button>
                                </div>
                              </div>

                              {/* Connected High-Yield Study Nodes */}
                              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                                <Link
                                  href={`/ncert/chapter/${ch.id}/mindmap`}
                                  className="px-2.5 py-1 rounded-lg bg-[#f9f9ff] hover:bg-[#e1e8fd] text-[#464555] hover:text-[#3525cd] border border-[#e9edff] flex items-center gap-1 font-semibold transition-colors"
                                  title={`Open ${ch.title} Mind Map Viewer`}
                                >
                                  <StitchIcon name="account_tree" size={14} className="text-[#3525cd]" />
                                  <span>Mind Map</span>
                                </Link>
                                <Link
                                  href={`/flashcards?chapter=${encodeURIComponent(ch.title)}`}
                                  className="px-2.5 py-1 rounded-lg bg-[#f9f9ff] hover:bg-[#e1e8fd] text-[#464555] hover:text-[#3525cd] border border-[#e9edff] flex items-center gap-1 font-semibold"
                                >
                                  <StitchIcon name="style" size={14} className="text-[#3525cd]" />
                                  <span>Flashcards</span>
                                </Link>
                                <Link
                                  href={`/practice?chapterId=${ch.id}`}
                                  className="px-2.5 py-1 rounded-lg bg-[#f9f9ff] hover:bg-[#e1e8fd] text-[#464555] hover:text-[#3525cd] border border-[#e9edff] flex items-center gap-1 font-semibold"
                                >
                                  <StitchIcon name="quiz" size={14} className="text-[#3525cd]" />
                                  <span>Practice</span>
                                </Link>
                                <Link
                                  href={`/tests?chapterId=${ch.id}`}
                                  className="px-2.5 py-1 rounded-lg bg-[#f9f9ff] hover:bg-[#e1e8fd] text-[#464555] hover:text-[#3525cd] border border-[#e9edff] flex items-center gap-1 font-semibold"
                                >
                                  <StitchIcon name="assignment" size={14} className="text-[#3525cd]" />
                                  <span>Fingertips Test</span>
                                </Link>
                              </div>

                              {/* Topics Dropdown List */}
                              {isExpanded && ch.topics.length > 0 && (
                                <div className="pt-2 border-t border-[#f1f3ff] space-y-2">
                                  <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider block">
                                    NCERT Topics Breakdown:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {ch.topics.map((t) => {
                                      const isDone = t.progress.status === 'COMPLETED';

                                      return (
                                        <Link
                                          key={t.id}
                                          href={`/ncert/topic/${t.id}`}
                                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                                            isDone
                                              ? 'bg-[#f0fbf5] border-[#c0efd9] text-[#006c49]'
                                              : 'bg-[#f9f9ff] border-[#e9edff] text-[#141b2b] hover:border-[#3525cd]'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span
                                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                                isDone
                                                  ? 'bg-[#006c49] text-white'
                                                  : 'bg-[#e2e7f8] text-[#3525cd]'
                                              }`}
                                            >
                                              {isDone ? '✓' : t.topicNumber.split('.')[1] || '•'}
                                            </span>
                                            <span className="font-semibold truncate">
                                              {t.topicNumber} {t.title}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <span className="text-[10px] text-[#777587]">
                                              p. {t.pageStart || 1}
                                            </span>
                                            {t.progress.dppCompleted && (
                                              <span className="text-[10px] font-bold bg-[#e7fbf1] text-[#00714d] px-1.5 py-0.5 rounded">
                                                DPP ✓
                                              </span>
                                            )}
                                          </div>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* High-Resolution Mind Map Lightbox Viewer */}
      <MindMapLightboxViewer
        mindMap={selectedMindMap}
        isOpen={isMindMapViewerOpen}
        onClose={() => setIsMindMapViewerOpen(false)}
      />

      {/* Graceful notice if mind map asset is missing */}
      {missingMindMapInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#e9edff] animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-[#f1f3ff] text-[#3525cd] flex items-center justify-center">
              <StitchIcon name="account_tree" size={20} />
            </div>
            <div>
              <h4 className="font-headline font-bold text-base text-[#141b2b]">
                Mind Map Availability
              </h4>
              <p className="text-xs text-[#777587] mt-1 leading-relaxed">
                Currently, all 28 <strong className="text-[#141b2b]">NEET Physics</strong> chapters and <strong className="text-[#141b2b]">Chemistry Class 11 Chapter 1</strong> have dedicated interactive mind maps.
                Mind map for <span className="font-semibold text-[#141b2b]">&ldquo;{missingMindMapInfo.chapterTitle}&rdquo;</span> is not yet in the active collection.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMissingMindMapInfo(null);
                  setSelectedSubject('PHYSICS');
                  const p1 = getMindMapForChapter({
                    chapterNumber: 1,
                    classLevel: selectedClass === 'CLASS_12' ? 12 : 11,
                    subjectName: 'Physics',
                  });
                  if (p1) {
                    setSelectedMindMap(p1);
                    setIsMindMapViewerOpen(true);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <StitchIcon name="account_tree" size={16} />
                <span>Open Physics Chapter 1 Mind Map</span>
              </button>
              <button
                type="button"
                onClick={() => setMissingMindMapInfo(null)}
                className="w-full py-2 rounded-xl bg-[#f9f9ff] hover:bg-[#f1f3ff] text-[#464555] text-xs font-semibold transition border border-[#e9edff]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
