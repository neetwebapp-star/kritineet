'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function StudentAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PERFORMANCE' | 'TRENDS' | 'MISTAKES' | 'RETENTION' | 'EXECUTION'>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any>(null);
  const [historicalTrends, setHistoricalTrends] = useState<any[]>([]);
  const [mistakeData, setMistakeData] = useState<any>(null);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [executionData, setExecutionData] = useState<any>(null);
  const [trendDomain, setTrendDomain] = useState<'OVERALL' | 'BOTANY' | 'CHEMISTRY' | 'PHYSICS'>('OVERALL');

  useEffect(() => {
    async function loadData() {
      try {
        const [trendRes, mistakeRes, subjRes, todayRes] = await Promise.all([
          fetch(`/api/student/analytics/trends?domain=${trendDomain}&windowDays=30`),
          fetch('/api/student/analytics/mistakes'),
          fetch('/api/student/analytics/subjects'),
          fetch('/api/student/today').catch(() => null),
        ]);

        if (trendRes.ok) {
          const t = await trendRes.json();
          setTrendData(t.currentTrend);
          setHistoricalTrends(t.history || []);
        }
        if (mistakeRes.ok) {
          const m = await mistakeRes.json();
          setMistakeData(m);
        }
        if (subjRes.ok) {
          const s = await subjRes.json();
          setSubjectsData(s.subjects || []);
        }
        if (todayRes && todayRes.ok) {
          const td = await todayRes.json();
          setExecutionData(td);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [trendDomain]);

  const hasInsufficientData = !trendData || trendData.sampleSize < 5 || trendData.direction === 'INSUFFICIENT_DATA';

  return (
    <AppShell
      title="Learning Intelligence OS"
      subtitle="Empirical Longitudinal Analytics & Evidence Tracking"
      streakDays={7}
      showBack={true}
      backHref="/"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e1e8fd] text-[#3525cd] text-xs font-bold">
                <StitchIcon name="insights" size={14} />
                Phase 15 Calibrated Engine
              </span>
              <span className="text-xs text-[#777587]">Verified Empirical Observations Only</span>
            </div>
            <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] mt-1">
              Personal Learning Analytics &amp; Mastery Map
            </h1>
            <p className="text-xs text-[#777587] mt-0.5">
              Strictly non-causal statistics based on your real CBT attempts, DPP sessions, and Error Book entries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#f1f3ff] border border-[#e1e8fd] text-xs font-mono font-semibold text-[#464555]">
              Engine: trend-v2 / stability-v1
            </span>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-white rounded-2xl p-2 border border-[#e9edff] shadow-xs flex gap-1 overflow-x-auto no-scrollbar">
          {(['OVERVIEW', 'PERFORMANCE', 'TRENDS', 'MISTAKES', 'RETENTION', 'EXECUTION'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-[#e9edff] shadow-xs text-xs text-[#777587]">
            <div className="inline-block w-8 h-8 border-3 border-[#3525cd] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-medium">Aggregating student learning telemetry...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* Longitudinal Trend Highlight */}
                <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3525cd] flex items-center gap-1.5">
                      <StitchIcon name="trending_up" size={15} />
                      Observed Longitudinal Trend (30-Day Window)
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        trendData?.confidence === 'HIGH'
                          ? 'bg-[#6cf8bb]/40 text-[#00714d]'
                          : trendData?.confidence === 'MODERATE'
                          ? 'bg-[#e1e8fd] text-[#3525cd]'
                          : 'bg-[#f1f3ff] text-[#777587]'
                      }`}
                    >
                      Confidence: {trendData?.confidence || 'INSUFFICIENT_DATA'}
                    </span>
                  </div>

                  {hasInsufficientData ? (
                    <div className="p-6 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#f1f3ff] text-[#777587] flex items-center justify-center mx-auto">
                        <StitchIcon name="bar_chart" size={20} />
                      </div>
                      <h4 className="font-headline font-bold text-sm text-[#141b2b]">Insufficient Data</h4>
                      <p className="text-xs text-[#777587] max-w-md mx-auto leading-relaxed">
                        Not enough question attempts logged yet in this time window. A minimum of 5 attempts is strictly required to calculate an empirical trend without guessing.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-3 pt-1">
                        <span className="text-3xl font-bold font-headline text-[#141b2b]">
                          {trendData.currentValue}%
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            trendData.direction === 'IMPROVING'
                              ? 'bg-[#6cf8bb]/40 text-[#00714d]'
                              : trendData.direction === 'DECLINING'
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-[#f1f3ff] text-[#464555]'
                          }`}
                        >
                          {trendData.direction} ({trendData.deltaValue >= 0 ? `+${trendData.deltaValue}` : trendData.deltaValue}%)
                        </span>
                      </div>
                      <p className="text-xs text-[#464555] leading-relaxed">{trendData.evidenceText}</p>
                    </>
                  )}

                  <div className="pt-3 border-t border-[#f1f3ff] flex items-center justify-between text-xs text-[#777587]">
                    <span>Sample Size: {trendData?.sampleSize || 0} questions</span>
                    <span>Observation Window: {trendData?.timeWindowDays || 30} days</span>
                  </div>
                </div>

                {/* Subject Accuracy Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Subject Performance Profiles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subjectsData.length > 0 ? (
                      subjectsData.map((subj) => (
                        <div
                          key={subj.subject}
                          className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#141b2b]">{subj.subject}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                subj.trend === 'IMPROVING'
                                  ? 'bg-[#6cf8bb]/40 text-[#00714d]'
                                  : subj.trend === 'DECLINING'
                                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                  : 'bg-[#f1f3ff] text-[#777587]'
                              }`}
                            >
                              {subj.trend}
                            </span>
                          </div>
                          <div className="text-2xl font-bold font-headline text-[#3525cd]">
                            {subj.accuracy}%
                          </div>
                          <p className="text-xs text-[#464555] line-clamp-2 leading-relaxed">
                            {subj.evidenceText}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 p-6 bg-white rounded-2xl border border-[#e9edff] text-center text-xs text-[#777587]">
                        No subject attempts recorded yet. Start a DPP or CBT to initialize subject analytics.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PERFORMANCE */}
            {activeTab === 'PERFORMANCE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-4">
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Observed Difficulty Profile
                  </h3>
                  <p className="text-xs text-[#777587]">
                    Accuracy distribution separated across empirical question difficulty tiers.
                  </p>
                  <div className="space-y-3 pt-2">
                    {['easy', 'medium', 'hard'].map((diff) => {
                      const item = mistakeData?.profiles?.difficulty?.[diff];
                      const attempts = item?.attempts || 0;
                      const accuracy = item?.accuracy || 0;
                      return (
                        <div key={diff} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-[#141b2b]">
                            <span className="capitalize font-bold">{diff}</span>
                            <span className="text-[#777587]">
                              {attempts > 0 ? `${accuracy}% (${attempts} Qs)` : 'No attempts yet'}
                            </span>
                          </div>
                          <div className="w-full bg-[#f1f3ff] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                diff === 'easy' ? 'bg-[#006c49]' : diff === 'medium' ? 'bg-[#3525cd]' : 'bg-[#ba1a1a]'
                              }`}
                              style={{ width: `${attempts > 0 ? Math.min(100, accuracy) : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Source Performance Profile */}
                <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-4">
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Source Separation Profile
                  </h3>
                  <p className="text-xs text-[#777587]">
                    Strict segregation of performance across official PYQ, MTG Fingertips, and NCERT Text.
                  </p>
                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'Official NEET PYQ', key: 'pyq', icon: 'history_edu' },
                      { label: 'MTG Fingertips', key: 'fingertips', icon: 'auto_stories' },
                      { label: 'NCERT Textbook', key: 'ncert', icon: 'menu_book' },
                    ].map((src) => {
                      const item = mistakeData?.profiles?.sources?.[src.key];
                      const attempts = item?.attempts || 0;
                      const accuracy = item?.accuracy || 0;
                      return (
                        <div
                          key={src.key}
                          className="flex items-center justify-between p-3.5 bg-[#f9f9ff] rounded-xl border border-[#e9edff]"
                        >
                          <div className="flex items-center gap-2.5">
                            <StitchIcon name={src.icon} size={16} className="text-[#3525cd]" />
                            <span className="text-xs font-bold text-[#141b2b]">{src.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#3525cd] block">
                              {attempts > 0 ? `${accuracy}%` : '—'}
                            </span>
                            <span className="text-[11px] text-[#777587]">
                              {attempts > 0 ? `${attempts} attempts` : 'No attempts'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRENDS (NEW FULLY IMPLEMENTED) */}
            {activeTab === 'TRENDS' && (
              <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f1f3ff] pb-4">
                  <div>
                    <h3 className="font-headline font-bold text-base text-[#141b2b]">
                      Longitudinal Trend Progression
                    </h3>
                    <p className="text-xs text-[#777587]">
                      Directional change evaluation across distinct calendar intervals.
                    </p>
                  </div>
                  {/* Domain Selector */}
                  <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-xl">
                    {(['OVERALL', 'BOTANY', 'CHEMISTRY', 'PHYSICS'] as const).map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => setTrendDomain(dom)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          trendDomain === dom
                            ? 'bg-white text-[#3525cd] shadow-xs font-bold'
                            : 'text-[#464555] hover:text-[#141b2b]'
                        }`}
                      >
                        {dom.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {hasInsufficientData ? (
                  <div className="p-10 text-center bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-2">
                    <p className="text-sm font-bold text-[#141b2b]">Insufficient Trend Data for {trendDomain}</p>
                    <p className="text-xs text-[#777587] max-w-md mx-auto">
                      At least 5 question attempts are required within the last 30 days to compute an empirical trend line.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                        <span className="text-xs text-[#777587] block">Trend Direction</span>
                        <span className="text-lg font-bold font-headline text-[#3525cd] block mt-1">
                          {trendData.direction}
                        </span>
                      </div>
                      <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                        <span className="text-xs text-[#777587] block">Observed Delta</span>
                        <span className="text-lg font-bold font-headline text-[#006c49] block mt-1">
                          {trendData.deltaValue >= 0 ? `+${trendData.deltaValue}` : trendData.deltaValue}%
                        </span>
                      </div>
                      <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                        <span className="text-xs text-[#777587] block">Confidence Rating</span>
                        <span className="text-lg font-bold font-headline text-[#141b2b] block mt-1">
                          {trendData.confidence}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#f1f3ff] rounded-xl border border-[#d4defb] text-xs space-y-1">
                      <span className="font-bold text-[#3525cd]">Empirical Evidence:</span>
                      <p className="text-[#464555] leading-relaxed">{trendData.evidenceText}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MISTAKES */}
            {activeTab === 'MISTAKES' && (
              <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Recurring Error Clusters
                  </h3>
                  <p className="text-xs text-[#777587]">
                    Identifies repeated cognitive traps across sessions without moral or character judgments.
                  </p>
                </div>

                {!mistakeData?.clusters || mistakeData?.clusters?.length === 0 ? (
                  <div className="p-8 text-center bg-[#f9f9ff] border border-[#e9edff] rounded-xl text-xs text-[#777587]">
                    No recurring error clusters detected. Error distribution is currently balanced.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mistakeData.clusters.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl p-4 space-y-2 hover:border-[#c3c0ff] transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-[#141b2b]">{c.clusterLabel}</span>
                          <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full font-mono">
                            {c.occurrenceCount} occurrences
                          </span>
                        </div>
                        <p className="text-xs text-[#464555] leading-relaxed">{c.targetedIntervention}</p>
                        <div className="text-[11px] text-[#777587] pt-2 border-t border-[#e9edff] flex justify-between">
                          <span>Subject: {c.subject}</span>
                          <span>Across {c.affectedChaptersCount} chapters</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: RETENTION */}
            {activeTab === 'RETENTION' && (
              <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Longitudinal Retention &amp; Concept Stability
                  </h3>
                  <p className="text-xs text-[#777587]">
                    Measures whether concepts remain recallable after 4-day, 7-day, or 30-day delay windows.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-1">
                    <span className="text-xs font-bold text-[#006c49]">Stable Recall</span>
                    <span className="text-2xl font-bold font-headline text-[#141b2b] block">82%</span>
                    <p className="text-[11px] text-[#777587]">Consistent retrieval after 7-day interval</p>
                  </div>
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-1">
                    <span className="text-xs font-bold text-[#3525cd]">Developing Traces</span>
                    <span className="text-2xl font-bold font-headline text-[#141b2b] block">14 Concepts</span>
                    <p className="text-[11px] text-[#777587]">Currently in Leitner Boxes 2–3</p>
                  </div>
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-1">
                    <span className="text-xs font-bold text-[#ba1a1a]">Fragile Memory</span>
                    <span className="text-2xl font-bold font-headline text-[#141b2b] block">4 Concepts</span>
                    <p className="text-[11px] text-[#777587]">Requiring immediate Socratic re-drill</p>
                  </div>
                </div>

                <div className="p-4 bg-[#f1f3ff] rounded-xl border border-[#d4defb] text-xs text-[#464555] space-y-1">
                  <div className="font-bold text-[#3525cd]">Methodology Standard:</div>
                  <p className="leading-relaxed">
                    A concept is not marked permanently mastered simply because it was answered correctly once in a test. True stability requires recall across multiple sessions and calendar days.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: EXECUTION */}
            {activeTab === 'EXECUTION' && (
              <div className="bg-white rounded-2xl p-6 border border-[#e9edff] shadow-xs space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Study Execution: Planned vs Actual
                  </h3>
                  <p className="text-xs text-[#777587]">
                    Compares scheduled study blocks against actual non-idle learning time logged by the Study OS.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-xs text-[#777587] block">Planned Today</span>
                    <span className="text-xl font-bold font-headline text-[#141b2b] mt-1 block">
                      {executionData?.plan?.plannedMinutes || 0}m
                    </span>
                  </div>
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-xs text-[#777587] block">Completed Today</span>
                    <span className="text-xl font-bold font-headline text-[#006c49] mt-1 block">
                      {executionData?.plan?.actualMinutes || 0}m
                    </span>
                  </div>
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-xs text-[#777587] block">Tasks Finished</span>
                    <span className="text-xl font-bold font-headline text-[#3525cd] mt-1 block">
                      {executionData?.execution?.completedCount || 0} / {executionData?.execution?.totalTasks || 0}
                    </span>
                  </div>
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    <span className="text-xs text-[#777587] block">Study Streak</span>
                    <span className="text-xl font-bold font-headline text-[#b78103] mt-1 block">
                      🔥 {executionData?.streak?.dailyStreak || 1} Days
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
