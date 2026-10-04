'use client';

import React, { useState, useEffect, Suspense, use } from 'react';
import Link from 'next/link';

interface VersionItem {
  id: string;
  versionNumber: number;
  contentSnapshot?: string;
  sourceSnapshot?: string;
  contentHash?: string;
  changeType?: string;
  changeReason?: string;
  changedBy?: string;
  createdAt: string;
}

interface VersionsPageProps {
  params: Promise<{ id: string }>;
}

function VersionsDiffContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch(`/api/admin/content/${id}/versions`);
        const json = await res.json();
        setVersions(json.versions || []);
      } catch (err) {
        console.error('Error fetching version history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVersions();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Content Version History & Diff</h1>
            <span className="font-mono text-sm px-2.5 py-1 bg-slate-200 text-slate-800 rounded font-bold">{id}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Immutable chronological audit of all text revisions, provenance alterations, and scientific corrections.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/content-review"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Review Queue
          </Link>
          <Link
            href="/admin/content-intelligence"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition"
          >
            Intelligence
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto p-12 text-center text-slate-500 font-medium">Loading version history...</div>
      ) : versions.length === 0 ? (
        <div className="max-w-7xl mx-auto p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          No versions recorded yet for this content identifier.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {versions.map((ver, idx) => (
            <div key={ver.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-full text-xs">
                    Version {ver.versionNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ver.changeType || 'INITIAL'}
                  </span>
                  <span className="text-xs text-slate-500">By {ver.changedBy || 'SYSTEM'}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(ver.createdAt).toLocaleString()}
                </div>
              </div>

              {ver.changeReason && (
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <strong>Reason:</strong> {ver.changeReason}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Content Snapshot (SHA-256: {ver.contentHash?.substring(0, 12)}...)
                </label>
                <div className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {ver.contentSnapshot || 'Empty snapshot'}
                </div>
              </div>

              {ver.sourceSnapshot && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Provenance Snapshot
                  </label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700">
                    {ver.sourceSnapshot}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VersionsPage({ params }: VersionsPageProps) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading versions...</div>}>
      <VersionsDiffContent params={params} />
    </Suspense>
  );
}
