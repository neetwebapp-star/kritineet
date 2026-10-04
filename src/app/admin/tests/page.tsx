'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  PlusCircle,
  Clock,
  Eye,
  Check,
  X,
  Zap,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export default function AdminTestsStudioPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validationModal, setValidationModal] = useState<{
    testId: string;
    testTitle: string;
    result: any;
  } | null>(null);
  const [validating, setValidating] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form state
  const [createType, setCreateType] = useState('FULL_MOCK');
  const [createSubject, setCreateSubject] = useState('BIO');
  const [createCount, setCreateCount] = useState(45);
  const [createTitle, setCreateTitle] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/tests').then((r) => r.json()),
      fetch('/api/admin/tests/analytics').then((r) => r.json()),
    ])
      .then(([testsRes, analyticsRes]) => {
        setTests(testsRes.tests || []);
        setAnalytics(analyticsRes.analytics || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin test data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidate = async (testId: string, testTitle: string) => {
    setValidating(true);
    try {
      const res = await fetch(`/api/admin/tests/${testId}/validate`, { method: 'POST' });
      const result = await res.json();
      setValidationModal({ testId, testTitle, result });
    } catch (err) {
      console.error('Validation failed:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleTogglePublish = async (testId: string, currentStatus: boolean) => {
    setPublishingId(testId);
    try {
      const res = await fetch(`/api/admin/tests/${testId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to toggle publication');
        setTimeout(() => setActionError(null), 4000);
        if (data.validation) {
          const t = tests.find((x) => x.id === testId);
          setValidationModal({
            testId,
            testTitle: t?.title || 'Test',
            result: data.validation,
          });
        }
      } else {
        loadData();
      }
    } catch (err) {
      console.error('Publish toggle error:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: createType,
          subjectCode: createType === 'SUBJECT_TEST' ? createSubject : undefined,
          customCount: createCount,
          customTitle: createTitle.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setCreateTitle('');
        loadData();
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to generate test');
        setTimeout(() => setActionError(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create test:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/admin/review" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Review</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Test Administration & Quality Gate
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tests"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <span>Student View</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generate Mock Test</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Analytics Top Bar */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Tests</span>
              <div className="text-2xl font-black text-white">{analytics.totalTests}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Published</span>
              <div className="text-2xl font-black text-emerald-400">{analytics.publishedTests}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Drafts</span>
              <div className="text-2xl font-black text-amber-400">{analytics.draftTests}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Attempts</span>
              <div className="text-2xl font-black text-blue-400">{analytics.totalAttempts}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Avg Score</span>
              <div className="text-2xl font-black text-purple-400">{analytics.averageScore}</div>
            </div>
          </div>
        )}

        {/* Tests List */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Test Catalog & Gate Status ({tests.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Loading test catalog...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No tests created yet. Click &ldquo;Generate Mock Test&rdquo; to build your first test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Marks</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {tests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-white font-medium max-w-xs truncate">
                        {t.title}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          v{t.version} &bull; {t.durationMinutes} mins
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {t.testType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{t.questionCount} / {t.totalQuestions}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{t.totalMarks}</td>
                      <td className="py-3 px-4 text-slate-300">{t.totalAttempts}</td>
                      <td className="py-3 px-4">
                        {t.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> PUBLISHED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            DRAFT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleValidate(t.id, t.title)}
                            disabled={validating}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
                          >
                            Validate Gate
                          </button>
                          <button
                            onClick={() => handleTogglePublish(t.id, t.isPublished)}
                            disabled={publishingId === t.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              t.isPublished
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {t.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Validation Results Modal */}
      {validationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Quality Gate: {validationModal.testTitle}
              </h3>
              <button
                onClick={() => setValidationModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Gate Verdict:</span>
                {validationModal.result.isValid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASSED QUALITY GATE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> GATE FAILED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Verified</span>
                  <span className="font-bold text-emerald-400">{validationModal.result.stats?.verifiedCount} / {validationModal.result.stats?.totalChecked}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Published</span>
                  <span className="font-bold text-blue-400">{validationModal.result.stats?.publishedCount} / {validationModal.result.stats?.totalChecked}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Avg Quality</span>
                  <span className="font-bold text-white">{validationModal.result.stats?.averageQualityScore}</span>
                </div>
              </div>

              {validationModal.result.errors?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-red-400 block">Critical Invariant Violations:</span>
                  <ul className="text-xs text-red-300 space-y-1 max-h-36 overflow-y-auto bg-red-950/20 p-2.5 rounded-xl border border-red-900/40">
                    {validationModal.result.errors.map((e: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>&bull;</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationModal.result.warnings?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 block">Warnings:</span>
                  <ul className="text-xs text-amber-300 space-y-1 max-h-24 overflow-y-auto bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/40">
                    {validationModal.result.warnings.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>&bull;</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setValidationModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Create New Test
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Test Title (Optional)</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Test Type</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="FULL_MOCK">Full NEET Mock (200 Questions)</option>
                  <option value="SUBJECT_TEST">Subject Test</option>
                  <option value="PYQ_TEST">NEET PYQ Test</option>
                  <option value="WEAKNESS_TEST">Targeted Weakness Test</option>
                  <option value="REVISION_TEST">Revision Test</option>
                </select>
              </div>

              {createType === 'SUBJECT_TEST' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <select
                    value={createSubject}
                    onChange={(e) => setCreateSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="BIO">Biology (Botany + Zoology)</option>
                    <option value="PHY">Physics</option>
                    <option value="CHE">Chemistry</option>
                  </select>
                </div>
              )}

              {createType !== 'FULL_MOCK' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Question Count</label>
                  <select
                    value={createCount}
                    onChange={(e) => setCreateCount(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value={15}>15 Questions</option>
                    <option value={30}>30 Questions</option>
                    <option value={45}>45 Questions</option>
                    <option value={90}>90 Questions</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-2"
                >
                  {creating ? 'Generating...' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
