'use client';

import React from 'react';
import Link from 'next/link';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export type ReadingMode = 'focus' | 'learning' | 'revision';

interface NCERTHeaderProps {
  classLevelName: string;
  subjectName: string;
  chapterTitle: string;
  chapterNumber?: number;
  chapterId: string;
  topicNumber: string;
  readingMode: ReadingMode;
  onReadingModeChange: (mode: ReadingMode) => void;
  onToggleSidebarMobile?: () => void;
}

export const NCERTHeader: React.FC<NCERTHeaderProps> = ({
  classLevelName,
  subjectName,
  chapterTitle,
  chapterNumber,
  chapterId,
  topicNumber,
  readingMode,
  onReadingModeChange,
  onToggleSidebarMobile,
}) => {
  return (
    <header className="bg-white border-b border-[#e8edfb] px-4 sm:px-6 py-2.5 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Mobile Sidebar Toggle + Clean Breadcrumb matching reference */}
        <div className="flex items-center gap-2 text-xs sm:text-[13px]">
          {onToggleSidebarMobile && (
            <button
              onClick={onToggleSidebarMobile}
              className="lg:hidden p-1.5 rounded-xl bg-[#f1f3ff] text-[#3525cd] hover:bg-[#e2dfff] transition-colors"
              title="Toggle chapter outline"
              aria-label="Toggle chapter outline"
            >
              <StitchIcon name="menu" size={18} />
            </button>
          )}

          <nav className="flex items-center gap-2 text-[#777587] font-medium flex-wrap">
            <Link href="/ncert" className="hover:text-[#3525cd] transition-colors">
              {classLevelName || 'Class 11'}
            </Link>
            <span className="text-[#a5b4fc] font-bold">›</span>
            <span className="text-[#464555]">{subjectName || 'Physics'}</span>
            <span className="text-[#a5b4fc] font-bold">›</span>
            <Link
              href={`/ncert/chapter/${chapterId}`}
              className="hover:text-[#3525cd] text-[#464555] transition-colors"
            >
              {chapterNumber ? `Chapter ${chapterNumber}` : chapterTitle}
            </Link>
            <span className="text-[#a5b4fc] font-bold">›</span>
            <span className="text-[#3525cd] font-bold">{topicNumber}</span>
          </nav>
        </div>

        {/* Right: Reading Mode Buttons matching reference visual hierarchy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReadingModeChange('focus')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              readingMode === 'focus'
                ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                : 'bg-white text-[#464555] border-[#d8d8ee] hover:border-[#3525cd] hover:text-[#3525cd]'
            }`}
          >
            Focus Mode
          </button>

          <button
            type="button"
            onClick={() => onReadingModeChange('learning')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              readingMode === 'learning'
                ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                : 'bg-white text-[#464555] border-[#d8d8ee] hover:border-[#3525cd] hover:text-[#3525cd]'
            }`}
          >
            Learning Mode
          </button>

          <button
            type="button"
            onClick={() => onReadingModeChange('revision')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              readingMode === 'revision'
                ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                : 'bg-white text-[#464555] border-[#d8d8ee] hover:border-[#3525cd] hover:text-[#3525cd]'
            }`}
          >
            Revision Mode
          </button>
        </div>
      </div>
    </header>
  );
};
