'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Filter,
  RefreshCw,
  Award
} from 'lucide-react';

function StudentDirectoryView() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const json = await res.json();
        setStudents(json.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-6 font-sans">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            href="/admin"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            Student Operations Directory
          </h1>
          <p className="text-xs text-slate-400">
            Search, inspect preparation trajectories, and review active interventions
          </p>
        </div>

        {/* Global Directory Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Students Directory Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Target Exam</th>
                <th className="py-3.5 px-4">Questions Solved</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4">Mock Tests</th>
                <th className="py-3.5 px-4">Streak</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.length > 0 ? (
                students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        NEET {s.targetYear}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {s.totalAttempted} Qs
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${
                        s.accuracyRate >= 75 ? 'text-emerald-400' : s.accuracyRate >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {s.accuracyRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {s.testsCompleted} tests
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-orange-400 font-bold">🔥 {s.currentStreak}d</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                      >
                        <span>360° Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    {loading ? 'Loading directory...' : 'No students found matching query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 p-10">Loading student directory...</div>}>
      <StudentDirectoryView />
    </Suspense>
  );
}
