'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export interface SidebarChapter {
  id: string;
  chapterNumber: number;
  title: string;
  slug?: string;
  topics: Array<{
    id: string;
    topicNumber: string;
    title: string;
  }>;
}

interface NCERTSidebarProps {
  subjectName: string;
  classLevelName: string;
  currentChapterId: string;
  currentTopicId: string;
  chapters: SidebarChapter[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const NCERTSidebar: React.FC<NCERTSidebarProps> = ({
  subjectName,
  classLevelName,
  currentChapterId,
  currentTopicId,
  chapters,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  // By default, current chapter is expanded
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      initial[ch.id] = ch.id === currentChapterId;
    });
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fcfdff] border-r border-[#e8edfb] w-72 lg:w-80">
      {/* Header */}
      <div className="p-4 border-b border-[#e8edfb] bg-white flex items-center justify-between">
        <Link
          href="/ncert"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#464555] hover:text-[#3525cd] transition-colors"
        >
          <span className="w-6 h-6 rounded-full bg-[#f1f3ff] text-[#3525cd] flex items-center justify-center">
            <StitchIcon name="arrow_back" size={14} />
          </span>
          <span>{subjectName || 'Biology'} — {classLevelName || 'Class 11'}</span>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#777587] hover:bg-[#f1f3ff]"
            aria-label="Close sidebar"
          >
            <StitchIcon name="close" size={18} />
          </button>
        )}
      </div>

      {/* Chapters & Topics List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {chapters.map((ch) => {
          const isCurrentChapter = ch.id === currentChapterId;
          const isExpanded = !!expandedChapters[ch.id];

          return (
            <div key={ch.id} className="rounded-xl overflow-hidden transition-all">
              {/* Chapter Header Button */}
              <button
                type="button"
                onClick={() => toggleChapter(ch.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-bold rounded-xl transition-all ${
                  isCurrentChapter
                    ? 'text-[#141b2b] bg-[#f4f6ff]'
                    : 'text-[#464555] hover:bg-[#f8f9ff] hover:text-[#141b2b]'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                      isCurrentChapter
                        ? 'bg-[#3525cd] text-white'
                        : 'bg-[#e9edff] text-[#464555]'
                    }`}
                  >
                    {ch.chapterNumber}
                  </span>
                  <span className="truncate">{ch.title}</span>
                </div>

                <StitchIcon
                  name={isExpanded ? 'expand_more' : 'chevron_right'}
                  size={16}
                  className={`text-[#777587] transition-transform ${isExpanded ? 'rotate-0' : ''}`}
                />
              </button>

              {/* Topics Sub-tree */}
              {isExpanded && ch.topics && ch.topics.length > 0 && (
                <div className="mt-1 ml-4 pl-2 border-l-2 border-[#e8edfb] space-y-0.5 pb-1">
                  {ch.topics.map((t) => {
                    const isActive = t.id === currentTopicId;

                    return (
                      <Link
                        key={t.id}
                        href={`/ncert/topic/${t.id}`}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#eeedfe] text-[#3525cd] font-bold shadow-2xs'
                            : 'text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-[#3525cd]' : 'bg-[#c3c0ff]'
                          }`}
                        />
                        <span className="truncate">
                          {t.topicNumber} {t.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
