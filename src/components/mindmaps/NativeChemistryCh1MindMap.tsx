'use client';

import React, { useState, useRef, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { StitchIcon } from '@/components/stitch/StitchIcon';

// Safe KaTeX Math component
function MathSpan({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return tex;
    }
  }, [tex, block]);

  if (block) {
    return (
      <div
        className="my-0.5 overflow-x-auto text-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function NativeChemistryCh1MindMap() {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="w-full space-y-4">
      {/* Global CSS for Sketch Styling & Print */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Patrick+Hand&family=Permanent+Marker&family=Kalam:wght@400;700&display=swap');

        .mindmap-font-marker {
          font-family: 'Permanent Marker', cursive, sans-serif;
        }
        .mindmap-font-caveat {
          font-family: 'Caveat', cursive, sans-serif;
        }
        .mindmap-font-hand {
          font-family: 'Patrick Hand', 'Kalam', cursive, -apple-system, sans-serif;
        }

        .mindmap-sheet-bg {
          background-color: #fdfbf7;
          background-image: 
            radial-gradient(#d5d0c5 0.75px, transparent 0.75px),
            radial-gradient(#e2ddd2 0.75px, #fdfbf7 0.75px);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }

        .sketch-box {
          border: 1.6px solid #2d3748;
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.94);
          box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.04);
        }

        .pill-badge-pink {
          background-color: #e11d48;
          color: white;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .pill-badge-blue {
          background-color: #0284c7;
          color: white;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 4mm;
          }
          body {
            background: transparent !important;
            padding: 0 !important;
          }
          .mindmap-no-print {
            display: none !important;
          }
          .mindmap-sheet-wrapper {
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
            border: none !important;
          }
          .mindmap-canvas-container {
            box-shadow: none !important;
            border: 1px solid #333 !important;
            width: 100% !important;
            min-height: 100vh !important;
            transform: none !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Action Toolbar */}
      <div className="mindmap-no-print w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 sm:px-5 sm:py-3 rounded-2xl border border-[#e1e8fd] shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-headline font-bold text-[#141b2b]">
            Class 11 Chemistry &bull; Chapter 1 &bull; Some Basic Concepts of Chemistry
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c]">
            Exact Recreated Mindmap &bull; 1536&times;1024 Native HTML5
          </span>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#f1f3ff] rounded-xl p-1 border border-[#e2dfff]">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3525cd] hover:bg-white transition"
            >
              <StitchIcon name="remove" size={16} />
            </button>
            <span className="text-xs font-mono font-bold px-1.5 text-[#3525cd]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3525cd] hover:bg-white transition"
            >
              <StitchIcon name="add" size={16} />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white text-[#3525cd] shadow-2xs hover:bg-[#e2dfff] transition"
              >
                Reset
              </button>
            )}
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-headline font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            <StitchIcon name="print" size={16} />
            <span>Print / Save as PDF (A4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* Main 1536x1024 Canvas Wrapper */}
      <div className="mindmap-sheet-wrapper w-full overflow-x-auto rounded-2xl bg-[#eae5d9]/50 p-2 sm:p-4 border border-[#ddd3c1]">
        <div
          ref={sheetRef}
          style={{
            width: '1536px',
            height: '1024px',
            minWidth: '1536px',
            minHeight: '1024px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
          }}
          className="mindmap-canvas-container mindmap-sheet-bg mindmap-font-hand relative rounded-2xl border-2 border-[#2d3748] p-3 text-[#1f2937] select-text shadow-xl overflow-hidden"
        >
          {/* ========================================================================= */}
          {/* TOP ROW: 1, 2, 3                                                          */}
          {/* ========================================================================= */}

          {/* ---------------- SECTION 1: Importance & Scope of Chemistry ---------------- */}
          <div
            style={{ position: 'absolute', top: 12, left: 12, width: 480, height: 216 }}
            className="sketch-box p-2.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="pill-badge-pink w-6 h-6 text-sm">1</span>
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Importance &amp; Scope of Chemistry
                </h3>
              </div>

              {/* Importance */}
              <div className="relative mb-2">
                <span className="bg-[#fef08a] px-2 py-0.5 rounded-full text-xs font-bold border border-[#ca8a04]">
                  Importance
                </span>
                <ul className="text-xs list-disc list-inside mt-1 space-y-0.5 text-[#374151] pr-16 leading-tight">
                  <li>Helps to understand composition, structure and properties of matter</li>
                  <li>Useful in medicine, agriculture, materials, energy, environment etc.</li>
                  <li>Improves quality of life</li>
                </ul>

                {/* Flask SVG */}
                <div className="absolute right-1 top-0 w-11 h-14">
                  <svg viewBox="0 0 40 50" className="w-full h-full">
                    <path
                      d="M16 4 h8 v10 l10 24 a4 4 0 0 1 -3.5 6 h-21 a4 4 0 0 1 -3.5 -6 l10 -24 z"
                      fill="#e0f2fe"
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                    <path d="M12 28 l16 0 l6 14 a3 3 0 0 1 -2.5 4 h-21 a3 3 0 0 1 -2.5 -4 z" fill="#38bdf8" />
                    <line x1="15" y1="4" x2="25" y2="4" stroke="#1e293b" strokeWidth="2.5" />
                    <circle cx="20" cy="36" r="1.5" fill="#ffffff" />
                    <circle cx="24" cy="40" r="1" fill="#ffffff" />
                    <circle cx="16" cy="38" r="1" fill="#ffffff" />
                  </svg>
                </div>
              </div>

              {/* Scope */}
              <div className="relative">
                <span className="bg-[#fef08a] px-2 py-0.5 rounded-full text-xs font-bold border border-[#ca8a04]">
                  Scope
                </span>
                <ul className="text-xs list-disc list-inside mt-1 space-y-0.5 text-[#374151] pr-16 leading-tight">
                  <li>Synthesis of new materials</li>
                  <li>Drug design and healthcare</li>
                  <li>Food and nutrition.</li>
                  <li>Environmental protection</li>
                  <li>Industrial processes and green chemistry</li>
                </ul>

                {/* Globe + Sprout SVG */}
                <div className="absolute right-1 top-0 w-12 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 44 48" className="w-full h-full">
                    <circle cx="22" cy="30" r="14" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
                    <path d="M13 26 Q17 24 22 28 Q26 33 32 30" fill="none" stroke="#22c55e" strokeWidth="3" />
                    <path d="M16 35 Q22 36 28 34" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                    {/* Sprout */}
                    <path d="M22 20 Q22 10 22 6" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M22 12 Q14 8 16 2 Q22 4 22 12" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                    <path d="M22 10 Q30 6 28 0 Q22 2 22 10" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 2: Matter & Classification ---------------- */}
          <div
            style={{ position: 'absolute', top: 12, left: 504, width: 512, height: 216 }}
            className="sketch-box p-2.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-blue w-6 h-6 text-sm">2</span>
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Matter &amp; Classification
                </h3>
              </div>

              <p className="text-xs text-[#374151] mb-1.5">
                <strong className="text-black">Matter:</strong> Anything which has mass and occupies space.
              </p>

              {/* Hierarchy Tree */}
              <div className="flex flex-col items-center">
                <div className="bg-[#fecdd3] border border-[#f43f5e] rounded-md px-3 py-0.5 text-xs font-bold text-[#881337] shadow-2xs">
                  Matter
                </div>

                {/* Branch split lines */}
                <svg width="340" height="14" className="my-0.5">
                  <line x1="170" y1="0" x2="170" y2="6" stroke="#475569" strokeWidth="1.5" />
                  <line x1="85" y1="6" x2="255" y2="6" stroke="#475569" strokeWidth="1.5" />
                  <line x1="85" y1="6" x2="85" y2="14" stroke="#475569" strokeWidth="1.5" />
                  <line x1="255" y1="6" x2="255" y2="14" stroke="#475569" strokeWidth="1.5" />
                </svg>

                {/* Level 1: Pure Substance vs Mixture */}
                <div className="grid grid-cols-2 gap-4 w-full px-2">
                  {/* Left: Pure Substance */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#fef9c3] border border-[#eab308] rounded-md px-2 py-0.5 text-[11px] font-bold text-center w-full">
                      Pure Substance<br />
                      <span className="text-[9px] font-normal text-gray-700">(constant composition)</span>
                    </div>

                    <svg width="180" height="12" className="my-0.5">
                      <line x1="90" y1="0" x2="90" y2="5" stroke="#475569" strokeWidth="1.2" />
                      <line x1="45" y1="5" x2="135" y2="5" stroke="#475569" strokeWidth="1.2" />
                      <line x1="45" y1="5" x2="45" y2="12" stroke="#475569" strokeWidth="1.2" />
                      <line x1="135" y1="5" x2="135" y2="12" stroke="#475569" strokeWidth="1.2" />
                    </svg>

                    <div className="grid grid-cols-2 gap-1 w-full text-center">
                      <div className="bg-[#e0f2fe] border border-[#38bdf8] rounded px-1 py-0.5 text-[10px] font-bold">
                        Element<br />
                        <span className="text-[8px] font-normal text-gray-600">(one type of atom)</span>
                      </div>
                      <div className="bg-[#e0f2fe] border border-[#38bdf8] rounded px-1 py-0.5 text-[10px] font-bold">
                        Compound<br />
                        <span className="text-[8px] font-normal text-gray-600">(two or more elements chemically combined)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Mixture */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#fef9c3] border border-[#eab308] rounded-md px-2 py-0.5 text-[11px] font-bold text-center w-full">
                      Mixture<br />
                      <span className="text-[9px] font-normal text-gray-700">(variable composition)</span>
                    </div>

                    <svg width="180" height="12" className="my-0.5">
                      <line x1="90" y1="0" x2="90" y2="5" stroke="#475569" strokeWidth="1.2" />
                      <line x1="45" y1="5" x2="135" y2="5" stroke="#475569" strokeWidth="1.2" />
                      <line x1="45" y1="5" x2="45" y2="12" stroke="#475569" strokeWidth="1.2" />
                      <line x1="135" y1="5" x2="135" y2="12" stroke="#475569" strokeWidth="1.2" />
                    </svg>

                    <div className="grid grid-cols-2 gap-1 w-full text-center">
                      <div className="bg-[#e0f2fe] border border-[#38bdf8] rounded px-1 py-0.5 text-[10px] font-bold">
                        Homogeneous<br />
                        <span className="text-[8px] font-normal text-gray-600">(Solution)</span>
                      </div>
                      <div className="bg-[#e0f2fe] border border-[#38bdf8] rounded px-1 py-0.5 text-[10px] font-bold">
                        Heterogeneous<br />
                        <span className="text-[8px] font-normal text-gray-600">(non-uniform)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Particle Diagram Dots */}
                <div className="grid grid-cols-4 gap-2 w-full mt-1.5 px-2 text-center">
                  {/* Cu Element */}
                  <div>
                    <div className="w-12 h-6 border border-dashed border-gray-400 rounded mx-auto flex flex-wrap p-0.5 justify-center items-center gap-0.5 bg-white">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-600 block" />
                      ))}
                    </div>
                    <span className="text-[9px] text-gray-700 font-bold block mt-0.5">Cu (Element)</span>
                  </div>

                  {/* H2O Compound */}
                  <div>
                    <div className="w-12 h-6 border border-dashed border-gray-400 rounded mx-auto flex items-center justify-around bg-white px-0.5">
                      <div className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 block border border-red-700" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block -ml-0.5" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block -ml-0.5" />
                      </div>
                      <div className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 block border border-red-700" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block -ml-0.5" />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-700 font-bold block mt-0.5">H₂O (Compound)</span>
                  </div>

                  {/* Homogeneous Salt Solution */}
                  <div>
                    <div className="w-12 h-6 border border-dashed border-gray-400 rounded mx-auto flex flex-wrap p-0.5 justify-around items-center bg-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
                    </div>
                    <span className="text-[9px] text-gray-700 font-bold block mt-0.5 leading-tight">
                      Salt solution (Homogeneous)
                    </span>
                  </div>

                  {/* Heterogeneous Oil + Water */}
                  <div>
                    <div className="w-12 h-6 border border-dashed border-gray-400 rounded mx-auto flex flex-col justify-between p-0.5 bg-white">
                      <div className="flex justify-around">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
                      </div>
                      <div className="border-t border-gray-300 flex justify-around pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block" />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-700 font-bold block mt-0.5 leading-tight">
                      Oil + Water (Heterogeneous)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 3: Physical Quantities & Measurement ---------------- */}
          <div
            style={{ position: 'absolute', top: 12, left: 1028, width: 496, height: 216 }}
            className="sketch-box p-2.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-pink w-6 h-6 text-sm">3</span>
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Physical Quantities &amp; Measurement
                </h3>
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-0.5 text-xs text-[#374151] pr-2">
                  <p>
                    &bull; <strong className="text-black">Physical quantity:</strong> measurable property with number and unit.
                  </p>
                  <p>
                    &bull; <strong className="text-black">Types:</strong> Fundamental (base) &amp; Derived
                  </p>
                  <p className="font-bold text-gray-900 pt-0.5">Common quantities:</p>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1 text-gray-800">
                    <li>Mass (m) &rarr; kg (balance)</li>
                    <li>Volume (V) &rarr; L, m³ (measuring cylinder)</li>
                    <li>
                      Density (&rho;) &rarr; <MathSpan tex="\rho = \frac{m}{V}" /> (kg m⁻³ or g cm⁻³)
                    </li>
                    <li>Temperature (T) &rarr; K, &deg;C</li>
                  </ul>
                </div>

                {/* Right Illustrations: Cylinder & Digital Balance */}
                <div className="w-20 flex flex-col items-center gap-1 flex-shrink-0">
                  {/* Graduated Cylinder */}
                  <svg viewBox="0 0 24 50" className="w-7 h-16">
                    <rect x="6" y="4" width="12" height="42" rx="2" fill="#e0f2fe" stroke="#1e293b" strokeWidth="1.5" />
                    <rect x="7" y="18" width="10" height="27" fill="#38bdf8" />
                    {/* Tick marks */}
                    <line x1="6" y1="12" x2="10" y2="12" stroke="#1e293b" strokeWidth="1" />
                    <line x1="6" y1="20" x2="11" y2="20" stroke="#1e293b" strokeWidth="1" />
                    <line x1="6" y1="28" x2="11" y2="28" stroke="#1e293b" strokeWidth="1" />
                    <line x1="6" y1="36" x2="11" y2="36" stroke="#1e293b" strokeWidth="1" />
                    {/* Base */}
                    <rect x="2" y="45" width="20" height="3" rx="1" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" />
                  </svg>
                  {/* Digital Balance */}
                  <div className="w-18 bg-gray-200 border border-gray-700 rounded px-1 py-0.5 text-center shadow-xs">
                    <div className="h-1 bg-gray-400 rounded-t w-10 mx-auto" />
                    <span className="text-[9px] font-mono font-bold text-emerald-800 bg-white px-1 rounded block">
                      0.00 g
                    </span>
                  </div>
                </div>
              </div>

              {/* Temperature conversion formula box */}
              <div className="bg-[#fef9c3] border border-[#eab308] rounded-lg p-1.5 mt-1">
                <span className="text-[11px] font-bold text-[#713f12] block mb-0.5">
                  Temperature conversion:
                </span>
                <div className="grid grid-cols-2 gap-x-2 text-[11px] text-gray-900 font-semibold leading-tight">
                  <div>&bull; K = &deg;C + 273</div>
                  <div>
                    &bull; &deg;F = <MathSpan tex="\frac{9}{5}" /> &deg;C + 32
                  </div>
                  <div>&bull; &deg;C = K &minus; 273</div>
                  <div>
                    &bull; &deg;C = <MathSpan tex="\frac{5}{9}" /> (&deg;F &minus; 32)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MIDDLE ROW: 4, 6 (Left) | 5, CENTER HUB, 7, 9 (Center) | 8, 10 (Right)   */}
          {/* ========================================================================= */}

          {/* ---------------- SECTION 4: SI Units & Common Conversions ---------------- */}
          <div
            style={{ position: 'absolute', top: 236, left: 12, width: 448, height: 218 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-blue w-6 h-6 text-sm">4</span>
                <h3 className="text-[14px] font-bold text-[#111827]">
                  SI Units &amp; Common Conversions
                </h3>
              </div>

              {/* 7 Base SI Units Table */}
              <table className="w-full text-[10.5px] border border-gray-400 text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-[#e0f2fe] border-b border-gray-400 text-gray-900 font-bold">
                    <th className="p-0.5 pl-1 border-r border-gray-300">Quantity</th>
                    <th className="p-0.5 pl-1 border-r border-gray-300">SI Unit</th>
                    <th className="p-0.5 text-center">Symbol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Length</td><td className="p-0.5 pl-1 border-r border-gray-300">metre</td><td className="p-0.5 text-center font-mono">m</td></tr>
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Mass</td><td className="p-0.5 pl-1 border-r border-gray-300">kilogram</td><td className="p-0.5 text-center font-mono">kg</td></tr>
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Time</td><td className="p-0.5 pl-1 border-r border-gray-300">second</td><td className="p-0.5 text-center font-mono">s</td></tr>
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Temperature</td><td className="p-0.5 pl-1 border-r border-gray-300">kelvin</td><td className="p-0.5 text-center font-mono">K</td></tr>
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Amount of substance</td><td className="p-0.5 pl-1 border-r border-gray-300">mole</td><td className="p-0.5 text-center font-mono">mol</td></tr>
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Electric current</td><td className="p-0.5 pl-1 border-r border-gray-300">ampere</td><td className="p-0.5 text-center font-mono">A</td></tr>
                  <tr><td className="p-0.5 pl-1 border-r border-gray-300">Luminous intensity</td><td className="p-0.5 pl-1 border-r border-gray-300">candela</td><td className="p-0.5 text-center font-mono">cd</td></tr>
                </tbody>
              </table>

              {/* Common Conversions */}
              <div className="mt-1 pt-0.5">
                <span className="text-[11px] font-bold text-amber-900 bg-[#fef08a] px-1.5 py-0.2 rounded border border-[#ca8a04]">
                  Common Conversions
                </span>
                <div className="grid grid-cols-2 gap-x-2 text-[10px] text-gray-800 mt-1 leading-tight font-medium">
                  <div>&bull; 1 m = 100 cm = 10³ mm</div>
                  <div>&bull; 1 km = 10³ m</div>
                  <div>&bull; 1 L = 10³ mL = 10⁻³ m³</div>
                  <div>&bull; 1 mL = 1 cm³</div>
                  <div>&bull; 1 g = 10⁻³ kg</div>
                  <div>&bull; 1 mg = 10⁻³ g</div>
                  <div>&bull; 1 atm = 1.013 &times; 10⁵ Pa &asymp; 760 mm Hg</div>
                  <div>&bull; 1 bar = 10⁵ Pa</div>
                  <div className="col-span-2 text-rose-800 font-bold">
                    &bull; 1 mol = 6.022 &times; 10²³ entities
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 6: Laws of Chemical Combination ---------------- */}
          <div
            style={{ position: 'absolute', top: 462, left: 12, width: 448, height: 418 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="pill-badge-pink w-6 h-6 text-sm">6</span>
                <h3 className="text-[14px] font-bold text-[#111827]">
                  Laws of Chemical Combination
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-[#374151]">
                {/* 1. Conservation of Mass */}
                <div className="relative pr-20">
                  <div className="flex items-start gap-1">
                    <span className="pill-badge-blue w-4 h-4 text-[10px] mt-0.5 flex-shrink-0">1</span>
                    <div>
                      <strong className="text-black">Law of Conservation of Mass</strong>
                      <p className="text-[11px] leading-tight">Mass is neither created nor destroyed in a chemical reaction.</p>
                      <p className="text-[11px] font-bold text-rose-700">m (reactants) = m (products)</p>
                    </div>
                  </div>
                  {/* Balance Scale SVG */}
                  <div className="absolute right-0 top-0 w-20 h-10 flex items-center justify-center">
                    <svg viewBox="0 0 60 30" className="w-full h-full">
                      <line x1="30" y1="6" x2="30" y2="28" stroke="#334155" strokeWidth="2" />
                      <line x1="12" y1="10" x2="48" y2="10" stroke="#334155" strokeWidth="2" />
                      <polygon points="30,4 27,10 33,10" fill="#475569" />
                      {/* Left Pan */}
                      <line x1="12" y1="10" x2="7" y2="20" stroke="#64748b" strokeWidth="1" />
                      <line x1="12" y1="10" x2="17" y2="20" stroke="#64748b" strokeWidth="1" />
                      <ellipse cx="12" cy="20" rx="6" ry="1.5" fill="#94a3b8" />
                      {/* Right Pan */}
                      <line x1="48" y1="10" x2="43" y2="20" stroke="#64748b" strokeWidth="1" />
                      <line x1="48" y1="10" x2="53" y2="20" stroke="#64748b" strokeWidth="1" />
                      <ellipse cx="48" cy="20" rx="6" ry="1.5" fill="#94a3b8" />
                      <text x="5" y="27" fontSize="5" fontWeight="bold">CaCO₃</text>
                      <text x="38" y="27" fontSize="5" fontWeight="bold">CaO + CO₂</text>
                    </svg>
                  </div>
                </div>

                {/* 2. Definite Proportions */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-4 h-4 text-[10px] mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <strong className="text-black">Law of Definite Proportions</strong>
                    <p className="text-[11px] leading-tight">A pure compound always contains the same elements in a fixed ratio by mass.</p>
                    <p className="text-[11px] text-blue-800 font-semibold">In H₂O, H : O = 1 : 8 (by mass)</p>
                  </div>
                </div>

                {/* 3. Multiple Proportions */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-4 h-4 text-[10px] mt-0.5 flex-shrink-0">3</span>
                  <div>
                    <strong className="text-black">Law of Multiple Proportions</strong>
                    <p className="text-[11px] leading-tight">When two elements form more than one compound, masses of one element that combine with a fixed mass of the other are in small whole number ratio.</p>
                    <p className="text-[11px] text-rose-800 font-semibold">CO (O = 16 g), CO₂ (O = 32 g) &rarr; ratio 1 : 2</p>
                  </div>
                </div>

                {/* 4. Reciprocal Proportions */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-4 h-4 text-[10px] mt-0.5 flex-shrink-0">4</span>
                  <div>
                    <strong className="text-black">Law of Reciprocal Proportions</strong>
                    <p className="text-[10.5px] leading-tight">If A combines with B and C separately, then the masses of B and C that combine with a fixed mass of A are in the same or simple ratio as the masses of B and C that combine with each other.</p>
                  </div>
                </div>

                {/* 5. Gay-Lussac */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-4 h-4 text-[10px] mt-0.5 flex-shrink-0">5</span>
                  <div>
                    <strong className="text-black">Gay-Lussac&apos;s Law of Gaseous Volumes</strong>
                    <p className="text-[10.5px] leading-tight">At same T and P, volumes of reacting gases and product gases are in simple whole number ratio.</p>
                    <p className="text-[10.5px] text-emerald-800 font-semibold">e.g. 2H₂ (2 vol) + O₂ (1 vol) &rarr; 2H₂O (2 vol)</p>
                  </div>
                </div>
              </div>

              {/* Dalton's Atomic Theory Box */}
              <div className="bg-[#fef9c3] border border-[#eab308] rounded-lg p-1.5 mt-1.5 relative pr-14">
                <span className="text-xs font-bold text-[#713f12] block mb-0.5">
                  Dalton&apos;s Atomic Theory
                </span>
                <ul className="text-[10px] list-disc list-inside space-y-0.5 text-gray-800 leading-tight">
                  <li>Matter is made of tiny indivisible atoms.</li>
                  <li>Atoms of same element are identical.</li>
                  <li>Atoms of different elements differ in mass &amp; properties.</li>
                  <li>Compounds formed by combination of atoms in fixed simple whole number ratio.</li>
                  <li>In a chemical reaction, atoms are rearranged, not created or destroyed.</li>
                </ul>

                {/* Dalton Atom Model SVG */}
                <div className="absolute right-1 top-2 w-12 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <circle cx="20" cy="20" r="4.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                    <ellipse cx="20" cy="20" rx="16" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" transform="rotate(30 20 20)" />
                    <ellipse cx="20" cy="20" rx="16" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" transform="rotate(-30 20 20)" />
                    <ellipse cx="20" cy="20" rx="16" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" transform="rotate(90 20 20)" />
                    <circle cx="34" cy="24" r="1.5" fill="#1d4ed8" />
                    <circle cx="6" cy="16" r="1.5" fill="#1d4ed8" />
                    <circle cx="20" cy="4" r="1.5" fill="#1d4ed8" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 5: Significant Figures, Accuracy & Precision ---------------- */}
          <div
            style={{ position: 'absolute', top: 236, left: 468, width: 588, height: 168 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-pink w-6 h-6 text-sm">5</span>
                <h3 className="text-[14px] font-bold text-[#111827]">
                  Significant Figures, Accuracy &amp; Precision
                </h3>
              </div>

              <div className="grid grid-cols-12 gap-1.5 text-xs text-[#374151]">
                {/* Left 5 cols: Rules & Examples */}
                <div className="col-span-5 space-y-0.5">
                  <p className="text-[11px] leading-tight">
                    &bull; <strong className="text-black">Significant figures:</strong> all certain digits + 1 uncertain digit.
                  </p>
                  <p className="text-[11px] font-bold text-gray-900">&bull; Rules:</p>
                  <ol className="text-[10px] list-decimal list-inside space-y-0.2 pl-0.5 text-gray-800 leading-tight">
                    <li>All non-zero digits are significant.</li>
                    <li>Zeros between non-zero digits are significant.</li>
                    <li>Leading zeros are not significant.</li>
                    <li>Trailing zeros significant only with decimal point.</li>
                  </ol>

                  {/* Examples box */}
                  <div className="border border-dashed border-sky-400 bg-sky-50/60 rounded p-1 text-[10px] font-mono mt-0.5">
                    <span className="font-sans font-bold text-sky-900 block text-[10px]">Examples:</span>
                    <div className="grid grid-cols-2 gap-x-1">
                      <div>0.00256 &rarr; 3 s.f.</div>
                      <div>2500 &rarr; 2 s.f.</div>
                      <div>25.0 &rarr; 3 s.f.</div>
                      <div>2.500 &times; 10⁴ &rarr; 4 s.f.</div>
                    </div>
                  </div>
                </div>

                {/* Middle 3.5 cols: Accuracy vs Precision & Uncertainty */}
                <div className="col-span-4 space-y-1">
                  {/* Accuracy vs Precision */}
                  <div className="border border-amber-300 bg-[#fefce8] rounded p-1">
                    <span className="text-[10.5px] font-bold text-amber-900 block text-center mb-0.5">
                      Accuracy vs Precision
                    </span>
                    <div className="flex justify-around items-center">
                      {/* Accuracy Target */}
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-gray-700 block">Accuracy:</span>
                        <span className="text-[8px] text-gray-500 block leading-none">close to true value</span>
                        <svg viewBox="0 0 32 32" className="w-7 h-7 mx-auto my-0.5">
                          <circle cx="16" cy="16" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="16" cy="16" r="9" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="16" cy="16" r="4" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="16" cy="16" r="1.5" fill="#1e293b" />
                          <circle cx="15" cy="17" r="1.2" fill="#1e293b" />
                          <circle cx="17" cy="15" r="1.2" fill="#1e293b" />
                        </svg>
                      </div>

                      {/* Precision Target */}
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-gray-700 block">Precision:</span>
                        <span className="text-[8px] text-gray-500 block leading-none">reproducible results</span>
                        <svg viewBox="0 0 32 32" className="w-7 h-7 mx-auto my-0.5">
                          <circle cx="16" cy="16" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="16" cy="16" r="9" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="16" cy="16" r="4" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                          {/* Clustered off-center */}
                          <circle cx="23" cy="10" r="1.2" fill="#1e293b" />
                          <circle cx="22" cy="11" r="1.2" fill="#1e293b" />
                          <circle cx="24" cy="12" r="1.2" fill="#1e293b" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Uncertainty in measurement */}
                  <div className="bg-[#f0fdf4] border border-[#86efac] rounded p-1 text-[9.5px] leading-tight">
                    <span className="font-bold text-emerald-900 block">Uncertainty in measurement</span>
                    <div>&bull; Absolute uncertainty: &plusmn;&Delta;x</div>
                    <div>
                      &bull; Relative uncertainty: (<MathSpan tex="\frac{\Delta x}{x}" />) &times; 100%
                    </div>
                    <div className="font-bold text-emerald-800">Result: x &plusmn; &Delta;x</div>
                  </div>
                </div>

                {/* Right 3 cols: Scientific Notation & Dimensional Analysis */}
                <div className="col-span-3 space-y-1">
                  {/* Scientific Notation */}
                  <div className="bg-sky-50 border border-sky-300 rounded p-1 text-[10px]">
                    <span className="font-bold text-sky-950 block">Scientific Notation</span>
                    <div className="font-mono text-center font-bold text-rose-700">N &times; 10ⁿ</div>
                    <div className="text-[8.5px] text-gray-600">1 &le; a &lt; 10, n = integer</div>
                    <div className="text-[9px] font-mono mt-0.5 leading-tight">
                      0.00072 = 7.2 &times; 10⁻⁴<br />
                      356000 = 3.56 &times; 10⁵
                    </div>
                  </div>

                  {/* Dimensional Analysis */}
                  <div className="bg-amber-50 border border-amber-300 rounded p-1 text-[9px] leading-tight">
                    <span className="font-bold text-amber-950 block">Dimensional Analysis</span>
                    <div>Dimension: [M], [L], [T], [A] ...</div>
                    <div>Check: LHS = RHS dimension</div>
                    <div className="font-mono text-[8.5px] text-gray-800 mt-0.5">
                      v = u + at<br />
                      [LT⁻¹] = [LT⁻¹] + [L][T⁻²][T]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- CENTER MASTER HUB ---------------- */}
          <div
            style={{
              position: 'absolute',
              top: 412,
              left: 476,
              width: 572,
              height: 124,
            }}
            className="flex flex-col items-center justify-center relative select-none"
          >
            {/* Cloud bubble container */}
            <div className="w-full h-full bg-[#fdf2f8]/90 border-2 border-[#f43f5e] rounded-3xl shadow-md p-2 flex flex-col items-center justify-center relative">
              {/* Top Chapter 1 capsule badge */}
              <div className="bg-[#f43f5e] text-white px-4 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase mb-1 shadow-xs">
                CHAPTER 1
              </div>

              {/* Bold Title */}
              <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] text-center tracking-tight leading-none mindmap-font-marker">
                SOME BASIC CONCEPTS OF CHEMISTRY
              </h1>

              {/* Open Book SVG Illustration */}
              <div className="w-14 h-9 mt-1 flex items-center justify-center">
                <svg viewBox="0 0 60 40" className="w-full h-full">
                  {/* Left Page */}
                  <path d="M30 32 C22 28 10 28 4 30 L4 8 C10 6 22 6 30 10 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                  {/* Right Page */}
                  <path d="M30 32 C38 28 50 28 56 30 L56 8 C50 6 38 6 30 10 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                  {/* Spine & Bookmark */}
                  <path d="M30 10 L30 34" stroke="#475569" strokeWidth="2" />
                  <path d="M30 10 Q28 20 26 26" fill="none" stroke="#e11d48" strokeWidth="2" />
                  {/* Little Leaves / Stars */}
                  <circle cx="2" cy="18" r="1.5" fill="#22c55e" />
                  <circle cx="58" cy="18" r="1.5" fill="#22c55e" />
                  <circle cx="16" cy="3" r="1" fill="#eab308" />
                  <circle cx="44" cy="3" r="1" fill="#eab308" />
                </svg>
              </div>

              {/* Radiating Curved Arrows */}
              {/* Arrow to Box 4/6 */}
              <svg className="absolute -left-5 top-1/2 w-6 h-6 -translate-y-1/2 pointer-events-none">
                <path d="M20 12 Q5 12 0 12" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
              </svg>
              {/* Arrow to Box 7 */}
              <svg className="absolute bottom-[-16px] left-1/2 w-6 h-6 -translate-x-1/2 pointer-events-none">
                <path d="M12 0 Q12 12 12 18" fill="none" stroke="#0284c7" strokeWidth="2" />
                <polygon points="12,22 9,16 15,16" fill="#0284c7" />
              </svg>
              {/* Arrow to Box 8 */}
              <svg className="absolute -right-5 top-1/2 w-6 h-6 -translate-y-1/2 pointer-events-none">
                <path d="M0 12 Q15 12 20 12" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
              </svg>
            </div>
          </div>

          {/* ---------------- SECTION 7: Atomic, Molecular & Formula Mass ---------------- */}
          <div
            style={{ position: 'absolute', top: 544, left: 468, width: 588, height: 184 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-blue w-6 h-6 text-sm">7</span>
                <h3 className="text-[14px] font-bold text-[#111827]">
                  Atomic, Molecular &amp; Formula Mass
                </h3>
              </div>

              <div className="space-y-1 text-xs text-[#374151]">
                <p>
                  &bull; <strong className="text-black">Atomic mass:</strong> mass of an atom (u or g mol⁻¹)
                </p>
                <div>
                  &bull; <strong className="text-black">Molecular mass:</strong> sum of atomic masses of all atoms in a molecule.
                  <span className="text-blue-900 font-semibold block text-[11px] pl-3">
                    e.g. H₂O = 2(1) + 16 = 18 u
                  </span>
                </div>
                <div>
                  &bull; <strong className="text-black">Formula mass:</strong> sum of atomic masses in a formula unit.
                  <span className="text-blue-900 font-semibold block text-[11px] pl-3">
                    e.g. NaCl = 23 + 35.5 = 58.5 u
                  </span>
                </div>

                {/* 1 u definition box */}
                <div className="bg-[#fef9c3] border border-[#eab308] rounded-md py-1 px-2 text-center text-xs font-semibold text-gray-900 shadow-2xs">
                  <MathSpan tex="1\text{ u} = \frac{1}{12}\text{ mass of }{^{12}\text{C}}\text{ atom} = 1.66 \times 10^{-24}\text{ g}" />
                </div>

                {/* Molecules Visual Models */}
                <div className="flex justify-around items-center pt-1">
                  {/* H2O Model */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-gray-400 flex items-center justify-center text-[8px] font-bold">
                        H
                      </span>
                      <span className="w-7 h-7 rounded-full bg-red-500 border border-red-700 flex items-center justify-center text-[10px] text-white font-bold -ml-1">
                        O
                      </span>
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-gray-400 flex items-center justify-center text-[8px] font-bold -ml-1">
                        H
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-center">
                      <span>H₂O</span>
                      <span className="text-gray-600 block text-[9.5px]">18 u</span>
                    </div>
                  </div>

                  {/* NaCl Model */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-purple-500 border border-purple-700 flex items-center justify-center text-[9px] text-white font-bold">
                        Na
                      </span>
                      <span className="w-7 h-7 rounded-full bg-emerald-500 border border-emerald-700 flex items-center justify-center text-[10px] text-white font-bold -ml-1">
                        Cl
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-center">
                      <span>NaCl</span>
                      <span className="text-gray-600 block text-[9.5px]">58.5 u</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 9: Percentage Composition & Formulas ---------------- */}
          <div
            style={{ position: 'absolute', top: 736, left: 468, width: 588, height: 144 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-blue w-6 h-6 text-sm">9</span>
                <h3 className="text-[14px] font-bold text-[#111827]">
                  Percentage Composition &amp; Formulas
                </h3>
              </div>

              <div className="grid grid-cols-12 gap-2 text-xs">
                {/* Left 4 cols: Percentage Composition */}
                <div className="col-span-4 border-r border-gray-300 pr-1 space-y-1">
                  <span className="bg-[#fef08a] px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-900 border border-[#ca8a04]">
                    Percentage Composition
                  </span>
                  <div className="text-[9.5px] leading-tight text-gray-800">
                    <MathSpan tex="\% = \frac{\text{Mass of element in 1 mol}}{\text{Molar mass of compound}} \times 100" />
                  </div>
                  <div className="text-[9.5px] text-gray-700 font-mono leading-tight">
                    In CaCO₃ (M = 100):<br />
                    &bull; %Ca = <MathSpan tex="\frac{40}{100} \times 100 = 40\%" /><br />
                    &bull; %C = 12%<br />
                    &bull; %O = 48%
                  </div>
                </div>

                {/* Middle 4 cols: Empirical Formula */}
                <div className="col-span-4 border-r border-gray-300 pr-1 space-y-1">
                  <span className="bg-[#fef08a] px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-900 border border-[#ca8a04]">
                    Empirical Formula
                  </span>
                  <ol className="text-[9.5px] list-decimal list-inside space-y-0.2 text-gray-800 leading-tight">
                    <li>Find moles of each element</li>
                    <li>Divide by smallest mole</li>
                    <li>Simplify to whole numbers</li>
                  </ol>
                  <div className="text-[9.5px] bg-rose-50 text-rose-800 p-0.5 rounded font-semibold text-center border border-rose-200">
                    e.g. C : H = 2 : 4 &rarr; CH₂
                  </div>
                </div>

                {/* Right 4 cols: Molecular Formula */}
                <div className="col-span-4 space-y-0.5 text-[9.5px] text-gray-800 leading-tight">
                  <span className="font-bold text-black block">Molecular Formula</span>
                  <div>Molecular formula = (Empirical formula)ₙ</div>
                  <div>
                    <MathSpan tex="n = \frac{\text{Molar mass}}{\text{Empirical formula mass}}" />
                  </div>
                  <div className="text-[9px] text-gray-700">
                    e.g. Empirical = CH₂ (mass = 14)<br />
                    Molar mass = 56, n = 56 / 14 = 4<br />
                    <strong className="text-blue-900 font-bold">Molecular formula = C₄H₈</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 8: Mole Concept ---------------- */}
          <div
            style={{ position: 'absolute', top: 236, left: 1064, width: 460, height: 366 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="pill-badge-pink w-6 h-6 text-sm">8</span>
                <h3 className="text-[14px] font-bold text-[#111827]">
                  Mole Concept
                </h3>
              </div>

              {/* Top Mole Definition & Avogadro */}
              <div className="space-y-1 text-xs text-[#374151]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="leading-tight">
                      &bull; <strong className="text-black">1 mole = 6.022 &times; 10²³ entities</strong><br />
                      <span className="text-[10px] text-gray-600 pl-2">(Avogadro constant, N<sub>A</sub>)</span>
                    </p>
                    <p className="text-[11px] leading-tight mt-0.5">
                      &bull; <strong className="text-black">Molar mass:</strong> mass of 1 mole (in g)<br />
                      &bull; Units: g mol⁻¹
                    </p>
                    <div className="bg-[#fef9c3] border border-[#eab308] rounded px-2 py-0.5 mt-1 inline-block text-[11px] font-bold text-amber-900">
                      <MathSpan tex="N_A = 6.022 \times 10^{23}\text{ mol}^{-1}" />
                    </div>
                  </div>

                  {/* Avogadro Entities Blue Cluster */}
                  <div className="w-20 text-center flex-shrink-0">
                    <div className="w-14 h-14 bg-sky-50 border border-sky-300 rounded-full mx-auto flex flex-wrap p-1.5 justify-center items-center gap-1 shadow-inner">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-sky-500 border border-sky-700 block shadow-2xs" />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-sky-950 block mt-0.5 leading-tight">
                      1 mole<br />
                      <span className="text-[8px] font-normal text-gray-600">(6.022 &times; 10²³ particles)</span>
                    </span>
                  </div>
                </div>

                {/* Relationships Box */}
                <div className="bg-[#fef9c3] border border-[#eab308] rounded-lg p-2 mt-2">
                  <span className="text-xs font-bold text-[#713f12] block mb-1">
                    Relationships
                  </span>
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-900 font-medium">
                    <div className="flex items-center justify-between">
                      <div>
                        &bull; <MathSpan tex="n = \frac{m}{M}" />
                      </div>
                      <span className="text-[10px] text-gray-600">(m = mass, M = molar mass)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        &bull; <MathSpan tex="N = n \times N_A" />
                      </div>
                      <span className="text-[10px] text-gray-600">(N = number of particles)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        &bull; <MathSpan tex="n = \frac{V}{22.4}" />
                      </div>
                      <span className="text-[10px] text-gray-600">(for gases at STP, 22.4 L = 1 mol)</span>
                    </div>

                    <div>
                      &bull; <MathSpan tex="V = n \times 22.4\text{ L (at STP)}" />
                    </div>

                    <div>
                      &bull; <MathSpan tex="\text{Mass} = n \times M" />
                    </div>

                    <div>
                      &bull; <MathSpan tex="N = \left(\frac{m}{M}\right) \times N_A" />
                    </div>
                  </div>
                </div>

                {/* Connected Spheres Molecule Illustration */}
                <div className="flex items-center justify-center gap-1 pt-1">
                  <svg viewBox="0 0 60 20" className="w-16 h-6">
                    <circle cx="12" cy="10" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                    <line x1="18" y1="10" x2="30" y2="10" stroke="#475569" strokeWidth="2" />
                    <circle cx="30" cy="10" r="7" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
                    <line x1="37" y1="10" x2="48" y2="10" stroke="#475569" strokeWidth="2" />
                    <circle cx="48" cy="10" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                    <text x="10" y="12" fontSize="5" fill="#fff" fontWeight="bold">H</text>
                    <text x="46" y="12" fontSize="5" fill="#fff" fontWeight="bold">H</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 10: Concentration Terms ---------------- */}
          <div
            style={{ position: 'absolute', top: 610, left: 1064, width: 460, height: 270 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="pill-badge-pink w-6 h-6 text-sm">10</span>
                  <h3 className="text-[14px] font-bold text-[#111827]">
                    Concentration Terms
                  </h3>
                </div>

                {/* Small Flask illustration */}
                <div className="w-8 h-8">
                  <svg viewBox="0 0 30 36" className="w-full h-full">
                    <path d="M12 2 h6 v8 l8 18 a2 2 0 0 1 -2 3 h-18 a2 2 0 0 1 -2 -3 l8 -18 z" fill="#e0f2fe" stroke="#1e293b" strokeWidth="1.5" />
                    <path d="M9 20 l12 0 l5 8 a2 2 0 0 1 -2 3 h-18 a2 2 0 0 1 -2 -3 z" fill="#38bdf8" />
                  </svg>
                </div>
              </div>

              {/* 7 Concentration Formulas */}
              <div className="space-y-1 text-[11px] text-[#374151]">
                {/* 1. Mass percentage */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">1</span>
                  <div>
                    <strong className="text-black">Mass percentage (w/w):</strong>
                    <div className="text-[10px] pl-1 font-semibold text-rose-950">
                      <MathSpan tex="\% \text{ (w/w)} = \frac{\text{Mass of solute}}{\text{Mass of solution}} \times 100" />
                    </div>
                  </div>
                </div>

                {/* 2. Volume percentage */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <strong className="text-black">Volume percentage (v/v):</strong>
                    <div className="text-[10px] pl-1 font-semibold text-rose-950">
                      <MathSpan tex="\% \text{ (v/v)} = \frac{\text{Volume of solute}}{\text{Volume of solution}} \times 100" />
                    </div>
                  </div>
                </div>

                {/* 3. Mass by volume percentage */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">3</span>
                  <div>
                    <strong className="text-black">Mass by volume percentage (w/v):</strong>
                    <div className="text-[10px] pl-1 font-semibold text-rose-950">
                      <MathSpan tex="\% \text{ (w/v)} = \frac{\text{Mass of solute (g)}}{\text{Volume of solution (mL)}} \times 100" />
                    </div>
                  </div>
                </div>

                {/* 4. ppm */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">4</span>
                  <div>
                    <strong className="text-black">ppm (parts per million):</strong>
                    <div className="text-[10px] pl-1 font-semibold text-rose-950">
                      <MathSpan tex="\text{ppm} = \frac{\text{Mass of solute}}{\text{Mass of solution}} \times 10^6 \quad (\approx \text{mg L}^{-1} \text{ for dilute aqueous})" />
                    </div>
                  </div>
                </div>

                {/* 5. Mole fraction */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">5</span>
                  <div>
                    <strong className="text-black">Mole fraction (X<sub>i</sub>):</strong>
                    <div className="text-[10.5px] pl-1 font-semibold text-blue-950">
                      <MathSpan tex="X_i = \frac{n_i}{\sum n_i}, \quad \sum X_i = 1" />
                    </div>
                  </div>
                </div>

                {/* 6. Molarity */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">6</span>
                  <div>
                    <strong className="text-black">Molarity (M):</strong>
                    <div className="text-[10.5px] pl-1 font-semibold text-blue-950">
                      <MathSpan tex="M = \frac{\text{Moles of solute}}{\text{Volume of solution (L)}} \quad (\text{mol L}^{-1})" />
                    </div>
                  </div>
                </div>

                {/* 7. Molality */}
                <div className="flex items-start gap-1">
                  <span className="pill-badge-blue w-3.5 h-3.5 text-[9px] mt-0.5 flex-shrink-0">7</span>
                  <div>
                    <strong className="text-black">Molality (m):</strong>
                    <div className="text-[10.5px] pl-1 font-semibold text-blue-950">
                      <MathSpan tex="m = \frac{\text{Moles of solute}}{\text{Mass of solvent (kg)}} \quad (\text{mol kg}^{-1})" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM ROW: SECTION 11 (Spans full width from left to right)              */}
          {/* ========================================================================= */}
          <div
            style={{ position: 'absolute', top: 888, left: 12, width: 1512, height: 124 }}
            className="sketch-box p-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill-badge-pink w-6 h-6 text-sm">11</span>
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Chemical Equations &amp; Stoichiometry
                </h3>
              </div>

              <div className="grid grid-cols-12 gap-3 text-xs text-[#374151]">
                {/* Col 1-3: Chemical Equations definition & Mole ratio */}
                <div className="col-span-3 space-y-0.5 border-r border-gray-300 pr-2">
                  <p className="text-[11px] leading-tight">
                    &bull; <strong className="text-black">Chemical equation:</strong> symbolic representation of a chemical reaction.
                  </p>
                  <p className="text-[11px] leading-tight">
                    &bull; <strong className="text-black">Balanced equation:</strong> obeys law of conservation of mass.
                  </p>
                  <p className="text-[11px] leading-tight">
                    &bull; <strong className="text-black">Stoichiometric coefficients</strong> give mole ratio.
                  </p>
                  <div className="bg-[#fefce8] border border-amber-300 rounded p-1 text-center font-mono text-[10.5px]">
                    <span className="text-rose-700 font-bold">N₂ + 3H₂ &rarr; 2NH₃</span>
                    <span className="text-amber-800 block text-[9.5px]">1 : 3 : 2 (mole ratio)</span>
                  </div>
                </div>

                {/* Col 4-6: Steps for Calculations */}
                <div className="col-span-3 border-r border-gray-300 pr-2">
                  <div className="bg-[#fef9c3] border border-[#eab308] rounded-lg p-1.5 h-full">
                    <span className="text-xs font-bold text-[#713f12] block mb-0.5">
                      Steps for calculations
                    </span>
                    <ol className="text-[10px] list-decimal list-inside space-y-0.5 text-gray-800 leading-tight">
                      <li>Balance the equation</li>
                      <li>Convert given quantity to moles</li>
                      <li>Use mole ratio to find required moles</li>
                      <li>Convert to desired unit (mass/volume/particles)</li>
                    </ol>
                  </div>
                </div>

                {/* Col 7-9: Stoichiometric Calculations Example */}
                <div className="col-span-3 border-r border-gray-300 pr-2">
                  <div className="border border-dashed border-rose-300 bg-rose-50/50 rounded-lg p-1.5 h-full text-[10px] leading-tight">
                    <span className="font-bold text-rose-900 block mb-0.5">
                      Stoichiometric Calculations (example)
                    </span>
                    <div className="font-mono text-center font-bold text-rose-800 my-0.5">
                      2H₂ + O₂ &rarr; 2H₂O<br />
                      <span className="text-[9px] text-gray-600 font-normal">2 mol &nbsp; 1 mol &nbsp; 2 mol</span>
                    </div>
                    <div>If 4 g H₂ (2 mol) reacts, H₂O formed?</div>
                    <div className="text-rose-800 font-bold mt-0.5">
                      2 mol H₂ &rarr; 2 mol H₂O<br />
                      &there4; 2 mol H₂O = 36 g
                    </div>
                  </div>
                </div>

                {/* Col 10-12: Limiting Reagent */}
                <div className="col-span-3">
                  <div className="bg-[#fef9c3] border border-[#eab308] rounded-lg p-1.5 h-full text-[9.5px] leading-tight">
                    <span className="text-[11px] font-bold text-[#713f12] block mb-0.5">
                      Limiting Reagent
                    </span>
                    <p className="text-gray-800">
                      &bull; Reagent which is completely consumed and limits the amount of product.
                    </p>
                    <div className="mt-0.5 text-gray-900 font-mono text-[9px]">
                      e.g. 2H₂ + O₂ &rarr; 2H₂O<br />
                      Given: 3 mol H₂, 1 mol O₂<br />
                      Required H₂ for 1 mol O₂ = 2 mol<br />
                      Available H₂ = 3 mol (&gt; 2)<br />
                      <strong className="text-rose-700 font-bold">Limiting reagent = O₂</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
