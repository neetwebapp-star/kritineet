'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface KeyTakeawaysCardProps {
  takeaways: string[];
}

export function KeyTakeawaysCard({ takeaways }: KeyTakeawaysCardProps) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-[#fbf9fe] border border-[#ede9fe] shadow-[0_2px_10px_rgba(53,37,205,0.02)] space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center flex-shrink-0 shadow-2xs">
          <StitchIcon name="lightbulb" size={16} />
        </div>
        <h4 className="font-headline font-bold text-sm sm:text-base text-[#141b2b]">
          Key Takeaways
        </h4>
      </div>

      {/* Bullet Points with Green Checkmarks */}
      <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#464555] leading-relaxed">
        {takeaways.map((pt, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#006c49] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-2xs">
              ✓
            </span>
            <span className="font-medium text-[#141b2b]">{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
