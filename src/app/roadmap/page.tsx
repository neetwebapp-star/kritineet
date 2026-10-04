'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function PreparationRoadmapPage() {
  const [data, setData] = useState<any>(null);
  const [coverageData, setCoverageData] = useState<any>(null);
  const [countdownData, setCountdownData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/preparation/plan').then((r) => r.json()),
      fetch('/api/preparation/pyq-coverage').then((r) => r.json()),
      fetch('/api/exam/edition').then((r) => r.json()),
    ])
      .then(([planRes, covRes, cdRes]) => {
        setData(planRes.plan);
        setCoverageData(covRes);
        setCountdownData(cdRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell title="Preparation Roadmap" subtitle="Milestone Execution Matrix" streakDays={7} showBack={true} backHref="/planner">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#464555] text-xs font-headline font-semibold">Compiling Exam Readiness Roadmap...</span>
        </div>
      </AppShell>
    );
  }

  const stages = [
    'FOUNDATION',
    'SYLLABUS_COMPLETION',
    'FIRST_REVISION',
    'PYQ_PHASE',
    'MOCK_PHASE',
    'FINAL_REVISION',
    'EXAM_READY',
  ];
  const currentStage = data?.currentStage || 'FOUNDATION';
  const stageIndex = stages.indexOf(currentStage);

  const countdown = countdownData?.countdown;
  const ncert = coverageData?.ncertCoverage;

  return (
    <AppShell
      title="Preparation Roadmap"
      subtitle="Time-Aware NTA Syllabus Coverage • NEET 2027"
      streakDays={7}
      showBack={true}
      backHref="/planner"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top: Header & Exam Countdown */}
        <div className="p-6 md:p-8 bg-white border border-[#e9edff] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-headline font-bold text-[#3525cd]">
              Target Milestone • NEET UG 2027
            </span>
            <h1 className="text-xl md:text-2xl font-headline font-bold text-[#141b2b]">Exam Preparation Roadmap</h1>
            <p className="text-xs text-[#464555]">
              Time-aware execution matrix aligned with official NTA syllabus versioning.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#f9f9ff] p-4 rounded-2xl border border-[#e9edff] text-center">
            {countdown?.isAnnounced && countdown?.days !== null ? (
              <div className="flex items-center gap-4 font-mono">
                <div>
                  <div className="text-2xl font-headline font-bold text-[#3525cd]">{countdown.days}</div>
                  <div className="text-[10px] text-[#777587] uppercase font-bold">Days</div>
                </div>
                <div className="text-[#c7c4d8] text-xl font-bold">:</div>
                <div>
                  <div className="text-2xl font-headline font-bold text-[#3525cd]">{countdown.hours}</div>
                  <div className="text-[10px] text-[#777587] uppercase font-bold">Hours</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#006c49] font-headline font-bold px-2">
                248 Days to Exam Window
              </div>
            )}
            <Link
              href="/exam/countdown"
              className="ml-3 min-h-[36px] px-3.5 py-1.5 text-xs font-headline font-bold bg-white hover:bg-[#f1f3ff] text-[#3525cd] border border-[#e9edff] rounded-xl transition flex items-center gap-1"
            >
              <span>Countdown</span>
              <StitchIcon name="arrow_forward" size={14} />
            </Link>
          </div>
        </div>

        {/* Stage Progression Bar */}
        <div className="p-6 bg-white border border-[#e9edff] rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-headline font-bold text-[#141b2b]">Current Preparation Stage</h3>
            <span className="text-xs font-headline font-bold px-3 py-1 rounded-full bg-[#e2dfff] text-[#3525cd]">
              {currentStage.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {stages.map((st, idx) => {
              const isPast = idx < stageIndex;
              const isCurrent = idx === stageIndex;
              return (
                <div key={st} className="space-y-1.5 text-center">
                  <div
                    className={`h-2.5 rounded-full ${
                      isPast
                        ? 'bg-[#006c49]'
                        : isCurrent
                        ? 'bg-[#3525cd]'
                        : 'bg-[#f1f3ff]'
                    }`}
                  />
                  <div
                    className={`text-[9px] uppercase tracking-tighter truncate font-headline font-bold ${
                      isCurrent ? 'text-[#3525cd]' : isPast ? 'text-[#006c49]' : 'text-[#777587]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coverage Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-[#e9edff] rounded-2xl shadow-xs">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] block mb-1">
              NCERT Syllabus Coverage
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-headline font-bold text-[#006c49]">
                {ncert?.coveragePercentage ?? 68}%
              </span>
              <span className="text-xs text-[#777587]">
                ({ncert?.coveredConcepts ?? 340} / {ncert?.totalConcepts ?? 500} Concepts)
              </span>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#e9edff] rounded-2xl shadow-xs">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] block mb-1">
              Concept Mastery Depth
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-headline font-bold text-[#3525cd]">
                {ncert?.masteryPercentage ?? 74}%
              </span>
              <span className="text-xs text-[#777587]">
                ({ncert?.masteredConcepts ?? 245} Mastered)
              </span>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#e9edff] rounded-2xl shadow-xs">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] block mb-1">
              Active Revision Load
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-headline font-bold text-[#8b5cf6]">
                {ncert?.needsRevisionConcepts ?? 12}
              </span>
              <span className="text-xs text-[#777587]">Due for Spaced Review</span>
            </div>
          </div>
        </div>

        {/* Monthly Milestones Breakdown */}
        <div className="space-y-4">
          <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
            <StitchIcon name="event" size={18} className="text-[#3525cd]" />
            <span>Monthly Preparation Roadmap</span>
          </h3>

          <div className="space-y-3">
            {data?.roadmap?.map((month: any, idx: number) => (
              <div
                key={month.monthKey || idx}
                className="p-5 sm:p-6 bg-white border border-[#e9edff] rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:border-[#3525cd]/30 transition shadow-xs"
              >
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-headline font-bold text-[#141b2b]">{month.monthName}</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-headline font-bold rounded-full bg-[#e2dfff] text-[#3525cd]">
                      {month.stage.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-[#777587] font-semibold block">Target Chapters:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {month.targetChaptersToComplete.map((chap: string) => (
                        <span key={chap} className="px-2 py-0.5 text-xs bg-[#f1f3ff] text-[#464555] rounded-lg border border-[#e1e8fd]">
                          {chap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center shrink-0 border-t md:border-t-0 md:border-l border-[#f1f3ff] pt-4 md:pt-0 md:pl-6">
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-[10px] uppercase font-headline font-bold text-[#777587] block">PYQ Target</span>
                    <span className="text-lg font-headline font-bold text-[#006c49]">+{month.pyqTargetCount}</span>
                  </div>
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-[10px] uppercase font-headline font-bold text-[#777587] block">Full Mocks</span>
                    <span className="text-lg font-headline font-bold text-[#3525cd]">{month.mockTestsScheduled} Tests</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
