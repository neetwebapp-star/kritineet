'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function SimulationDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555] font-headline font-semibold">Loading simulation...</p>
          </div>
        </div>
      }
    >
      <SimulationDetailContent />
    </React.Suspense>
  );
}

function SimulationDetailContent() {
  const params = useParams();
  const id = params?.id as string;

  const [attempt, setAttempt] = useState<any>(null);
  const [timeAnalysis, setTimeAnalysis] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [attRes, timeRes, planRes] = await Promise.all([
          fetch(`/api/student/simulations/${id}`),
          fetch(`/api/student/simulations/${id}/time-analysis`),
          fetch(`/api/student/simulations/${id}/action-plan`),
        ]);
        const attJson = await attRes.json();
        const timeJson = await timeRes.json();
        const planJson = await planRes.json();

        if (attJson.success) setAttempt(attJson.attempt);
        if (timeJson.success) setTimeAnalysis(timeJson);
        if (planJson.success) setActionPlan(planJson.actionPlan);
      } catch (e) {
        console.error('Failed to load simulation detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmitSimulation = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/simulations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT', userId: 'student_demo' }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Simulation Intelligence" subtitle="Analysis & Action Plan" streakDays={7} showBack={true} backHref="/simulations">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#464555] text-xs font-headline font-semibold">Loading Simulation Intelligence...</span>
        </div>
      </AppShell>
    );
  }

  if (!attempt) {
    return (
      <AppShell title="Simulation Detail" subtitle="Not Found" streakDays={7} showBack={true} backHref="/simulations">
        <div className="bg-white border border-[#ffdad6] rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-xs mt-10">
          <span className="text-[#ba1a1a] text-sm font-headline font-bold">Simulation attempt not found.</span>
        </div>
      </AppShell>
    );
  }

  const result = attempt.result;
  const isCompleted = attempt.status === 'SUBMITTED' || attempt.status === 'ANALYZED' || attempt.status === 'REVIEWED';

  return (
    <AppShell
      title={attempt.simulation?.title || 'Simulation Analysis'}
      subtitle="Full-Length Simulation Diagnostics & Action Horizons"
      streakDays={7}
      showBack={true}
      backHref="/simulations"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Breadcrumb Card */}
        <div className="bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#3525cd] bg-[#e2dfff] px-2.5 py-0.5 rounded-full">
              {attempt.status}
            </span>
            <span className="text-xs text-[#777587]">NEET UG 200 Questions Mock</span>
          </div>
          <Link
            href="/simulations"
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-xs font-headline font-bold text-[#3525cd] transition flex items-center gap-1 border border-[#e1e8fd]"
          >
            <StitchIcon name="arrow_back" size={14} />
            <span>All Simulations</span>
          </Link>
        </div>

        {/* Active Simulation In-Progress Controls */}
        {!isCompleted && (
          <div className="bg-[#fff8e1] border border-[#fde68a] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <h2 className="text-base font-headline font-bold text-[#b45309]">Simulation In Progress</h2>
              <p className="text-xs text-[#777587] mt-1">
                Server authoritative timer active. Refreshing or reopening will restore your state safely.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmitSimulation}
              disabled={submitting}
              className="min-h-[44px] px-6 py-2.5 rounded-xl font-headline font-bold text-xs bg-[#3525cd] hover:bg-[#2d1eb8] text-white transition shadow-xs cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit & Analyze'}
            </button>
          </div>
        )}

        {/* Results Overview (If Completed) */}
        {isCompleted && result && (
          <section className="bg-white border border-[#e9edff] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-4">
              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#777587]">
                  Simulation Outcome
                </span>
                <div className="text-3xl font-headline font-bold text-[#141b2b] mt-1">
                  {result.totalScore} <span className="text-xs text-[#777587] font-normal">/ 720 Marks</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#777587] uppercase font-headline font-bold">Overall Accuracy</span>
                <div className="text-2xl font-headline font-bold text-[#006c49]">{result.accuracy}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff]">
                <span className="text-[11px] text-[#777587] uppercase font-headline font-bold">Attempted</span>
                <div className="text-xl font-headline font-bold text-[#141b2b] mt-1">{result.totalAttempted}</div>
              </div>
              <div className="bg-[#e6f7ef] p-4 rounded-xl border border-[#6cf8bb]">
                <span className="text-[11px] text-[#006c49] uppercase font-headline font-bold">Correct (+4)</span>
                <div className="text-xl font-headline font-bold text-[#006c49] mt-1">
                  {result.totalCorrect} (+{result.positiveMarks})
                </div>
              </div>
              <div className="bg-[#fff1f0] p-4 rounded-xl border border-[#ffdad6]">
                <span className="text-[11px] text-[#ba1a1a] uppercase font-headline font-bold">Incorrect (-1)</span>
                <div className="text-xl font-headline font-bold text-[#ba1a1a] mt-1">
                  {result.totalIncorrect} (-{result.negativeMarks})
                </div>
              </div>
              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff]">
                <span className="text-[11px] text-[#777587] uppercase font-headline font-bold">Unanswered</span>
                <div className="text-xl font-headline font-bold text-[#777587] mt-1">{result.totalUnanswered}</div>
              </div>
            </div>
          </section>
        )}

        {/* Time Pressure & Behavioral Analytics */}
        {timeAnalysis && (
          <section className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587]">
              Time Pressure &amp; Pacing Observations
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e9edff]">
                <span className="text-[10px] text-[#777587] uppercase font-headline font-semibold">Median Time</span>
                <div className="text-lg font-headline font-bold text-[#141b2b]">
                  {timeAnalysis.timeMetrics.medianTimePerQuestion.toFixed(0)}s
                </div>
              </div>
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e9edff]">
                <span className="text-[10px] text-[#777587] uppercase font-headline font-semibold">P25 (Fast)</span>
                <div className="text-lg font-headline font-bold text-[#006c49]">
                  {timeAnalysis.timeMetrics.p25Time.toFixed(0)}s
                </div>
              </div>
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e9edff]">
                <span className="text-[10px] text-[#777587] uppercase font-headline font-semibold">P75 (Standard)</span>
                <div className="text-lg font-headline font-bold text-[#3525cd]">
                  {timeAnalysis.timeMetrics.p75Time.toFixed(0)}s
                </div>
              </div>
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e9edff]">
                <span className="text-[10px] text-[#777587] uppercase font-headline font-semibold">P90 (Hard)</span>
                <div className="text-lg font-headline font-bold text-[#ba1a1a]">
                  {timeAnalysis.timeMetrics.p90Time.toFixed(0)}s
                </div>
              </div>
            </div>

            {timeAnalysis.timePressure?.descriptiveObservations?.length > 0 ? (
              <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] space-y-1.5">
                <span className="text-xs font-headline font-bold text-[#141b2b]">Empirical Observations:</span>
                {timeAnalysis.timePressure.descriptiveObservations.map((obs: string, idx: number) => (
                  <p key={idx} className="text-xs text-[#464555]">
                    &bull; {obs}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#464555]">
                Pacing remained consistent across all sections without observed rapid guessing or excessive slowdowns.
              </p>
            )}

            {timeAnalysis.answerChanges && (
              <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <span className="text-[#464555]">
                  Answer Changes: <strong className="text-[#141b2b]">{timeAnalysis.answerChanges.totalChanged}</strong> answers changed
                  (Gain: +{timeAnalysis.answerChanges.changedToCorrect}, Loss: -{timeAnalysis.answerChanges.changedToIncorrect})
                </span>
                <span className="font-headline font-bold text-[#006c49]">
                  Net Impact: {timeAnalysis.answerChanges.netMarkGain >= 0 ? '+' : ''}{timeAnalysis.answerChanges.netMarkGain} marks
                </span>
              </div>
            )}
          </section>
        )}

        {/* 4-Horizon Action Plan */}
        {actionPlan && (
          <section className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587]">
              4-Horizon Post-Simulation Action Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff] space-y-2">
                <span className="text-xs font-headline font-bold text-[#ba1a1a] uppercase tracking-wide">
                  Immediate (Next 2-4 Hours)
                </span>
                {actionPlan.immediateActions.map((act: any, i: number) => (
                  <div key={i} className="text-xs text-[#464555] border-b border-[#f1f3ff] pb-1.5">
                    <strong className="text-[#141b2b]">{act.title}</strong>: {act.description}
                  </div>
                ))}
              </div>

              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff] space-y-2">
                <span className="text-xs font-headline font-bold text-[#b45309] uppercase tracking-wide">
                  Next 24 Hours
                </span>
                {actionPlan.next24Hours.map((act: any, i: number) => (
                  <div key={i} className="text-xs text-[#464555] border-b border-[#f1f3ff] pb-1.5">
                    <strong className="text-[#141b2b]">{act.title}</strong>: {act.description}
                  </div>
                ))}
              </div>

              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff] space-y-2">
                <span className="text-xs font-headline font-bold text-[#3525cd] uppercase tracking-wide">
                  Next 3 Days
                </span>
                {actionPlan.next3Days.map((act: any, i: number) => (
                  <div key={i} className="text-xs text-[#464555] border-b border-[#f1f3ff] pb-1.5">
                    <strong className="text-[#141b2b]">{act.title}</strong>: {act.description}
                  </div>
                ))}
              </div>

              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff] space-y-2">
                <span className="text-xs font-headline font-bold text-[#006c49] uppercase tracking-wide">
                  Next 7 Days
                </span>
                {actionPlan.next7Days.map((act: any, i: number) => (
                  <div key={i} className="text-xs text-[#464555] border-b border-[#f1f3ff] pb-1.5">
                    <strong className="text-[#141b2b]">{act.title}</strong>: {act.description}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
