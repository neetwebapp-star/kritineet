'use client';

import React, { useState } from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { PhysicsMindMapMeta } from '@/lib/mindmaps/physics-mindmap-registry';
import { MindMapLightboxViewer } from './MindMapLightboxViewer';

interface ChapterMindMapCardProps {
  mindMaps: PhysicsMindMapMeta[];
  defaultSelectedId?: string;
  showAllEditions?: boolean;
}

export function ChapterMindMapCard({
  mindMaps,
  defaultSelectedId,
  showAllEditions = true,
}: ChapterMindMapCardProps) {
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId || mindMaps[0]?.id || ''
  );
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);

  if (!mindMaps || mindMaps.length === 0) return null;

  const currentMap = mindMaps.find((m) => m.id === selectedId) || mindMaps[0];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = currentMap.assetUrl;
    link.download = currentMap.downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e9edff] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f3ff] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#3525cd] uppercase tracking-wider">
              High-Yield Mind Map
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555]">
              Class {currentMap.classLevel} &bull; Ch {currentMap.chapterNumber}
            </span>
            {currentMap.status === 'LEGACY' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fff0c0] text-[#745500]">
                Legacy Revision
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-xl font-headline font-bold text-[#141b2b]">
            {currentMap.title}
          </h3>
          <p className="text-xs text-[#777587] mt-1 max-w-2xl leading-relaxed">
            {currentMap.description}
          </p>
        </div>

        {/* Edition selector if chapter has multiple maps (e.g. Rotational Motion) */}
        {showAllEditions && mindMaps.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-[#f1f3ff] rounded-xl self-start sm:self-center">
            {mindMaps.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition ${
                  m.id === currentMap.id
                    ? 'bg-white text-[#3525cd] shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b]'
                }`}
              >
                {m.editionType === 'PRIMARY' ? 'Standard NCERT' : 'Deep-Dive Edition'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Key Topics Pills */}
      {currentMap.keyTopics && currentMap.keyTopics.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider block">
            Core Concepts Mapped:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentMap.keyTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-[#f9f9ff] border border-[#e9edff] text-[11px] font-medium text-[#464555]"
              >
                &bull; {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clickable High-Resolution Preview Card */}
      <div
        onClick={() => setIsViewerOpen(true)}
        className="relative group rounded-2xl overflow-hidden border border-[#e9edff] bg-[#0c0f1d] cursor-pointer shadow-sm transition hover:border-[#3525cd]/50 hover:shadow-md"
      >
        <div className="aspect-[16/10] sm:aspect-[21/9] max-h-[380px] w-full overflow-hidden flex items-center justify-center bg-[#f8fafc]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentMap.assetUrl}
            alt={currentMap.title}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Hover Overlay with Action Badges */}
        <div className="absolute inset-0 bg-[#0c0f1d]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <span className="px-4 py-2 rounded-xl bg-[#3525cd] text-white font-headline font-bold text-xs flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <StitchIcon name="zoom_in" size={16} />
            <span>Open Interactive Viewer &amp; Zoom</span>
          </span>
        </div>

        {/* Persistent bottom preview status badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-[#141b2b]/80 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1.5">
            <StitchIcon name="image" size={14} />
            <span>Original High-Resolution ({currentMap.dimensions.width}&times;{currentMap.dimensions.height})</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#3525cd]/90 backdrop-blur-sm text-white text-[11px] font-bold hidden sm:inline-flex items-center gap-1">
            <StitchIcon name="touch_app" size={14} />
            <span>Click to Expand</span>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-[#777587]">
          <StitchIcon name="verified" size={16} className="text-[#006c49]" />
          <span>Complete NCERT &bull; 100% High-Fidelity &bull; Mobile &amp; Desktop Optimized</span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsViewerOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#3525cd] font-headline font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <StitchIcon name="fullscreen" size={16} />
            <span>Open Fullscreen</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-headline font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <StitchIcon name="download" size={16} />
            <span>Download Mind Map ({(currentMap.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)</span>
          </button>
        </div>
      </div>

      {/* Interactive Lightbox Viewer Modal */}
      <MindMapLightboxViewer
        mindMap={currentMap}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}
