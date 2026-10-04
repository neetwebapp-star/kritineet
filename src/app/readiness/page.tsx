'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function ReadinessDashboardPage() {
  const [report, setReport] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const fetchReadiness = () => {
    setLoading(true);
    fetch('/api/readiness')
      .then((res) => res.json())
      .then((json) => {
        if (json.report) {
          setReport(json.report);
          setSnapshots(json.snapshots || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load readiness report:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const handleCaptureSnapshot = async () => {
    setCapturing(true);
    try {
      const res = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodType: 'MANUAL_AUDIT' }),
      });
      if (res.ok) {
        fetchReadiness();
      }
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
    } finally {
      setCapturing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb]">
            OPTIMAL
          </span>
        );
      case 'ON_TRACK':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase bg-[#e2dfff] text-[#3525cd] border border-[#c3c0ff]">
            ON TRACK
          </span>
        );
      case 'ATTENTION_NEEDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase bg-[#fff8e1] text-[#b45309] border border-[#fde68a]">
            ATTENTION NEEDED
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase bg-[#fff1f0] text-[#ba1a1a] border border-[#ffdad6]">
            CRITICAL
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      title="Exam Readiness Matrix"
      subtitle="8-Dimension Competency Audit • NEET 2027"
      streakDays={7}
      showBack={true}
      backHref="/analytics"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-white border border-[#e9edff] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3525cd] text-xs font-headline font-bold">
              <StitchIcon name="insights" size={14} />
              <span>Multi-Dimensional Evaluation Standard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-[#141b2b]">
              8-Dimension NEET Readiness Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
              NEET readiness cannot be reduced to a single misleading percentage. We evaluate 8 independent, verifiable operational competencies required for medical college qualification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              disabled={capturing || loading}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white text-xs font-headline font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <StitchIcon name="camera" size={16} />
              <span>{capturing ? 'Recording...' : 'Snapshot Performance'}</span>
            </button>
            <Link
              href="/tests"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-xs font-headline font-bold text-[#464555] border border-[#e9edff] transition flex items-center gap-1.5"
            >
              <span>Test Library</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555] font-headline font-semibold">Auditing readiness telemetry across all 8 dimensions...</p>
          </div>
        ) : !report?.dimensions ? (
          <div className="py-16 text-center text-[#777587] bg-white rounded-2xl border border-[#e9edff]">
            Readiness data could not be retrieved.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 8 Independent Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(report.dimensions).map(([key, dim]: [string, any]) => (
                <div
                  key={key}
                  className="rounded-2xl bg-white border border-[#e9edff] p-5 flex flex-col justify-between space-y-4 hover:border-[#3525cd]/30 transition shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-headline font-bold text-[#777587] uppercase tracking-wider">
                        {dim.name}
                      </span>
                      {getStatusBadge(dim.status)}
                    </div>

                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b]">{dim.value}</span>
                      <span className="text-xs text-[#777587] font-semibold">{dim.unit}</span>
                      <span className="text-xs text-[#777587] ml-auto">Target: {dim.target}{dim.unit}</span>
                    </div>

                    <p className="text-xs text-[#464555] leading-relaxed pt-1">
                      {dim.description}
                    </p>
                  </div>

                  {/* Progress bar towards target */}
                  <div className="space-y-1.5 pt-3 border-t border-[#f1f3ff]">
                    <div className="w-full bg-[#f1f3ff] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          dim.status === 'OPTIMAL'
                            ? 'bg-[#006c49]'
                            : dim.status === 'ON_TRACK'
                            ? 'bg-[#3525cd]'
                            : dim.status === 'ATTENTION_NEEDED'
                            ? 'bg-[#b45309]'
                            : 'bg-[#ba1a1a]'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, dim.target > 0 ? (dim.value / dim.target) * 100 : 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Historical Snapshots Section */}
            <div className="rounded-2xl bg-white border border-[#e9edff] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
                    <StitchIcon name="history_edu" size={18} className="text-[#3525cd]" />
                    <span>Readiness Snapshot Progression Log</span>
                  </h3>
                  <p className="text-xs text-[#464555]">
                    Temporal checkpoints captured post-mock or via manual audit.
                  </p>
                </div>
              </div>

              {snapshots.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#777587]">
                  No historical snapshots recorded yet. Click &ldquo;Snapshot Performance&rdquo; to save today&rsquo;s audit baseline.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f9f9ff] text-[#777587] uppercase font-headline font-bold border-b border-[#e9edff]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Trigger</th>
                        <th className="py-3 px-4">Coverage</th>
                        <th className="py-3 px-4">Practice Acc</th>
                        <th className="py-3 px-4">PYQ Rate</th>
                        <th className="py-3 px-4">Mock Avg</th>
                        <th className="py-3 px-4">Weak Concepts</th>
                        <th className="py-3 px-4">Pacing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f3ff]">
                      {snapshots.map((s) => (
                        <tr key={s.id} className="hover:bg-[#f9f9ff] transition">
                          <td className="py-3 px-4 text-[#141b2b] font-medium">
                            {new Date(s.snapshotDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase bg-[#f1f3ff] text-[#464555]">
                              {s.periodType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#006c49] font-bold">{s.overallMastery}%</td>
                          <td className="py-3 px-4 text-[#3525cd] font-bold">{s.practiceAccuracy}%</td>
                          <td className="py-3 px-4 text-[#141b2b]">{s.pyqCoverageRate}%</td>
                          <td className="py-3 px-4 text-[#006c49] font-semibold">{s.mockTestAverageScore}</td>
                          <td className="py-3 px-4">
                            <span className={s.weakConceptsCount === 0 ? 'text-[#006c49] font-bold' : 'text-[#b45309] font-bold'}>
                              {s.weakConceptsCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#464555]">{s.timeEfficiencySeconds}s/q</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
