'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface SimulationItem {
  id: string;
  title: string;
  simulationCode: string;
  status: string;
  isStrictExamDay: boolean;
  questionsCount: number;
  durationMinutes: number;
}

interface AttemptItem {
  id: string;
  simulationId: string;
  title: string;
  status: string;
  isStrictExamDay: boolean;
  startedAt: string;
  submittedAt: string | null;
  totalDurationSeconds: number;
  result: {
    totalScore: number;
    accuracy: number;
    attempted: number;
    correct: number;
    incorrect: number;
  } | null;
}

export default function SimulationsListPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555]">Loading simulations...</p>
        </div>
      </div>
    }>
      <SimulationsListContent />
    </React.Suspense>
  );
}

function SimulationsListContent() {
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [simRes, attRes] = await Promise.all([
          fetch('/api/student/final-mile/simulation'),
          fetch('/api/student/simulations'),
        ]);
        const simJson = await simRes.json();
        const attJson = await attRes.json();

        if (simJson.success) setSimulations(simJson.simulations || []);
        if (attJson.success) setAttempts(attJson.attempts || []);
      } catch (e) {
        console.error('Error fetching simulations:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartSimulation = async (simId: string) => {
    try {
      const res = await fetch(`/api/student/final-mile/simulation/${simId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'student_demo', acknowledgeRules: true }),
      });
      const data = await res.json();
      if (data.success && data.attempt) {
        window.location.href = `/simulations/${data.attempt.id}`;
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppShell title="Full-Length Simulations" subtitle="NEET UG 200-Question Exam Mocks" streakDays={7} showBack={true} backHref="/tests">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#464555] text-xs font-headline font-semibold">Loading Exam Simulations...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Full-Length Simulations"
      subtitle="NEET UG 200-Question Exam Mocks"
      streakDays={7}
      showBack={true}
      backHref="/tests"
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Available Simulations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-[#141b2b]">Ready for Simulation</h2>
              <p className="text-xs text-[#464555]">Standard 200-Question NTA Timed Computer-Based Test Format</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-headline font-bold bg-[#e2dfff] text-[#3525cd]">
              Full 720 Marks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulations.length === 0 ? (
              <div className="col-span-2 p-8 rounded-2xl bg-white border border-[#e9edff] text-center text-[#777587] text-xs shadow-xs">
                No scheduled simulations pending. Click CBT Simulation in the sidebar to create a test.
              </div>
            ) : (
              simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e9edff] flex flex-col justify-between hover:border-[#3525cd]/40 transition shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-headline font-bold text-[#3525cd] bg-[#f1f3ff] px-2.5 py-0.5 rounded-full border border-[#e1e8fd]">
                        {sim.simulationCode}
                      </span>
                      {sim.isStrictExamDay && (
                        <span className="text-[10px] font-headline font-bold px-2.5 py-0.5 rounded-full bg-[#fff1f0] text-[#ba1a1a] border border-[#ffdad6]">
                          EXAM DAY LOCKDOWN
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-headline font-bold text-[#141b2b]">{sim.title}</h3>
                    <p className="text-xs text-[#464555] leading-relaxed">
                      Standard NEET pattern: 200 questions across Physics, Chemistry, Botany and Zoology (+4/-1 marking).
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#f1f3ff]">
                    <span className="text-xs font-headline font-semibold text-[#777587] flex items-center gap-1">
                      <StitchIcon name="timer" size={14} />
                      <span>{sim.durationMinutes} minutes</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartSimulation(sim.id)}
                      className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-headline font-bold bg-[#3525cd] hover:bg-[#2d1eb8] text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Simulation</span>
                      <StitchIcon name="arrow_forward" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Historical Attempts */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-headline font-bold text-[#141b2b]">Past Simulation Attempts</h2>
          <div className="space-y-2.5">
            {attempts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#e9edff] text-center text-[#777587] text-xs shadow-xs">
                No past simulation attempts recorded yet.
              </div>
            ) : (
              attempts.map((att) => (
                <div
                  key={att.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e9edff] flex items-center justify-between hover:border-[#3525cd]/30 transition shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-headline font-bold text-[#141b2b]">{att.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f3ff] font-headline font-bold text-[#464555]">
                        {att.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#777587]">
                      Started: {new Date(att.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {att.result && (
                      <div className="text-right">
                        <span className="text-sm font-headline font-bold text-[#006c49]">
                          {att.result.totalScore} / 720
                        </span>
                        <div className="text-[10px] text-[#777587]">
                          {att.result.accuracy}% Accuracy
                        </div>
                      </div>
                    )}
                    <Link
                      href={`/simulations/${att.id}`}
                      className="min-h-[40px] text-xs font-headline font-bold px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] border border-[#e1e8fd] transition flex items-center gap-1"
                    >
                      <span>View Analysis</span>
                      <StitchIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
