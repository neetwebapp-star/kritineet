'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, GraduationCap, ShieldCheck, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('COACHING');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => {
        setOrganizations(data.organizations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!orgName) return;
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, type: orgType }),
      });
      const data = await res.json();
      if (data.tenant) {
        setOrganizations([data.tenant, ...organizations]);
        setStep(5); // Show onboarding completion
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Building2 className="w-4 h-4" /> Multi-Tenant Operations
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Institutes & Organization Tenants</h1>
            <p className="text-slate-400 text-sm mt-1">Manage coaching institutes, schools, and institutional student cohorts</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              Command Center
            </Link>
            <button
              onClick={() => { setShowModal(true); setStep(1); }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Onboard Organization
            </button>
          </div>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No organizations onboarded yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-4">
              Click &quot;Onboard Organization&quot; to establish an isolated coaching institute or school tenant.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map(org => (
              <div
                key={org.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {org.type}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">{org.name}</h3>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">slug: {org.slug}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {org.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center">
                  <div>
                    <div className="text-xs text-slate-500">Students</div>
                    <div className="text-base font-bold text-slate-200">{org._count?.users || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Custom Tests</div>
                    <div className="text-base font-bold text-slate-200">{org._count?.customTests || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Assignments</div>
                    <div className="text-base font-bold text-slate-200">{org._count?.assignments || 0}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Plan: {org.plan?.name || '14-Day Trial'}</span>
                  <Link
                    href={`/admin/students?tenantId=${org.id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    View Cohort <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Onboarding Wizard Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" /> Organization Onboarding
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span className={step >= 1 ? 'text-indigo-400 font-semibold' : ''}>1. Organization</span>
                <span>→</span>
                <span className={step >= 2 ? 'text-indigo-400 font-semibold' : ''}>2. Profile</span>
                <span>→</span>
                <span className={step >= 3 ? 'text-indigo-400 font-semibold' : ''}>3. Exam Config</span>
                <span>→</span>
                <span className={step >= 4 ? 'text-emerald-400 font-semibold' : ''}>Ready</span>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Institute / School Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder="e.g. Apex NEET Academy"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Organization Type</label>
                    <select
                      value={orgType}
                      onChange={e => setOrgType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="COACHING">Coaching Institute</option>
                      <option value="SCHOOL">Senior Secondary School</option>
                      <option value="ORGANIZATION">Education Enterprise / Trust</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!orgName}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                  >
                    Continue to Profile Configuration
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">
                    Configure institutional parameters for <strong>{orgName}</strong>. Automatic trial grants access to 100 students and 5 mentors.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                    <div>✓ Dedicated isolated database tenant scope</div>
                    <div>✓ Custom Test authoring enabled</div>
                    <div>✓ Multi-mentor assignment workspaces</div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Back</button>
                    <button onClick={handleCreate} className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg">
                      Create & Initialize
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center space-y-4 py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Organization Ready!</h4>
                  <p className="text-slate-400 text-sm">
                    {orgName} is now established with an active 14-day Institute trial. You can now invite mentors and batch-enroll students.
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
