'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface ImportantTermsCardProps {
  terms: string[];
}

export function ImportantTermsCard({ terms }: ImportantTermsCardProps) {
  if (!terms || terms.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#e9edff] shadow-[0_2px_12px_rgba(20,27,43,0.03)] space-y-3.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center flex-shrink-0">
          <StitchIcon name="star" size={15} />
        </div>
        <h4 className="font-headline font-bold text-sm text-[#141b2b]">
          Important Terms{' '}
          <span className="text-xs font-normal text-[#777587]">(From this section)</span>
        </h4>
      </div>

      {/* Terms Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {terms.map((term, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#f9f9ff] text-[#3525cd] border border-[#e2dfff] hover:border-[#3525cd] hover:bg-[#eeedfe] transition-colors cursor-default"
          >
            {term}
          </span>
        ))}
      </div>
    </div>
  );
}
