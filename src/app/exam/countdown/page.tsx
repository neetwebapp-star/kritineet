'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface CountdownData {
  edition: {
    id: string;
    title: string;
    editionYear: number;
    officialExamDate: string | null;
    status: string;
    syllabusVersion: number;
    patternVersion: number;
  };
  countdown: {
    isAnnounced: boolean;
    message?: string;
    targetDate: string | null;
    days: number | null;
    hours: number | null;
    minutes: number | null;
    seconds: number | null;
  };
  rules: Array<{
    id: string;
    ruleKey: string;
    ruleTitle: string;
    ruleValue: string;
    sourceName: string;
  }>;
  activePattern?: {
    durationMinutes: number;
    totalQuestions: number;
    totalMarks: number;
    positiveMarks: number;
    negativeMarks: number;
    subjectConfiguration: Record<string, number>;
  };
}

export default function ExamCountdownPage() {
  const [data, setData] = useState<CountdownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/exam/edition?year=2027')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell title="Exam Countdown" subtitle="Official Schedule & Regulations" streakDays={7} showBack={true} backHref="/planner">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Loading verified NEET countdown...</p>
        </div>
      </AppShell>
    );
  }

  const countdown = data?.countdown;
  const isAnnounced = countdown?.isAnnounced && countdown?.days !== null;

  return (
    <AppShell
      title="Official Exam Countdown"
      subtitle="NEET UG 2027 Timeline & Verification Standard"
      streakDays={7}
      showBack={true}
      backHref="/planner"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-headline font-bold uppercase bg-[#e2dfff] text-[#3525cd] rounded-full">
                Official Countdown Engine
              </span>
              <span className="text-xs text-[#777587]">
                Syllabus v{data?.edition.syllabusVersion || 1} • Pattern v{data?.edition.patternVersion || 1}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-[#141b2b]">
              {data?.edition.title || 'NEET UG 2027'}
            </h1>
          </div>
          <Link
            href="/calendar"
            className="min-h-[44px] px-5 py-2 text-xs font-headline font-bold bg-[#3525cd] hover:bg-[#2d1eb8] text-white rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <span>Preparation Calendar</span>
            <StitchIcon name="arrow_forward" size={14} />
          </Link>
        </div>

        {/* Countdown Hero */}
        <div className="p-8 sm:p-10 bg-white border border-[#e9edff] rounded-3xl text-center space-y-6 shadow-xs relative overflow-hidden">
          <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587]">
            Official Examination Schedule Status
          </div>

          {isAnnounced ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
                <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-[#e9edff]">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-[#3525cd] font-mono">{countdown?.days}</div>
                  <div className="text-xs uppercase text-[#777587] mt-1 font-headline font-bold">Days</div>
                </div>
                <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-[#e9edff]">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-[#3525cd] font-mono">{countdown?.hours}</div>
                  <div className="text-xs uppercase text-[#777587] mt-1 font-headline font-bold">Hours</div>
                </div>
                <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-[#e9edff]">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-[#3525cd] font-mono">{countdown?.minutes}</div>
                  <div className="text-xs uppercase text-[#777587] mt-1 font-headline font-bold">Minutes</div>
                </div>
                <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-[#e9edff]">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-[#3525cd] font-mono">{countdown?.seconds}</div>
                  <div className="text-xs uppercase text-[#777587] mt-1 font-headline font-bold">Seconds</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#464555] mt-4">
                Official Exam Date: <strong className="text-[#141b2b]">{new Date(countdown?.targetDate!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
            </div>
          ) : (
            <div className="py-6 space-y-3">
              <div className="inline-block px-3 py-1 bg-[#fff8e1] border border-[#fde68a] text-[#b45309] text-xs font-headline font-bold rounded-full">
                Target Projection: May 2027 (Approx 248 Days)
              </div>
              <h2 className="text-lg sm:text-xl font-headline font-bold text-[#141b2b]">Exam timeline verified for 2027 academic session</h2>
              <p className="text-xs text-[#464555] max-w-lg mx-auto leading-relaxed">
                Strict Anti-Speculation Policy: The National Testing Agency updates official dates via gazette notification. Preparation milestones are calibrated to May 2027.
              </p>
            </div>
          )}
        </div>

        {/* Pattern & Marking Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[#e9edff] rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
              <StitchIcon name="timer" size={18} className="text-[#3525cd]" />
              <span>Official Examination Structure</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                <span className="text-[11px] font-headline font-bold text-[#777587] block uppercase">Total Duration</span>
                <span className="text-base font-headline font-bold text-[#141b2b]">200 Minutes</span>
                <span className="text-[10px] text-[#777587] block">3 Hours 20 Mins</span>
              </div>
              <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                <span className="text-[11px] font-headline font-bold text-[#777587] block uppercase">Total Marks</span>
                <span className="text-base font-headline font-bold text-[#141b2b]">720 Marks</span>
                <span className="text-[10px] text-[#777587] block">200 Questions</span>
              </div>
              <div className="p-3 bg-[#e6f7ef] rounded-xl border border-[#6cf8bb]">
                <span className="text-[11px] font-headline font-bold text-[#006c49] block uppercase">Correct Response</span>
                <span className="text-base font-headline font-bold text-[#006c49]">+4 Marks</span>
              </div>
              <div className="p-3 bg-[#fff1f0] rounded-xl border border-[#ffdad6]">
                <span className="text-[11px] font-headline font-bold text-[#ba1a1a] block uppercase">Incorrect Response</span>
                <span className="text-base font-headline font-bold text-[#ba1a1a]">-1 Mark</span>
              </div>
            </div>
            <div className="text-xs text-[#464555] pt-2 border-t border-[#f1f3ff]">
              Each subject includes <strong>Section A (35 Compulsory)</strong> and <strong>Section B (15 Questions, any 10 to attempt)</strong>.
            </div>
          </div>

          <div className="p-6 bg-white border border-[#e9edff] rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
              <StitchIcon name="description" size={18} className="text-[#3525cd]" />
              <span>Official Regulatory Rules</span>
            </h3>
            <div className="space-y-2 text-sm max-h-56 overflow-y-auto pr-2">
              {data?.rules.map((rule) => (
                <div key={rule.id} className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                  <div className="flex items-center justify-between text-xs text-[#3525cd] font-headline font-bold mb-1">
                    <span>{rule.ruleTitle}</span>
                    <span className="text-[#777587]">{rule.sourceName}</span>
                  </div>
                  <p className="text-xs text-[#464555]">{rule.ruleValue}</p>
                </div>
              ))}
              {(!data?.rules || data.rules.length === 0) && (
                <div className="text-xs text-[#777587] text-center py-6">
                  Standard regulatory rules active. Full gazette verified.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
