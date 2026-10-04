'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Cpu,
  DollarSign,
  Clock,
  ShieldCheck,
  ThumbsUp,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export default function AdminAIMonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ai');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/review"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Review
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Cpu className="w-7 h-7 text-indigo-400" />
            AI Tutor Intelligence & Operations Monitor
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry, model routing, token economics, and grounding verification
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </header>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Queries */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Queries</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.metrics?.totalQueries || 0}
          </div>
          <div className="text-[11px] text-slate-500">All student sessions</div>
        </div>

        {/* Total Tokens */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Tokens</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(data?.metrics?.totalTokens || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Prompt + Completion</div>
        </div>

        {/* Estimated Cost */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Est. Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${(data?.metrics?.totalCost || 0).toFixed(4)}
          </div>
          <div className="text-[11px] text-emerald-400">0$ on System Engine</div>
        </div>

        {/* Average Latency */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.metrics?.averageLatencyMs || 0} ms
          </div>
          <div className="text-[11px] text-slate-500">Real-time inference</div>
        </div>

        {/* Grounding Rate */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Grounding Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {data?.metrics?.groundingRate || 100}%
          </div>
          <div className="text-[11px] text-slate-500">Verified NCERT / PYQ</div>
        </div>

        {/* Feedback Satisfaction */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Satisfaction</span>
            <ThumbsUp className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-pink-400">
            {data?.metrics?.feedbackSatisfactionRate || 100}%
          </div>
          <div className="text-[11px] text-slate-500">Student helpful rating</div>
        </div>
      </div>

      {/* Mode Distribution & Model Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mode Counts */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Query Distribution by Tutor Mode</span>
          </h3>
          <div className="space-y-2.5">
            {data?.metrics?.modeCounts && Object.keys(data.metrics.modeCounts).length > 0 ? (
              Object.entries(data.metrics.modeCounts).map(([mode, count]: any) => (
                <div key={mode} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{mode}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No queries logged yet.</p>
            )}
          </div>
        </div>

        {/* Feedback Breakdown */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Recent Student Feedback</span>
          </h3>
          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {data?.recentFeedback && data.recentFeedback.length > 0 ? (
              data.recentFeedback.map((fb: any) => (
                <div
                  key={fb.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{fb.user?.email}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fb.isHelpful ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {fb.isHelpful ? 'HELPFUL' : 'NOT HELPFUL'}
                    </span>
                  </div>
                  {fb.comments && <p className="text-slate-400">{fb.comments}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No feedback recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Telemetry Logs Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-white">Recent AI Telemetry Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Provider / Model</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Grounding</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.recentLogs && data.recentLogs.length > 0 ? (
                data.recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {log.provider} ({log.model})
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {log.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{log.totalTokens}</td>
                    <td className="py-3 px-4 font-mono">{log.latencyMs} ms</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.groundingStatus === 'GROUNDED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.groundingStatus === 'PARTIALLY_GROUNDED'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.groundingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                    No telemetry events found.
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
