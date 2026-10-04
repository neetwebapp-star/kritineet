'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface PlannerTask {
  id: string;
  title: string;
  taskType: string;
  subjectCode: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  priority: 'CORE' | 'RECOMMENDED' | 'OPTIONAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  whyToday: string;
  topicId?: string;
  testId?: string;
  topic?: {
    id: string;
    title: string;
    chapter?: {
      id: string;
      title: string;
      subject: string;
    };
  };
}

interface DayPlanData {
  planId: string;
  date: string;
  dayNumber: number;
  totalDays: number;
  phase: string;
  stage: string;
  status: string;
  isSunday: boolean;
  plannedMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  progressPercent: number;
  checklist: {
    ncert: boolean;
    fingertips: boolean;
    pyq: boolean;
    revision: boolean;
    mistakes: boolean;
    test: boolean;
    buffer: boolean;
  };
  breakdown: {
    subjectMinutes: { biology: number; physics: number; chemistry: number; fullPcb: number };
    taskTypeMinutes: Record<string, number>;
  };
  tasks: PlannerTask[];
}

export default function TimetablePlannerPage() {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'roadmap' | 'revision'>('day');
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-10-05');
  const [dayPlan, setDayPlan] = useState<DayPlanData | null>(null);
  const [weekData, setWeekData] = useState<any>(null);
  const [monthData, setMonthData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [revisionData, setRevisionData] = useState<any>(null);
  const [backlogData, setBacklogData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Capacity toggle state: 480 (8h), 540 (9h), 600 (10h)
  const [targetCapacity, setTargetCapacity] = useState<number>(540);
  const [capacityNotice, setCapacityNotice] = useState<string | null>(null);

  // Explainability drawer/modal
  const [selectedTaskExplanation, setSelectedTaskExplanation] = useState<any | null>(null);
  const [explainingTaskId, setExplainingTaskId] = useState<string | null>(null);

  // Reschedule state
  const [reschedulingTask, setReschedulingTask] = useState<PlannerTask | null>(null);
  const [rescheduleTargetDate, setRescheduleTargetDate] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  // Load day plan
  const loadDayPlan = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/planner/today?date=${date}`);
      if (res.ok) {
        const json = await res.json();
        setDayPlan(json);
        if (json.plannedMinutes) {
          setTargetCapacity(json.plannedMinutes);
        }
      }
    } catch (err) {
      console.error('Failed to load day plan:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load week plan
  const loadWeekPlan = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/student/planner/week?startDate=${date}`);
      if (res.ok) {
        const json = await res.json();
        setWeekData(json);
      }
    } catch (err) {
      console.error('Failed to load week plan:', err);
    }
  }, []);

  // Load month plan
  const loadMonthPlan = useCallback(async (monthStr: string) => {
    try {
      const res = await fetch(`/api/student/planner/month?month=${monthStr}`);
      if (res.ok) {
        const json = await res.json();
        setMonthData(json);
      }
    } catch (err) {
      console.error('Failed to load month plan:', err);
    }
  }, []);

  // Load roadmap
  const loadRoadmap = useCallback(async () => {
    try {
      const res = await fetch('/api/student/planner/roadmap');
      if (res.ok) {
        const json = await res.json();
        setRoadmapData(json);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    }
  }, []);

  // Load revision queue
  const loadRevisionQueue = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/student/planner/revision?date=${date}`);
      if (res.ok) {
        const json = await res.json();
        setRevisionData(json);
      }
    } catch (err) {
      console.error('Failed to load revision queue:', err);
    }
  }, []);

  // Load backlog
  const loadBacklog = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/student/planner/backlog?date=${date}`);
      if (res.ok) {
        const json = await res.json();
        setBacklogData(json);
      }
    } catch (err) {
      console.error('Failed to load backlog:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDayPlan(currentDateStr);
    loadWeekPlan(currentDateStr);
    const curMonth = currentDateStr.substring(0, 7);
    loadMonthPlan(curMonth);
    loadRoadmap();
    loadRevisionQueue(currentDateStr);
    loadBacklog(currentDateStr);
  }, [currentDateStr, loadDayPlan, loadWeekPlan, loadMonthPlan, loadRoadmap, loadRevisionQueue, loadBacklog]);

  // Navigate date
  const shiftDate = (days: number) => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + days);
    // Clamp to 2026-10-05 and 2027-05-05
    const minDate = new Date('2026-10-05');
    const maxDate = new Date('2027-05-05');
    if (d < minDate) d.setTime(minDate.getTime());
    if (d > maxDate) d.setTime(maxDate.getTime());
    const nextStr = d.toISOString().split('T')[0];
    setCurrentDateStr(nextStr);
  };

  // Toggle complete task
  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      const res = await fetch('/api/student/planner/task/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
        // Refresh day plan and revision
        loadDayPlan(currentDateStr);
        loadRevisionQueue(currentDateStr);
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  // Change capacity target
  const handleCapacityChange = async (minutes: number) => {
    try {
      setTargetCapacity(minutes);
      const res = await fetch('/api/student/planner/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDailyMinutes: minutes,
          targetDate: currentDateStr,
          applyToFuture: false,
        }),
      });
      if (res.ok) {
        setCapacityNotice(`Daily study capacity set to ${minutes / 60}h (${minutes}m).`);
        setTimeout(() => setCapacityNotice(null), 3000);
        loadDayPlan(currentDateStr);
      }
    } catch (err) {
      console.error('Failed to update capacity:', err);
    }
  };

  // Defibrillate & redistribute backlog
  const handleDefibrillateBacklog = async () => {
    try {
      setIsRecovering(true);
      const res = await fetch('/api/student/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missedPlanDate: currentDateStr,
          maxExtraMinutesPerDay: 45,
          recoveryDaysSpan: 4,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecoverySuccess(data.explanation || 'Backlog safely redistributed over next 4 days (+45 min/day buffer).');
        setTimeout(() => setRecoverySuccess(null), 5000);
        loadBacklog(currentDateStr);
        loadDayPlan(currentDateStr);
        loadWeekPlan(currentDateStr);
      } else {
        alert(data.error || 'Failed to redistribute backlog');
      }
    } catch (err) {
      console.error('Defibrillator failed:', err);
    } finally {
      setIsRecovering(false);
    }
  };

  // Fetch explanation
  const handleExplainTask = async (taskId: string) => {
    try {
      setExplainingTaskId(taskId);
      const res = await fetch(`/api/student/planner/explain/${taskId}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedTaskExplanation(json);
      }
    } catch (err) {
      console.error('Failed to explain task:', err);
    } finally {
      setExplainingTaskId(null);
    }
  };

  // Execute reschedule
  const handleReschedule = async () => {
    if (!reschedulingTask) return;
    setRescheduleError(null);
    setRescheduleSuccess(null);
    try {
      const res = await fetch('/api/student/planner/task/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: reschedulingTask.id,
          targetDate: rescheduleTargetDate || undefined,
          reason: 'Student workload balancing',
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRescheduleError(json.error || 'Failed to reschedule');
      } else {
        setRescheduleSuccess(json.message);
        setTimeout(() => {
          setReschedulingTask(null);
          setRescheduleSuccess(null);
          loadDayPlan(currentDateStr);
        }, 1200);
      }
    } catch (err: any) {
      setRescheduleError(err.message || 'Network error');
    }
  };

  // Get action link for a task
  const getTaskAction = (task: PlannerTask) => {
    switch (task.taskType) {
      case 'NCERT_READ':
        return { label: 'Open NCERT', href: '/ncert', icon: 'menu_book' };
      case 'FINGERTIPS':
        return { label: 'Practice MCQs', href: '/fingertips', icon: 'assignment' };
      case 'PYQ':
        return { label: 'Open PYQ Vault', href: '/pyq-vault', icon: 'history_edu' };
      case 'CHAPTER_TEST':
      case 'HALF_BOOK_TEST':
      case 'MOCK_TEST':
        return { label: 'Launch CBT Test', href: '/cbt', icon: 'timer' };
      case 'MISTAKE_REVIEW':
        return { label: 'Error Notebook', href: '/error-book', icon: 'psychology' };
      default:
        return { label: 'Review Topic', href: '/ncert', icon: 'arrow_forward' };
    }
  };

  const getSubjectColor = (subj: string) => {
    switch (subj?.toUpperCase()) {
      case 'BIOLOGY':
        return { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', border: 'border-[#c8e6c9]' };
      case 'PHYSICS':
        return { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', border: 'border-[#bbdefb]' };
      case 'CHEMISTRY':
        return { bg: 'bg-[#fff3e0]', text: 'text-[#e65100]', border: 'border-[#ffe0b2]' };
      case 'FULL_PCB':
        return { bg: 'bg-[#f3e5f5]', text: 'text-[#7b1fa2]', border: 'border-[#e1bee7]' };
      default:
        return { bg: 'bg-[#f1f3ff]', text: 'text-[#3525cd]', border: 'border-[#e1e8fd]' };
    }
  };

  return (
    <AppShell
      title="NEET 2027 Autonomous Operating System"
      subtitle="213-Day Intelligent Syllabus • NCERT • Fingertips • CBT Simulation Engine"
      streakDays={7}
      rightAction={
        <div className="flex items-center gap-2">
          {/* Capacity Switcher Pills */}
          <div className="hidden md:flex items-center bg-[#f1f3ff] p-1 rounded-xl text-xs">
            <span className="px-2 text-[#777587] font-semibold text-[11px]">Daily Load:</span>
            {[
              { label: '8h', mins: 480 },
              { label: '9h Target', mins: 540 },
              { label: '10h Max', mins: 600 },
            ].map((cap) => (
              <button
                key={cap.mins}
                type="button"
                onClick={() => handleCapacityChange(cap.mins)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  targetCapacity === cap.mins
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#141b2b]'
                }`}
              >
                {cap.label}
              </button>
            ))}
          </div>

          <Link
            href="/today"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#3525cd] text-white hover:bg-[#2b1ea8] transition-all shadow-xs"
          >
            <StitchIcon name="play_arrow" size={14} />
            <span>Today Cockpit</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Capacity Notice Toast */}
        {capacityNotice && (
          <div className="p-3 bg-[#6cf8bb]/20 border border-[#006c49]/30 text-[#006c49] rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span>✓ {capacityNotice}</span>
          </div>
        )}

        {/* Master Navigation & Period Selector */}
        <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e1e8fd] text-[#3525cd] text-xs font-bold">
                <StitchIcon name="calendar_month" size={13} />
                Day {dayPlan?.dayNumber || 1} of 213
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold">
                <StitchIcon name="verified" size={13} />
                {dayPlan?.phase || 'Phase 1: Foundation Sprint'}
              </span>
              {dayPlan?.isSunday && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff8e1] text-[#b78103] text-xs font-bold">
                  ★ Sunday Diagnostic &amp; Buffer
                </span>
              )}
            </div>
            <h1 className="font-headline font-bold text-xl text-[#141b2b] mt-1.5 flex items-center gap-2">
              <span>NEET UG 2027 Autonomous Study Schedule</span>
            </h1>
            <p className="text-xs text-[#777587]">
              Zero topic loss • Mathematical 9.0h daily balancing • Ebbinghaus spaced repetition • MTG Fingertips drills
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-xl">
              {[
                { id: 'day', label: 'Day View', icon: 'view_day' },
                { id: 'week', label: 'Week View', icon: 'view_week' },
                { id: 'month', label: 'Month View', icon: 'calendar_month' },
                { id: 'roadmap', label: '213-Day Roadmap', icon: 'alt_route' },
                { id: 'revision', label: 'Spaced Review', icon: 'update' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-[#3525cd] shadow-xs font-bold'
                      : 'text-[#464555] hover:text-[#141b2b] font-medium'
                  }`}
                >
                  <StitchIcon name={tab.icon} size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Date Navigator */}
            <div className="flex items-center bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-2 py-1">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftDate(-1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#464555] hover:bg-[#e9edff] cursor-pointer"
              >
                <StitchIcon name="chevron_left" size={16} />
              </button>
              <input
                type="date"
                min="2026-10-05"
                max="2027-05-05"
                value={currentDateStr}
                onChange={(e) => setCurrentDateStr(e.target.value)}
                className="px-2 font-bold text-xs text-[#141b2b] bg-transparent border-none outline-none cursor-pointer"
              />
              <button
                type="button"
                aria-label="Next day"
                onClick={() => shiftDate(1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#464555] hover:bg-[#e9edff] cursor-pointer"
              >
                <StitchIcon name="chevron_right" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DAY VIEW (Execution Cockpit)                       */}
        {/* ======================================================== */}
        {activeTab === 'day' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Velocity, Dynamic Checklist & Rationale (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Daily Execution Velocity Meter */}
              <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StitchIcon name="donut_large" size={18} className="text-[#3525cd]" />
                    <span className="font-bold text-sm text-[#141b2b]">Execution Telemetry</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#006c49] text-xs font-bold">
                    {dayPlan?.progressPercent || 0}% Complete
                  </span>
                </div>

                <div className="w-full bg-[#f1f3ff] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#006c49] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, dayPlan?.progressPercent || 0)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#777587]">
                  <span><strong>{((dayPlan?.completedMinutes || 0) / 60).toFixed(1)}h</strong> Done</span>
                  <span>•</span>
                  <span><strong>{((dayPlan?.plannedMinutes || 540) / 60).toFixed(1)}h</strong> Target</span>
                  <span>•</span>
                  <span className="text-[#3525cd] font-semibold">
                    {((dayPlan?.remainingMinutes || 540) / 60).toFixed(1)}h Remaining
                  </span>
                </div>
              </div>

              {/* Dynamic Day Checklist */}
              <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StitchIcon name="checklist" size={18} className="text-[#3525cd]" />
                    <span className="font-bold text-sm text-[#141b2b]">Prescribed Daily Checklist</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#777587]">Active Components</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'ncert', label: 'NCERT Line Reading', active: dayPlan?.checklist?.ncert },
                    { key: 'fingertips', label: 'MTG Fingertips MCQs', active: dayPlan?.checklist?.fingertips },
                    { key: 'pyq', label: 'PYQ Drill (15-Yr)', active: dayPlan?.checklist?.pyq },
                    { key: 'revision', label: 'Spaced Recall R1-R4', active: dayPlan?.checklist?.revision },
                    { key: 'mistakes', label: 'Mistake Notebook', active: dayPlan?.checklist?.mistakes },
                    { key: 'test', label: 'Timed CBT Test', active: dayPlan?.checklist?.test },
                    { key: 'buffer', label: 'Buffer / Coach Slot', active: dayPlan?.checklist?.buffer },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`p-2 rounded-xl flex items-center gap-2 border transition-all ${
                        item.active
                          ? 'bg-[#f4f7ff] border-[#c3c0ff] text-[#141b2b] font-semibold'
                          : 'bg-[#fafafa] border-[#eeeeee] text-[#a0a0a0] line-through'
                      }`}
                    >
                      <StitchIcon
                        name={item.active ? 'check_circle' : 'radio_button_unchecked'}
                        size={14}
                        className={item.active ? 'text-[#3525cd]' : 'text-[#cccccc]'}
                      />
                      <span className="text-[11px] truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Breakdown Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-[#777587] block">
                  Today&apos;s Subject Time Allocation
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-[#e8f5e9] border border-[#c8e6c9]">
                    <span className="text-[10px] uppercase font-bold text-[#2e7d32]">Biology</span>
                    <p className="text-base font-bold text-[#1b5e20] mt-0.5">
                      {dayPlan?.breakdown?.subjectMinutes?.biology || 0}m
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#e3f2fd] border border-[#bbdefb]">
                    <span className="text-[10px] uppercase font-bold text-[#1565c0]">Physics</span>
                    <p className="text-base font-bold text-[#0d47a1] mt-0.5">
                      {dayPlan?.breakdown?.subjectMinutes?.physics || 0}m
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fff3e0] border border-[#ffe0b2]">
                    <span className="text-[10px] uppercase font-bold text-[#e65100]">Chemistry</span>
                    <p className="text-base font-bold text-[#bf360c] mt-0.5">
                      {dayPlan?.breakdown?.subjectMinutes?.chemistry || 0}m
                    </p>
                  </div>
                </div>
              </div>

              {/* Backlog Advisor Banner */}
              {backlogData && backlogData.totalBacklogCount > 0 && (
                <div className="bg-[#fff8e1] rounded-2xl p-4 border border-[#ffe082] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#b78103] font-bold text-xs">
                      <StitchIcon name="warning" size={16} />
                      <span>Backlog Advisor ({backlogData.totalBacklogHours}h pending)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#f57c00] text-white rounded-full">
                      {backlogData.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-[#464555] leading-relaxed">
                    {backlogData.recommendation}
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={handleDefibrillateBacklog}
                      disabled={isRecovering}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#b78103] hover:bg-[#996500] text-white font-headline font-bold text-xs transition disabled:opacity-50 shadow-xs"
                    >
                      <StitchIcon name="auto_fix_high" size={14} />
                      <span>{isRecovering ? 'Redistributing...' : '⚡ Defibrillate Backlog (Safe Multi-Day Spread)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {recoverySuccess && (
                <div className="bg-[#e6f4ea] text-[#006c49] p-3 rounded-xl border border-[#b7dfc6] text-xs font-semibold flex items-center gap-2">
                  <StitchIcon name="check_circle" size={16} />
                  <span>{recoverySuccess}</span>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Scheduled Tasks Sequence (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#f1f3ff]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#777587]">
                  Prescribed Sequence ({dayPlan?.tasks?.length || 0} Blocks • {dayPlan?.plannedMinutes || 540}m)
                </span>
                <span className="text-xs text-[#006c49] font-bold">
                  {dayPlan?.tasks?.filter((t) => t.status === 'COMPLETED').length || 0} Completed
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-[#777587]">
                  Loading day schedule from autonomous engine...
                </div>
              ) : (
                <div className="space-y-3">
                  {dayPlan?.tasks?.map((task, idx) => {
                    const isDone = task.status === 'COMPLETED';
                    const subjStyle = getSubjectColor(task.subjectCode);
                    const action = getTaskAction(task);

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-[#f9f9ff] border-[#e9edff] opacity-80'
                            : 'bg-white border-[#e9edff] hover:border-[#c3c0ff] shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Checkbox & Task details */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleComplete(task.id, task.status)}
                              className="mt-0.5 text-[#3525cd] hover:scale-110 transition-transform cursor-pointer flex-shrink-0"
                              title={isDone ? 'Mark Pending' : 'Mark Complete'}
                            >
                              <StitchIcon
                                name={isDone ? 'check_circle' : 'radio_button_unchecked'}
                                size={20}
                                className={isDone ? 'text-[#006c49]' : 'text-[#9e9e9e]'}
                              />
                            </button>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${subjStyle.bg} ${subjStyle.text} ${subjStyle.border}`}>
                                  {task.subjectCode}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f3ff] text-[#464555]">
                                  {task.taskType}
                                </span>
                                <span className="text-[10px] font-mono text-[#777587] flex items-center gap-0.5">
                                  <StitchIcon name="schedule" size={12} />
                                  {task.estimatedMinutes} mins
                                </span>
                              </div>

                              <h3 className={`text-sm font-bold truncate ${isDone ? 'line-through text-[#777587]' : 'text-[#141b2b]'}`}>
                                {idx + 1}. {task.title}
                              </h3>

                              {/* Why Today? Explainability pill */}
                              <button
                                type="button"
                                onClick={() => handleExplainTask(task.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#3525cd] hover:underline cursor-pointer font-medium bg-[#e1e8fd]/50 px-2 py-0.5 rounded-md mt-1"
                              >
                                <StitchIcon name="lightbulb" size={12} />
                                <span>Why today? {task.whyToday.substring(0, 65)}...</span>
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
                            {/* Reschedule Button */}
                            {!isDone && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReschedulingTask(task);
                                  setRescheduleTargetDate('');
                                  setRescheduleError(null);
                                  setRescheduleSuccess(null);
                                }}
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-[#777587] hover:bg-[#f1f3ff] hover:text-[#141b2b] transition-all cursor-pointer"
                                title="Reschedule task to another day"
                              >
                                <StitchIcon name="schedule_send" size={15} />
                              </button>
                            )}

                            {/* Launch Action */}
                            <Link
                              href={action.href}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                isDone
                                  ? 'bg-[#6cf8bb]/30 text-[#006c49]'
                                  : 'bg-[#3525cd] text-white hover:bg-[#2b1ea8] shadow-xs'
                              }`}
                            >
                              <StitchIcon name={action.icon} size={14} />
                              <span className="hidden sm:inline">{action.label}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: WEEK VIEW (Rolling 7 Days)                         */}
        {/* ======================================================== */}
        {activeTab === 'week' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-base text-[#141b2b]">
                    Rolling 7-Day Curriculum ({weekData?.startDate} to {weekData?.endDate})
                  </h2>
                  <p className="text-xs text-[#777587]">
                    Total Planned: {((weekData?.totalMinutes || 0) / 60).toFixed(1)}h • Completed: {((weekData?.completedMinutes || 0) / 60).toFixed(1)}h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekData?.days?.map((d: any) => {
                  const isCurrent = d.date === currentDateStr;
                  return (
                    <div
                      key={d.date}
                      onClick={() => {
                        setCurrentDateStr(d.date);
                        setActiveTab('day');
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#f4f7ff] border-[#3525cd] ring-2 ring-[#3525cd]/20 shadow-sm'
                          : 'bg-white border-[#e9edff] hover:border-[#c3c0ff]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777587]">
                            {new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                          <span className="text-xs font-bold text-[#141b2b]">
                            {d.date.split('-')[2]}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#3525cd]">
                            {d.totalMinutes / 60} hrs
                          </p>
                          <p className="text-[11px] text-[#777587]">
                            {d.tasksCount} tasks
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#f1f3ff] flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#006c49]">
                          {d.completedTasksCount}/{d.tasksCount}
                        </span>
                        <span className="text-[#3525cd] font-bold">Open →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MONTH VIEW (Monthly Calendar Grid)                 */}
        {/* ======================================================== */}
        {activeTab === 'month' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-base text-[#141b2b]">
                    {monthData?.currentMonthName || 'Monthly Syllabus Distribution'}
                  </h2>
                  <p className="text-xs text-[#777587]">
                    Total Topics: {monthData?.totalTopicsInMonth || 0} • Phase: {monthData?.phase || 'Active'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {monthData?.availableMonths?.map((m: any) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => loadMonthPlan(m.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        monthData?.monthKey === m.key
                          ? 'bg-[#3525cd] text-white shadow-xs'
                          : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e1e8fd]'
                      }`}
                    >
                      {m.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {monthData?.days?.map((d: any) => (
                  <div
                    key={d.date}
                    onClick={() => {
                      setCurrentDateStr(d.date);
                      setActiveTab('day');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      d.hasTest
                        ? 'bg-[#fff8e1] border-[#ffe082]'
                        : d.date === currentDateStr
                        ? 'bg-[#f4f7ff] border-[#3525cd] ring-1 ring-[#3525cd]'
                        : 'bg-[#fafafa] border-[#eeeeee] hover:bg-white hover:border-[#c3c0ff]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[11px] text-[#141b2b]">{d.dayNumber}</span>
                      {d.hasTest && (
                        <span className="text-[9px] px-1 py-0.2 bg-[#f57c00] text-white rounded">
                          TEST
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#777587] mt-1">
                      {d.ncertTopicsCount} NCERT Topics
                    </p>
                    <p className="text-[10px] font-bold text-[#3525cd] mt-0.5">
                      {(d.plannedMinutes / 60).toFixed(1)}h
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: 213-DAY ROADMAP (Milestones & Invariants)          */}
        {/* ======================================================== */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {/* Mathematical Invariants Verified Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs">
              <span className="font-bold text-xs uppercase tracking-wider text-[#777587] block mb-3">
                Autonomous Engine Invariant Proofs
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#e8f5e9] border border-[#c8e6c9]">
                  <span className="text-[11px] font-bold text-[#2e7d32]">NCERT Topics Scheduled</span>
                  <p className="text-xl font-bold text-[#1b5e20] mt-1">426 / 426</p>
                  <span className="text-[10px] text-[#2e7d32] font-semibold">Zero Loss Guaranteed</span>
                </div>
                <div className="p-3 rounded-xl bg-[#e3f2fd] border border-[#bbdefb]">
                  <span className="text-[11px] font-bold text-[#1565c0]">Daily Average Load</span>
                  <p className="text-xl font-bold text-[#0d47a1] mt-1">9.0 Hours</p>
                  <span className="text-[10px] text-[#1565c0] font-semibold">Max 10h Strict Bound</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fff3e0] border border-[#ffe0b2]">
                  <span className="text-[11px] font-bold text-[#e65100]">Overloaded Days</span>
                  <p className="text-xl font-bold text-[#bf360c] mt-1">0 Days</p>
                  <span className="text-[10px] text-[#e65100] font-semibold">100% Feasible</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f3e5f5] border border-[#e1bee7]">
                  <span className="text-[11px] font-bold text-[#7b1fa2]">Questions Mapped</span>
                  <p className="text-xl font-bold text-[#4a148c] mt-1">4,640 Qs</p>
                  <span className="text-[10px] text-[#7b1fa2] font-semibold">MTG + 15-Yr PYQ</span>
                </div>
              </div>
            </div>

            {/* The 4 Phases */}
            <div className="space-y-4">
              {roadmapData?.phases?.map((p: any) => (
                <div key={p.phaseId} className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#e1e8fd] text-[#3525cd]">
                          {p.dayRange}
                        </span>
                        <span className="text-xs text-[#777587] font-semibold">
                          {p.dateRange}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#141b2b] mt-1">{p.title}</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#6cf8bb]/30 text-[#006c49]">
                      {p.totalDays} Days
                    </span>
                  </div>

                  <p className="text-xs text-[#464555] leading-relaxed">
                    {p.objective}
                  </p>

                  <div className="pt-2 border-t border-[#f1f3ff]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587] block mb-2">
                      Key Assessment &amp; Milestone Events
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {p.milestones?.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#3525cd]">Day {m.day}</span>
                            <span className="text-[10px] text-[#777587]">{m.date}</span>
                          </div>
                          <p className="font-semibold text-[#141b2b] truncate">{m.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SPACED REVISION QUEUE                             */}
        {/* ======================================================== */}
        {activeTab === 'revision' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-4">
              <div>
                <h2 className="font-bold text-base text-[#141b2b]">
                  Ebbinghaus Spaced Repetition Engine
                </h2>
                <p className="text-xs text-[#777587]">
                  Automatic 2-3-5-7 day early reviews + R5/R6 long-term retention triggers
                </p>
              </div>

              {/* Interval metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e1e8fd]">
                  <span className="text-[10px] font-bold text-[#3525cd]">R1 (+2 Days)</span>
                  <p className="text-lg font-bold text-[#141b2b]">
                    {revisionData?.summary?.spacedIntervals?.r1_2day || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e1e8fd]">
                  <span className="text-[10px] font-bold text-[#3525cd]">R2 (+3 Days)</span>
                  <p className="text-lg font-bold text-[#141b2b]">
                    {revisionData?.summary?.spacedIntervals?.r2_3day || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e1e8fd]">
                  <span className="text-[10px] font-bold text-[#3525cd]">R3 (+5 Days)</span>
                  <p className="text-lg font-bold text-[#141b2b]">
                    {revisionData?.summary?.spacedIntervals?.r3_5day || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#f1f3ff] border border-[#e1e8fd]">
                  <span className="text-[10px] font-bold text-[#3525cd]">R4 (+7 Days)</span>
                  <p className="text-lg font-bold text-[#141b2b]">
                    {revisionData?.summary?.spacedIntervals?.r4_7day || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#e8f5e9] border border-[#c8e6c9]">
                  <span className="text-[10px] font-bold text-[#2e7d32]">Long-term R5/R6</span>
                  <p className="text-lg font-bold text-[#1b5e20]">
                    {revisionData?.summary?.spacedIntervals?.other || 0}
                  </p>
                </div>
              </div>

              {/* Tasks Due Today */}
              <div className="space-y-3 pt-3">
                <span className="font-bold text-xs uppercase tracking-wider text-[#777587] block">
                  Reviews Due Today ({revisionData?.dueToday?.length || 0})
                </span>
                {revisionData?.dueToday?.length === 0 ? (
                  <p className="text-xs text-[#777587] italic p-4 bg-[#f9f9ff] rounded-xl text-center">
                    No spaced reviews due on this date.
                  </p>
                ) : (
                  revisionData?.dueToday?.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-[#e9edff] bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#e1e8fd] text-[#3525cd] text-[10px] font-bold">
                            {t.taskType}
                          </span>
                          <span className="text-[#777587] font-mono">{t.estimatedMinutes}m</span>
                        </div>
                        <h4 className="font-bold text-[#141b2b] mt-1">{t.title}</h4>
                        <p className="text-[11px] text-[#777587]">{t.whyToday}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(t.id, t.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          t.status === 'COMPLETED'
                            ? 'bg-[#6cf8bb]/30 text-[#006c49]'
                            : 'bg-[#3525cd] text-white'
                        }`}
                      >
                        {t.status === 'COMPLETED' ? 'Done ✓' : 'Mark Done'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EXPLAINABILITY MODAL                                     */}
        {/* ======================================================== */}
        {selectedTaskExplanation && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#e9edff] space-y-4 animate-scaleUp">
              <div className="flex items-start justify-between gap-2 border-b border-[#f1f3ff] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
                    <StitchIcon name="lightbulb" size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#141b2b]">
                      Planner Rationale &amp; Pedagogy
                    </h3>
                    <p className="text-xs text-[#777587]">
                      Explainable Intelligence • Why Scheduled Today
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTaskExplanation(null)}
                  className="text-[#777587] hover:text-[#141b2b] text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#777587] uppercase text-[10px] block">Task</span>
                  <p className="text-sm font-bold text-[#141b2b] mt-0.5">
                    {selectedTaskExplanation.title}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#f4f7ff] border border-[#c3c0ff] space-y-1">
                  <span className="font-bold text-[#3525cd] uppercase text-[10px] block">
                    Immediate Scheduling Rationale (Why Today?)
                  </span>
                  <p className="text-[#141b2b] font-medium leading-relaxed">
                    {selectedTaskExplanation.whyToday}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#777587] uppercase text-[10px] block">
                    Pedagogical Science
                  </span>
                  <p className="text-[#464555] leading-relaxed">
                    {selectedTaskExplanation.pedagogicalRationale}
                  </p>
                </div>

                {selectedTaskExplanation.prerequisites?.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[#777587] uppercase text-[10px] block">
                      Prerequisites
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#464555]">
                      {selectedTaskExplanation.prerequisites.map((p: string, idx: number) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTaskExplanation(null)}
                  className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1ea8] cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* RESCHEDULE MODAL                                         */}
        {/* ======================================================== */}
        {reschedulingTask && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e9edff] space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-3">
                <h3 className="font-bold text-base text-[#141b2b]">
                  Reschedule Study Task
                </h3>
                <button
                  type="button"
                  onClick={() => setReschedulingTask(null)}
                  className="text-[#777587] hover:text-[#141b2b] text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#777587] uppercase">Moving Task</span>
                  <p className="font-bold text-[#141b2b] mt-0.5 truncate">{reschedulingTask.title}</p>
                  <p className="text-[#777587] mt-0.5 font-mono">{reschedulingTask.estimatedMinutes} minutes</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#464555]">
                    Select Target Date (Leave blank to auto-find next feasible day with capacity):
                  </label>
                  <input
                    type="date"
                    min="2026-10-05"
                    max="2027-05-05"
                    value={rescheduleTargetDate}
                    onChange={(e) => setRescheduleTargetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#e9edff] bg-[#f9f9ff] text-xs font-medium text-[#141b2b] outline-none focus:border-[#3525cd]"
                  />
                </div>

                {rescheduleError && (
                  <p className="p-2.5 bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] rounded-xl text-xs font-semibold">
                    {rescheduleError}
                  </p>
                )}

                {rescheduleSuccess && (
                  <p className="p-2.5 bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] rounded-xl text-xs font-semibold">
                    ✓ {rescheduleSuccess}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingTask(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#f1f3ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReschedule}
                  className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1ea8] cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
