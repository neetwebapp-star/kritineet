'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface UpdateItem {
  id: string;
  title: string;
  publicationDate: string;
  sourceName: string;
  sourceUrl: string;
  sourceHierarchy: string;
  updateType: string;
  impactLevel: string;
  impactSummary: string | null;
  verificationStatus: string;
  edition?: { title: string; editionYear: number };
}

export default function ExamUpdatesPage() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/exam/updates')
      .then((res) => res.json())
      .then((data) => {
        setUpdates(data.updates || []);
        setMessage(data.message || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell
      title="Exam Gazette & Updates"
      subtitle="Authoritative Regulatory Feed • NTA & NMC"
      streakDays={7}
      showBack={true}
      backHref="/planner"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border border-[#e9edff] bg-white p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-headline font-bold uppercase tracking-wider bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb] rounded-full">
                Official Sources Only
              </span>
              <span className="text-xs text-[#777587]">• Anti-Speculation Policy Enforced</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-[#141b2b]">NEET UG Exam Update Center</h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
              Authoritative notifications published directly by National Testing Agency (NTA) and NMC.
            </p>
          </div>
          <Link
            href="/exam/countdown"
            className="min-h-[44px] px-4 py-2 text-xs font-headline font-bold bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] border border-[#e1e8fd] rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <span>Exam Countdown</span>
            <StitchIcon name="arrow_forward" size={14} />
          </Link>
        </div>

        {/* Source Hierarchy Advisory */}
        <div className="p-4 bg-[#f9f9ff] border border-[#e9edff] rounded-2xl flex items-start gap-3 shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3525cd] mt-1 shrink-0" />
          <div className="text-xs text-[#464555] leading-relaxed">
            <strong className="text-[#141b2b] font-headline font-bold">Authoritative Source Policy:</strong> This center strictly reflects verified official gazettes and portals (nta.ac.in, nmc.org.in). Social media rumors, unverified coaching leaks, and speculative calendar projections are systematically excluded.
          </div>
        </div>

        {/* Updates List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555] font-headline font-semibold">Loading verified exam updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#e9edff] rounded-2xl p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f7ef] text-[#006c49] flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              ✓
            </div>
            <h3 className="text-base font-headline font-bold text-[#141b2b]">{message || 'Official information not yet published.'}</h3>
            <p className="text-xs text-[#777587] mt-1 max-w-md mx-auto">
              The regulatory bodies have not yet released notices for this examination cycle. Check back periodically for verified releases.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((up) => {
              const impactColor =
                up.impactLevel === 'HIGH'
                  ? 'bg-[#fff1f0] text-[#ba1a1a] border-[#ffdad6]'
                  : up.impactLevel === 'MEDIUM'
                  ? 'bg-[#fff8e1] text-[#b45309] border-[#fde68a]'
                  : 'bg-[#e2dfff] text-[#3525cd] border-[#c3c0ff]';

              return (
                <div
                  key={up.id}
                  className="p-5 sm:p-6 bg-white border border-[#e9edff] rounded-2xl hover:border-[#3525cd]/30 transition space-y-3 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-headline font-bold uppercase tracking-wider bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb] rounded-full">
                        Verified Official
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-headline font-bold rounded-full border ${impactColor}`}>
                        {up.impactLevel} Impact
                      </span>
                      <span className="text-xs text-[#777587]">{up.updateType.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-[#777587]">
                      Published: {new Date(up.publicationDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-headline font-bold text-[#141b2b]">{up.title}</h3>

                  {up.impactSummary && (
                    <p className="text-xs sm:text-sm text-[#464555] leading-relaxed bg-[#f9f9ff] p-3.5 rounded-xl border border-[#e9edff]">
                      {up.impactSummary}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#f1f3ff] text-xs text-[#777587]">
                    <div>
                      Source: <span className="text-[#141b2b] font-medium">{up.sourceName}</span>
                    </div>
                    <a
                      href={up.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline font-headline font-bold flex items-center gap-1"
                    >
                      <span>View Official Source</span>
                      <StitchIcon name="open_in_new" size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
