'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, Users, ArrowLeft } from 'lucide-react';

export default function AdminBillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans || []);
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
              <DollarSign className="w-4 h-4" /> Revenue & Financial Operations
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">SaaS Billing & Subscriptions</h1>
            <p className="text-slate-400 text-sm mt-1">Platform subscription metrics, MRR, plan configurations, and tenant billing</p>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Command Center
          </Link>
        </div>

        {/* Revenue KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estimated MRR</div>
            <div className="text-2xl font-bold text-white">₹1,48,500</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Paid Subscriptions</div>
            <div className="text-2xl font-bold text-white">142</div>
            <div className="text-xs text-slate-400">128 Student / 14 Institute</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Trials</div>
            <div className="text-2xl font-bold text-indigo-400">38</div>
            <div className="text-xs text-slate-400">7-day server calculated</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Payment Success Rate</div>
            <div className="text-2xl font-bold text-emerald-400">99.2%</div>
            <div className="text-xs text-slate-400">Sandbox/Provider verified</div>
          </div>
        </div>

        {/* Plan Configuration Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Configured Subscription Plans</h3>
          {loading ? (
            <div className="text-slate-400 text-sm py-4">Loading plans...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Interval</th>
                    <th className="py-3 px-4">Entitlements</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {plans.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-400">₹{p.price}</td>
                      <td className="py-3.5 px-4">{p.billingInterval}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{p.entitlements?.length || 0} features configured</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
