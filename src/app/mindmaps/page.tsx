'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import {
  PHYSICS_MIND_MAPS,
  PhysicsMindMapMeta,
} from '@/lib/mindmaps/physics-mindmap-registry';
import { ChapterMindMapCard } from '@/components/mindmaps/ChapterMindMapCard';

function MindMapStudioContent() {
  const searchParams = useSearchParams();
  const initialChapter = searchParams.get('chapter');
  const initialClass = searchParams.get('class');
  const initialId = searchParams.get('id');

  const [selectedClass, setSelectedClass] = useState<'ALL' | '11' | '12'>(
    initialClass === '11' ? '11' : initialClass === '12' ? '12' : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapId, setSelectedMapId] = useState<string>(() => {
    if (initialId) {
      const found = PHYSICS_MIND_MAPS.find((m) => m.id === initialId);
      if (found) return found.id;
    }
    if (initialChapter) {
      const q = initialChapter.toLowerCase();
      const found = PHYSICS_MIND_MAPS.find(
        (m) =>
          m.chapterSlug.toLowerCase() === q ||
          m.chapterTitle.toLowerCase().includes(q)
      );
      if (found) return found.id;
    }
    return PHYSICS_MIND_MAPS[0].id;
  });

  // Sync state if query params change
  useEffect(() => {
    if (initialId) {
      const found = PHYSICS_MIND_MAPS.find((m) => m.id === initialId);
      if (found) {
        setSelectedMapId(found.id);
        setSelectedClass(found.classLevel === 11 ? '11' : '12');
      }
    } else if (initialChapter) {
      const q = initialChapter.toLowerCase();
      const found = PHYSICS_MIND_MAPS.find(
        (m) =>
          m.chapterSlug.toLowerCase() === q ||
          m.chapterTitle.toLowerCase().includes(q)
      );
      if (found) {
        setSelectedMapId(found.id);
        setSelectedClass(found.classLevel === 11 ? '11' : '12');
      }
    }
  }, [initialChapter, initialId]);

  // Filtered mind maps
  const filteredMaps = useMemo(() => {
    return PHYSICS_MIND_MAPS.filter((m) => {
      if (m.status !== 'ACTIVE') return false;
      const matchClass =
        selectedClass === 'ALL' || m.classLevel.toString() === selectedClass;
      if (!matchClass) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.chapterTitle.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.keyTopics.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedClass, searchQuery]);

  // Current selected map
  const activeMap = useMemo(() => {
    return (
      PHYSICS_MIND_MAPS.find((m) => m.id === selectedMapId && m.status === 'ACTIVE') ||
      filteredMaps[0] ||
      PHYSICS_MIND_MAPS.find((m) => m.status === 'ACTIVE') ||
      PHYSICS_MIND_MAPS[0]
    );
  }, [selectedMapId, filteredMaps]);

  // Related maps for this chapter (e.g. if multiple editions exist)
  const relatedChapterMaps = useMemo(() => {
    return PHYSICS_MIND_MAPS.filter(
      (m) => m.chapterSlug === activeMap.chapterSlug && m.status === 'ACTIVE'
    );
  }, [activeMap.chapterSlug]);

  const class11Count = PHYSICS_MIND_MAPS.filter((m) => m.classLevel === 11 && m.status === 'ACTIVE').length;
  const class12Count = PHYSICS_MIND_MAPS.filter((m) => m.classLevel === 12 && m.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-[#141b2b] via-[#1a233a] to-[#251f68] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#3525cd] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <StitchIcon name="account_tree" size={14} />
              <span>Physics Visual OS</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-[#cbd5e1]">
              28 High-Resolution Chapter Mind Maps
            </span>
            <span className="px-3 py-1 rounded-full bg-[#006c49]/80 text-[11px] font-bold text-white">
              100% NCERT Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-headline font-bold text-white tracking-tight">
            Physics Chapter Mind Map Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            High-resolution visual revision architecture for Class 11 and Class 12 NEET Physics.
            Click any mind map to launch the full-screen interactive viewer with mouse-wheel &amp; pinch zoom, fluid panning, and pristine high-resolution downloads.
          </p>

          {/* Quick Stats Ribbon */}
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#e2e8f0]">
            <div>
              <span className="text-[#a5b4fc] font-bold text-sm mr-1">{class11Count}</span> Class 11 Maps
            </div>
            <div>&bull;</div>
            <div>
              <span className="text-[#a5b4fc] font-bold text-sm mr-1">{class12Count}</span> Class 12 Maps
            </div>
            <div>&bull;</div>
            <div>
              <span className="text-[#6ee7b7] font-bold text-sm mr-1">100%</span> Original Resolution (~2.5 MB/map)
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#3525cd]/30 to-transparent pointer-events-none" />
      </section>

      {/* Control Bar: Class Tabs & Search */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e9edff] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f1f3ff] rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setSelectedClass('ALL')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-headline font-bold transition ${
              selectedClass === 'ALL'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            All Physics ({PHYSICS_MIND_MAPS.length})
          </button>
          <button
            onClick={() => setSelectedClass('11')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-headline font-bold transition ${
              selectedClass === '11'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            Class 11 ({class11Count})
          </button>
          <button
            onClick={() => setSelectedClass('12')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-headline font-bold transition ${
              selectedClass === '12'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b]'
            }`}
          >
            Class 12 ({class12Count})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <StitchIcon
            name="search"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777587]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters, formulas, topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-xs font-medium text-[#141b2b] placeholder-[#777587] focus:outline-hidden focus:border-[#3525cd] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777587] hover:text-[#141b2b]"
            >
              &times;
            </button>
          )}
        </div>
      </section>

      {/* Main Feature: Active Mind Map Display */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]" />
            <h2 className="text-sm font-headline font-bold text-[#141b2b] uppercase tracking-wider">
              Currently Selected Chapter Mind Map
            </h2>
          </div>

          <Link
            href={`/ncert?subject=PHYSICS`}
            className="text-xs font-semibold text-[#3525cd] hover:underline flex items-center gap-1"
          >
            <span>Open NCERT Reader</span>
            <StitchIcon name="arrow_forward" size={14} />
          </Link>
        </div>

        <ChapterMindMapCard
          mindMaps={relatedChapterMaps}
          defaultSelectedId={activeMap.id}
          showAllEditions={true}
        />
      </section>

      {/* Chapter Selection Grid */}
      <section className="space-y-4 pt-4 border-t border-[#e9edff]">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-headline font-bold text-[#141b2b]">
              Browse All Physics Chapters ({filteredMaps.length})
            </h3>
            <p className="text-xs text-[#777587]">
              Select any chapter below to load its full-resolution visual revision sheet
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaps.map((map) => {
            const isSelected = map.id === activeMap.id;

            return (
              <div
                key={map.id}
                onClick={() => {
                  setSelectedMapId(map.id);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#3525cd] bg-[#f2f4ff] shadow-sm ring-2 ring-[#3525cd]/20'
                    : 'bg-white border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        map.classLevel === 11
                          ? 'bg-[#e0e7ff] text-[#3730a3]'
                          : 'bg-[#fae8ff] text-[#86198f]'
                      }`}
                    >
                      Class {map.classLevel} &bull; Ch {map.chapterNumber}
                    </span>

                    {map.status === 'LEGACY' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#fef3c7] text-[#92400e]">
                        Legacy
                      </span>
                    ) : map.editionType === 'EXTENDED' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#dcfce7] text-[#166534]">
                        Extended
                      </span>
                    ) : null}
                  </div>

                  <h4 className="text-sm font-headline font-bold text-[#141b2b] line-clamp-1">
                    {map.chapterTitle}
                  </h4>
                  <p className="text-xs text-[#777587] line-clamp-2">
                    {map.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#f1f3ff] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#3525cd] flex items-center gap-1">
                    <StitchIcon name="visibility" size={14} />
                    <span>{isSelected ? 'Viewing Now' : 'Load Mind Map'}</span>
                  </span>

                  <span className="text-[10px] text-[#777587]">
                    {(map.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB PNG
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function MindMapStudioPage() {
  return (
    <AppShell
      title="Physics Mind Map Studio"
      subtitle="Complete Class 11 &amp; 12 NCERT Visual Revision"
      showBack={true}
      backHref="/"
    >
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-[#777587]">
            Loading Physics Mind Map Studio...
          </div>
        }
      >
        <MindMapStudioContent />
      </Suspense>
    </AppShell>
  );
}
