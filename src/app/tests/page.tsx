'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function TestsLibraryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [tests, setTests] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);

  // Generator form state
  const [genType, setGenType] = useState('FULL_MOCK');
  const [genSubject, setGenSubject] = useState('BIO');
  const [genCount, setGenCount] = useState(45);

  const fetchTests = (category: string) => {
    setLoading(true);
    fetch(`/api/tests?category=${category}`)
      .then((res) => res.json())
      .then((json) => {
        setTests(json.tests || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load tests:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTests(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    fetch('/api/tests/recommendations')
      .then((res) => res.json())
      .then((json) => {
        if (json.recommendedTest) {
          setRecommendation(json.recommendedTest);
        }
      })
      .catch((err) => console.error('Failed to load test recommendations:', err));
  }, []);

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: genType,
          subject: genSubject,
          count: genCount,
        }),
      });

      if (res.ok) {
        setShowGenModal(false);
        fetchTests(activeCategory);
      }
    } catch (err) {
      console.error('Failed to generate test:', err);
    } finally {
      setGenerating(false);
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Tests' },
    { key: 'FULL_MOCK', label: 'Full NEET Mocks' },
    { key: 'PYQ', label: 'NEET PYQ Tests' },
    { key: 'SUBJECT', label: 'Subject Tests' },
    { key: 'CHAPTER', label: 'Chapter Tests' },
    { key: 'WEAKNESS', label: 'Weakness Remediations' },
    { key: 'REVISION', label: 'Revision Tests' },
  ];

  return (
    <AppShell
      title="Exam Simulation Center"
      subtitle="NTA Standard Full-Length & Subject CBT Simulations"
      streakDays={7}
      showBack={true}
      backHref="/"
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/tests/history"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] hover:bg-[#e1e8fd] text-xs font-semibold transition-all"
          >
            <StitchIcon name="history" size={14} />
            <span>Test History</span>
          </Link>
          <Link
            href="/cbt"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e8fd] text-[#3525cd] hover:bg-[#d4defb] text-xs font-bold transition-all"
          >
            <StitchIcon name="quiz" size={14} />
            <span>Live CBT Mode</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-12">
        {/* Recommended Test Banner */}
        {recommendation && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e1e8fd] via-white to-[#f1f3ff] border border-[#d4defb] p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3525cd] text-white text-xs font-bold">
                  <StitchIcon name="auto_awesome" size={13} />
                  <span>AI Recommended for You</span>
                </div>
                <h2 className="text-lg sm:text-xl font-headline font-bold text-[#141b2b] tracking-tight">
                  {recommendation.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                  {recommendation.rationale}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#777587] pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <StitchIcon name="timer" size={14} className="text-[#3525cd]" /> {recommendation.durationMinutes} Minutes
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <StitchIcon name="quiz" size={14} className="text-[#3525cd]" /> {recommendation.totalQuestions} Questions
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <StitchIcon name="verified" size={14} className="text-[#006c49]" /> {recommendation.totalMarks} Marks
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/cbt?testId=${recommendation.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <span>Launch Recommended Simulation</span>
                  <StitchIcon name="arrow_forward" size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar & Filter Bar */}
        <div className="bg-white rounded-2xl p-3 border border-[#e9edff] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === c.key
                    ? 'bg-[#3525cd] text-white shadow-xs font-bold'
                    : 'bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] hover:bg-[#e1e8fd]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowGenModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#e1e8fd] hover:bg-[#d4defb] text-[#3525cd] text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <StitchIcon name="add" size={15} />
            <span>Generate Custom Test</span>
          </button>
        </div>

        {/* Test Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e9edff] p-16 flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#464555]">Loading verified NEET test simulations...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e9edff] p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center mx-auto">
              <StitchIcon name="quiz" size={24} />
            </div>
            <h3 className="text-base font-bold text-[#141b2b]">No Tests Available in this Category</h3>
            <p className="text-xs text-[#777587] max-w-md mx-auto">
              You can instantly generate a verified test using official NCERT concepts and NEET UG PYQs.
            </p>
            <button
              onClick={() => setShowGenModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <StitchIcon name="bolt" size={16} />
              <span>Generate Test Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tests.map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-2xl bg-white border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md p-5 space-y-4 shadow-xs transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#e1e8fd] text-[#3525cd]">
                      {t.testType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-[#777587] flex items-center gap-1 font-medium">
                      <StitchIcon name="timer" size={13} className="text-[#3525cd]" /> {t.durationMinutes}m
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#141b2b] tracking-tight line-clamp-2">
                    {t.title}
                  </h3>

                  <p className="text-xs text-[#777587] line-clamp-2 leading-relaxed">
                    {t.description || 'Full pattern NEET test calibrated against canonical NCERT concepts and verified PYQs.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#f1f3ff]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
                      <span className="block text-[10px] text-[#777587] uppercase font-semibold">Questions</span>
                      <span className="text-xs font-bold text-[#141b2b]">{t.totalQuestions}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
                      <span className="block text-[10px] text-[#777587] uppercase font-semibold">Max Marks</span>
                      <span className="text-xs font-bold text-[#006c49]">{t.totalMarks}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
                      <span className="block text-[10px] text-[#777587] uppercase font-semibold">Attempts</span>
                      <span className="text-xs font-bold text-[#3525cd]">{t.attemptsCount || 0}</span>
                    </div>
                  </div>

                  <Link
                    href={`/cbt?testId=${t.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#f1f3ff] hover:bg-[#3525cd] hover:text-white text-[#3525cd] text-xs font-bold transition-all shadow-2xs group-hover:bg-[#3525cd] group-hover:text-white"
                  >
                    <span>Launch Simulation</span>
                    <StitchIcon name="arrow_forward" size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e9edff] rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#141b2b] flex items-center gap-2">
                <StitchIcon name="auto_awesome" size={18} className="text-[#3525cd]" />
                <span>Generate NEET Test Simulation</span>
              </h3>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-[#777587] hover:text-[#141b2b] text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateTest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#141b2b]">Test Type</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-2 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                >
                  <option value="FULL_MOCK">Full NEET Mock (200 Qs / 720 Marks)</option>
                  <option value="SUBJECT_TEST">Subject Test</option>
                  <option value="PYQ_TEST">NEET PYQ Test</option>
                  <option value="WEAKNESS_TEST">Targeted Weakness Test</option>
                  <option value="REVISION_TEST">Spaced Revision Test</option>
                </select>
              </div>

              {genType === 'SUBJECT_TEST' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#141b2b]">Subject</label>
                  <select
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value)}
                    className="w-full bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-2 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  >
                    <option value="BIO">Biology (Botany + Zoology)</option>
                    <option value="PHY">Physics</option>
                    <option value="CHE">Chemistry</option>
                  </select>
                </div>
              )}

              {genType !== 'FULL_MOCK' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#141b2b]">Question Count</label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                    className="w-full bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-2 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  >
                    <option value={15}>15 Questions (Quick Test)</option>
                    <option value={30}>30 Questions (Focused)</option>
                    <option value={45}>45 Questions (Standard Subject)</option>
                    <option value={90}>90 Questions (Biology Section)</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777587] hover:bg-[#f1f3ff] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {generating ? 'Generating...' : 'Generate Simulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
