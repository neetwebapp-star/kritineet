'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch('/api/student/nta-notifications/unread')
      .then((res) => res.json())
      .then((json) => {
        if (json.unreadCount > 0 && json.latestNotice) {
          setUnreadNotice(json.latestNotice);
        }
      })
      .catch(() => {});
  }, []);

  const [unreadNotice, setUnreadNotice] = useState<any>(null);
  const stats = data?.stats || {};
  const student = data?.student || {};
  const dailyPlan = data?.dailyPlan || null;
  const overallMastery = data?.overallMastery ?? 68;
  const streakDays = student?.streakDays ?? 7;

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="Home • Preparation OS"
      streakDays={streakDays}
    >
      <div className="space-y-6">
        {/* NTA Official Alert Banner if unread */}
        {unreadNotice && (
          <div className="bg-[#fff8e1] rounded-2xl p-4 border border-[#ffe082] shadow-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#f57c00] text-white flex items-center justify-center flex-shrink-0">
                <StitchIcon name="notifications" size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#b78103] tracking-wider block">
                  Official NTA Update • {unreadNotice.authority}
                </span>
                <h4 className="font-bold text-xs text-[#141b2b] truncate max-w-lg">
                  {unreadNotice.title}
                </h4>
              </div>
            </div>
            <Link
              href={`/nta-notifications/${unreadNotice.id}`}
              className="px-3 py-1.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1ea8] transition-all flex items-center gap-1 flex-shrink-0 shadow-xs"
            >
              <span>View Notice</span>
              <StitchIcon name="arrow_forward" size={13} />
            </Link>
          </div>
        )}

        {/* Welcome Greeting & Target Date Banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#f1f3ff] rounded-2xl p-5 sm:p-6 border border-[#e1e8fd] shadow-xs gap-4">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b]">
                Good Morning, Kriti
              </h1>
              <span className="text-xl">✨</span>
            </div>
            <p className="text-sm text-[#464555] mt-1">
              Keep going, you&apos;re doing great! NEET UG 2027 Syllabus is on track.
            </p>
          </div>
          <div className="flex items-center sm:flex-col items-start sm:items-end justify-between bg-white px-4 py-2.5 rounded-xl border border-[#e9edff] shadow-xs">
            <span className="text-[11px] uppercase font-bold text-[#777587] tracking-wider">
              Target Date
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline font-bold text-lg sm:text-xl text-[#3525cd]">
                248 Days
              </span>
              <span className="text-xs text-[#006c49] font-semibold">May 2027</span>
            </div>
          </div>
        </section>

        {/* Quick Stats Micro Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stat 1: Study Time */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e9edff] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#464555] uppercase tracking-wide">
                Study Time
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
                <StitchIcon name="schedule" size={17} />
              </div>
            </div>
            <div>
              <div className="font-headline font-bold text-2xl text-[#141b2b]">
                2h 45m
              </div>
              <div className="text-xs text-[#777587] mt-0.5">
                of 6h daily target
              </div>
            </div>
          </div>

          {/* Stat 2: Questions Solved */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e9edff] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#464555] uppercase tracking-wide">
                Questions Solved
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#6cf8bb]/30 flex items-center justify-center text-[#006c49]">
                <StitchIcon name="task_alt" size={17} />
              </div>
            </div>
            <div>
              <div className="font-headline font-bold text-2xl text-[#141b2b]">
                {stats.questionsSolved ?? 48} Qs
              </div>
              <div className="text-xs text-[#006c49] font-semibold mt-0.5">
                +12 today
              </div>
            </div>
          </div>

          {/* Stat 3: Memory Retention */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e9edff] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#464555] uppercase tracking-wide">
                Memory Retention
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#d8e2ff] flex items-center justify-center text-[#004598]">
                <StitchIcon name="memory" size={17} />
              </div>
            </div>
            <div>
              <div className="font-headline font-bold text-2xl text-[#141b2b]">
                92%
              </div>
              <div className="text-xs text-[#004598] font-semibold mt-0.5">
                Optimal Leitner state
              </div>
            </div>
          </div>
        </section>

        {/* Primary Action Hero: Dynamic ONE CURRENT MISSION */}
        {(() => {
          const mission = data?.nextAction || {
            actionType: 'DPP',
            title: 'High-Yield NCERT Practice Sprint',
            description: 'Strengthen core biological classification with 15 verified questions.',
            estimatedMinutes: 20,
            subjectName: 'Biology',
            reason: 'Regular daily practice maintains consistency.',
            priority: 'HIGH',
            ctaLabel: 'Execute Mission Now',
            targetRoute: '/dpp',
          };

          return (
            <section className="bg-gradient-to-r from-[#3525cd] via-[#4338ca] to-[#4f46e5] text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-headline font-bold uppercase tracking-wider backdrop-blur-xs">
                      Your Current Mission
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#6cf8bb] text-[10px] font-bold">
                      {mission.estimatedMinutes} Mins
                    </span>
                    <span className="text-xs text-[#c3c0ff] font-semibold">
                      • {mission.subjectName}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-headline font-bold text-xl sm:text-2xl text-white tracking-tight leading-snug">
                      {mission.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#dad7ff] mt-1 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#e0e7ff]/90 bg-black/15 px-3 py-1.5 rounded-xl w-max">
                    <StitchIcon name="psychology" size={15} className="text-[#6cf8bb]" />
                    <span className="font-medium">Reason: {mission.reason}</span>
                  </div>
                </div>

                <Link
                  href={mission.targetRoute}
                  className="sm:self-center px-7 py-4 rounded-2xl bg-white hover:bg-[#f1f3ff] text-[#3525cd] font-headline font-extrabold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 flex-shrink-0 group/btn"
                >
                  <span>{mission.ctaLabel || 'Start Mission Now'}</span>
                  <StitchIcon name="arrow_forward" size={17} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          );
        })()}

        {/* Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Today's Focus Plan (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e9edff] shadow-xs flex flex-col gap-5">
              {/* Header with Circular Progress Ring */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-[#141b2b]">
                    Today&apos;s Focus Plan
                  </h2>
                  <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
                    2 of 3 modules completed
                  </p>
                </div>
                {/* SVG Progress Ring */}
                <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#e1e8fd]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#4f46e5]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="68, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute font-headline font-bold text-xs sm:text-sm text-[#141b2b]">
                    68%
                  </span>
                </div>
              </div>

              {/* Sequential Study Steps List */}
              <div className="space-y-3">
                {/* Step 1: NCERT Reading (Done) */}
                <Link
                  href="/ncert/monera-archaebacteria"
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#6cf8bb]/40 text-[#00714d] flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="check" size={18} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-semibold text-sm text-[#141b2b] line-through text-[#777587]">
                        NCERT Reading
                      </span>
                      <span className="text-[10px] font-bold text-[#00714d] bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    </div>
                    <p className="text-xs text-[#777587] truncate">
                      Biological Classification (pp. 19–28)
                    </p>
                  </div>
                </Link>

                {/* Step 2: DPP (In Progress) */}
                <Link
                  href="/dpp/challenger"
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#e2dfff]/40 border border-[#c3c0ff]/60 hover:bg-[#e2dfff]/60 transition-colors shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="draw" size={18} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-semibold text-sm text-[#141b2b]">
                        Fingertips DPP 02
                      </span>
                      <span className="text-[10px] font-bold text-[#3525cd] bg-[#e1e8fd] px-2 py-0.5 rounded-full">
                        18/25 Qs
                      </span>
                    </div>
                    <p className="text-xs text-[#464555] truncate">
                      Plant Kingdom • Gymnosperms
                    </p>
                  </div>
                </Link>

                {/* Step 3: Smart Revision (Next Up) */}
                <Link
                  href="/today"
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] hover:bg-[#f1f3ff] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#dce2f7] text-[#464555] flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="autorenew" size={18} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-semibold text-sm text-[#141b2b]">
                        Smart Revision
                      </span>
                      <span className="text-[10px] font-bold text-[#464555] bg-[#e1e8fd] px-2 py-0.5 rounded-full">
                        Next Up
                      </span>
                    </div>
                    <p className="text-xs text-[#464555] truncate">
                      Chemical Bonding • Due Today
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Syllabus & Diagnostic (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Syllabus Completion Card */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e9edff] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-base sm:text-lg text-[#141b2b]">
                  Syllabus Completion
                </h2>
                <Link
                  href="/analytics"
                  className="text-xs font-bold text-[#3525cd] flex items-center gap-0.5 hover:underline"
                >
                  View All
                  <StitchIcon name="chevron_right" size={14} />
                </Link>
              </div>

              <div className="space-y-3.5">
                {/* Biology */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#141b2b]">Biology</span>
                    <span className="font-bold text-[#006c49]">74%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                    <div
                      className="h-full bg-[#006c49] rounded-full transition-all duration-500"
                      style={{ width: '74%' }}
                    />
                  </div>
                </div>

                {/* Chemistry */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#141b2b]">Chemistry</span>
                    <span className="font-bold text-[#3525cd]">61%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                    <div
                      className="h-full bg-[#3525cd] rounded-full transition-all duration-500"
                      style={{ width: '61%' }}
                    />
                  </div>
                </div>

                {/* Physics */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#141b2b]">Physics</span>
                    <span className="font-bold text-[#ba1a1a]">54%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                    <div
                      className="h-full bg-[#ba1a1a] rounded-full transition-all duration-500"
                      style={{ width: '54%' }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Diagnostic Alert Card with DNA Illustration */}
            <section className="bg-gradient-to-br from-[#f1f3ff] to-[#e1e8fd]/60 rounded-2xl p-5 border border-[#e1e8fd] shadow-xs flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#3525cd] uppercase tracking-wider w-max mb-1.5 shadow-2xs">
                  NEET 2027 Diagnostic
                </span>
                <h3 className="font-headline font-bold text-sm sm:text-base text-[#141b2b]">
                  Weak Area Detected
                </h3>
                <p className="text-xs text-[#464555] mt-1">
                  3 missed questions in Rotational Dynamics from yesterday&apos;s drill.
                </p>
                <Link
                  href="/remediation"
                  className="mt-3 text-xs font-bold text-[#3525cd] inline-flex items-center gap-1 hover:underline"
                >
                  Start 5-min drill
                  <StitchIcon name="arrow_forward" size={14} />
                </Link>
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-xs relative bg-white border border-[#e9edff]">
                <Image
                  src="/stitch/dna-stethoscope.png"
                  alt="Diagnostic Art"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
