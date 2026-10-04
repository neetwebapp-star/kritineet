'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  ArrowLeft,
  BookOpen,
  Activity,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Award
} from 'lucide-react';

export default function StudentReportClient({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/student/${studentId}`);
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
    fetchReport();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 p-10 flex items-center justify-center font-sans">
        Compiling comprehensive 10-section student progress report...
      </div>
    );
  }

  const report = data?.report;
  const student = report?.student;
  const sections = report?.sections;
  const period = data?.periodComparison;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 space-y-10 font-sans max-w-5xl mx-auto">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-400" />
            Comprehensive Student Preparation Progress Report
          </h1>
          <p className="text-xs text-slate-400">
            Official evaluation covering 10 analytical dimensions for NEET UG 2027
          </p>
        </div>

        <a
          href={`/api/reports/student/${studentId}?format=csv`}
          download
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
        >
          <Download className="w-4 h-4" /> Download Official CSV Report
        </a>
      </header>

      {/* Student Profile Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xl font-bold text-white">{student?.name}</div>
          <div className="text-xs text-slate-400">{student?.email}</div>
          <div className="text-xs text-indigo-400 font-semibold mt-1">Target Exam: NEET UG {student?.targetYear}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-orange-400">🔥 {student?.streakDays || 1} Days Active Streak</div>
          <div className="text-[11px] text-slate-500">Report Generated: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Period Comparison Card (Current 7d vs Previous 7d) */}
      {period && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Period-over-Period Performance Trajectory (Last 7 Days vs Previous 7 Days)</span>
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              period.delta?.isImproving ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {period.delta?.isImproving ? 'ACCELERATING' : 'CONSISTENT'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 mb-1">Questions Solved</div>
              <div className="text-lg font-bold text-white">
                {period.currentPeriod?.questionsAttempted} Qs
                <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
                  (prev: {period.previousPeriod?.questionsAttempted})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 mb-1">Accuracy Trend</div>
              <div className="text-lg font-bold text-emerald-400">
                {period.currentPeriod?.accuracy}%
                <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
                  ({period.delta?.accuracyDelta >= 0 ? '+' : ''}{period.delta?.accuracyDelta}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 mb-1">Pacing Velocity</div>
              <div className="text-lg font-bold text-indigo-400">
                {period.delta?.questions >= 0 ? `+${period.delta.questions}` : period.delta?.questions} Qs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10 Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Study Activity */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Study Activity</h4>
          <div className="text-2xl font-bold text-white">{sections?.studyActivity?.totalQuestionsSolved} Questions Solved</div>
          <div className="text-xs text-slate-400">
            {sections?.studyActivity?.activeMinutesLast7Days} active learning minutes recorded over the last 7 days.
          </div>
        </div>

        {/* Section 2: Subject Performance */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Subject Mastery</h4>
          <div className="text-2xl font-bold text-white">{sections?.subjectPerformance?.overallMastery}% Overall</div>
          <div className="text-xs text-slate-400">
            Bio: {sections?.subjectPerformance?.biologyMastery}% • Phy: {sections?.subjectPerformance?.physicsMastery}% • Chem: {sections?.subjectPerformance?.chemistryMastery}%
          </div>
        </div>

        {/* Section 3: Practice Accuracy */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Practice Accuracy</h4>
          <div className="text-2xl font-bold text-emerald-400">{sections?.practice?.overallAccuracy?.toFixed(1)}%</div>
          <div className="text-xs text-slate-400">Across all single-correct, assertion-reason, and matching MCQs.</div>
        </div>

        {/* Section 4: PYQs Coverage */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. PYQ Coverage</h4>
          <div className="text-2xl font-bold text-cyan-400">{sections?.pyqs?.pyqCoverageRate}%</div>
          <div className="text-xs text-slate-400">Authentic NTA NEET PYQ papers (2010–2024).</div>
        </div>

        {/* Section 5: Revision Status */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">5. Spaced Revision (SM-2)</h4>
          <div className="text-2xl font-bold text-amber-400">{sections?.revision?.dueToday} Due Today</div>
          <div className="text-xs text-slate-400">
            {sections?.revision?.mastered} concepts at long-term retention interval.
          </div>
        </div>

        {/* Section 6: Tests & CBT */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">6. CBT Mock Exams</h4>
          <div className="text-2xl font-bold text-purple-400">{sections?.tests?.testsCompleted} Completed</div>
          <div className="text-xs text-slate-400">
            Average Score: {sections?.tests?.averageScore} / 720
          </div>
        </div>

        {/* Section 7: Mistakes */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">7. Error Book</h4>
          <div className="text-2xl font-bold text-rose-400">{sections?.mistakes?.unresolvedCount} Unresolved</div>
          <div className="text-xs text-slate-400">
            Flagged for concept review and targeted re-attempts.
          </div>
        </div>

        {/* Section 8: Assignments */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">8. Assigned Study Plans</h4>
          <div className="text-2xl font-bold text-white">
            {sections?.assignments?.completed} / {sections?.assignments?.totalAssigned}
          </div>
          <div className="text-xs text-slate-400">{sections?.assignments?.pending} pending tasks from faculty mentor.</div>
        </div>
      </div>

      {/* Section 9 & 10: Recommended Actions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>9 & 10. Data-Driven Pedagogical Action Plan</span>
        </h4>
        <div className="space-y-2">
          {sections?.recommendedActions && sections.recommendedActions.length > 0 ? (
            sections.recommendedActions.map((act: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{act}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Continue with daily adaptive practice and scheduled revisions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
