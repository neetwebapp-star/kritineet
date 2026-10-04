'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function QuestionIntelligenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const questionId = resolvedParams.id;

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New dispute/review form
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('MAINTAIN_KEY');
  const [newKey, setNewKey] = useState(0);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = () => {
    setLoading(true);
    fetch(`/api/admin/questions/${questionId}/intelligence`)
      .then((res) => res.json())
      .then((d) => {
        setQuestion(d.question);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [questionId]);

  const handleRecalculate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECALCULATE' }),
      });
      const data = await res.json();
      setMessage('Psychometrics and anomalies recalculated.');
      loadData();
    } catch (err: any) {
      setMessage(`Recalculation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', status }),
      });
      if (res.ok) {
        setMessage(`Status updated to ${status}.`);
        loadData();
      }
    } catch (err: any) {
      setMessage(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/question-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESOLVE_REVIEW',
          questionId,
          reviewerId: 'admin_psychometrics',
          actionTaken: reviewAction,
          newCorrectOption: reviewAction === 'UPDATE_ANSWER_KEY' ? newKey : undefined,
          explanation: reviewNotes,
          decisionNotes: reviewNotes,
        }),
      });
      if (res.ok) {
        setMessage('Review resolution recorded. Audit trail preserved.');
        setShowReviewModal(false);
        loadData();
      }
    } catch (err: any) {
      setMessage(`Review resolution failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white p-8">Loading question intelligence...</div>;
  }

  if (!question) {
    return <div className="min-h-screen bg-slate-900 text-white p-8">Question not found.</div>;
  }

  const profile = question.assessmentProfile;
  const options = question.parsedOptions || [];
  const optionPerfs = question.optionPerformances || [];
  const anomalies = question.anomalies || [];
  const versions = question.versions || [];
  const reviews = question.reviews || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back and Header */}
        <div>
          <Link
            href="/admin/question-intelligence"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-3"
          >
            ← Back to Question Intelligence
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Question Psychometric Profile
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span>ID: {question.id}</span>
                <span>•</span>
                <span>Subject: {question.subject?.name}</span>
                <span>•</span>
                <span>Chapter: {question.chapter?.title}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{question.sourceType}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRecalculate}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold text-white transition disabled:opacity-50"
              >
                ⚡ Recalculate
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-xs font-semibold text-white transition"
              >
                ⚖️ Audit Review / Key Dispute
              </button>
              <select
                value={question.assessmentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MONITORED">MONITORED</option>
                <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
                <option value="TEMPORARILY_SUPPRESSED">TEMPORARILY_SUPPRESSED</option>
                <option value="RETIRED">RETIRED</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-indigo-950/70 border border-indigo-500/50 rounded-lg text-indigo-200 text-sm flex justify-between items-center">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-indigo-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Question Text Box */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl space-y-4">
          <div className="text-slate-200 font-medium text-base whitespace-pre-wrap">{question.text}</div>
          {question.rationale && (
            <div className="p-3 bg-slate-900/60 rounded-lg text-xs text-slate-300 border border-slate-800">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Official Solution Rationale</span>
              {question.rationale}
            </div>
          )}
        </div>

        {/* Core Psychometrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Difficulty Calibration</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-white">
                {profile?.observedDifficulty || 'Uncalibrated'}
              </span>
              <span className="text-xs text-slate-400">(Authored: {question.difficulty})</span>
            </div>
            <div className="text-xs mt-2">
              Sample size: <span className="font-semibold text-slate-200">{profile?.totalAttempts ?? 0}</span> ({profile?.difficultyConfidence || 'INSUFFICIENT'})
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Discrimination Index (D)</span>
            <div className="text-2xl font-bold mt-2">
              {profile?.discriminationIndex !== null && profile?.discriminationIndex !== undefined ? (
                <span className={profile.discriminationIndex >= 0.35 ? 'text-emerald-400' : profile.discriminationIndex >= 0.20 ? 'text-yellow-400' : 'text-rose-400'}>
                  {profile.discriminationIndex.toFixed(2)}
                </span>
              ) : (
                <span className="text-slate-500 text-lg">N/A</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Upper vs lower 27% difference
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Pacing & Timing (p50 / p90)</span>
            <div className="text-xl font-bold text-white mt-2">
              {profile?.medianResponseTime ? `${Math.round(profile.medianResponseTime)}s` : 'N/A'}
              <span className="text-xs font-normal text-slate-400 ml-1">
                {profile?.p90ResponseTime ? `/ ${Math.round(profile.p90ResponseTime)}s` : ''}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Std Dev: {profile?.responseTimeVariance ? Math.round(profile.responseTimeVariance) : 0}s
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Quality & Ambiguity</span>
            <div className="text-2xl font-bold text-white mt-2">
              {profile?.assessmentQualityScore ? `${Math.round(profile.assessmentQualityScore * 100)}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Ambiguity Score: <span className="font-semibold text-slate-300">{profile?.ambiguityScore ? profile.ambiguityScore.toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Distractor Analysis Table */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 bg-slate-900/60 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Distractor Analysis & Response Distribution
            </h3>
            <span className="text-xs text-slate-400">Total Attempts: {profile?.totalAttempts ?? 0}</span>
          </div>

          <div className="p-4 space-y-3">
            {options.map((optText: string, idx: number) => {
              const perf = optionPerfs.find((p: any) => p.optionIndex === idx);
              const isKey = idx === question.correctOption;
              const selectRate = perf?.selectionRate ? (perf.selectionRate * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isKey
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                      : perf?.distractorCategory === 'AMBIGUOUS'
                      ? 'bg-purple-950/40 border-purple-700/60 text-purple-200'
                      : perf?.distractorCategory === 'SUSPICIOUS'
                      ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                      : 'bg-slate-900/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-bold text-sm px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="text-sm flex-1">{optText}</div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="text-slate-300">
                      {perf?.selectionCount ?? 0} clicks ({selectRate}%)
                    </span>
                    <span className={`px-2 py-0.5 rounded font-semibold uppercase text-xs ${
                      isKey ? 'bg-emerald-900 text-emerald-300' :
                      perf?.distractorCategory === 'AMBIGUOUS' ? 'bg-purple-900 text-purple-300' :
                      perf?.distractorCategory === 'SUSPICIOUS' ? 'bg-amber-900 text-amber-300' :
                      perf?.distractorCategory === 'WEAK' ? 'bg-slate-800 text-slate-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {isKey ? 'CORRECT KEY' : perf?.distractorCategory || 'DISTRACTOR'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomalies & Review Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anomalies */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span>⚠️</span> Detected Anomalies ({anomalies.length})
            </h3>
            {anomalies.length === 0 ? (
              <p className="text-xs text-slate-400">No psychometric anomalies detected.</p>
            ) : (
              <div className="space-y-2">
                {anomalies.map((a: any) => (
                  <div key={a.id} className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-rose-400">{a.anomalyType}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{a.status}</span>
                    </div>
                    <p className="text-slate-300">{a.description}</p>
                    <div className="text-slate-500 text-[10px]">
                      Detected: {new Date(a.detectedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Versions */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span>📜</span> Question Versions ({versions.length})
            </h3>
            {versions.length === 0 ? (
              <p className="text-xs text-slate-400">No version revisions created yet (Initial canonical state).</p>
            ) : (
              <div className="space-y-2">
                {versions.map((v: any) => (
                  <div key={v.id} className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-400">Version {v.versionNumber}</span>
                      <span className="text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300">Reason: {v.changeReason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Answer Key Dispute Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-white">Answer Key Dispute & Review</h3>
              <p className="text-xs text-slate-400">
                Audited action will maintain immutability for past attempts while setting the active key.
              </p>

              <form onSubmit={handleResolveReview} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Action</label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="MAINTAIN_KEY">MAINTAIN_KEY (Dispute Rejected)</option>
                    <option value="UPDATE_ANSWER_KEY">UPDATE_ANSWER_KEY (Creates New Version)</option>
                    <option value="AWARD_FULL_MARKS">AWARD_FULL_MARKS (Bonus / Ambiguous Item)</option>
                    <option value="SUPPRESS_QUESTION">SUPPRESS_QUESTION (Remove From Tests)</option>
                  </select>
                </div>

                {reviewAction === 'UPDATE_ANSWER_KEY' && (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">New Correct Option</label>
                    <select
                      value={newKey}
                      onChange={(e) => setNewKey(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                    >
                      {options.map((_: any, i: number) => (
                        <option key={i} value={i}>
                          Option {String.fromCharCode(65 + i)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Audited Decision Notes</label>
                  <textarea
                    required
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Provide justification and NCERT provenance citations..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-3 py-1.5 bg-slate-700 rounded text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Submit Resolution
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
