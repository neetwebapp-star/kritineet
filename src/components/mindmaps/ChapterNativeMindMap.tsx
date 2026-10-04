'use client';

import React from 'react';
import { NativeChemistryCh1MindMap } from './NativeChemistryCh1MindMap';

interface ChapterNativeMindMapProps {
  chapterId?: string;
  chapterSlug?: string;
  chapterTitle?: string;
  classLevel?: number | string;
  subject?: string;
}

export function ChapterNativeMindMap({
  chapterId,
  chapterSlug = '',
  chapterTitle = '',
  classLevel,
  subject = '',
}: ChapterNativeMindMapProps) {
  const normSlug = chapterSlug.toLowerCase().trim();
  const normTitle = chapterTitle.toLowerCase().trim();
  const normSubj = subject.toLowerCase().trim();

  // Class 11 Chemistry Ch 1
  const isChemCh1 =
    normSlug === 'some-basic-concepts-of-chemistry' ||
    normTitle.includes('some basic concepts of chemistry') ||
    chapterId === 'cmunm1fgr000xevz01a6mbtmt' ||
    chapterId === 'CH_KECH101';

  if (isChemCh1) {
    return <NativeChemistryCh1MindMap />;
  }

  // Placeholder for future automated native chapters
  return (
    <div className="bg-white rounded-3xl p-8 border border-[#e9edff] text-center space-y-3">
      <div className="inline-block px-3 py-1 rounded-full bg-[#f1f3ff] text-[#3525cd] text-xs font-bold uppercase tracking-wider">
        Native Vector Mind Map
      </div>
      <h3 className="text-lg font-headline font-bold text-[#141b2b]">
        {chapterTitle || 'Chapter Mind Map'}
      </h3>
      <p className="text-xs text-[#777587] max-w-md mx-auto">
        This chapter&apos;s scalable HTML/SVG mind map is currently being prepared with interactive vector equations and A4 print support.
      </p>
    </div>
  );
}
