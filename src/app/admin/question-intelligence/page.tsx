'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminQuestionIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (confidenceFilter) params.set('confidence', confidenceFilter);
    if (searchQuery) params.set('query', searchQuery);
    params.set('limit', '30');

    fetch(`/api/admin/question-intelligence?${params.toString()}`)
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
  }, [statusFilter, confidenceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleBatchCalculate = async () => {
    if (!confirm('Run psychometrics batch calculation across questions?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/question-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BATCH_CALCULATE', limit: 100 }),
      });
      const resData = await res.json();
      setMessage(`Successfully calculated profiles for ${resData.calculated} questions.`);
      loadData();
    } catch (err: any) {
      setMessage(`Batch calculation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanAnomalies = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/question-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SCAN_ANOMALIES' }),
      });
      const resData = await res.json();
      setMessage(`Scan complete. Found ${resData.totalAnomaliesFound} anomalies across ${resData.totalQuestionsScanned} questions.`);
      loadData();
    } catch (err: any) {
      setMessage(`Scan failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuppress = async (questionId: string, currentStatus: string) => {
    const isSuppressed = currentStatus === 'TEMPORARILY_SUPPRESSED' || currentStatus === 'RETIRED';
    const endpoint = isSuppressed ? '/api/admin/question-restore' : '/api/admin/question-suppress';
    const reason = prompt(isSuppressed ? 'Enter reason for restoring:' : 'Enter reason for suppressing:');
    if (!reason) return;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          reason,
          adminUserId: 'admin_psychometrics',
        }),
      });
      if (res.ok) {
        setMessage(`Question status updated.`);
        loadData();
      }
    } catch (err: any) {
      setMessage(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>🎯</span> Question Intelligence & Psychometrics 2.0
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Continuous empirical item evaluation, discrimination analysis, distractor categorization & anomaly tracking
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/assessment-intelligence"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition"
            >
              📊 Cohort Analytics
            </Link>
            <button
              onClick={handleScanAnomalies}
              disabled={actionLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              🔍 Scan Anomalies
            </button>
            <button
              onClick={handleBatchCalculate}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              ⚡ Batch Recalculate
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-indigo-950/70 border border-indigo-500/50 rounded-lg text-indigo-200 text-sm flex justify-between items-center">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-indigo-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Aggregation Summary Cards */}
        {data?.aggregations && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Questions</span>
              <div className="text-2xl font-bold mt-1 text-white">{data.aggregations.totalQuestions}</div>
              <div className="text-xs text-emerald-400 mt-1">Active: {data.aggregations.statusCounts.ACTIVE}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Monitored</span>
              <div className="text-2xl font-bold mt-1 text-yellow-400">{data.aggregations.statusCounts.MONITORED}</div>
              <div className="text-xs text-slate-400 mt-1">Under observation</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Review Required</span>
              <div className="text-2xl font-bold mt-1 text-orange-400">{data.aggregations.statusCounts.REVIEW_REQUIRED}</div>
              <div className="text-xs text-orange-400/80 mt-1">Action needed</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Suppressed / Retired</span>
              <div className="text-2xl font-bold mt-1 text-rose-400">
                {data.aggregations.statusCounts.TEMPORARILY_SUPPRESSED + data.aggregations.statusCounts.RETIRED}
              </div>
              <div className="text-xs text-rose-400/80 mt-1">Excluded from tests</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Open Anomalies</span>
              <div className="text-2xl font-bold mt-1 text-purple-400">{data.aggregations.openAnomaliesCount}</div>
              <div className="text-xs text-slate-400 mt-1">
                {data.aggregations.confidenceCounts.HIGH + data.aggregations.confidenceCounts.MEDIUM} calibrated
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 min-w-[280px] flex gap-2">
            <input
              type="text"
              placeholder="Search by question text, subject, chapter, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MONITORED">MONITORED</option>
              <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
              <option value="TEMPORARILY_SUPPRESSED">SUPPRESSED</option>
              <option value="RETIRED">RETIRED</option>
            </select>

            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">All Confidence Levels</option>
              <option value="INSUFFICIENT">INSUFFICIENT (&lt;10 attempts)</option>
              <option value="LOW">LOW (10-29 attempts)</option>
              <option value="MEDIUM">MEDIUM (30-99 attempts)</option>
              <option value="HIGH">HIGH (100+ attempts)</option>
            </select>
          </div>
        </div>

        {/* Question List Table */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading psychometric calibrations...</div>
          ) : !data?.questions?.length ? (
            <div className="p-12 text-center text-slate-400">No questions found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Question</th>
                    <th className="px-4 py-3">Subject / Source</th>
                    <th className="px-4 py-3">Difficulty (Auth / Obs)</th>
                    <th className="px-4 py-3">Discrimination (D)</th>
                    <th className="px-4 py-3">Attempts & Confidence</th>
                    <th className="px-4 py-3">Status / Anomalies</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {data.questions.map((q: any) => {
                    const profile = q.assessmentProfile;
                    const anomalies = q.anomalies || [];
                    const openAnomalies = anomalies.filter((a: any) => a.status === 'OPEN');

                    return (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 max-w-md">
                          <Link
                            href={`/admin/questions/${q.id}/intelligence`}
                            className="font-medium text-white hover:text-indigo-400 line-clamp-2"
                          >
                            {q.text}
                          </Link>
                          <div className="text-xs text-slate-500 mt-1">ID: {q.id}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-slate-200">{q.subject?.name}</div>
                          <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            {q.sourceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-xs">Auth:</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              q.difficulty === 'EASY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              q.difficulty === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-slate-400 text-xs">Obs:</span>
                            <span className="text-xs font-semibold text-slate-200">
                              {profile?.observedDifficulty || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {profile?.discriminationIndex !== null && profile?.discriminationIndex !== undefined ? (
                            <div>
                              <span className={`text-sm font-bold ${
                                profile.discriminationIndex >= 0.35 ? 'text-emerald-400' :
                                profile.discriminationIndex >= 0.20 ? 'text-yellow-400' :
                                'text-rose-400'
                              }`}>
                                {profile.discriminationIndex.toFixed(2)}
                              </span>
                              <div className="text-xs text-slate-500">
                                {profile.discriminationIndex >= 0.35 ? 'Good' :
                                 profile.discriminationIndex >= 0.20 ? 'Marginal' : 'Poor/Negative'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Uncalibrated</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">
                            {profile?.totalAttempts ?? 0} attempts
                          </div>
                          <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded font-medium ${
                            profile?.difficultyConfidence === 'HIGH' ? 'bg-emerald-900/60 text-emerald-300' :
                            profile?.difficultyConfidence === 'MEDIUM' ? 'bg-blue-900/60 text-blue-300' :
                            profile?.difficultyConfidence === 'LOW' ? 'bg-yellow-900/60 text-yellow-300' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {profile?.difficultyConfidence || 'INSUFFICIENT'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${
                            q.assessmentStatus === 'ACTIVE' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' :
                            q.assessmentStatus === 'MONITORED' ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50' :
                            q.assessmentStatus === 'REVIEW_REQUIRED' ? 'bg-orange-900/60 text-orange-300 border border-orange-700/50' :
                            'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          }`}>
                            {q.assessmentStatus}
                          </span>
                          {openAnomalies.length > 0 && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                                ⚠️ {openAnomalies.length} anomaly
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                          <Link
                            href={`/admin/questions/${q.id}/intelligence`}
                            className="inline-block px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-medium transition"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => handleSuppress(q.id, q.assessmentStatus)}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              ['TEMPORARILY_SUPPRESSED', 'RETIRED'].includes(q.assessmentStatus)
                                ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                                : 'bg-rose-800/80 hover:bg-rose-700 text-rose-100'
                            }`}
                          >
                            {['TEMPORARILY_SUPPRESSED', 'RETIRED'].includes(q.assessmentStatus) ? 'Restore' : 'Suppress'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
