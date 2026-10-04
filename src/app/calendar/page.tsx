'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface CalendarBlock {
  date: string;
  dayOfWeek: string;
  isRestDay: boolean;
  totalPlannedMinutes: number;
  tasks: Array<{
    id: string;
    type: 'STUDY' | 'REVISION' | 'PRACTICE' | 'TEST' | 'MOCK' | 'ASSIGNMENT' | 'MILESTONE';
    title: string;
    subject?: string;
    chapterTitle?: string;
    durationMinutes: number;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
    status: 'PENDING' | 'COMPLETED' | 'MISSED';
  }>;
}

export default function PreparationCalendarPage() {
  const [calendar, setCalendar] = useState<CalendarBlock[]>([]);
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH' | 'DAY'>('WEEK');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [planInfo, setPlanInfo] = useState<any>(null);

  const loadPlan = () => {
    fetch('/api/preparation/plan')
      .then((res) => res.json())
      .then((data) => {
        setPlanInfo(data.plan);
        setCalendar(data.plan?.calendar || []);
        setLoading(false);
        setRecalculating(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setRecalculating(false);
      });
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleRecalculate = () => {
    setRecalculating(true);
    fetch('/api/preparation/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Student adaptive recalculation' }),
    })
      .then((res) => res.json())
      .then(() => {
        loadPlan();
      })
      .catch((err) => {
        console.error(err);
        setRecalculating(false);
      });
  };

  const filters = ['ALL', 'STUDY', 'REVISION', 'PRACTICE', 'TEST', 'MOCK'];
  const displayedDays = viewMode === 'DAY' ? calendar.slice(0, 1) : viewMode === 'WEEK' ? calendar.slice(0, 7) : calendar;

  if (loading) {
    return (
      <AppShell title="Preparation Calendar" subtitle="Deterministic Schedule" streakDays={7} showBack={true} backHref="/planner">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#464555] text-xs font-headline font-semibold">Loading Preparation Calendar...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Preparation Calendar"
      subtitle="Capacity-Governed Schedule • NEET 2027"
      streakDays={7}
      showBack={true}
      backHref="/planner"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-headline font-bold uppercase bg-[#e2dfff] text-[#3525cd] rounded-full">
                Stage: {planInfo?.currentStage || 'FOUNDATION'}
              </span>
              <span className="text-xs text-[#777587]">Plan v{planInfo?.version || 1} • Capacity-Aware</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b]">
              Preparation Calendar
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
              Deterministic, capacity-governed schedule designed to guarantee NEET 2027 syllabus coverage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={recalculating}
              className="min-h-[44px] px-4 py-2 text-xs font-headline font-bold bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] border border-[#e1e8fd] rounded-xl transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <StitchIcon name="refresh" size={16} />
              <span>{recalculating ? 'Adapting...' : 'Adapt Schedule'}</span>
            </button>
            <Link
              href="/roadmap"
              className="min-h-[44px] px-5 py-2 text-xs font-headline font-bold bg-[#3525cd] hover:bg-[#2d1eb8] text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>View Roadmap</span>
              <StitchIcon name="arrow_forward" size={14} />
            </Link>
          </div>
        </div>

        {/* Capacity Warning Banner */}
        {planInfo?.isOverloaded && (
          <div className="p-4 bg-[#fff1f0] border border-[#ffdad6] rounded-2xl flex items-center justify-between text-xs text-[#ba1a1a] shadow-xs">
            <div className="flex items-center gap-2">
              <StitchIcon name="warning" size={18} className="text-[#ba1a1a]" />
              <span>
                <strong>Study Capacity Warning:</strong> Planned weekly load exceeds available hours ({planInfo?.plannedWorkloadHours}h planned vs {planInfo?.weeklyCapacityHours}h available). Lower-priority tasks deferred to buffer slots.
              </span>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#e9edff] rounded-2xl shadow-xs">
          <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-xl border border-[#e9edff]">
            {(['WEEK', 'MONTH', 'DAY'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`min-h-[36px] px-3.5 py-1 text-xs font-headline font-bold rounded-lg transition cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b]'
                }`}
              >
                {mode === 'WEEK' ? '7-Day View' : mode === 'MONTH' ? 'Full Fortnight' : 'Today'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`min-h-[36px] px-3 py-1 text-xs font-headline font-bold rounded-xl border transition cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#3525cd] border-[#3525cd] text-white shadow-xs'
                    : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Day Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedDays.map((day) => {
            const filteredTasks = day.tasks.filter((t) => activeFilter === 'ALL' || t.type === activeFilter);

            return (
              <div
                key={day.date}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition shadow-xs ${
                  day.isRestDay
                    ? 'bg-[#f1f3ff]/50 border-[#e9edff]'
                    : 'bg-white border-[#e9edff] hover:border-[#3525cd]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-2 mb-3">
                    <div>
                      <div className="text-sm font-headline font-bold text-[#141b2b]">{day.dayOfWeek}</div>
                      <div className="text-xs text-[#777587] font-mono">{day.date}</div>
                    </div>
                    <span className="text-xs font-headline font-bold px-2 py-0.5 rounded-full bg-[#f1f3ff] text-[#3525cd]">
                      {Math.round((day.totalPlannedMinutes / 60) * 10) / 10}h
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {filteredTasks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#777587]">
                        {day.isRestDay ? 'Rest / Buffer Window' : 'No tasks in this filter'}
                      </div>
                    ) : (
                      filteredTasks.map((task) => {
                        const typeBadgeColor =
                          task.type === 'REVISION'
                            ? 'bg-[#f5f3ff] text-[#8b5cf6] border-[#ddd6fe]'
                            : task.type === 'MOCK'
                            ? 'bg-[#fff1f0] text-[#ba1a1a] border-[#ffdad6]'
                            : task.type === 'PRACTICE'
                            ? 'bg-[#e6f7ef] text-[#006c49] border-[#6cf8bb]'
                            : 'bg-[#e2dfff] text-[#3525cd] border-[#c3c0ff]';

                        return (
                          <div
                            key={task.id}
                            className="p-3 bg-[#f9f9ff] border border-[#e9edff] rounded-xl space-y-1.5 hover:border-[#3525cd]/30 transition"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`px-2 py-0.5 text-[10px] font-headline font-bold rounded border ${typeBadgeColor}`}>
                                {task.type}
                              </span>
                              <span className="text-[10px] text-[#777587] font-mono">{task.durationMinutes}m</span>
                            </div>
                            <h4 className="text-xs font-headline font-bold text-[#141b2b] leading-snug line-clamp-2">
                              {task.title}
                            </h4>
                            {task.subject && (
                              <div className="text-[10px] text-[#777587] font-medium">{task.subject}</div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#f1f3ff] flex items-center justify-between text-[11px] text-[#777587]">
                  <span>{day.tasks.length} Blocks</span>
                  {day.isRestDay && <span className="text-[#006c49] font-bold">Recharge Day</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
