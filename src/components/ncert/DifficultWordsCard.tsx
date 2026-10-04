'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { WordMeaning } from './NCERTHighlightEngine';

interface DifficultWordsCardProps {
  words: WordMeaning[];
}

export function DifficultWordsCard({ words }: DifficultWordsCardProps) {
  if (!words || words.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#e9edff] shadow-[0_2px_12px_rgba(20,27,43,0.03)] space-y-3.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#e7fbf1] text-[#006c49] flex items-center justify-center flex-shrink-0">
          <StitchIcon name="auto_stories" size={15} />
        </div>
        <h4 className="font-headline font-bold text-sm text-[#141b2b]">
          Difficult Words <span className="text-[#777587] font-normal">— Quick Meaning</span>
        </h4>
      </div>

      {/* Words List */}
      <div className="divide-y divide-[#f1f3ff] text-xs">
        {words.map((item, idx) => (
          <div key={idx} className="py-2.5 flex items-start gap-2.5">
            <span className="font-bold text-[#3525cd] min-w-[95px] sm:min-w-[105px] flex-shrink-0">
              {item.term}
            </span>
            <span className="text-[#777587] flex-shrink-0">&rarr;</span>
            <span className="text-[#464555] font-medium leading-relaxed">
              {item.hindi}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
