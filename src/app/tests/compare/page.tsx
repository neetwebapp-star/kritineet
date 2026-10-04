'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

function CompareContent() {
  const searchParams = useSearchParams();
  const rawAttemptIds = searchParams.get('attemptIds') || '';

  const [availableAttempts, setAvailableAttempts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    rawAttemptIds ? rawAttemptIds.split(',').filter(Boolean) : []
  );
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load available attempts for dropdown selection
  useEffect(() => {
    fetch('/api/tests/history')
      .then((res) => res.json())
      .then((json) => {
        const hist = json.history || [];
        setAvailableAttempts(hist);
        if (selectedIds.length === 0 && hist.length >= 2) {
          // Default to the two most recent attempts
          setSelectedIds([hist[0].id, hist[1].id]);
        }
      })
      .catch((err) => console.error('Failed to load attempts for comparison:', err));
  }, []);

  // Fetch comparison whenever selectedIds change (and >= 2)
  useEffect(() => {
    if (selectedIds.length < 2) {
      setComparisonData(null);
      return;
    }

    setLoading(true);
    fetch(`/api/tests/compare?attemptIds=${selectedIds.join(',')}`)
      .then((res) => res.json())
      .then((data) => {
        setComparisonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to compare tests:', err);
        setLoading(false);
      });
  }, [selectedIds]);

  const handleSelectAttempt = (index: number, newId: string) => {
    const copy = [...selectedIds];
    copy[index] = newId;
    setSelectedIds(copy);
  };

  const attemptsToCompare = comparisonData?.comparison?.attempts || [];
  const delta = comparisonData?.comparison?.delta || null;

  return (
    <div className="space-y-6">
      {/* Selector Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e9edff] space-y-4 shadow-xs">
        <h2 className="text-xs font-headline font-bold text-[#777587] uppercase tracking-wider">
          Select Exam Attempts to Compare Side-by-Side
        </h2>

        {availableAttempts.length < 2 ? (
          <p className="text-xs text-[#777587]">
            You need at least 2 completed test attempts to run a comparative analysis.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-headline font-bold text-[#141b2b]">Attempt 1 (Baseline)</label>
              <select
                value={selectedIds[0] || ''}
                onChange={(e) => handleSelectAttempt(0, e.target.value)}
                className="w-full bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
              >
                {availableAttempts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.testTitle} ({new Date(a.submittedAt).toLocaleDateString()} - Score: {a.totalScore})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-headline font-bold text-[#141b2b]">Attempt 2 (Comparison)</label>
              <select
                value={selectedIds[1] || ''}
                onChange={(e) => handleSelectAttempt(1, e.target.value)}
                className="w-full bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
              >
                {availableAttempts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === selectedIds[0]}>
                    {a.testTitle} ({new Date(a.submittedAt).toLocaleDateString()} - Score: {a.totalScore})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Body */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Synthesizing comparative test diagnostics...</p>
        </div>
      ) : attemptsToCompare.length < 2 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-[#e9edff] p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#f1f3ff] flex items-center justify-center mx-auto text-[#3525cd]">
            <StitchIcon name="compare_arrows" size={24} />
          </div>
          <h3 className="text-base font-headline font-bold text-[#141b2b]">Select at least two attempts to view comparison</h3>
          <p className="text-xs text-[#464555]">
            Choose two completed tests above to compare score progressions, speed, subject strengths, and pacing patterns.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Delta Insight Pill (if available) */}
          {delta && (
            <div className="p-4 rounded-2xl bg-[#e6f7ef] border border-[#6cf8bb] flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <StitchIcon name="trending_up" size={18} className="text-[#006c49]" />
                <span className="text-xs text-[#00714d] font-headline font-medium">
                  Score Difference: <strong className={delta.scoreDiff >= 0 ? 'text-[#006c49] font-bold' : 'text-[#ba1a1a] font-bold'}>
                    {delta.scoreDiff > 0 ? `+${delta.scoreDiff}` : delta.scoreDiff} Marks
                  </strong> &bull; Accuracy Shift: <strong className={delta.accuracyDiff >= 0 ? 'text-[#006c49] font-bold' : 'text-[#ba1a1a] font-bold'}>
                    {delta.accuracyDiff > 0 ? `+${delta.accuracyDiff}%` : `${delta.accuracyDiff}%`}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attemptsToCompare.map((a: any, idx: number) => (
              <div
                key={a.id}
                className="rounded-3xl bg-white border border-[#e9edff] p-6 space-y-5 shadow-xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-headline font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555]">
                    {idx === 0 ? 'Attempt 1 (Baseline)' : 'Attempt 2 (Comparison)'}
                  </span>
                  <h3 className="text-lg font-headline font-bold text-[#141b2b] tracking-tight">{a.testTitle}</h3>
                  <p className="text-xs text-[#777587]">
                    Taken on {new Date(a.submittedAt).toLocaleDateString()} &bull; {a.testType}
                  </p>
                </div>

                {/* Score & Accuracy Hero */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] text-center">
                    <span className="text-[10px] text-[#777587] uppercase font-headline font-bold">Total Score</span>
                    <div className="text-2xl sm:text-3xl font-headline font-bold text-[#006c49]">{a.totalScore}</div>
                    <span className="text-[10px] text-[#777587]">out of {a.maxScore}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] text-center">
                    <span className="text-[10px] text-[#777587] uppercase font-headline font-bold">Accuracy</span>
                    <div className="text-2xl sm:text-3xl font-headline font-bold text-[#3525cd]">{a.accuracy}%</div>
                    <span className="text-[10px] text-[#777587]">{a.correctCount} correct / {a.incorrectCount} wrong</span>
                  </div>
                </div>

                {/* Time & Pacing */}
                <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-2">
                  <span className="text-xs font-headline font-bold text-[#141b2b] uppercase tracking-wider block">
                    Time Management & Pacing
                  </span>
                  <div className="flex items-center justify-between text-xs text-[#464555]">
                    <span>Total Time Spent:</span>
                    <strong className="text-[#141b2b]">
                      {Math.floor(a.timeSpentSeconds / 60)}m {a.timeSpentSeconds % 60}s
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#464555]">
                    <span>Avg Time / Question:</span>
                    <strong className="text-[#141b2b]">
                      {a.averageTimePerQuestion || 50} seconds
                    </strong>
                  </div>
                  {a.timeAnalysis?.summary && (
                    <p className="text-xs text-[#464555] italic pt-1 border-t border-[#f1f3ff]">
                      &ldquo;{a.timeAnalysis.summary}&rdquo;
                    </p>
                  )}
                </div>

                {/* Subject Breakdown */}
                {a.subjectBreakdown && (
                  <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-2.5">
                    <span className="text-xs font-headline font-bold text-[#141b2b] uppercase tracking-wider block">
                      Subject Performance
                    </span>
                    <div className="space-y-2">
                      {Object.entries(a.subjectBreakdown).map(([subj, stats]: [string, any]) => (
                        <div key={subj} className="flex items-center justify-between text-xs">
                          <span className="text-[#141b2b] font-medium">{subj}:</span>
                          <span className="text-[#464555]">
                            Score: <strong className="text-[#006c49]">{stats.score}</strong> | Acc: <strong className="text-[#3525cd]">{stats.accuracy}%</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompareTestsPage() {
  return (
    <AppShell
      title="Compare Test Attempts"
      subtitle="Side-by-Side Progression & Weakness Shifts"
      streakDays={7}
      showBack={true}
      backHref="/tests/history"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="space-y-1 bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl shadow-xs">
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] tracking-tight flex items-center gap-2">
            <StitchIcon name="compare_arrows" size={22} className="text-[#3525cd]" />
            <span>Comparative Mock Test Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#464555]">
            Side-by-side progression tracking across scores, pacing, error patterns, and subject proficiencies.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#464555] font-headline font-semibold">Loading comparative analyzer...</p>
            </div>
          }
        >
          <CompareContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
