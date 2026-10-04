'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Clock,
  Download,
  CheckCircle,
  FileText,
  Activity,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export default function StudentProfileClient({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`);
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
    fetchProfile();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 p-10 flex items-center justify-center">
        Loading student 360° profile...
      </div>
    );
  }

  const report = data?.report;
  const student = report?.student;
  const sections = report?.sections;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            href="/admin/students"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Directory
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
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
          <a
            href={`/api/reports/student/${studentId}?format=csv`}
            download
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Progress CSV
          </a>
          <Link
            href={`/reports/student/${studentId}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
          >
            <FileText className="w-3.5 h-3.5" /> Full Report View
          </Link>
        </div>
      </header>

      {/* Core Subject Mastery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Biology */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>Biology Mastery</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-white">
            {sections?.subjectPerformance?.biologyMastery ?? 0}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${sections?.subjectPerformance?.biologyMastery ?? 0}%` }} />
          </div>
        </div>

        {/* Physics */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
            <span>Physics Mastery</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-white">
            {sections?.subjectPerformance?.physicsMastery ?? 0}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${sections?.subjectPerformance?.physicsMastery ?? 0}%` }} />
          </div>
        </div>

        {/* Chemistry */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
            <span>Chemistry Mastery</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-white">
            {sections?.subjectPerformance?.chemistryMastery ?? 0}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full" style={{ width: `${sections?.subjectPerformance?.chemistryMastery ?? 0}%` }} />
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Career Accuracy</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-white">
            {sections?.practice?.overallAccuracy?.toFixed(1) ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500">
            {sections?.practice?.totalAttempted ?? 0} total questions attempted
          </div>
        </div>
      </div>

      {/* Relationships & Mentors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Mentors */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Assigned Faculty Mentors</span>
          </h3>
          <div className="space-y-2">
            {data?.mentors && data.mentors.length > 0 ? (
              data.mentors.map((m: any) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-slate-500">{m.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold text-[10px]">
                    ACTIVE MENTOR
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No faculty mentors assigned yet.</p>
            )}
          </div>
        </div>

        {/* Linked Parents */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Linked Guardians & Parents</span>
          </h3>
          <div className="space-y-2">
            {data?.parents && data.parents.length > 0 ? (
              data.parents.map((p: any) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-slate-500">{p.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                    LINKED PARENT
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No parents linked yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Active Interventions & Alerts */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Evidence-Based Alerts & Recommended Interventions</span>
        </h3>
        <div className="space-y-3">
          {data?.alerts && data.alerts.length > 0 ? (
            data.alerts.map((al: any) => (
              <div key={al.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{al.title}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                    {al.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{al.description}</p>
                {al.suggestedIntervention && (
                  <div className="text-xs text-emerald-400">
                    💡 <strong>Intervention:</strong> {al.suggestedIntervention}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">Zero active alerts for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
}
