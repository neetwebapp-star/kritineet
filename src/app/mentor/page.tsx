'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  Clock,
  RefreshCw,
  Send,
  Sparkles
} from 'lucide-react';

function MentorDashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignType, setAssignType] = useState('PRACTICE');
  const [targetCount, setTargetCount] = useState('10');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mentor/students');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !selectedStudentId) return;

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignTitle,
          type: assignType,
          targetCount: parseInt(targetCount, 10),
          targetStudentIds: [selectedStudentId],
        }),
      });

      if (res.ok) {
        setShowAssignModal(false);
        setAssignTitle('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              FACULTY MENTOR WORKSPACE
            </span>
            <span className="text-xs text-slate-400">• NEET UG 2027</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-purple-400" />
            Mentor Guidance & Intervention Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Monitor assigned students, review data-driven alerts, and dispatch targeted study plans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-purple-600/30"
          >
            <PlusCircle className="w-4 h-4" /> Dispatch Assignment
          </button>
          <button
            onClick={fetchMentorData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Assigned Students</div>
          <div className="text-3xl font-bold text-white">{data?.assignedCount || 0}</div>
          <div className="text-[11px] text-purple-400">Under your active mentorship</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Students Needing Attention</div>
          <div className="text-3xl font-bold text-rose-400">
            {data?.studentsNeedingAttentionCount || 0}
          </div>
          <div className="text-[11px] text-slate-500">Triggered by quantitative evidence</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Intervention Status</div>
          <div className="text-3xl font-bold text-emerald-400">
            {data?.assignedCount ? Math.round(((data.assignedCount - data.studentsNeedingAttentionCount) / data.assignedCount) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-500">Cohort on track</div>
        </div>
      </div>

      {/* Needs Attention Digest */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Daily Data-Driven Needs Attention Digest</span>
          </h2>
          <p className="text-xs text-slate-400">
            Students whose recent accuracy, revision, or mistake metrics warrant proactive coaching
          </p>
        </div>

        <div className="space-y-3">
          {data?.students && data.students.filter((s: any) => s.needsAttention).length > 0 ? (
            data.students
              .filter((s: any) => s.needsAttention)
              .map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-slate-950 border border-rose-950/60 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{s.name}</span>
                      <span className="text-xs text-slate-400">({s.email})</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                        {s.alertsCount} Alert(s)
                      </span>
                    </div>
                    {s.topAlert && (
                      <p className="text-xs text-slate-300">
                        <strong>Reason:</strong> {s.topAlert.title} — {s.topAlert.description}
                      </p>
                    )}
                    {s.topAlert?.suggestedIntervention && (
                      <div className="text-xs text-emerald-400">
                        💡 <strong>Suggested Intervention:</strong> {s.topAlert.suggestedIntervention}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/mentor/students/${s.id}`}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>View Student & Coach</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span>All assigned students are meeting practice and revision benchmarks!</span>
            </div>
          )}
        </div>
      </div>

      {/* All Assigned Students Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-white">All Assigned Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Questions Attempted</th>
                <th className="py-3 px-4">Career Accuracy</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.students && data.students.length > 0 ? (
                data.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{s.totalAttempted} Qs</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{s.accuracyRate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-orange-400 font-bold">🔥 {s.streakDays}d</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.needsAttention ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {s.needsAttention ? 'NEEDS ATTENTION' : 'ON TRACK'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/mentor/students/${s.id}`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                    No students currently assigned to this mentor account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAssignment}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              Dispatch Study Plan Assignment
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="">-- Choose Assigned Student --</option>
                {data?.students?.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Assignment Title</label>
              <input
                type="text"
                value={assignTitle}
                onChange={e => setAssignTitle(e.target.value)}
                placeholder="e.g. Current Electricity NCERT Concept & 10 Qs"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Type</label>
                <select
                  value={assignType}
                  onChange={e => setAssignType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="PRACTICE">Adaptive Practice</option>
                  <option value="PYQ">NEET PYQs</option>
                  <option value="NCERT_READING">NCERT Reading</option>
                  <option value="REVISION">Spaced Revision</option>
                  <option value="TEST">Chapter Test</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Count</label>
                <input
                  type="number"
                  value={targetCount}
                  onChange={e => setTargetCount(e.target.value)}
                  min={1}
                  max={100}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Dispatch Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function MentorDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 p-10">Loading mentor dashboard...</div>}>
      <MentorDashboardView />
    </Suspense>
  );
}
