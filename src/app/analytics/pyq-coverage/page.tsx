'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function PYQCoverageAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/preparation/pyq-coverage')
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
      <AppShell title="PYQ Intelligence" subtitle="Exposure vs Accuracy vs Mastery" streakDays={7} showBack={true} backHref="/analytics">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Loading PYQ Coverage Telemetry...</p>
        </div>
      </AppShell>
    );
  }

  const pyq = data?.pyqCoverage || {};
  const matrix = data?.matrix || [];

  const filteredMatrix = matrix.filter((row: any) =>
    selectedSubject === 'ALL' ? true : row.subjectCode.toUpperCase() === selectedSubject.toUpperCase()
  );

  return (
    <AppShell
      title="PYQ Intelligence & Coverage"
      subtitle="Exposure vs Accuracy vs Composite Mastery • NEET 2027"
      streakDays={7}
      showBack={true}
      backHref="/analytics"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border border-[#e9edff] bg-white p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="px-2.5 py-0.5 text-xs font-headline font-bold uppercase bg-[#e2dfff] text-[#3525cd] rounded-full">
              Verified Question Intelligence
            </span>
            <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-[#141b2b] mt-1.5">
              PYQ Coverage & Mastery Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
              Separates Question Exposure, Accuracy, and Concept Mastery. Never conflates volume with true proficiency.
            </p>
          </div>
          <Link
            href="/pyq-vault"
            className="min-h-[44px] px-5 py-2 text-xs font-headline font-bold bg-[#3525cd] hover:bg-[#2d1eb8] text-white rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <span>Open PYQ Vault</span>
            <StitchIcon name="arrow_forward" size={14} />
          </Link>
        </div>

        {/* 3 Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(pyq).map(([subKey, metric]: [string, any]) => (
            <div
              key={subKey}
              className="p-5 sm:p-6 bg-white border border-[#e9edff] rounded-2xl space-y-4 hover:border-[#3525cd]/30 transition shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-headline font-bold text-[#141b2b]">{metric.subject}</h3>
                <span className="text-xs font-headline font-semibold text-[#777587]">
                  {metric.exposedCount} / {metric.totalAvailable} PYQs
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#464555]">Exposure (Attempted)</span>
                    <span className="font-headline font-bold text-[#3525cd]">{metric.exposureRate}%</span>
                  </div>
                  <div className="h-2 bg-[#f1f3ff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3525cd]" style={{ width: `${metric.exposureRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#464555]">Accuracy (Correct)</span>
                    <span className="font-headline font-bold text-[#006c49]">{metric.accuracyRate}%</span>
                  </div>
                  <div className="h-2 bg-[#f1f3ff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#006c49]" style={{ width: `${metric.accuracyRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#464555]">Composite Mastery</span>
                    <span className="font-headline font-bold text-[#8b5cf6]">{metric.masteryRate}%</span>
                  </div>
                  <div className="h-2 bg-[#f1f3ff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8b5cf6]" style={{ width: `${metric.masteryRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coverage vs Mastery Matrix */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-headline font-bold text-[#141b2b]">Chapter Mastery & Coverage Matrix</h3>
              <p className="text-xs text-[#464555]">
                Distinguishes <strong className="text-[#b45309] font-semibold">Not Studied</strong> (&lt;30% coverage) from <strong className="text-[#ba1a1a] font-semibold">Studied but Weak</strong> (&lt;50% mastery).
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#e9edff] shadow-xs">
              {['ALL', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSubject(s)}
                  className={`min-h-[36px] px-3.5 py-1 text-xs font-headline font-bold rounded-xl transition cursor-pointer ${
                    selectedSubject === s
                      ? 'bg-[#3525cd] text-white shadow-xs'
                      : 'text-[#464555] hover:bg-[#f1f3ff]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e9edff] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-[#141b2b]">
                <thead className="bg-[#f9f9ff] text-[11px] uppercase font-headline font-bold text-[#777587] border-b border-[#e9edff]">
                  <tr>
                    <th className="p-4">Chapter Title</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Coverage</th>
                    <th className="p-4">Mastery</th>
                    <th className="p-4">Diagnostic Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f3ff]">
                  {filteredMatrix.slice(0, 25).map((row: any) => {
                    const badge =
                      row.category === 'MASTERED'
                        ? 'bg-[#e6f7ef] text-[#006c49] border-[#6cf8bb]'
                        : row.category === 'STUDIED_BUT_WEAK'
                        ? 'bg-[#fff1f0] text-[#ba1a1a] border-[#ffdad6]'
                        : row.category === 'NOT_STUDIED'
                        ? 'bg-[#fff8e1] text-[#b45309] border-[#fde68a]'
                        : 'bg-[#e2dfff] text-[#3525cd] border-[#c3c0ff]';

                    return (
                      <tr key={row.chapterId} className="hover:bg-[#f9f9ff] transition">
                        <td className="p-4 font-headline font-bold text-[#141b2b]">{row.chapterTitle}</td>
                        <td className="p-4 text-xs font-mono text-[#777587]">{row.subjectCode}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{row.coveragePercentage}%</span>
                            <div className="w-16 h-2 bg-[#f1f3ff] rounded-full overflow-hidden">
                              <div className="h-full bg-[#3525cd]" style={{ width: `${row.coveragePercentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{row.masteryPercentage}%</span>
                            <div className="w-16 h-2 bg-[#f1f3ff] rounded-full overflow-hidden">
                              <div className="h-full bg-[#006c49]" style={{ width: `${row.masteryPercentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 text-[10px] font-headline font-bold rounded-full border ${badge}`}>
                            {row.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
