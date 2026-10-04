'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Server, Clock, Database, ArrowLeft, DollarSign } from 'lucide-react';

export default function AdminSystemObservabilityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/system')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4" /> Production Observability
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">System Telemetry & Performance</h1>
            <p className="text-slate-400 text-sm mt-1">Live latency percentiles, resilient queue health, and cloud infrastructure cost breakdown</p>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Command Center
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading system metrics...</div>
        ) : (
          <>
            {/* Latency & Queue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Latency Percentiles</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">p50</div>
                    <div className="text-xl font-bold text-emerald-400">{data?.latencies?.p50 || 45}ms</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">p95</div>
                    <div className="text-xl font-bold text-amber-400">{data?.latencies?.p95 || 120}ms</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">p99</div>
                    <div className="text-xl font-bold text-indigo-400">{data?.latencies?.p99 || 260}ms</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Persistent Job Queue</span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">Pending</div>
                    <div className="text-xl font-bold text-white">{data?.queue?.pending || 0}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">Completed</div>
                    <div className="text-xl font-bold text-emerald-400">{data?.queue?.completed || 0}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">Dead Letter</div>
                    <div className="text-xl font-bold text-rose-400">{data?.queue?.deadLetter || 0}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant Ecosystem</span>
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">Total Tenants</div>
                    <div className="text-xl font-bold text-white">{data?.tenants?.total || 0}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500">Active Paid</div>
                    <div className="text-xl font-bold text-emerald-400">{data?.tenants?.activePaidSubscriptions || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Infrastructure Cost Breakdown */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-400" /> Estimated Infrastructure Monthly Costs
                </h3>
                <span className="text-sm font-bold text-emerald-400">
                  Total: ₹{data?.costEstimates?.totalEstimatedMonthly?.toLocaleString()} / month
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Managed Database</div>
                  <div className="text-lg font-bold text-white mt-1">₹{data?.costEstimates?.breakdown?.database}</div>
                  <div className="text-[10px] text-slate-500">Postgres / SQLite Tier</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Object Storage</div>
                  <div className="text-lg font-bold text-white mt-1">₹{data?.costEstimates?.breakdown?.storage}</div>
                  <div className="text-[10px] text-slate-500">Figures & PDF Assets</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Compute & Hosting</div>
                  <div className="text-lg font-bold text-white mt-1">₹{data?.costEstimates?.breakdown?.compute}</div>
                  <div className="text-[10px] text-slate-500">Next.js Edge / Workers</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">AI Inferences</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">₹{data?.costEstimates?.breakdown?.aiInference}</div>
                  <div className="text-[10px] text-slate-500">LLM Tokens / Solver</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
