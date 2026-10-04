'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function WeeklyPlannerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/plan/week')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell title="7-Day Study Matrix" subtitle="Weekly Horizon" streakDays={7} showBack={true} backHref="/today">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Loading 7-Day Study Matrix...</p>
        </div>
      </AppShell>
    );
  }

  const days = data?.days || [];

  return (
    <AppShell
      title="7-Day Study Matrix"
      subtitle="Weekly Operating Horizon • Capacity-Balanced"
      streakDays={7}
      showBack={true}
      backHref="/today"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-[#e2dfff] text-[#3525cd]">
                Weekly Horizon
              </span>
              <span className="text-xs text-[#777587]">
                Total Planned: {data?.totalPlannedMinutes || 0}m &bull; Actual: {data?.totalActualMinutes || 0}m
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-[#141b2b]">
              7-Day Study Execution Grid
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
              Syllabus pacing distributed across daily blocks to guarantee steady mastery.
            </p>
          </div>
          <Link
            href="/today"
            className="min-h-[44px] px-5 py-2 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <span>Execute Today</span>
            <StitchIcon name="arrow_forward" size={14} />
          </Link>
        </div>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map((day: any) => {
            const dateObj = new Date(day.date);
            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();

            return (
              <div
                key={day.date}
                className="bg-white border border-[#e9edff] rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-[#3525cd]/30 transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-2 mb-3">
                    <div>
                      <span className="text-[11px] font-headline font-bold text-[#777587] uppercase">{weekday}</span>
                      <p className="text-lg font-headline font-bold text-[#141b2b]">{dayNum}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f3ff] text-[#3525cd] font-headline font-bold">
                      {day.plannedMinutes}m
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.tasks.slice(0, 4).map((t: any) => (
                      <div
                        key={t.id}
                        className="bg-[#f9f9ff] border border-[#e9edff] p-2.5 rounded-xl text-xs space-y-1 hover:border-[#3525cd]/20 transition"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#777587]">
                          <span className="font-headline font-bold text-[#006c49]">{t.subjectCode}</span>
                          <span>{t.estimatedMinutes}m</span>
                        </div>
                        <p className="font-medium text-[#141b2b] line-clamp-1">{t.title}</p>
                        <span className="text-[10px] text-[#777587] block">{t.taskType}</span>
                      </div>
                    ))}
                    {day.tasks.length > 4 && (
                      <p className="text-[11px] text-[#777587] text-center pt-1">
                        +{day.tasks.length - 4} more tasks
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#f1f3ff] flex items-center justify-between text-[11px] text-[#777587]">
                  <span>Actual: {day.actualMinutes}m</span>
                  <span className={day.actualMinutes >= day.plannedMinutes ? 'text-[#006c49] font-bold' : 'text-[#777587]'}>
                    {day.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
