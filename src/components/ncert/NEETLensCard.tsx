'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface NEETLensCardProps {
  insights: string[];
}

export function NEETLensCard({ insights }: NEETLensCardProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-[#f8f7ff] border border-[#e2dfff] shadow-[0_2px_10px_rgba(53,37,205,0.03)] space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
          <StitchIcon name="track_changes" size={16} />
        </div>
        <h4 className="font-headline font-bold text-sm sm:text-base text-[#141b2b]">
          NEET Lens
        </h4>
      </div>

      {/* Bullet Points */}
      <ul className="space-y-2 text-xs sm:text-[13px] text-[#464555] leading-relaxed">
        {insights.map((pt, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd] mt-2 flex-shrink-0" />
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
