'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function PrivacySettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/account/settings')
      .then(res => res.json())
      .then(res => {
        setData(res.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="Privacy & Permissions"
      subtitle="Data Visibility, Parent Access & Stakeholders"
      streakDays={7}
      showBack={true}
      backHref="/settings"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#e9edff]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-headline font-bold bg-[#e2dfff] text-[#3525cd]">
              Student Privacy
            </span>
            <span className="text-xs text-[#464555]">DPDP Act 2023 & NTA FERPA Standard</span>
          </div>
          <Link
            href="/settings"
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-headline font-bold bg-white text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff] transition-all flex items-center gap-1.5"
          >
            <StitchIcon name="arrow_back" size={16} />
            <span>Back to Settings</span>
          </Link>
        </div>

        {/* Visibility Policy Overview */}
        <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
              <StitchIcon name="visibility" size={18} className="text-[#3525cd]" />
              <span>Platform Parent & Mentor Visibility Policy</span>
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Transparent demarcation between student private learning workspaces and authorized guardian summaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#e6f7ef] border border-[#6cf8bb] rounded-xl space-y-2">
              <div className="font-headline font-bold text-[#006c49] flex items-center gap-1.5">
                <StitchIcon name="check" size={16} className="text-[#006c49]" />
                <span>Authorized Viewers Can See:</span>
              </div>
              <ul className="space-y-1.5 text-[#00714d] list-disc list-inside">
                <li>Syllabus completion percentage</li>
                <li>Overall subject mastery scores</li>
                <li>Study streak and homework completion</li>
                <li>Mock test scores and CBT averages</li>
              </ul>
            </div>

            <div className="p-4 bg-[#fff1f0] border border-[#ffdad6] rounded-xl space-y-2">
              <div className="font-headline font-bold text-[#ba1a1a] flex items-center gap-1.5">
                <StitchIcon name="lock" size={16} className="text-[#ba1a1a]" />
                <span>Strictly Redacted (Private to Student):</span>
              </div>
              <ul className="space-y-1.5 text-[#ba1a1a] list-disc list-inside">
                <li>Private AI Tutor conversations & questions</li>
                <li>Mentor diagnostic internal notes</li>
                <li>Raw login telemetry, IP addresses & devices</li>
                <li>Confidential error-by-error mistake logs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Authorized Stakeholders */}
        <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
              <StitchIcon name="group" size={18} className="text-[#3525cd]" />
              <span>Linked Family & Mentors</span>
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Guardians and educators authorized to track your milestone progress.
            </p>
          </div>

          {loading ? (
            <div className="text-[#464555] text-sm py-4">Loading relationships...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] mb-2">
                  Linked Parents ({data?.authorizedParents?.length || 0})
                </div>
                {data?.authorizedParents?.length === 0 ? (
                  <div className="text-xs text-[#777587] italic p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    No parent accounts currently linked.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.authorizedParents?.map((p: any) => (
                      <div key={p.id} className="p-3.5 bg-[#f9f9ff] border border-[#e9edff] rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-headline font-bold text-[#141b2b]">{p.name} ({p.type})</div>
                          <div className="text-[#777587]">{p.email}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb]">
                          ACTIVE
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#f1f3ff]">
                <div className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587] mb-2">
                  Assigned Mentors ({data?.authorizedMentors?.length || 0})
                </div>
                {data?.authorizedMentors?.length === 0 ? (
                  <div className="text-xs text-[#777587] italic p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                    No mentors assigned yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.authorizedMentors?.map((m: any) => (
                      <div key={m.id} className="p-3.5 bg-[#f9f9ff] border border-[#e9edff] rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-headline font-bold text-[#141b2b]">{m.name}</div>
                          <div className="text-[#777587]">{m.email}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e2dfff] text-[#3525cd] border border-[#3525cd]/20">
                          ASSIGNED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
