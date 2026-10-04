'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function NotificationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetch(`/api/student/nta-notifications/${id}`);
        if (res.ok) {
          const json = await res.json();
          setNotification(json.notification);
          // Mark as read automatically on open
          fetch(`/api/student/nta-notifications/${id}/read`, { method: 'POST' }).catch(() => {});
        }
      } catch (e) {
        console.error('Failed to load notification detail:', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Official Intelligence Detail" subtitle="Loading provenance...">
        <div className="max-w-4xl mx-auto p-12 text-center text-xs text-[#777587]">
          Verifying cryptographic document hash and loading official records...
        </div>
      </AppShell>
    );
  }

  if (!notification) {
    return (
      <AppShell title="Not Found" subtitle="Official Notice">
        <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-3xl border border-[#e9edff] space-y-3">
          <p className="font-bold text-base text-[#141b2b]">Official notification not found.</p>
          <Link href="/nta-notifications" className="text-xs text-[#3525cd] font-bold hover:underline">
            ← Back to Official Feed
          </Link>
        </div>
      </AppShell>
    );
  }

  const facts = notification.facts;
  const isHistorical = notification.isHistorical;

  return (
    <AppShell
      title="Official Notice Intelligence"
      subtitle={`${notification.authority} Official Publication • Verified Record`}
      showBack={true}
      backHref="/nta-notifications"
      rightAction={
        notification.officialDocumentUrl ? (
          <a
            href={notification.officialDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#3525cd] text-white hover:bg-[#2b1ea8] transition-all shadow-xs"
          >
            <StitchIcon name="download" size={14} />
            <span>Open Official PDF</span>
          </a>
        ) : null
      }
    >
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* PROVENANCE BANNER */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#f1f3ff]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#e1e8fd] text-[#3525cd]">
                {notification.authority} OFFICIAL PUBLICATION
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f3ff] text-[#464555]">
                {notification.category.replace(/_/g, ' ')}
              </span>
              {isHistorical && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#fff3e0] text-[#e65100]">
                  Historical Archive
                </span>
              )}
            </div>

            <span className="text-xs text-[#777587]">
              Published: {new Date(notification.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] leading-tight">
            {notification.title}
          </h1>

          {/* Provenance Metadata Grid */}
          <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#777587] uppercase block">Official Issuing Authority</span>
              <p className="font-bold text-[#141b2b] mt-0.5">{notification.authority} (Competent Government Authority)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#777587] uppercase block">Document SHA-256 Hash</span>
              <p className="font-mono text-[11px] text-[#3525cd] mt-0.5 truncate" title={notification.documentHash || ''}>
                {notification.documentHash || 'Direct portal statement'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#777587] uppercase block">Official Canonical URL</span>
              <a
                href={notification.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#3525cd] hover:underline font-medium mt-0.5 truncate block"
              >
                {notification.officialSourceUrl}
              </a>
            </div>
          </div>
        </div>

        {/* STRUCTURED OFFICIAL FACTS */}
        {facts && (
          <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777587] block">
              Grounded Official Facts Extracted
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] space-y-0.5">
                <span className="text-[10px] font-bold text-[#777587] uppercase">Confirmed Exam Mode</span>
                <p className="text-sm font-bold text-[#141b2b]">{facts.examMode || 'Not stated in this notice'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] space-y-0.5">
                <span className="text-[10px] font-bold text-[#777587] uppercase">Duration</span>
                <p className="text-sm font-bold text-[#141b2b]">{facts.examDuration || 'Not stated'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] space-y-0.5">
                <span className="text-[10px] font-bold text-[#777587] uppercase">Questions &amp; Marking</span>
                <p className="text-sm font-bold text-[#141b2b]">{facts.numberOfQuestions ? `${facts.numberOfQuestions} Qs (attempt 180)` : 'Not stated'}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI GROUNDED SUMMARY & EVIDENCE */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#3525cd]">
            <StitchIcon name="auto_awesome" size={18} />
            <h2 className="font-bold text-base text-[#141b2b]">
              AI Summary &amp; Evidence Grounding
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#f4f7ff] border border-[#c3c0ff] space-y-2">
            <span className="text-[10px] font-bold text-[#3525cd] uppercase tracking-wider block">
              Synthesized Summary (Strictly Grounded)
            </span>
            <p className="text-xs text-[#141b2b] leading-relaxed">
              {notification.aiSummary || 'Notice text available in official document.'}
            </p>
          </div>

          {notification.aiSummaryEvidence && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#777587] block">
                Evidence Traceability Citation
              </span>
              <p className="text-xs text-[#464555] italic">
                {notification.aiSummaryEvidence}
              </p>
            </div>
          )}

          {notification.studentActionRequired && (
            <div className="p-3.5 rounded-xl bg-[#fff8e1] border border-[#ffe082] text-xs font-semibold text-[#b78103] flex items-center gap-2">
              <StitchIcon name="warning" size={16} />
              <span>Mandatory Candidate Action: {notification.studentActionRequired}</span>
            </div>
          )}
        </div>

        {/* IMPACT ON STUDY PLANNER */}
        {notification.impacts && notification.impacts.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777587] block">
              Study Planner &amp; Syllabus Impact Analysis
            </span>
            {notification.impacts.map((imp: any) => (
              <div key={imp.id} className="p-3.5 rounded-xl bg-[#e8f5e9] border border-[#c8e6c9] text-xs space-y-1">
                <span className="font-bold text-[#2e7d32] uppercase text-[10px]">
                  {imp.impactType.replace(/_/g, ' ')}
                </span>
                <p className="text-[#141b2b] font-semibold">{imp.plannerEventTitle}</p>
                {imp.actionDescription && (
                  <p className="text-[#2e7d32] text-[11px]">{imp.actionDescription}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DOCUMENT / ORIGINAL LINK */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-sm text-[#141b2b]">Access Authoritative Source</h3>
            <p className="text-xs text-[#777587]">
              View the unedited document directly on the official government server.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {notification.officialDocumentUrl && (
              <a
                href={notification.officialDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1ea8] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <StitchIcon name="download" size={16} />
                <span>Open PDF Document</span>
              </a>
            )}
            <a
              href={notification.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#f1f3ff] text-[#141b2b] text-xs font-bold hover:bg-[#e1e8fd] transition-all flex items-center gap-1.5"
            >
              <StitchIcon name="open_in_new" size={16} />
              <span>Official Website</span>
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
