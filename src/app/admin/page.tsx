'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Clock,
  Activity,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function AdminCommandCenterPage() {
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [healthRes, alertsRes] = await Promise.all([
        fetch('/api/admin/system-health'),
        fetch('/api/admin/alerts'),
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (alertsRes.ok) {
        const d = await alertsRes.json();
        setAlerts(d.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              OPERATIONAL
            </span>
            <span className="text-xs text-slate-400">NEET UG 2027 Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-indigo-400" />
            Administration & Operations Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time oversight of student preparation, mentor assignments, parent links, and system telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
          >
            <Users className="w-4 h-4" /> Student Directory
          </Link>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {health?.usersSummary?.students ?? '—'}
          </div>
          <div className="text-[11px] text-slate-500">Targeting NEET 2027</div>
        </div>

        {/* Total Mentors */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Mentors</span>
            <GraduationCap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {health?.usersSummary?.mentors ?? '—'}
          </div>
          <div className="text-[11px] text-slate-500">Active faculty</div>
        </div>

        {/* Parent Links */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Parent Links</span>
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {health?.usersSummary?.parents ?? '—'}
          </div>
          <div className="text-[11px] text-slate-500">Authorized guardians</div>
        </div>

        {/* Question Bank */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Verified Questions</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(health?.questionBank?.totalVerified || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400">PYQ + Fingertips + NCERT</div>
        </div>

        {/* Published Mocks */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">CBT Mock Exams</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {health?.testEngine?.publishedMocks || 0}
          </div>
          <div className="text-[11px] text-slate-500">NTA Blueprint Calibrated</div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Student Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {alerts.length}
          </div>
          <div className="text-[11px] text-slate-500">Requiring intervention</div>
        </div>
      </div>

      {/* Operational Hub & Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Directory Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Users className="w-5 h-5" />
              <span>Student Operations</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore 360° student directory, examine individual mastery curves, practice accuracy, and assign mentors.
            </p>
          </div>
          <Link
            href="/admin/students"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-between"
          >
            <span>Open Student Directory</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* AI Ops & Telemetry Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
              <Cpu className="w-5 h-5" />
              <span>AI Tutor Operations</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor real-time inference latency, token economics, grounding accuracy, and student feedback sentiment.
            </p>
          </div>
          <Link
            href="/admin/ai"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-between"
          >
            <span>Open AI Telemetry</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Content Review Studio Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Layers className="w-5 h-5" />
              <span>Content & Quality Review</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify ingested NCERT line items, PYQ provenance, question diagrams, and publish validated mock tests.
            </p>
          </div>
          <Link
            href="/admin/review"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-between"
          >
            <span>Open Review Studio</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Active Evidence-Based Alerts Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Active Evidence-Based Student Alerts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Objective intervention suggestions generated from quantitative performance telemetry
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {alerts.length} pending
          </span>
        </div>

        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-start justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{alert.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-400">• Student: {alert.student?.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{alert.description}</p>
                  {alert.suggestedIntervention && (
                    <div className="text-xs text-emerald-400 pt-1">
                      💡 <strong>Suggested Intervention:</strong> {alert.suggestedIntervention}
                    </div>
                  )}
                </div>

                <Link
                  href={`/admin/students/${alert.studentId}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition"
                >
                  View Profile & Intervene
                </Link>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>All student preparation trajectories are currently in a healthy state.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
