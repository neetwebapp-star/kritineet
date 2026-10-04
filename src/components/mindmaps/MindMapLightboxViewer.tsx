'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { PhysicsMindMapMeta } from '@/lib/mindmaps/physics-mindmap-registry';
import { ChemistryMindMapMeta } from '@/lib/mindmaps/chemistry-mindmap-registry';
import { BiologyMindMapMeta } from '@/lib/mindmaps/biology-mindmap-registry';
import { ChapterNativeMindMap } from '@/components/mindmaps/ChapterNativeMindMap';

export type AnyMindMapMeta = PhysicsMindMapMeta | ChemistryMindMapMeta | BiologyMindMapMeta;

interface MindMapLightboxViewerProps {
  mindMap: AnyMindMapMeta | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MindMapLightboxViewer({ mindMap, isOpen, onClose }: MindMapLightboxViewerProps) {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  // Reset zoom & position when a new mind map opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, mindMap]);

  // Keyboard navigation (Esc to close, +/- to zoom, 0 to reset)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.3).toFixed(2)), 4.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.3).toFixed(2)), 0.6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // High-Resolution Direct Download or Print
  const handleDownload = () => {
    if (!mindMap) return;
    if ('assetUrl' in mindMap && mindMap.assetUrl) {
      const link = document.createElement('a');
      link.href = mindMap.assetUrl;
      link.download = mindMap.downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => {
      const next = Math.min(Math.max(Number((prev + zoomFactor).toFixed(2)), 0.6), 4.0);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch handlers (Pinch-to-zoom & touch pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchDistanceRef.current = distance;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const diff = distance - touchDistanceRef.current;
      touchDistanceRef.current = distance;

      setScale((prev) => {
        const next = Math.min(Math.max(Number((prev + diff * 0.01).toFixed(2)), 0.6), 4.0);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  if (!isOpen || !mindMap) return null;

  const isNative = (mindMap as unknown as { type?: string }).type === 'native_html' || !('assetUrl' in mindMap) || !mindMap.assetUrl;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0c0f1d]/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Bar */}
      <header className="px-4 py-3 sm:px-6 bg-[#141b2b]/90 border-b border-[#2d3748] flex items-center justify-between gap-3 text-white z-20">
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2.5 py-1 rounded-lg bg-[#3525cd] text-white text-[11px] font-bold uppercase tracking-wider flex-shrink-0">
            Class {mindMap.classLevel} &bull; Ch {mindMap.chapterNumber}
          </span>
          <div className="truncate">
            <h2 className="text-sm sm:text-base font-headline font-bold text-white truncate">
              {mindMap.title}
            </h2>
            <p className="text-[11px] text-[#a0aec0] truncate hidden sm:block">
              {mindMap.chapterTitle} &bull;{' '}
              {isNative
                ? `Scalable HTML5/KaTeX Canvas (${mindMap.dimensions.width}\u00D7${mindMap.dimensions.height}px)`
                : `Original High-Resolution (${mindMap.dimensions.width}\u00D7${mindMap.dimensions.height}px)`}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title={isNative ? 'Print / Save as PDF' : 'Download Original High-Res Image'}
          >
            <StitchIcon name={isNative ? 'print' : 'download'} size={16} />
            <span className="hidden sm:inline">{isNative ? 'Print / PDF' : 'Download High-Res'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-[#cbd5e0] hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <StitchIcon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={18} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#232d42] hover:bg-[#e53e3e] text-[#cbd5e0] hover:text-white transition"
            title="Close Viewer (Esc)"
          >
            <StitchIcon name="close" size={18} />
          </button>
        </div>
      </header>

      {/* Main Interactive Canvas */}
      {isNative ? (
        <main className="relative flex-1 overflow-auto p-2 sm:p-6 flex flex-col items-center justify-start bg-[#0c0f1d]/90">
          <div className="w-full max-w-[1580px] my-auto">
            <ChapterNativeMindMap
              chapterId={mindMap.chapterId}
              chapterSlug={mindMap.chapterSlug}
              chapterTitle={mindMap.chapterTitle}
              classLevel={mindMap.classLevel}
              subject={mindMap.subject}
            />
          </div>
        </main>
      ) : (
        <main
          className="relative flex-1 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing p-2 sm:p-6"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white z-10">
              <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#a0aec0] font-headline font-semibold">
                Loading original 2.5MB high-resolution mind map...
              </p>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mindMap.assetUrl}
            alt={mindMap.title}
            onLoad={() => setImageLoaded(true)}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              maxWidth: '96%',
              maxHeight: '92vh',
              objectFit: 'contain',
            }}
            className={`rounded-xl shadow-2xl pointer-events-none transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            draggable={false}
          />
        </main>
      )}

      {/* Bottom Floating Controls Toolbar */}
      {isNative ? (
        <footer className="px-4 py-3 bg-[#141b2b]/90 border-t border-[#2d3748] flex items-center justify-between gap-3 text-white z-20">
          <div className="text-xs text-[#a0aec0] hidden sm:flex items-center gap-3">
            <span>✨ <strong>Scalable HTML5/KaTeX Canvas</strong></span>
            <span>&bull;</span>
            <span>100% Vector Sharpness from 50%&ndash;500% Zoom</span>
            <span>&bull;</span>
            <span><strong>Esc</strong> to close</span>
          </div>

          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <StitchIcon name="print" size={16} />
              <span>Print / Save as PDF (A4 Landscape)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-xs font-semibold text-white transition"
            >
              Close (Esc)
            </button>
          </div>
        </footer>
      ) : (
        <footer className="px-4 py-3 bg-[#141b2b]/90 border-t border-[#2d3748] flex items-center justify-between gap-3 text-white z-20">
          <div className="text-xs text-[#a0aec0] hidden md:flex items-center gap-3">
            <span>💡 <strong>Wheel / Pinch</strong> to zoom</span>
            <span>&bull;</span>
            <span><strong>Drag</strong> to pan</span>
            <span>&bull;</span>
            <span><strong>Esc</strong> to close</span>
          </div>

          <div className="flex items-center justify-center gap-2 mx-auto md:mx-0">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.6}
              className="p-2 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-white disabled:opacity-40 transition"
              title="Zoom Out (-)"
            >
              <StitchIcon name="remove" size={18} />
            </button>

            <span className="font-mono text-xs font-bold px-3 py-1 bg-[#232d42] rounded-lg min-w-[60px] text-center text-white">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={scale >= 4.0}
              className="p-2 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-white disabled:opacity-40 transition"
              title="Zoom In (+)"
            >
              <StitchIcon name="add" size={18} />
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-xs font-semibold text-white transition flex items-center gap-1"
              title="Reset to Fit Screen (0)"
            >
              <StitchIcon name="restart_alt" size={16} />
              <span>Reset</span>
            </button>

            <button
              onClick={handleDownload}
              className="md:hidden px-3 py-1.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold transition flex items-center gap-1"
              title="Download"
            >
              <StitchIcon name="download" size={16} />
              <span>Save</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
