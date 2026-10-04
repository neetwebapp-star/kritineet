'use client';

import React, { useState, useEffect } from 'react';

export default function AdminLearningIntelligenceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/learning-intelligence');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load admin learning intelligence', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Admin Learning Research Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Longitudinal research intelligence, cohort distributions, intervention tracking, and educational experimentation.
          </p>
        </div>
        <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-full font-mono">
          Research Framework: Empirical
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-mono">Loading learning intelligence metrics...</div>
      ) : (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-mono">Tracked Students</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">
                {data?.metrics?.totalTrackedStudents || 0}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-mono">Active Interventions</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {data?.metrics?.totalInterventions || 0}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-mono">Measured Outcomes</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {data?.metrics?.completedOutcomes || 0}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-mono">Quarantined Telemetry</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {data?.metrics?.quarantinedQualityEvents || 0}
              </div>
            </div>
          </div>

          {/* Research Invariant Callout */}
          <div className="p-4 bg-slate-900 border border-emerald-900/60 rounded-xl text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-emerald-400 uppercase tracking-wide">
              Scientific Research Integrity Guardrail
            </div>
            <p className="text-slate-400">
              The platform strictly differentiates observed correlations from causal claims.
              Interventions are recorded descriptively across multi-horizon outcomes without asserting unverified causal impact.
            </p>
          </div>

          {/* Recent Longitudinal Snapshots */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-200">Recent Immutable Snapshots</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2">Snapshot ID</th>
                    <th className="pb-2">Student ID</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data?.recentSnapshots?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">
                        No snapshots captured yet.
                      </td>
                    </tr>
                  ) : (
                    data?.recentSnapshots?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-slate-300">{s.id.slice(0, 14)}...</td>
                        <td className="py-2.5 text-slate-400">{s.studentId.slice(0, 14)}...</td>
                        <td className="py-2.5 text-emerald-400">{s.snapshotType}</td>
                        <td className="py-2.5 text-slate-500">{new Date(s.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
