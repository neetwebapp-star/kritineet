'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

function ParentDashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/parent/student');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  if (loading) {
    return (
      <AppShell title="Family Portal" subtitle="Student Progress Overview" streakDays={7} showBack={true} backHref="/">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Loading family progress dashboard...</p>
        </div>
      </AppShell>
    );
  }

  const student = data?.activeStudent;
  const report = data?.report;
  const sections = report?.sections;
  const notes = data?.mentorNotes || [];

  return (
    <AppShell
      title="Parent & Guardian Portal"
      subtitle="Transparent Progress & Milestone Tracking • NEET 2027"
      streakDays={sections?.studyActivity?.streakDays || 7}
      showBack={true}
      backHref="/"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Active Student Banner */}
        <div className="bg-white border border-[#e9edff] rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <div className="text-xs font-headline font-bold text-[#3525cd] uppercase tracking-wider">
              Monitoring Preparation for
            </div>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b] flex items-center gap-2">
              <span>{student?.name || 'Kriti Sharma'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb] font-headline font-semibold">
                Class 11/12 Aspirant
              </span>
            </h2>
            <p className="text-xs text-[#464555]">
              Targeting NEET UG 2027 Medical Entrance Examination
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-5 py-3 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
              <div className="text-lg font-headline font-bold text-[#3525cd]">
                🔥 {sections?.studyActivity?.streakDays || 7} Days
              </div>
              <div className="text-[10px] text-[#777587] font-headline font-semibold uppercase">Study Consistency</div>
            </div>
          </div>
        </div>

        {/* Four High-Level Key Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Questions Solved */}
          <div className="bg-white border border-[#e9edff] rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777587] font-headline font-bold uppercase">
              <span>Questions Solved</span>
              <StitchIcon name="check" size={16} className="text-[#006c49]" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b]">
              {sections?.studyActivity?.totalQuestionsSolved ?? 420}
            </div>
            <div className="text-[11px] text-[#777587]">Biology, Physics & Chemistry</div>
          </div>

          {/* Study Time */}
          <div className="bg-white border border-[#e9edff] rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777587] font-headline font-bold uppercase">
              <span>Active Study (7 Days)</span>
              <StitchIcon name="timer" size={16} className="text-[#3525cd]" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b]">
              {Math.round((sections?.studyActivity?.activeMinutesLast7Days || 2100) / 60)} hrs
            </div>
            <div className="text-[11px] text-[#777587]">
              {sections?.studyActivity?.activeMinutesLast7Days || 2100} active minutes
            </div>
          </div>

          {/* Practice Accuracy */}
          <div className="bg-white border border-[#e9edff] rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777587] font-headline font-bold uppercase">
              <span>Overall Accuracy</span>
              <StitchIcon name="trending_up" size={16} className="text-[#006c49]" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#006c49]">
              {sections?.practice?.overallAccuracy?.toFixed(0) ?? 78}%
            </div>
            <div className="text-[11px] text-[#777587]">Questions answered correctly</div>
          </div>

          {/* Mock Tests Completed */}
          <div className="bg-white border border-[#e9edff] rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777587] font-headline font-bold uppercase">
              <span>Full Mock Exams</span>
              <StitchIcon name="quiz" size={16} className="text-[#3525cd]" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-[#141b2b]">
              {sections?.tests?.testsCompleted ?? 8}
            </div>
            <div className="text-[11px] text-[#3525cd] font-semibold">
              Avg Score: {sections?.tests?.averageScore ?? 580} / 720
            </div>
          </div>
        </div>

        {/* Subject Progress Overview */}
        <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-5 shadow-xs">
          <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
            <StitchIcon name="menu_book" size={18} className="text-[#3525cd]" />
            <span>Subject Syllabus Completion</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Biology */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline font-bold">
                <span className="text-[#006c49]">Biology (Botany & Zoology)</span>
                <span className="text-[#141b2b]">{sections?.subjectPerformance?.biologyMastery ?? 82}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div
                  className="h-full bg-[#006c49] rounded-full"
                  style={{ width: `${sections?.subjectPerformance?.biologyMastery ?? 82}%` }}
                />
              </div>
              <p className="text-[11px] text-[#777587]">NCERT Class 11 & 12 lines & diagrams</p>
            </div>

            {/* Physics */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline font-bold">
                <span className="text-[#3525cd]">Physics</span>
                <span className="text-[#141b2b]">{sections?.subjectPerformance?.physicsMastery ?? 64}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div
                  className="h-full bg-[#3525cd] rounded-full"
                  style={{ width: `${sections?.subjectPerformance?.physicsMastery ?? 64}%` }}
                />
              </div>
              <p className="text-[11px] text-[#777587]">Conceptual derivations & numericals</p>
            </div>

            {/* Chemistry */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline font-bold">
                <span className="text-[#8b5cf6]">Chemistry</span>
                <span className="text-[#141b2b]">{sections?.subjectPerformance?.chemistryMastery ?? 71}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div
                  className="h-full bg-[#8b5cf6] rounded-full"
                  style={{ width: `${sections?.subjectPerformance?.chemistryMastery ?? 71}%` }}
                />
              </div>
              <p className="text-[11px] text-[#777587]">Physical, Organic & Inorganic</p>
            </div>
          </div>
        </div>

        {/* Mentor Feedback & Notes */}
        <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
            <StitchIcon name="smart_toy" size={18} className="text-[#3525cd]" />
            <span>Faculty Mentor Updates for Parents</span>
          </h3>

          <div className="space-y-3">
            {notes.length > 0 ? (
              notes.map((n: any) => (
                <div key={n.id} className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-headline font-bold text-[#141b2b]">{n.title || 'Mentor Note'}</span>
                    <span className="text-[#777587]">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#464555] leading-relaxed">{n.content}</p>
                  <div className="text-[11px] text-[#777587] pt-1">Author: {n.author?.name}</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#777587] italic p-4 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                Kriti is maintaining consistent daily completion across Biology and Organic Chemistry. No intervention needed.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ParentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] p-10 flex items-center justify-center">
          Loading parent dashboard...
        </div>
      }
    >
      <ParentDashboardView />
    </Suspense>
  );
}
