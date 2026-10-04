'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function TestHistoryPage() {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/tests/history')
      .then((res) => res.json())
      .then((json) => {
        setHistory(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load test history:', err);
        setLoading(false);
      });
  }, []);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) return; // Max 3 for comparison
      setSelectedIds([...selectedIds, id]);
    }
  };

  const attempts = history?.history || [];
  const summary = history?.summary || { totalTests: 0, averageScore: 0, averageAccuracy: 0, totalTimeSpentMinutes: 0 };

  return (
    <AppShell
      title="Test History"
      subtitle="Chronological Mock Performance & Audits"
      streakDays={7}
      showBack={true}
      backHref="/tests"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl shadow-xs">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] tracking-tight flex items-center gap-2">
              <StitchIcon name="history_edu" size={22} className="text-[#3525cd]" />
              <span>Mock Performance & History</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#464555]">
              Immutable audit record of all submitted NEET exam simulations, time distributions, and post-mock remediation items.
            </p>
          </div>

          <Link
            href="/readiness"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#e6f7ef] border border-[#6cf8bb] text-xs font-headline font-bold text-[#006c49] hover:bg-[#d5f4e5] transition flex items-center gap-1.5 shrink-0"
          >
            <StitchIcon name="insights" size={16} />
            <span>Readiness Audit</span>
          </Link>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] space-y-1 shadow-xs">
            <span className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider">Total Tests Taken</span>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b]">{summary.totalTests}</div>
            <span className="text-[11px] text-[#777587]">Evaluated simulations</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] space-y-1 shadow-xs">
            <span className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider">Average Score</span>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#006c49]">{summary.averageScore}</div>
            <span className="text-[11px] text-[#777587]">Marks out of test total</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] space-y-1 shadow-xs">
            <span className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider">Average Accuracy</span>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#3525cd]">{summary.averageAccuracy}%</div>
            <span className="text-[11px] text-[#777587]">Correct answers ratio</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] space-y-1 shadow-xs">
            <span className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider">Simulation Time</span>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#8b5cf6]">{summary.totalTimeSpentMinutes}m</div>
            <span className="text-[11px] text-[#777587]">Under CBT conditions</span>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555] font-headline font-semibold">Loading student test logs...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-[#e9edff] p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#f1f3ff] flex items-center justify-center mx-auto text-[#3525cd]">
              <StitchIcon name="history_edu" size={24} />
            </div>
            <h3 className="text-base font-headline font-bold text-[#141b2b]">No test history yet.</h3>
            <p className="text-xs text-[#464555] max-w-md mx-auto">
              You haven&rsquo;t completed any mock tests yet. Launch an exam simulation from the test library to start building your verified performance trail.
            </p>
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs transition shadow-xs"
            >
              <span>Browse Available Tests</span>
              <StitchIcon name="arrow_forward" size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#777587]">
              <span>Showing {attempts.length} completed attempt{attempts.length > 1 ? 's' : ''}</span>
              {selectedIds.length > 0 && (
                <span className="text-[#3525cd] font-headline font-bold">{selectedIds.length} test{selectedIds.length > 1 ? 's' : ''} selected for comparison</span>
              )}
            </div>

            {attempts.map((a: any) => {
              const isSelected = selectedIds.includes(a.id);
              const minutes = Math.floor((a.timeSpentSeconds || 0) / 60);
              const seconds = (a.timeSpentSeconds || 0) % 60;
              const dateStr = a.submittedAt ? new Date(a.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Submitted';

              return (
                <div
                  key={a.id}
                  className={`rounded-2xl border transition p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs ${
                    isSelected
                      ? 'bg-[#f5f3ff] border-[#3525cd] shadow-md'
                      : 'bg-white border-[#e9edff] hover:border-[#3525cd]/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSelect(a.id)}
                      className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#3525cd] border-[#3525cd] text-white'
                          : 'border-[#c7c4d8] bg-white hover:border-[#3525cd]'
                      }`}
                      title="Select for comparison"
                    >
                      {isSelected && <StitchIcon name="check" size={14} />}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase bg-[#e2dfff] text-[#3525cd]">
                          {a.testType?.replace(/_/g, ' ') || 'FULL MOCK'}
                        </span>
                        <span className="text-xs text-[#777587] flex items-center gap-1">
                          <StitchIcon name="calendar_today" size={12} /> {dateStr}
                        </span>
                      </div>

                      <h3 className="text-base font-headline font-bold text-[#141b2b] tracking-tight">
                        {a.testTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#777587]">
                        <span>
                          Time: <strong className="text-[#141b2b]">{minutes}m {seconds}s</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Correct: <strong className="text-[#006c49]">{a.correctCount}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Incorrect: <strong className="text-[#ba1a1a]">{a.incorrectCount}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Unanswered: <strong className="text-[#777587]">{a.unansweredCount}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 self-end md:self-center shrink-0">
                    <div className="text-right space-y-0.5">
                      <div className="text-xl font-headline font-bold text-[#006c49]">
                        {a.totalScore} <span className="text-xs font-semibold text-[#777587]">/ {a.maxScore}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#3525cd]">
                        {a.accuracy}% accuracy
                      </div>
                    </div>

                    <Link
                      href={`/cbt?attemptId=${a.id}`}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-xs font-headline font-bold transition flex items-center gap-1.5 border border-[#e1e8fd]"
                    >
                      <span>View Scorecard</span>
                      <StitchIcon name="chevron_right" size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Comparison Bar when items are selected */}
        {selectedIds.length >= 2 && (
          <div className="fixed bottom-6 inset-x-0 max-w-lg mx-auto z-50 px-4">
            <div className="bg-white border border-[#3525cd] rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                  <StitchIcon name="compare_arrows" size={18} />
                </div>
                <span className="text-xs font-headline font-bold text-[#141b2b]">
                  {selectedIds.length} attempts selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-[#777587] hover:text-[#141b2b] px-3 py-1.5 cursor-pointer"
                >
                  Clear
                </button>
                <Link
                  href={`/tests/compare?attemptIds=${selectedIds.join(',')}`}
                  className="min-h-[36px] px-4 py-1.5 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs transition shadow-xs flex items-center gap-1"
                >
                  <span>Compare Side-by-Side</span>
                  <StitchIcon name="arrow_forward" size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
