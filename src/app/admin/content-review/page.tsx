'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  contentId: string;
  contentType: string;
  reviewType: string;
  severity: string;
  status: string;
  assignedToId?: string;
  evidenceJson?: string;
  reviewNotes?: string;
  createdAt: string;
}

function ContentReviewContent() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        let url = '/api/admin/content-review';
        const params = new URLSearchParams();
        if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
        if (selectedSeverity !== 'ALL') params.append('severity', selectedSeverity);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const json = await res.json();
        setReviews(json.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [selectedStatus, selectedSeverity]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/admin/content/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: `Actioned as ${action} from dashboard` }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-100 text-sky-800 border border-sky-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Content Review & Scientific QA Queue</h1>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {reviews.length} Active Items
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Authoritative review gate for scientific contradictions, question answer-keys, NCERT terminology changes, and licensing restrictions.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/content-intelligence"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Content Intelligence
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition"
          >
            Admin Home
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="NEEDS_MORE_EVIDENCE">Needs More Evidence</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Severity</label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Review Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading review queue items...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No items pending review matching selected filters. All educational content is validated.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="p-3.5">Content ID / Type</th>
                <th className="p-3.5">Review Type</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Notes / Evidence</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-medium">
                    <div className="font-mono text-slate-900">{r.contentId}</div>
                    <span className="text-xs text-slate-500">{r.contentType}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800">{r.reviewType}</span>
                  </td>
                  <td className="p-3.5">{getSeverityBadge(r.severity)}</td>
                  <td className="p-3.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-600 max-w-xs truncate">
                    {r.reviewNotes || 'Automated validation trigger'}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <Link
                      href={`/admin/content/${r.contentId}/versions`}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded transition"
                    >
                      Diff
                    </Link>
                    <button
                      onClick={() => handleAction(r.id, 'approve')}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'reject')}
                      className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function ContentReviewPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading content review queue...</div>}>
      <ContentReviewContent />
    </Suspense>
  );
}
