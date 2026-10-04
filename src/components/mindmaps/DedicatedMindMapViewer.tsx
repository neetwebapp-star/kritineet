'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { UnifiedMindMapMeta } from '@/lib/mindmaps/unified-mindmap-registry';

interface DedicatedMindMapViewerProps {
  mindMap: UnifiedMindMapMeta | null;
  chapterTitle?: string;
  chapterNumber?: number;
  subjectName?: string;
  classLevel?: number | string;
  backHref?: string;
  onBack?: () => void;
}

export function DedicatedMindMapViewer({
  mindMap,
  chapterTitle,
  chapterNumber,
  subjectName,
  classLevel,
  backHref,
  onBack,
}: DedicatedMindMapViewerProps) {
  const router = useRouter();
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  const displayTitle = mindMap?.title || `${chapterTitle || 'Chapter'} Mind Map`;
  const displayChapter =
    chapterTitle || mindMap?.chapterTitle || `Chapter ${chapterNumber || mindMap?.chapterNumber || ''}`;
  const displaySubject = subjectName || mindMap?.subject || 'NEET';
  const displayClass = classLevel || mindMap?.classLevel || 11;
  const displayChapterNum = chapterNumber || mindMap?.chapterNumber || 1;

  // Reset zoom & pan when mind map changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [mindMap?.id]);

  // Keyboard navigation (+, -, 0, f, esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleFitToScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleFitToScreen = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!mindMap?.assetUrl) return;
    const link = document.createElement('a');
    link.href = mindMap.assetUrl;
    link.download = mindMap.downloadFileName || `${displayTitle.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => {
      const next = Math.min(Math.max(Number((prev + zoomFactor).toFixed(2)), 0.5), 4.0);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse drag pan
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

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchDistanceRef.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
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
        const next = Math.min(Math.max(Number((prev + diff * 0.01).toFixed(2)), 0.5), 4.0);
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

  // If no mind map available
  if (!mindMap) {
    return (
      <div className="min-h-screen bg-[#0c0f1d] text-white flex flex-col justify-between">
        <header className="px-4 py-3 sm:px-6 bg-[#141b2b] border-b border-[#2d3748] flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-3 py-1.5 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <StitchIcon name="arrow_back" size={16} />
            <span>Back to Chapter</span>
          </button>
          <div className="text-center">
            <h1 className="text-sm sm:text-base font-headline font-bold text-white">
              {displayChapter}
            </h1>
          </div>
          <div className="w-20" />
        </header>

        <div className="max-w-md mx-auto p-8 text-center space-y-4 my-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#232d42] text-[#a0aec0] flex items-center justify-center mx-auto">
            <StitchIcon name="account_tree" size={28} />
          </div>
          <h2 className="text-lg font-headline font-bold text-white">
            Mind Map is not available yet
          </h2>
          <p className="text-xs text-[#a0aec0]">
            The dedicated visual mind map for &ldquo;{displayChapter}&rdquo; is currently being compiled into the curriculum library.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition"
          >
            <StitchIcon name="arrow_back" size={14} />
            <span>Return to Chapter</span>
          </button>
        </div>

        <footer className="px-4 py-3 bg-[#141b2b] border-t border-[#2d3748] text-center text-xs text-[#718096]">
          Kriti NEET &bull; Canonical Curriculum
        </footer>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0c0f1d] text-white flex flex-col justify-between select-none overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      {/* Print-only CSS styling */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .mindmap-no-print {
            display: none !important;
          }
          .mindmap-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .mindmap-print-area img {
            max-width: 100% !important;
            max-height: 100% !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* 1. TOP HEADER BAR */}
      <header className="mindmap-no-print px-3 py-2.5 sm:px-6 sm:py-3 bg-[#141b2b]/95 backdrop-blur-md border-b border-[#2d3748] flex items-center justify-between gap-3 z-30">
        {/* Left: Back button & Chapter Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="px-3 py-1.5 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-[#cbd5e0] hover:text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            title="Back to Chapter"
          >
            <StitchIcon name="arrow_back" size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <span className="px-2.5 py-1 rounded-lg bg-[#3525cd] text-white text-[11px] font-bold uppercase tracking-wider flex-shrink-0 hidden xs:inline-block">
            Class {displayClass} &bull; Ch {displayChapterNum}
          </span>

          <div className="truncate">
            <h1 className="text-xs sm:text-sm md:text-base font-headline font-bold text-white truncate">
              {displayTitle}
            </h1>
            <p className="text-[11px] text-[#a0aec0] truncate hidden md:block">
              {displaySubject} &bull; {displayChapter} &bull; Original High-Resolution Asset
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-[#cbd5e0] hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Print Mind Map"
          >
            <StitchIcon name="print" size={16} />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Download / Save button */}
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Save / Download Original High-Res File"
          >
            <StitchIcon name="download" size={16} />
            <span className="hidden sm:inline">Download High-Res</span>
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-[#cbd5e0] hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <StitchIcon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEWER CANVAS */}
      <main
        className="relative flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4 mindmap-print-area"
        onWheel={mindMap.fileType === 'image' ? handleWheel : undefined}
        onMouseDown={mindMap.fileType === 'image' ? handleMouseDown : undefined}
        onMouseMove={mindMap.fileType === 'image' ? handleMouseMove : undefined}
        onTouchStart={mindMap.fileType === 'image' ? handleTouchStart : undefined}
        onTouchMove={mindMap.fileType === 'image' ? handleTouchMove : undefined}
        onTouchEnd={mindMap.fileType === 'image' ? handleTouchEnd : undefined}
        style={{
          cursor:
            mindMap.fileType === 'image'
              ? scale > 1
                ? isDragging
                  ? 'grabbing'
                  : 'grab'
                : 'default'
              : 'default',
        }}
      >
        {/* PDF Viewer */}
        {mindMap.fileType === 'pdf' && (
          <div className="w-full h-full bg-[#1a202c] rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src={mindMap.assetUrl}
              className="w-full h-full border-0 rounded-xl"
              title={displayTitle}
            />
          </div>
        )}

        {/* HTML Viewer */}
        {mindMap.fileType === 'html' && (
          <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src={mindMap.assetUrl}
              className="w-full h-full border-0 rounded-xl"
              title={displayTitle}
            />
          </div>
        )}

        {/* Original High-Resolution Image Viewer */}
        {mindMap.fileType === 'image' && (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white z-10">
                <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#a0aec0] font-headline font-semibold">
                  Loading original high-resolution mind map...
                </p>
              </div>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mindMap.assetUrl}
              alt={displayTitle}
              onLoad={() => setImageLoaded(true)}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.12s ease-out',
                maxWidth: '96%',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
              className={`rounded-xl shadow-2xl pointer-events-none transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
            />
          </>
        )}
      </main>

      {/* 3. BOTTOM FLOATING CONTROLS TOOLBAR */}
      <footer className="mindmap-no-print px-4 py-2.5 sm:py-3 bg-[#141b2b]/95 backdrop-blur-md border-t border-[#2d3748] flex items-center justify-between gap-3 z-30">
        <div className="text-xs text-[#a0aec0] hidden md:flex items-center gap-3">
          <span>💡 <strong>Wheel / Pinch</strong> to zoom</span>
          <span>&bull;</span>
          <span><strong>Drag</strong> to pan</span>
          <span>&bull;</span>
          <span><strong>0</strong> to reset</span>
        </div>

        {/* Zoom & Fit-to-screen controls */}
        <div className="flex items-center justify-center gap-2 mx-auto md:mx-0">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-white disabled:opacity-40 transition cursor-pointer"
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
            className="p-2 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-white disabled:opacity-40 transition cursor-pointer"
            title="Zoom In (+)"
          >
            <StitchIcon name="add" size={18} />
          </button>

          <button
            onClick={handleFitToScreen}
            className="px-3 py-1.5 rounded-xl bg-[#232d42] hover:bg-[#323f5b] text-xs font-semibold text-white transition flex items-center gap-1 cursor-pointer"
            title="Fit to Screen (0)"
          >
            <StitchIcon name="restart_alt" size={16} />
            <span>Fit to Screen</span>
          </button>
        </div>

        {/* Mobile Download Shortcut */}
        <div className="md:hidden">
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold transition flex items-center gap-1"
            title="Download"
          >
            <StitchIcon name="download" size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
