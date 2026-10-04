'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function AdminNtaNotificationsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [healthRes, adminRes] = await Promise.all([
        fetch('/api/health/official-sources'),
        fetch('/api/admin/nta-notifications'),
      ]);

      if (healthRes.ok) {
        const hJson = await healthRes.json();
        setSources(hJson.sources || []);
      }

      if (adminRes.ok) {
        const aJson = await adminRes.json();
        setNotifications(aJson.notifications || []);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualCheck = async () => {
    try {
      setChecking(true);
      setCheckResult(null);
      const res = await fetch('/api/admin/nta-notifications/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) {
        setCheckResult(`Successfully checked all 3 official sources at ${new Date().toLocaleTimeString()}`);
        loadData();
      } else {
        setCheckResult(`Check failed: ${json.error}`);
      }
    } catch (e: any) {
      setCheckResult(`Network error: ${e.message}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <AppShell
      title="Admin Source Health & Ingestion Center"
      subtitle="Government Source Monitors • Live Verification Console"
      showBack={true}
      backHref="/nta-notifications"
    >
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Source Health Cards */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-lg text-[#141b2b]">
                Official Government Source Registry
              </h2>
              <p className="text-xs text-[#777587]">
                Tier 1 Official Portals with SHA-256 integrity verification and domain allowlist enforcement
              </p>
            </div>

            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                checking
                  ? 'bg-[#e1e8fd] text-[#3525cd] cursor-not-allowed'
                  : 'bg-[#3525cd] text-white hover:bg-[#2b1ea8]'
              }`}
            >
              <StitchIcon name="refresh" size={16} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Checking Official Portals...' : 'Verify Sources Now'}</span>
            </button>
          </div>

          {checkResult && (
            <div className="p-3 bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] rounded-xl text-xs font-bold">
              ✓ {checkResult}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sources.map((s) => (
              <div
                key={s.code}
                className="p-5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#141b2b]">{s.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.status === 'HEALTHY' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#ffebee] text-[#c62828]'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-[#777587]">
                    <strong>Authority:</strong> {s.authority}
                  </p>
                  <p className="text-[#777587] truncate">
                    <strong>URL:</strong> {s.websiteUrl}
                  </p>
                  <p className="text-[#777587]">
                    <strong>Latency:</strong> {s.latestLatencyMs}ms (HTTP {s.latestHttpStatus})
                  </p>
                  <p className="text-[#777587]">
                    <strong>Last checked:</strong> {s.lastCheckedAt ? new Date(s.lastCheckedAt).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingested Notifications Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#141b2b]">
              Ingested Official Records ({notifications.length})
            </h3>
            <span className="text-xs text-[#006c49] font-bold">100% Provenance Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e9edff] text-[#777587] font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Authority</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Published</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f3ff]">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-[#f9f9ff]">
                    <td className="py-3 px-3 font-bold text-[#3525cd]">{n.authority}</td>
                    <td className="py-3 px-3 font-semibold text-[#141b2b] max-w-sm truncate">
                      <Link href={`/nta-notifications/${n.id}`} className="hover:underline">
                        {n.title}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-[#464555]">{n.category}</td>
                    <td className="py-3 px-3 font-mono">{n.examYear || 'General'}</td>
                    <td className="py-3 px-3 text-[#777587]">
                      {new Date(n.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#2e7d32] font-bold text-[10px]">
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
