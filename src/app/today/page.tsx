'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface Task {
  id: string;
  title: string;
  description: string;
  taskType: string;
  subjectCode: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: 'CORE' | 'RECOMMENDED' | 'OPTIONAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'MISSED';
  routeUrl?: string;
  priorityReasons?: string;
}

function FormattedDailyBrief({ brief }: { brief: string }) {
  if (!brief) return null;

  const lines = brief.split('\n').map((l) => l.trim()).filter(Boolean);

  let title = 'Daily Preparation Brief';
  let dateText = '';
  const titleLine = lines.find((l) => l.startsWith('#'));
  if (titleLine) {
    const cleanTitle = titleLine.replace(/^#+\s*/, '');
    const dateMatch = cleanTitle.match(/\((.*?)\)/);
    if (dateMatch) {
      dateText = dateMatch[1];
      title = cleanTitle.replace(/\(.*?\)/, '').trim();
    } else {
      title = cleanTitle;
    }
  }

  let capacityMetrics: { target?: string; planned?: string; completed?: string } | null = null;
  const metricsLine = lines.find((l) => l.includes('Target Capacity') || l.includes('Planned:'));
  if (metricsLine) {
    const targetMatch = metricsLine.match(/Target Capacity:\*?\*?\s*([0-9]+\s*mins?|[0-9]+m)/i);
    const plannedMatch = metricsLine.match(/Planned:\*?\*?\s*([0-9]+\s*mins?|[0-9]+m)/i);
    const completedMatch = metricsLine.match(/Completed:\*?\*?\s*([0-9]+\s*mins?|[0-9]+m)/i);
    if (targetMatch || plannedMatch || completedMatch) {
      capacityMetrics = {
        target: targetMatch?.[1] || '360 mins',
        planned: plannedMatch?.[1] || '0 mins',
        completed: completedMatch?.[1] || '0 mins',
      };
    }
  }

  const items: { label: string; text: string; icon: string; badgeColor: string }[] = [];
  lines.forEach((l) => {
    if (l.startsWith('#') || l.includes('Target Capacity')) return;
    const clean = l.replace(/^\*\s*/, '').replace(/^-\s*/, '').trim();
    if (!clean) return;

    if (clean.toLowerCase().includes('core focus')) {
      items.push({
        label: 'Core Focus',
        text: clean.replace(/^.*?(core focus[:\s*-]+)/i, ''),
        icon: 'local_fire_department',
        badgeColor: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]',
      });
    } else if (clean.toLowerCase().includes('recommended') || clean.toLowerCase().includes('practice:')) {
      items.push({
        label: 'Recommended Drill',
        text: clean.replace(/^.*?(recommended drill[:\s*-]+|practice[:\s*-]+)/i, ''),
        icon: 'quiz',
        badgeColor: 'bg-[#e2dfff] text-[#3525cd] border-[#e2dfff]',
      });
    } else if (clean.toLowerCase().includes('revision') || clean.toLowerCase().includes('due:')) {
      items.push({
        label: 'Spaced Revision',
        text: clean.replace(/^.*?(spaced revision[:\s*-]+|revision due[:\s*-]+)/i, ''),
        icon: 'psychology',
        badgeColor: 'bg-[#e6f7ef] text-[#006c49] border-[#6cf8bb]',
      });
    } else {
      items.push({
        label: 'Note',
        text: clean,
        icon: 'info',
        badgeColor: 'bg-[#f1f3ff] text-[#464555] border-[#e9edff]',
      });
    }
  });

  return (
    <div className="bg-[#f1f3ff] border border-[#e1e8fd] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1e8fd] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3525cd] flex items-center justify-center text-white">
            <StitchIcon name="auto_awesome" size={16} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm sm:text-base text-[#141b2b]">{title}</h3>
            {dateText && <p className="text-[11px] text-[#464555]">{dateText}</p>}
          </div>
        </div>
        {capacityMetrics && (
          <div className="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-[#e9edff]">
            <span className="text-[#464555]">Target: <strong className="text-[#141b2b]">{capacityMetrics.target}</strong></span>
            <span className="text-[#c7c4d8]">•</span>
            <span className="text-[#464555]">Planned: <strong className="text-[#3525cd]">{capacityMetrics.planned}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border border-[#e9edff] p-3.5 rounded-xl flex items-start gap-3 shadow-xs">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-headline font-bold uppercase tracking-wider shrink-0 border ${item.badgeColor}`}>
              {item.label}
            </span>
            <p className="text-xs text-[#141b2b] leading-relaxed line-clamp-3">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodayStudyCommandPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [coachInput, setCoachInput] = useState('');
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  const fetchToday = async () => {
    try {
      const res = await fetch('/api/student/today');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleStartTask = async (task: Task) => {
    try {
      setActionLoading(task.id);
      const res = await fetch(`/api/student/tasks/${task.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data?.plan?.userId || 'student_demo' }),
      });
      if (res.ok) {
        const json = await res.json();
        const targetUrl = task.routeUrl || `/focus?taskId=${task.id}&sessionId=${json.sessionId}`;
        window.location.href = targetUrl;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkipTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      const res = await fetch(`/api/student/tasks/${taskId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data?.plan?.userId || 'student_demo' }),
      });
      if (res.ok) {
        fetchToday();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim()) return;

    try {
      const res = await fetch('/api/ai/study-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: coachInput }),
      });
      if (res.ok) {
        const json = await res.json();
        setCoachResponse(json.responseMessage);
        fetchToday();
      }
    } catch (err) {
      console.error(err);
    }
    setCoachInput('');
  };

  const plan = data?.plan || {};
  const execution = data?.execution || {};
  const priorityBuckets = data?.priorityBuckets || { core: [], recommended: [], optional: [] };

  return (
    <AppShell
      title="Daily Command Center"
      subtitle="Execution OS • Stage: Foundation"
      streakDays={data?.streak?.dailyStreak || 7}
      showBack={true}
      backHref="/"
    >
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-[#e2dfff] text-[#3525cd]">
                Study OS
              </span>
              <span className="text-xs text-[#464555] font-medium">Stage: {plan.preparationStage || 'FOUNDATION'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b]">
              Today's Preparation Command Center
            </h1>
            <p className="text-[#464555] text-xs sm:text-sm mt-1">
              Plan v{plan.planVersion || '1.0'} &bull; Target: {plan.targetCapacityMinutes || 360} mins &bull; Planned: {plan.plannedMinutes || 0} mins
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/planner"
              className="min-h-[44px] px-4 py-2 text-xs font-headline font-bold bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] border border-[#e1e8fd] rounded-xl transition flex items-center justify-center"
            >
              Weekly Planner
            </Link>
            <Link
              href="/focus"
              className="min-h-[44px] px-5 py-2 text-xs font-headline font-bold bg-[#3525cd] hover:bg-[#2d1eb8] text-white rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <StitchIcon name="timer" size={16} />
              <span>Focus Room</span>
            </Link>
          </div>
        </div>

        {/* Progress & Hero Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
            <p className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">Completed Time</p>
            <p className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] mt-1">
              {plan.actualMinutes || 0} <span className="text-xs font-normal text-[#777587]">/ {plan.targetCapacityMinutes || 360}m</span>
            </p>
            <div className="w-full bg-[#f1f3ff] h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#006c49] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((plan.actualMinutes || 0) / (plan.targetCapacityMinutes || 360)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
            <p className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">Tasks Finished</p>
            <p className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] mt-1">
              {execution.completedCount || 0} <span className="text-xs font-normal text-[#777587]">/ {execution.totalTasks || 0}</span>
            </p>
            <p className="text-[11px] text-[#464555] mt-2">{execution.remainingCount || 0} tasks left today</p>
          </div>

          <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
            <p className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">Study Streak</p>
            <p className="text-xl sm:text-2xl font-headline font-bold text-[#3525cd] mt-1 flex items-center gap-1.5">
              <span>🔥</span>
              <span>{data?.streak?.dailyStreak || 7} Days</span>
            </p>
            <p className="text-[11px] text-[#006c49] font-medium mt-2">Consistent momentum</p>
          </div>

          <div className="bg-white border border-[#e9edff] p-4 sm:p-5 rounded-2xl shadow-xs">
            <p className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">Due Revisions</p>
            <p className="text-xl sm:text-2xl font-headline font-bold text-[#3525cd] mt-1">
              {data?.dueRevisions?.length || 0} Concepts
            </p>
            <p className="text-[11px] text-[#464555] mt-2">Leitner memory schedule</p>
          </div>
        </div>

        {/* Grounded AI Daily Brief Section */}
        {plan.aiDailyBrief && <FormattedDailyBrief brief={plan.aiDailyBrief} />}

        {/* Next Immediate Task Banner */}
        {execution.nextTask && (
          <div className="bg-[#f1f3ff] border border-[#e1e8fd] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[11px] font-headline font-bold text-[#3525cd] uppercase tracking-wider">
                Next Recommended Step
              </span>
              <h2 className="text-lg sm:text-xl font-headline font-bold text-[#141b2b] mt-1">
                {execution.nextTask.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#464555] mt-0.5">{execution.nextTask.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#777587]">
                <span>⏱ {execution.nextTask.estimatedMinutes} mins</span>
                <span>&bull;</span>
                <span className="text-[#3525cd] font-semibold">{execution.nextTask.subjectCode}</span>
                <span>&bull;</span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#e9edff] text-[#141b2b] text-[10px] font-bold">
                  {execution.nextTask.priority}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStartTask(execution.nextTask)}
              disabled={actionLoading === execution.nextTask.id}
              className="min-h-[44px] px-6 py-2.5 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <StitchIcon name="play_arrow" size={16} />
              <span>{actionLoading === execution.nextTask.id ? 'Starting...' : 'Start Session Now'}</span>
            </button>
          </div>
        )}

        {/* Priority Buckets */}
        <div className="space-y-6">
          <h2 className="text-lg font-headline font-bold text-[#141b2b]">Daily Tasks by Priority</h2>

          {/* Must Do (CORE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#ba1a1a] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" /> Must Do (Core Priority)
              </span>
              <span className="text-xs text-[#777587]">{priorityBuckets.core.length} tasks</span>
            </div>
            {priorityBuckets.core.map((task: Task) => (
              <div
                key={task.id}
                className="bg-white border border-[#e9edff] hover:border-[#3525cd]/30 p-4 rounded-2xl flex items-center justify-between gap-4 transition shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[#e9edff] flex items-center justify-center mt-0.5 text-xs text-[#3525cd] font-bold">
                    {task.status === 'COMPLETED' ? '✓' : '•'}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-[#141b2b] text-sm">{task.title}</h3>
                    <p className="text-xs text-[#464555] mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#777587]">
                      <span>{task.estimatedMinutes}m</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-[#141b2b]">{task.subjectCode}</span>
                      <span>&bull;</span>
                      <span>{task.taskType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => handleStartTask(task)}
                      className="min-h-[40px] px-4 py-1.5 bg-[#3525cd] hover:bg-[#2d1eb8] text-xs font-headline font-bold text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended */}
          {priorityBuckets.recommended.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#006c49] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006c49]" /> Recommended
                </span>
                <span className="text-xs text-[#777587]">{priorityBuckets.recommended.length} tasks</span>
              </div>
              {priorityBuckets.recommended.map((task: Task) => (
                <div
                  key={task.id}
                  className="bg-white border border-[#e9edff] p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <h3 className="font-headline font-bold text-[#141b2b] text-sm">{task.title}</h3>
                    <p className="text-xs text-[#464555] mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#777587]">
                      <span>{task.estimatedMinutes}m</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-[#141b2b]">{task.subjectCode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartTask(task)}
                      className="min-h-[40px] px-4 py-1.5 bg-[#f1f3ff] hover:bg-[#e9edff] text-xs font-headline font-bold text-[#3525cd] rounded-xl transition cursor-pointer"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkipTask(task.id)}
                      className="min-h-[40px] px-3 py-1.5 text-xs text-[#777587] hover:text-[#141b2b] transition cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional */}
          {priorityBuckets.optional.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#777587]" /> Optional & Extra
                </span>
                <span className="text-xs text-[#777587]">{priorityBuckets.optional.length} tasks</span>
              </div>
              {priorityBuckets.optional.map((task: Task) => (
                <div
                  key={task.id}
                  className="bg-white border border-[#e9edff] p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <h3 className="font-medium text-[#141b2b] text-sm">{task.title}</h3>
                    <p className="text-xs text-[#777587]">{task.estimatedMinutes}m &bull; {task.subjectCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartTask(task)}
                      className="min-h-[40px] px-3 py-1 bg-[#f1f3ff] hover:bg-[#e9edff] text-xs text-[#141b2b] font-medium rounded-xl transition cursor-pointer"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkipTask(task.id)}
                      className="min-h-[40px] px-2.5 py-1 text-xs text-[#777587] hover:text-[#141b2b] cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Study Coach Quick Chat */}
        <div className="bg-white border border-[#e9edff] rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
              <StitchIcon name="smart_toy" size={18} className="text-[#3525cd]" />
              <span>AI Study Coach Assistant</span>
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Ask questions like: <em>"I only have 90 minutes today"</em>, <em>"I missed yesterday"</em>, or <em>"What should I do next?"</em>
            </p>
          </div>

          {coachResponse && (
            <div className="p-4 rounded-xl bg-[#e6f7ef] border border-[#6cf8bb] text-xs text-[#006c49] font-medium leading-relaxed">
              {coachResponse}
            </div>
          )}

          <form onSubmit={handleSendCoach} className="flex gap-2">
            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              placeholder="Tell your coach (e.g. 'I only have 60 minutes today')..."
              className="flex-1 bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#141b2b] placeholder-[#777587] focus:outline-none focus:border-[#3525cd]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              Ask Coach
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
