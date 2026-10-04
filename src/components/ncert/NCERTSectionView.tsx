'use client';

import React from 'react';
import Link from 'next/link';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { NCERTTextCard } from './NCERTTextCard';
import { NEETLensCard } from './NEETLensCard';
import { KeyTakeawaysCard } from './KeyTakeawaysCard';
import { ImportantTermsCard } from './ImportantTermsCard';
import { DifficultWordsCard } from './DifficultWordsCard';
import { NCERTFigureCard } from './NCERTFigureCard';
import { NCERTTableCard } from './NCERTTableCard';
import {
  extractDifficultWords,
  extractImportantTerms,
  generateNeetLens,
  generateKeyTakeaways,
} from './NCERTHighlightEngine';
import { ReadingMode } from './NCERTHeader';

interface NCERTSectionViewProps {
  topic: {
    id: string;
    topicNumber: string;
    title: string;
    pageStart?: number;
    pageEnd?: number;
    sourceProvenance?: string;
    contentHtml?: string;
    contentMarkdown?: string;
    figures?: Array<{
      id: string;
      figureNumber: string;
      caption: string;
      imagePath: string;
      pageNumber: number;
    }>;
    tables?: Array<{
      id: string;
      tableNumber: string;
      caption: string;
      htmlContent: string;
      pageNumber?: number;
    }>;
  };
  subjectName?: string;
  readingMode: ReadingMode;
  showHighlights: boolean;
  onToggleHighlights: (show: boolean) => void;
  onImageClick?: (src: string) => void;
  prevTopic?: { id: string; topicNumber: string; title: string } | null;
  nextTopic?: { id: string; topicNumber: string; title: string } | null;
  onFinishChapter?: () => void;
  onOpenDpp?: () => void;
  onOpenMtg?: () => void;
  recallState?: {
    answer: string;
    verified: boolean;
    error: boolean;
    onAnswerChange: (val: string) => void;
    onVerify: () => void;
  };
}

export const NCERTSectionView: React.FC<NCERTSectionViewProps> = ({
  topic,
  subjectName = 'Biology',
  readingMode,
  showHighlights,
  onToggleHighlights,
  onImageClick,
  prevTopic,
  nextTopic,
  onFinishChapter,
  onOpenDpp,
  onOpenMtg,
  recallState,
}) => {
  // Extract intelligent semantic entities using NCERTHighlightEngine
  const rawText = topic.contentMarkdown || topic.contentHtml || '';
  const difficultWords = React.useMemo(
    () => extractDifficultWords(rawText, subjectName, topic.title),
    [rawText, subjectName, topic.title]
  );
  const importantTerms = React.useMemo(
    () => extractImportantTerms(rawText, topic.title),
    [rawText, topic.title]
  );
  const neetLensInsights = React.useMemo(
    () => generateNeetLens(topic.title, rawText, subjectName),
    [topic.title, rawText, subjectName]
  );
  const keyTakeaways = React.useMemo(
    () => generateKeyTakeaways(topic.title, rawText),
    [topic.title, rawText]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* 1. Clean Section Header matching reference */}
      <div className="flex items-center justify-between gap-4 pt-1 pb-1 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#3525cd] text-white flex items-center justify-center font-headline font-bold text-base shadow-xs flex-shrink-0">
            {topic.topicNumber}
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#141b2b] tracking-tight">
            {topic.title}
          </h1>
          <span className="bg-[#eeedfe] text-[#3525cd] px-3.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border border-[#c3c0ff]">
            NCERT Page {topic.pageStart || 1}
            {topic.pageEnd && topic.pageEnd !== topic.pageStart ? `-${topic.pageEnd}` : ''}
          </span>
        </div>
      </div>

      {/* 2. Reading Grid Layout according to selected mode */}
      {readingMode === 'focus' ? (
        /* Focus Mode: Centered, clean, distraction-free */
        <div className="max-w-4xl mx-auto space-y-6">
          <NCERTTextCard
            contentHtml={topic.contentHtml}
            contentMarkdown={topic.contentMarkdown}
            sourceProvenance={topic.sourceProvenance}
            showHighlights={showHighlights}
            onToggleHighlights={() => onToggleHighlights(!showHighlights)}
          />

          {topic.figures && topic.figures.length > 0 && (
            <NCERTFigureCard figures={topic.figures} onZoom={onImageClick} />
          )}

          {topic.tables && topic.tables.length > 0 && (
            <NCERTTableCard tables={topic.tables} />
          )}
        </div>
      ) : readingMode === 'revision' ? (
        /* Revision Mode: Prioritizes Takeaways, NEET Lens, & Key Terms */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <KeyTakeawaysCard takeaways={keyTakeaways} />
            <NEETLensCard insights={neetLensInsights} />
            <NCERTTextCard
              contentHtml={topic.contentHtml}
              contentMarkdown={topic.contentMarkdown}
              sourceProvenance={topic.sourceProvenance}
              showHighlights={true}
              onToggleHighlights={() => onToggleHighlights(!showHighlights)}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ImportantTermsCard terms={importantTerms} />
            <DifficultWordsCard words={difficultWords} />
            {topic.figures && topic.figures.length > 0 && (
              <NCERTFigureCard figures={topic.figures} onZoom={onImageClick} />
            )}
            {topic.tables && topic.tables.length > 0 && (
              <NCERTTableCard tables={topic.tables} />
            )}
          </div>
        </div>
      ) : (
        /* Learning Mode (Default): 2-Column Balanced Textbook & Intelligent Aids */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Reading Column (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <NCERTTextCard
              contentHtml={topic.contentHtml}
              contentMarkdown={topic.contentMarkdown}
              sourceProvenance={topic.sourceProvenance}
              showHighlights={showHighlights}
              onToggleHighlights={() => onToggleHighlights(!showHighlights)}
            />

            {/* Side-by-side NEET Lens & Key Takeaways matching reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NEETLensCard insights={neetLensInsights} />
              <KeyTakeawaysCard takeaways={keyTakeaways} />
            </div>
          </div>

          {/* Auxiliary Terminology & Visuals Column (Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <ImportantTermsCard terms={importantTerms} />

            <DifficultWordsCard words={difficultWords} />

            {topic.figures && topic.figures.length > 0 && (
              <NCERTFigureCard figures={topic.figures} onZoom={onImageClick} />
            )}

            {topic.tables && topic.tables.length > 0 && (
              <NCERTTableCard tables={topic.tables} />
            )}
          </div>
        </div>
      )}

      {/* 3. Bottom Navigation Controls */}
      <footer className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8edfb] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {prevTopic ? (
            <Link
              href={`/ncert/topic/${prevTopic.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e2e7f8] bg-[#f9f9ff] text-xs sm:text-sm font-semibold text-[#464555] hover:bg-[#eef2ff] hover:text-[#3525cd] transition-all"
            >
              <StitchIcon name="arrow_back" size={16} />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                Previous: {prevTopic.topicNumber} {prevTopic.title}
              </span>
            </Link>
          ) : (
            <span className="text-xs text-[#777587] font-medium px-3 py-2">
              Beginning of Chapter
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenMtg && (
            <button
              onClick={onOpenMtg}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#3525cd] bg-[#eeedfe] hover:bg-[#e0ddfc] transition-colors inline-flex items-center gap-1.5"
            >
              <StitchIcon name="checklist" size={15} />
              <span>Practice MTG</span>
            </button>
          )}

          {onOpenDpp && (
            <button
              onClick={onOpenDpp}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#006c49] bg-[#e7fbf1] hover:bg-[#d0f6e3] transition-colors inline-flex items-center gap-1.5"
            >
              <StitchIcon name="local_fire_department" size={15} />
              <span>Topic DPP</span>
            </button>
          )}

          {nextTopic ? (
            <Link
              href={`/ncert/topic/${nextTopic.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#2a1ca4] active:scale-95 transition-all"
            >
              <span className="truncate max-w-[160px] sm:max-w-[240px]">
                Next: {nextTopic.topicNumber} {nextTopic.title}
              </span>
              <StitchIcon name="arrow_forward" size={16} />
            </Link>
          ) : onFinishChapter ? (
            <button
              onClick={onFinishChapter}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006c49] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#005237] active:scale-95 transition-all"
            >
              <span>Finish Chapter 🎉</span>
              <StitchIcon name="emoji_events" size={16} />
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
};
