'use client';

import React, { useEffect, useState } from 'react';

export default function AdminExamsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New update form state
  const [title, setTitle] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [updateType, setUpdateType] = useState('GENERAL_NOTIFICATION');
  const [impactLevel, setImpactLevel] = useState('MEDIUM');
  const [impactSummary, setImpactSummary] = useState('');

  const loadData = () => {
    fetch('/api/admin/exams')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sourceName || !sourceUrl) return;

    setSubmitting(true);
    const editionId = data?.editions?.[0]?.id;

    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_UPDATE',
          params: {
            editionId,
            title,
            sourceName,
            sourceUrl,
            updateType,
            impactLevel,
            impactSummary,
            verificationStatus: 'UNVERIFIED',
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Exam update recorded in DRAFT (UNVERIFIED) state.');
        setTitle('');
        setSourceName('');
        setSourceUrl('');
        setImpactSummary('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (updateId: string) => {
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_UPDATE',
          updateId,
          adminUserId: 'admin_sys',
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Update verified and impact analysis executed!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading Exam Command Center...</div>
      </div>
    );
  }

  const editions = data?.editions || [];
  const sources = data?.sources || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
              Administrative Command Center
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Exam Intelligence Administration</h1>
            <p className="text-sm text-slate-400 mt-1">
              Verify authoritative updates, configure syllabus versions, and govern exam patterns.
            </p>
          </div>
          <a
            href="/exam/updates"
            className="px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
          >
            Student Updates Portal →
          </a>
        </div>

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center justify-between">
            <span>✓ {message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-500 hover:text-emerald-400 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Create Update Form */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-slate-100">Publish or Record Official Exam Update</h3>
          <form onSubmit={handleCreateUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Update Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NTA Notification: NEET UG 2027 Information Bulletin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Update Type</label>
                <select
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="GENERAL_NOTIFICATION">General Notification</option>
                  <option value="DATE_ANNOUNCEMENT">Official Date Announcement</option>
                  <option value="SYLLABUS_CHANGE">Syllabus Revision</option>
                  <option value="PATTERN_CHANGE">Pattern Modification</option>
                  <option value="REGISTRATION">Registration Timeline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Source Name</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. National Testing Agency (NTA)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Source URL</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://exams.nta.ac.in/NEET/"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Impact Summary & Student Advisory</label>
              <textarea
                value={impactSummary}
                onChange={(e) => setImpactSummary(e.target.value)}
                placeholder="Explain concrete student impact without speculative commentary..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Record Update (Draft)'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Updates Table with Verification Workflow */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Updates Pending Verification & History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Impact</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {editions[0]?.updates?.map((up: any) => (
                  <tr key={up.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-semibold text-slate-100 max-w-xs truncate">{up.title}</td>
                    <td className="p-3 text-xs text-slate-400">{up.sourceName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          up.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : up.verificationStatus === 'SUPERSEDED'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {up.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{up.impactLevel}</td>
                    <td className="p-3 text-right">
                      {up.verificationStatus === 'UNVERIFIED' && (
                        <button
                          onClick={() => handleVerify(up.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Verify & Notify Students
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
