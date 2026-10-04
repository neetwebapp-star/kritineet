'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Activity,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  PlusCircle,
  Clock,
  Send
} from 'lucide-react';

export default function MentorStudentClient({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('MENTOR_ONLY');

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mentor/students/${studentId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const errJson = await res.json();
        setError(errJson.error || 'Failed to load student data');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 p-10 flex items-center justify-center">
        Loading student coaching details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-10 space-y-4">
        <Link href="/mentor" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Mentor Workspace
        </Link>
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          ⛔ {error}
        </div>
      </div>
    );
  }

  const report = data?.report;
  const student = report?.student;
  const sections = report?.sections;
  const alerts = data?.alerts || [];
  const assignments = data?.assignments || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            href="/mentor"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mentor Workspace
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{student?.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  NEET {student?.targetYear}
                </span>
              </h1>
              <p className="text-xs text-slate-400">{student?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/reports/student/${studentId}`}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition"
          >
            <FileText className="w-3.5 h-3.5" /> 10-Section Report
          </Link>
        </div>
      </header>

      {/* Core Subject Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>Biology Mastery</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">
            {sections?.subjectPerformance?.biologyMastery ?? 0}%
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
            <span>Physics Mastery</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">
            {sections?.subjectPerformance?.physicsMastery ?? 0}%
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
            <span>Chemistry Mastery</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">
            {sections?.subjectPerformance?.chemistryMastery ?? 0}%
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Accuracy & Practice</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">
            {sections?.practice?.overallAccuracy?.toFixed(1) ?? 0}%
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Active Student Alerts & Intervention Needs</span>
          </h3>
          <div className="space-y-2">
            {alerts.map((al: any) => (
              <div key={al.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{al.title}</span>
                  <span className="text-[10px] text-amber-400 font-mono">{al.severity}</span>
                </div>
                <p className="text-slate-400">{al.description}</p>
                {al.suggestedIntervention && (
                  <p className="text-emerald-400 pt-1">💡 <strong>Intervention:</strong> {al.suggestedIntervention}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Tasks */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Assigned Work & Completion Status</span>
        </h3>
        <div className="space-y-2">
          {assignments.length > 0 ? (
            assignments.map((a: any) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{a.assignment?.title}</div>
                  <div className="text-slate-500">
                    Type: {a.assignment?.type} • Target: {a.targetProgress} units
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-300">
                    Progress: {a.currentProgress} / {a.targetProgress}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    a.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No assignments active for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
}
