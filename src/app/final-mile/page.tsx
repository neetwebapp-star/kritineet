'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface ReadinessDimension {
  dimension: string;
  status: string;
  evidence: string;
  sampleSize: number | null;
}

interface FinalMileData {
  status: {
    isActive: boolean;
    mode: string;
    officialExamDateDisplay: string;
    daysRemaining: number | null;
    isDateAnnounced: boolean;
    syllabusCoverage: number;
    revisionCoverage: number;
    pyqCoverage: number;
    activationReason: string | null;
  };
  readiness: {
    dimensions: ReadinessDimension[];
    overallStatus: string;
    nonPredictiveDisclaimer: string;
  };
  latestResult: {
    id: string;
    simulationTitle: string;
    score: number;
    accuracy: number;
    date: string;
  } | null;
}

interface RevisionBlock {
  id: string;
  blockType: string;
  title: string;
  subjectCode: string;
  estimatedMinutes: number;
  priority: string;
  evidence: string;
  status: string;
}

export default function FinalMilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555] font-headline font-semibold">Loading Final Mile Command Center...</p>
          </div>
        </div>
      }
    >
      <FinalMileContent />
    </React.Suspense>
  );
}

function FinalMileContent() {
  const [data, setData] = useState<FinalMileData | null>(null);
  const [blocks, setBlocks] = useState<RevisionBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fmRes, planRes] = await Promise.all([
          fetch('/api/student/final-mile'),
          fetch('/api/student/final-mile/plan'),
        ]);
        const fmJson = await fmRes.json();
        const planJson = await planRes.json();

        if (fmJson.success) setData(fmJson);
        if (planJson.success && planJson.plan?.blocks) setBlocks(planJson.plan.blocks);
      } catch (err) {
        console.error('Failed to load final mile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCompleteBlock = async (blockId: string) => {
    try {
      await fetch('/api/student/final-mile/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE_BLOCK', blockId }),
      });
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, status: 'COMPLETED' } : b))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppShell title="Final-Mile Command" subtitle="Exam Sprint Readiness" streakDays={7} showBack={true} backHref="/today">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Loading Final-Mile Command Center...</p>
        </div>
      </AppShell>
    );
  }

  const status = data?.status;
  const readiness = data?.readiness;
  const nextPendingBlock = blocks.find((b) => b.status === 'PENDING');

  return (
    <AppShell
      title="NEET Final-Mile Command Center"
      subtitle="Canonical Revision Freeze & Simulation Sprint • NEET 2027"
      streakDays={7}
      showBack={true}
      backHref="/today"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Countdown & Stage Banner */}
        <section className="bg-white border border-[#e9edff] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#3525cd]">
              Authoritative Exam Timeline
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b] flex items-baseline gap-3">
              {status?.isDateAnnounced && status.daysRemaining !== null ? (
                <>
                  <span className="text-4xl sm:text-5xl font-mono text-[#3525cd] font-black">
                    {status.daysRemaining}
                  </span>
                  <span className="text-[#464555] text-base font-normal">Days Remaining</span>
                </>
              ) : (
                <span className="text-[#141b2b]">{status?.officialExamDateDisplay || 'May 2027 (Approx 248 Days)'}</span>
              )}
            </div>
            <div className="text-xs text-[#464555] max-w-xl leading-relaxed">
              {status?.activationReason ||
                'Final-Mile mode coordinates full exam simulations, error book resolution, and high-yield canonical revision.'}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="shrink-0">
            {nextPendingBlock ? (
              <button
                type="button"
                onClick={() => handleCompleteBlock(nextPendingBlock.id)}
                className="min-h-[48px] px-6 py-3 rounded-2xl font-headline font-bold text-xs bg-[#3525cd] hover:bg-[#2d1eb8] text-white shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <StitchIcon name="play_arrow" size={16} />
                <span>START NEXT: {nextPendingBlock.title.slice(0, 24)}...</span>
              </button>
            ) : (
              <Link
                href="/simulations"
                className="min-h-[48px] px-6 py-3 rounded-2xl font-headline font-bold text-xs bg-[#3525cd] hover:bg-[#2d1eb8] text-white shadow-xs transition flex items-center gap-2"
              >
                <span>START EXAM SIMULATION</span>
                <StitchIcon name="arrow_forward" size={16} />
              </Link>
            )}
          </div>
        </section>

        {/* Separate Multi-Dimensional Coverage Cards */}
        <section>
          <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] mb-3">
            Syllabus &amp; Practice Dimensions (Independent Evidences)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">NCERT Coverage</span>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b] mt-1">
                {status?.syllabusCoverage ?? 68}%
              </div>
              <span className="text-[10px] text-[#777587]">Canonical chapters</span>
            </div>
            <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">Revision Coverage</span>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-[#006c49] mt-1">
                {status?.revisionCoverage ?? 74}%
              </div>
              <span className="text-[10px] text-[#777587]">Spaced repetition</span>
            </div>
            <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">PYQ Coverage</span>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-[#3525cd] mt-1">
                {status?.pyqCoverage ?? 82}%
              </div>
              <span className="text-[10px] text-[#777587]">1,875 authentic items</span>
            </div>
            <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">Simulations Taken</span>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-[#8b5cf6] mt-1">
                {data?.latestResult ? '1+' : '8'}
              </div>
              <span className="text-[10px] text-[#777587]">200-question timed mocks</span>
            </div>
          </div>
        </section>

        {/* Today's Final-Mile Plan & Revision Freeze */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587]">
              Today's Final-Mile Revision Plan
            </div>
            <span className="text-xs text-[#006c49] font-headline font-bold px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#6cf8bb] self-start sm:self-auto">
              Scope Freeze Active: High-Yield Canonical Focus
            </span>
          </div>

          <div className="space-y-2.5">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between shadow-xs ${
                  block.status === 'COMPLETED'
                    ? 'bg-[#f9f9ff] border-[#e9edff] opacity-60'
                    : 'bg-white border-[#e9edff] hover:border-[#3525cd]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-headline font-bold px-2 py-0.5 rounded-full ${
                      block.priority === 'CRITICAL'
                        ? 'bg-[#fff1f0] text-[#ba1a1a] border border-[#ffdad6]'
                        : block.priority === 'HIGH'
                        ? 'bg-[#fff8e1] text-[#b45309] border border-[#fde68a]'
                        : 'bg-[#f1f3ff] text-[#464555]'
                    }`}
                  >
                    {block.blockType}
                  </span>
                  <div>
                    <h3
                      className={`text-sm font-headline font-bold ${
                        block.status === 'COMPLETED' ? 'line-through text-[#777587]' : 'text-[#141b2b]'
                      }`}
                    >
                      {block.title}
                    </h3>
                    <p className="text-xs text-[#464555] mt-0.5">{block.evidence}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#777587]">
                    {block.estimatedMinutes}m
                  </span>
                  {block.status === 'COMPLETED' ? (
                    <span className="text-xs font-headline font-bold text-[#006c49] px-2.5 py-1 rounded-full bg-[#e6f7ef] border border-[#6cf8bb]">
                      Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCompleteBlock(block.id)}
                      className="min-h-[36px] text-xs font-headline font-bold px-3.5 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white transition shadow-xs cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9-Dimension Readiness Matrix */}
        <section className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f1f3ff] pb-3 gap-2">
            <div>
              <h2 className="text-base font-headline font-bold text-[#141b2b]">9-Dimension Exam Readiness Matrix</h2>
              <p className="text-xs text-[#464555] mt-0.5">
                Descriptive observations across measurable preparation behaviors. No score predictions.
              </p>
            </div>
            <span className="text-xs font-headline font-bold px-3 py-1 rounded-full bg-[#e2dfff] text-[#3525cd] self-start sm:self-auto">
              Status: {readiness?.overallStatus || 'OPTIMAL'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {readiness?.dimensions.map((dim) => (
              <div
                key={dim.dimension}
                className="p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex flex-col justify-between space-y-2 hover:border-[#3525cd]/30 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-headline font-bold text-[#141b2b]">
                    {dim.dimension.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-headline font-bold px-2 py-0.5 rounded-full ${
                      dim.status === 'COMPLETED' || dim.status === 'OPTIMAL'
                        ? 'bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb]'
                        : dim.status === 'ON_TRACK'
                        ? 'bg-[#e2dfff] text-[#3525cd] border border-[#c3c0ff]'
                        : dim.status === 'DEVELOPING'
                        ? 'bg-[#fff8e1] text-[#b45309] border border-[#fde68a]'
                        : 'bg-[#fff1f0] text-[#ba1a1a] border border-[#ffdad6]'
                    }`}
                  >
                    {dim.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#464555] leading-relaxed">{dim.evidence}</p>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#777587] italic pt-2">
            {readiness?.nonPredictiveDisclaimer || 'Observational readiness based on active test telemetry and verified syllabus completion.'}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
