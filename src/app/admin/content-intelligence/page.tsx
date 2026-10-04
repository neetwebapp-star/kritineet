'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

interface IntelligenceData {
  overview: {
    totalContent: number;
    published: number;
    reviewRequired: number;
    retired: number;
    freshness: {
      fresh: number;
      reviewDue: number;
      stale: number;
    };
  };
  reviewBacklogSLA: {
    bracket0to1Day: number;
    bracket2to7Days: number;
    bracket8to30Days: number;
    bracket30PlusDays: number;
    totalOpen: number;
  };
  recentReviews: Array<{
    id: string;
    contentId: string;
    reviewType: string;
    severity: string;
    status: string;
    reviewNotes?: string;
  }>;
  recentDiffs: Array<{
    id: string;
    contentId: string;
    changeType: string;
    severity: string;
    oldVersion: number;
    newVersion: number;
  }>;
}

function ContentIntelligenceContent() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/content-intelligence');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching content intelligence:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Content Quality & Lifecycle Intelligence</h1>
          <p className="text-sm text-slate-600 mt-1">
            Continuous scientific validation, immutable provenance tracking, and content freshness auditing across all NEET subjects.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/content-review"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Review Queue ({data?.reviewBacklogSLA.totalOpen || 0})
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition"
          >
            Admin Home
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto p-12 text-center text-slate-500 font-medium">
          Loading content intelligence telemetry...
        </div>
      ) : data ? (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Objects</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{data.overview.totalContent}</div>
              <span className="text-xs text-emerald-600 mt-1 block">{data.overview.published} Published & Eligible</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">{data.reviewBacklogSLA.totalOpen}</div>
              <span className="text-xs text-slate-500 mt-1 block">Scientific & Source Flags</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Freshness Profile</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{data.overview.freshness.fresh} Fresh</div>
              <span className="text-xs text-amber-600 mt-1 block">{data.overview.freshness.stale} Stale / Revalidation Due</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retired / Blocked</span>
              <div className="text-2xl font-bold text-slate-700 mt-1">{data.overview.retired}</div>
              <span className="text-xs text-slate-500 mt-1 block">Excluded from Student Serving</span>
            </div>
          </div>

          {/* SLA Breakdown & Recent Changes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLA Aging */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Editorial Review Queue Backlog (SLA Aging)</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="font-medium text-slate-700">0 – 1 Day (Immediate):</span>
                  <span className="font-bold text-emerald-700">{data.reviewBacklogSLA.bracket0to1Day} items</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="font-medium text-slate-700">2 – 7 Days (Normal Priority):</span>
                  <span className="font-bold text-sky-700">{data.reviewBacklogSLA.bracket2to7Days} items</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="font-medium text-slate-700">8 – 30 Days (Elevated Backlog):</span>
                  <span className="font-bold text-amber-700">{data.reviewBacklogSLA.bracket8to30Days} items</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="font-medium text-slate-700">30+ Days (Critical Backlog):</span>
                  <span className="font-bold text-rose-700">{data.reviewBacklogSLA.bracket30PlusDays} items</span>
                </div>
              </div>
            </div>

            {/* Recent Source Diffs */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Detected Source Diffs</h2>
              {data.recentDiffs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No source mutations detected recently.</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {data.recentDiffs.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex justify-between font-bold text-slate-900 mb-1">
                        <span className="font-mono">{d.contentId}</span>
                        <span className="text-indigo-600">v{d.oldVersion} &rarr; v{d.newVersion}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{d.changeType}</span>
                        <span className="font-semibold text-rose-600">{d.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ContentIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading content intelligence...</div>}>
      <ContentIntelligenceContent />
    </Suspense>
  );
}
