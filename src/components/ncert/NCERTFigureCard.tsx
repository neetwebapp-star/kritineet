'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export interface FigureItem {
  id?: string;
  figureNumber?: string;
  caption?: string;
  imagePath: string;
  pageNumber?: number;
}

interface NCERTFigureCardProps {
  figureNumber?: string;
  caption?: string;
  imagePath?: string;
  pageNumber?: number;
  figures?: FigureItem[];
  onZoom?: (imagePath: string) => void;
}

export function NCERTFigureCard({
  figureNumber,
  caption,
  imagePath,
  pageNumber,
  figures,
  onZoom,
}: NCERTFigureCardProps) {
  // If figures array is provided, render each figure
  const figureList: FigureItem[] = React.useMemo(() => {
    if (figures && figures.length > 0) {
      return figures;
    }
    if (imagePath) {
      return [
        {
          figureNumber,
          caption,
          imagePath,
          pageNumber,
        },
      ];
    }
    return [];
  }, [figures, imagePath, figureNumber, caption, pageNumber]);

  if (figureList.length === 0) return null;

  return (
    <div className="space-y-4">
      {figureList.map((fig, idx) => (
        <div
          key={fig.id || `${fig.imagePath}-${idx}`}
          className="bg-white rounded-3xl p-5 border border-[#e9edff] shadow-[0_2px_12px_rgba(20,27,43,0.03)] space-y-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f3ff]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#e2dfff] text-[#3525cd] flex items-center justify-center flex-shrink-0">
                <StitchIcon name="image" size={15} />
              </div>
              <span className="font-headline font-bold text-xs sm:text-sm text-[#141b2b]">
                NCERT Figure
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#991b1b]">
                Important Figure
              </span>
              {onZoom && (
                <button
                  type="button"
                  onClick={() => onZoom(fig.imagePath)}
                  className="text-[#777587] hover:text-[#3525cd] transition p-1 hover:bg-[#f1f3ff] rounded-lg cursor-pointer"
                  title="Expand Figure"
                >
                  <StitchIcon name="fullscreen" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Image Container */}
          <div
            onClick={() => onZoom && onZoom(fig.imagePath)}
            className="w-full min-h-[180px] max-h-[260px] bg-white rounded-2xl border border-[#f1f3ff] p-3 flex items-center justify-center overflow-hidden cursor-pointer group relative hover:border-[#3525cd] transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fig.imagePath}
              alt={fig.caption || `Figure ${fig.figureNumber || ''}`}
              className="max-h-[230px] max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.figure-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="figure-fallback hidden absolute inset-0 flex-col items-center justify-center p-4 text-center bg-[#f9f9ff] text-[#3525cd]">
              <StitchIcon name="auto_stories" size={28} />
              <span className="text-xs font-bold mt-1">Figure {fig.figureNumber}</span>
              <span className="text-[11px] text-[#777587]">Official NCERT High Resolution Diagram</span>
            </div>
          </div>

          {/* Caption */}
          <div className="text-center pt-1">
            <h5 className="font-headline font-bold text-xs sm:text-sm text-[#141b2b]">
              {fig.figureNumber ? `Figure ${fig.figureNumber}` : 'NCERT Diagram'}{' '}
              {fig.caption && <span className="font-normal text-[#464555]">{fig.caption}</span>}
            </h5>
            {fig.pageNumber && (
              <span className="text-[11px] text-[#777587] block mt-0.5">
                NCERT Page {fig.pageNumber}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
