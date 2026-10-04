'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { applyPastelHighlights } from './NCERTHighlightEngine';

interface NCERTTextCardProps {
  contentHtml?: string;
  contentMarkdown?: string;
  showHighlights: boolean;
  onToggleHighlights: () => void;
  sectionNumber?: string;
  title?: string;
  sourceProvenance?: string;
}

export function NCERTTextCard({
  contentHtml,
  contentMarkdown,
  showHighlights,
  onToggleHighlights,
  sourceProvenance,
}: NCERTTextCardProps) {
  // If HTML is provided, clean and prepare for rendering
  const processedHtml = React.useMemo(() => {
    let raw = contentHtml || contentMarkdown || '';
    if (!raw) return '<p class="text-sm text-[#777587]">Loading NCERT canonical text...</p>';

    // If HTML contains outer boilerplate wrapper from previous ingestion, unwrap to expose genuine NCERT text
    let textBody = raw.trim();
    if (textBody.includes('ncert-structured-learning')) {
      const h3Idx = textBody.indexOf('</h3>');
      if (h3Idx !== -1) {
        const divAfterH3 = textBody.indexOf('</div>', h3Idx);
        if (divAfterH3 !== -1) {
          textBody = textBody.substring(divAfterH3 + 6).trim();
        }
      }
      while (textBody.endsWith('</div>')) {
        textBody = textBody.slice(0, -6).trim();
      }
    }

    if (showHighlights) {
      return applyPastelHighlights(textBody);
    }
    return textBody;
  }, [contentHtml, contentMarkdown, showHighlights]);

  return (
    <article className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e9edff] shadow-[0_2px_12px_rgba(20,27,43,0.03)] space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3ff]">
        <div className="flex items-center gap-2 text-[#141b2b]">
          <div className="w-7 h-7 rounded-lg bg-[#eeedfe] text-[#3525cd] flex items-center justify-center flex-shrink-0">
            <StitchIcon name="menu_book" size={17} />
          </div>
          <h3 className="font-headline font-bold text-sm sm:text-base text-[#141b2b]">
            NCERT Text <span className="text-[#777587] font-normal">(Original)</span>
          </h3>
        </div>

        {/* Toggle Highlights switch */}
        <button
          type="button"
          onClick={onToggleHighlights}
          className="flex items-center gap-2 cursor-pointer select-none group focus:outline-none"
          role="switch"
          aria-checked={showHighlights}
        >
          <span className="text-xs font-semibold text-[#464555] group-hover:text-[#3525cd] transition-colors hidden sm:inline">
            Show Highlights
          </span>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              showHighlights ? 'bg-[#3525cd]' : 'bg-[#d8e0ff]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                showHighlights ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Verbatim NCERT Canonical Reading Body */}
      <div
        className="prose prose-slate max-w-none text-sm sm:text-[15px] leading-[1.8] text-[#141b2b] [&>h3]:font-bold [&>h3]:text-base [&>h3]:text-[#3525cd] [&>h3]:mt-4 [&>h4]:font-bold [&>h4]:text-sm [&>p]:mb-3.5 [&>p]:text-[#141b2b] [&>p]:font-normal selection:bg-[#c3c0ff]"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </article>
  );
}
