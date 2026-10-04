'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check, Sparkles, ArrowLeft, Heart } from 'lucide-react';

export default function BillingPortalPage() {
  const freeEntitlements = [
    { name: 'Full NEET CBT Mock Test Series', desc: 'Unlimited full-length and subject-wise CBT mock tests with percentile analytics.' },
    { name: 'Grounded AI Tutor & Socratic Dialogue', desc: 'Unlimited Socratic concept breakdowns, NCERT citations, and doubt resolution.' },
    { name: 'Zero-Mistake Error Book & Leitner SRS', desc: 'Automatic mistake tracking, error classification, and 4–5 day spaced repetition cycles.' },
    { name: 'Complete 36-Year PYQ Vault', desc: 'Chapter-wise, topic-wise, and year-wise NEET past papers with detailed video/text solutions.' },
    { name: 'MTG Fingertips Question Bank', desc: 'Every line of NCERT converted into high-yield MCQs, assertion-reason, and matching drills.' },
    { name: 'Audio Mnemonics & Cognitive Memory Palace', desc: 'Multi-sensory recall accelerators for high-difficulty organic and biology taxonomies.' },
    { name: 'Parent & Mentor Supervision Portal', desc: 'Transparent syllabus tracking, homework audit, and progress synchronization.' },
    { name: 'Daily Study OS & Adaptive Planner', desc: 'Personalized daily schedule, priority buckets, and streak accountability.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" /> Open Access Education
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">100% Free Educational Platform</h1>
            <p className="text-slate-400 text-sm mt-1">
              Kriti NEET is committed to free, uncompromised medical preparation for every student.
            </p>
          </div>
          <Link
            href="/practice"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Learning
          </Link>
        </div>

        {/* Hero Free Guarantee Banner */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Zero Subscription Fees Forever
          </div>
          <h2 className="text-2xl font-bold text-white">All Premium Features Are Fully Unlocked</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            We believe high-quality medical entrance education is a fundamental right. There are no paid tiers, no subscription plans, no paywalls, and no hidden charges anywhere in Kriti NEET.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/practice"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Start Practicing Free
            </Link>
            <Link
              href="/cbt"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm rounded-xl transition"
            >
              Take a CBT Mock Test
            </Link>
          </div>
        </div>

        {/* Free Features Matrix */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" /> Everything Included at Zero Cost
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeEntitlements.map((feat, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{feat.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
