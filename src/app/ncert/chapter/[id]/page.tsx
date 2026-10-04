'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { ChapterMindMapCard } from '@/components/mindmaps/ChapterMindMapCard';
import { ChapterNativeMindMap } from '@/components/mindmaps/ChapterNativeMindMap';
import { PhysicsMindMapMeta } from '@/lib/mindmaps/physics-mindmap-registry';

interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  slug: string;
  ncertBookCode?: string;
  subject: { id: string; name: string; code: string };
  unit?: { id: string; unitNumber: number; title: string; classLevel?: { name: string; code: string } };
  classLevel?: { name: string; code: string } | null;
  topics: Array<{
    id: string;
    topicNumber: string;
    title: string;
    slug: string;
    orderIndex: number;
    pageStart?: number;
    pageEnd?: number;
  }>;
}

function ChapterDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chapterId = (params?.id as string) || '';
  const tabParam = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [mindMaps, setMindMaps] = useState<PhysicsMindMapMeta[]>([]);
  const [activeSection, setActiveSection] = useState<'mindmap' | 'topics' | 'practice'>('topics');

  useEffect(() => {
    if (tabParam === 'mindmap') {
      setActiveSection('mindmap');
    } else if (tabParam === 'topics' || tabParam === 'ncert' || tabParam === 'overview') {
      setActiveSection('topics');
    } else if (tabParam === 'practice' || tabParam === 'pyq') {
      setActiveSection('practice');
    }
  }, [tabParam]);

  useEffect(() => {
    if (!chapterId) return;

    async function loadChapter() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ncert/chapter/${encodeURIComponent(chapterId)}`);
        const data = await res.json();
        if (data.success) {
          setChapter(data.chapter);
          const maps: PhysicsMindMapMeta[] = data.mindMaps || [];
          setMindMaps(maps);

          // If explicit tab query param was provided, honor it
          if (tabParam === 'mindmap' && maps.length > 0) {
            setActiveSection('mindmap');
          } else if (tabParam === 'practice' || tabParam === 'pyq') {
            setActiveSection('practice');
          } else if (tabParam === 'topics' || tabParam === 'ncert' || tabParam === 'overview') {
            setActiveSection('topics');
          } else if (maps.length > 0) {
            // For Physics chapters with mindmaps, default to mindmap for rapid visual conceptualization
            setActiveSection('mindmap');
          } else {
            setActiveSection('topics');
          }
        }
      } catch (err) {
        console.error('Failed to load chapter:', err);
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [chapterId, tabParam]);

  if (loading) {
    return (
      <AppShell
        title="NCERT Chapter"
        subtitle="Loading Curriculum..."
        showBack={true}
        backHref="/ncert"
      >
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#777587] font-headline font-semibold">
            Loading NCERT Chapter and Visual Mind Maps...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!chapter) {
    return (
      <AppShell
        title="Chapter Not Found"
        subtitle="Error 404"
        showBack={true}
        backHref="/ncert"
      >
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-[#e9edff] rounded-3xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
            <StitchIcon name="error" size={24} />
          </div>
          <h2 className="text-lg font-headline font-bold text-[#141b2b]">Chapter Not Found</h2>
          <p className="text-xs text-[#777587]">
            The requested chapter identifier could not be resolved in the NCERT syllabus database.
          </p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold"
          >
            <span>Return to NCERT Hub</span>
            <StitchIcon name="arrow_forward" size={14} />
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Chapter ${chapter.chapterNumber}: ${chapter.title}`}
      subtitle={`${chapter.subject.name} • ${chapter.unit?.title || 'NCERT Core'}`}
      showBack={true}
      backHref="/ncert"
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Chapter Header Banner */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e9edff] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f3ff] pb-3 text-xs text-[#777587]">
            <div className="flex items-center gap-2">
              <Link href="/ncert" className="hover:text-[#3525cd] transition">
                NCERT Hub
              </Link>
              <span>›</span>
              <span className="font-semibold text-[#141b2b]">{chapter.subject.name}</span>
              <span>›</span>
              <span>Chapter {chapter.chapterNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#3525cd] font-bold text-[11px]">
                {chapter.ncertBookCode ? `Code: ${chapter.ncertBookCode}` : 'NCERT 2024-2027'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e7fbf1] text-[#00714d] font-bold text-[11px]">
                {chapter.topics.length} NCERT Topics
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider block">
                {chapter.unit?.title ? `Unit: ${chapter.unit.title}` : 'Syllabus Chapter'}
              </span>
              <h1 className="text-xl sm:text-3xl font-headline font-bold text-[#141b2b] mt-0.5">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {chapter.topics.length > 0 && (
                <Link
                  href={`/ncert/topic/${chapter.topics[0].id}`}
                  className="px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-headline font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <StitchIcon name="play_arrow" size={16} />
                  <span>Start Reading Chapter</span>
                </Link>
              )}

              <Link
                href={`/ncert/chapter/${chapter.id}/test`}
                className="px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#3525cd] font-headline font-bold text-xs flex items-center gap-1.5 transition"
              >
                <StitchIcon name="quiz" size={16} />
                <span>Chapter Test</span>
              </Link>
            </div>
          </div>

          {/* Section Navigation Tabs: Direct Contextual Chapter Resources */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f1f3ff] overflow-x-auto">
            {mindMaps.length > 0 && (
              <Link
                href={`/ncert/chapter/${chapter.id}/mindmap`}
                className="px-4 py-2 rounded-xl text-xs font-headline font-bold flex items-center gap-2 transition flex-shrink-0 bg-[#f9f9ff] text-[#464555] hover:bg-[#3525cd] hover:text-white"
              >
                <StitchIcon name="account_tree" size={16} />
                <span>🗺️ Mind Map</span>
              </Link>
            )}

            <button
              onClick={() => setActiveSection('topics')}
              className={`px-4 py-2 rounded-xl text-xs font-headline font-bold flex items-center gap-2 transition flex-shrink-0 ${
                activeSection === 'topics'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#f9f9ff] text-[#464555] hover:bg-[#f1f3ff]'
              }`}
            >
              <StitchIcon name="menu_book" size={16} />
              <span>NCERT Topics ({chapter.topics.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('practice')}
              className={`px-4 py-2 rounded-xl text-xs font-headline font-bold flex items-center gap-2 transition flex-shrink-0 ${
                activeSection === 'practice'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#f9f9ff] text-[#464555] hover:bg-[#f1f3ff]'
              }`}
            >
              <StitchIcon name="checklist" size={16} />
              <span>Practice &amp; PYQs</span>
            </button>
          </div>
        </section>

        {/* RESOURCE 1: PROMINENT CHAPTER MIND MAP (DIRECT CONTEXTUAL RESOURCE) */}
        {activeSection === 'mindmap' && mindMaps.length > 0 && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]" />
                <h2 className="text-sm font-headline font-bold text-[#141b2b] uppercase tracking-wider">
                  Chapter Visual Mind Map
                </h2>
              </div>

              <Link
                href={`/ncert/chapter/${chapter.id}/mindmap`}
                className="text-xs font-semibold text-white bg-[#3525cd] hover:bg-[#2b1ea8] px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <StitchIcon name="fullscreen" size={16} />
                <span>Open Dedicated Viewer</span>
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e9edff] shadow-xs text-center space-y-4">
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-[#e2dfff] shadow-md group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mindMaps[0].assetUrl}
                  alt={mindMaps[0].title}
                  className="w-full max-h-[480px] object-contain bg-[#0c0f1d] group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link
                    href={`/ncert/chapter/${chapter.id}/mindmap`}
                    className="px-5 py-2.5 rounded-xl bg-[#3525cd] text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <StitchIcon name="zoom_in" size={18} />
                    <span>Open in Dedicated High-Res Viewer</span>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Link
                  href={`/ncert/chapter/${chapter.id}/mindmap`}
                  className="px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <StitchIcon name="account_tree" size={16} />
                  <span>Launch Dedicated Mind Map Viewer</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* RESOURCE 2: CANONICAL NCERT TOPICS BREAKDOWN */}
        {activeSection === 'topics' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e9edff] shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-3">
              <h3 className="font-headline font-bold text-base text-[#141b2b]">
                Canonical NCERT Topics Breakdown
              </h3>
              <span className="text-xs text-[#777587]">
                {chapter.topics.length} Sections
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chapter.topics.map((t, idx) => (
                <Link
                  key={t.id}
                  href={`/ncert/topic/${t.id}`}
                  className="p-4 rounded-2xl border border-[#e9edff] bg-[#f9f9ff] hover:border-[#3525cd] hover:bg-white transition flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-[#e2dfff] text-[#3525cd] font-headline font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-[#3525cd] group-hover:text-white transition">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-headline font-bold text-[#141b2b] truncate group-hover:text-[#3525cd] transition">
                        {t.topicNumber} {t.title}
                      </h4>
                      {t.pageStart && (
                        <p className="text-[11px] text-[#777587]">
                          NCERT Page {t.pageStart} - {t.pageEnd || t.pageStart}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="p-1.5 rounded-lg bg-white border border-[#e9edff] text-[#777587] group-hover:text-[#3525cd] transition flex-shrink-0">
                    <StitchIcon name="arrow_forward" size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* RESOURCE 3: PRACTICE & PYQs */}
        {activeSection === 'practice' && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#006c49] uppercase tracking-wider block">
                  Daily Practice Problem
                </span>
                <h4 className="text-base font-headline font-bold text-[#141b2b] mt-1">
                  Topic-Wise DPP Challenger
                </h4>
                <p className="text-xs text-[#777587] mt-1 leading-relaxed">
                  Solve 10-15 timed NEET-calibrated MCQs targeted at this chapter’s core topics.
                </p>
              </div>
              <Link
                href={`/dpp?chapter=${encodeURIComponent(chapter.slug)}`}
                className="w-full py-2 px-3 rounded-xl bg-[#3525cd] text-white font-headline font-bold text-xs text-center transition hover:bg-[#2b1ea8]"
              >
                Launch Chapter DPP
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider block">
                  MTG Fingertips
                </span>
                <h4 className="text-base font-headline font-bold text-[#141b2b] mt-1">
                  100% NCERT Extract MCQs
                </h4>
                <p className="text-xs text-[#777587] mt-1 leading-relaxed">
                  Every line of NCERT tested through MTG Fingertips assertion-reason and diagram questions.
                </p>
              </div>
              <Link
                href={`/practice?chapterId=${chapter.id}`}
                className="w-full py-2 px-3 rounded-xl bg-[#f1f3ff] text-[#3525cd] font-headline font-bold text-xs text-center transition hover:bg-[#e1e8fd]"
              >
                Practice Fingertips
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#bf360c] uppercase tracking-wider block">
                  CBT Simulation
                </span>
                <h4 className="text-base font-headline font-bold text-[#141b2b] mt-1">
                  Full Chapter Mock Exam
                </h4>
                <p className="text-xs text-[#777587] mt-1 leading-relaxed">
                  45 questions, 60 minutes, official +4 / -1 marking scheme with post-test pacing analytics.
                </p>
              </div>
              <Link
                href={`/ncert/chapter/${chapter.id}/test`}
                className="w-full py-2 px-3 rounded-xl bg-[#bf360c] text-white font-headline font-bold text-xs text-center transition hover:bg-[#a02e0a]"
              >
                Take Chapter CBT Test
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default function ChapterDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="NCERT Chapter" subtitle="Loading Curriculum..." showBack={true} backHref="/ncert">
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#777587] font-headline font-semibold">
              Loading NCERT Chapter and Visual Mind Maps...
            </p>
          </div>
        </AppShell>
      }
    >
      <ChapterDetailContent />
    </Suspense>
  );
}
