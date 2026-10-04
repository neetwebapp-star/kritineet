'use client';

import { StitchIcon } from '@/components/stitch/StitchIcon';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';

function CbtExaminationContent() {
  const searchParams = useSearchParams();
  const paramTestId = searchParams.get('testId');
  const paramAttemptId = searchParams.get('attemptId');

  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [attemptSession, setAttemptSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { selected: string | null; marked: boolean }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorecard, setScorecard] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'UNANSWERED'>('ALL');
  const [isRestoring, setIsRestoring] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'OFFLINE'>('IDLE');
  const [reminderSet, setReminderSet] = useState(false);

  // 1. Initial Load: Fetch tests & restore active attempt from localStorage or URL
  useEffect(() => {
    fetch('/api/cbt/tests')
      .then((res) => res.json())
      .then((json) => setTests(json.tests || []))
      .catch((err) => console.error('Failed to load tests:', err));

    if (paramAttemptId) {
      fetch(`/api/cbt/attempt/${paramAttemptId}/result`)
        .then((r) => r.json())
        .then((resData) => {
          if (!resData.error) {
            setScorecard(resData);
          }
        })
        .finally(() => setIsRestoring(false));
      return;
    }

    const activeAttemptId = typeof window !== 'undefined' ? localStorage.getItem('cbt_active_attempt_id') : null;
    if (activeAttemptId) {
      fetch(`/api/cbt/attempt/${activeAttemptId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Attempt not found or finished');
          return res.json();
        })
        .then((state) => {
          if (state.isSubmitted || state.status === 'SUBMITTED') {
            fetch(`/api/cbt/attempt/${activeAttemptId}/result`)
              .then((r) => r.json())
              .then((resData) => {
                if (!resData.error) {
                  setScorecard(resData);
                }
                localStorage.removeItem('cbt_active_attempt_id');
              });
          } else {
            setAttemptSession({
              attemptId: state.attemptId,
              test: state.test,
              questions: state.questions,
            });
            setCurrentIndex(state.activeQuestionIndex || 0);
            setTimeLeft(state.remainingSeconds || (state.test.durationMinutes || 60) * 60);

            const restoredResp: Record<string, { selected: string | null; marked: boolean }> = {};
            for (const q of state.questions) {
              const qid = String(q.questionId);
              restoredResp[qid] = {
                selected: state.answers[qid] || null,
                marked: (state.markedForReview || []).includes(qid),
              };
            }
            setResponses(restoredResp);
          }
        })
        .catch(() => {
          localStorage.removeItem('cbt_active_attempt_id');
        })
        .finally(() => {
          setIsRestoring(false);
        });
    } else {
      setIsRestoring(false);
      if (paramTestId) {
        handleStartExam(paramTestId);
      }
    }
  }, [paramTestId, paramAttemptId]);

  // 2. Start Exam
  const handleStartExam = async (testId: string) => {
    setSelectedTestId(testId);
    try {
      const res = await fetch('/api/cbt/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START', testId }),
      });
      const session = await res.json();
      setAttemptSession(session);
      setTimeLeft((session.test.durationMinutes || 60) * 60);
      setCurrentIndex(session.activeQuestionIndex || 0);

      localStorage.setItem('cbt_active_attempt_id', session.attemptId);

      const initialResp: Record<string, { selected: string | null; marked: boolean }> = {};
      for (const q of session.questions) {
        const qid = String(q.questionId);
        initialResp[qid] = {
          selected: session.answers?.[qid] || null,
          marked: (session.markedForReview || []).includes(qid),
        };
      }
      setResponses(initialResp);
    } catch (e) {
      console.error('Error starting exam:', e);
    }
  };

  // 3. Periodic Anti-loss Autosave
  const sendAutosave = (newResponses: typeof responses, activeIdx: number, remainingSecs: number) => {
    if (!attemptSession?.attemptId) return;

    const answers: Record<string, string> = {};
    const markedForReview: string[] = [];

    for (const [qid, r] of Object.entries(newResponses)) {
      if (r.selected) answers[qid] = r.selected;
      if (r.marked) markedForReview.push(qid);
    }

    setSaveStatus('SAVING');
    fetch('/api/cbt/attempt/autosave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: attemptSession.attemptId,
        activeQuestionIndex: activeIdx,
        remainingSeconds: remainingSecs,
        answers,
        markedForReview,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setSaveStatus('SAVED');
        } else {
          setSaveStatus('OFFLINE');
        }
      })
      .catch((err) => {
        console.warn('Autosave warning:', err);
        setSaveStatus('OFFLINE');
      });
  };

  // 4. Timer Countdown & Auto-Submit
  useEffect(() => {
    if (!attemptSession || scorecard) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attemptSession, scorecard]);

  // Periodic autosave every 25 seconds
  useEffect(() => {
    if (!attemptSession || scorecard) return;
    const saveInterval = setInterval(() => {
      sendAutosave(responses, currentIndex, timeLeft);
    }, 25000);
    return () => clearInterval(saveInterval);
  }, [attemptSession, scorecard, responses, currentIndex, timeLeft]);

  // Question navigation and answer helpers
  const questions = attemptSession?.questions || [];
  const currentQ = questions[currentIndex];
  const currentResp = currentQ ? responses[currentQ.questionId] || { selected: null, marked: false } : null;

  const handleSelectOption = (optLabel: string) => {
    if (!currentQ) return;
    const qid = String(currentQ.questionId);
    const newResponses = {
      ...responses,
      [qid]: { ...(responses[qid] || { selected: null, marked: false }), selected: optLabel },
    };
    setResponses(newResponses);
    sendAutosave(newResponses, currentIndex, timeLeft);
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    const qid = String(currentQ.questionId);
    const newResponses = {
      ...responses,
      [qid]: { ...(responses[qid] || { selected: null, marked: false }), selected: null },
    };
    setResponses(newResponses);
    sendAutosave(newResponses, currentIndex, timeLeft);
  };

  const handleToggleMarkReview = () => {
    if (!currentQ) return;
    const qid = String(currentQ.questionId);
    const newResponses = {
      ...responses,
      [qid]: {
        ...(responses[qid] || { selected: null, marked: false }),
        marked: !(responses[qid]?.marked ?? false),
      },
    };
    setResponses(newResponses);
    sendAutosave(newResponses, currentIndex, timeLeft);
  };

  const handleNavQuestion = (newIdx: number) => {
    setCurrentIndex(newIdx);
    sendAutosave(responses, newIdx, timeLeft);
    if (showMobilePalette) setShowMobilePalette(false);
  };

  const handleSubmitExam = async () => {
    if (!attemptSession || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      await sendAutosave(responses, currentIndex, timeLeft);

      const res = await fetch('/api/cbt/attempt/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attemptSession.attemptId }),
      });

      const analysis = await res.json();
      setScorecard(analysis);
      localStorage.removeItem('cbt_active_attempt_id');
    } catch (e) {
      console.error('Submit error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(responses).filter((r) => r.selected).length;

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#464555]">
          <StitchIcon name="refresh" size={20} className="animate-spin text-[#3525cd]" />
          <span>Restoring test session...</span>
        </div>
      </div>
    );
  }

  // Pre-Exam Selection Screen (Stitch Mock Test Center)
  if (!attemptSession) {
    return (
      <AppShell
        title="Kriti NEET"
        subtitle="CBT Simulator • Mock Test Center"
        showBack={true}
        backHref="/"
      >
        <div className="space-y-6">
          {/* Top Intro Section */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e9edff] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3525cd] text-xs font-bold">
                <StitchIcon name="timer" size={15} />
                <span>NTA CBT Simulator</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#464555]">
                <span className="w-2 h-2 rounded-full bg-[#006c49]" />
                <span>Negative Marking (-1) • Correct (+4)</span>
              </div>
            </div>
            <div>
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] tracking-tight">
                Mock Test Center
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] mt-1 leading-relaxed">
                Simulate real NTA CBT environment with timer, negative marking, question palette &amp; instant AI score breakdown.
              </p>
            </div>
          </section>

          {/* Live / Scheduled National Mock Card */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-[#ffdad6]/20 p-5 sm:p-6 shadow-xs border border-[#ffdad6]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
                  ALL INDIA LIVE MOCK #04
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#464555]">
                  <StitchIcon name="group" size={15} className="text-[#3525cd]" />
                  <strong className="text-[#141b2b]">24,810</strong> enrolled
                </span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-lg sm:text-xl text-[#141b2b]">
                  NEET UG 2027 All-India Grand Mock Test
                </h2>
                <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
                  Official NTA Pattern (Section A: 35 Qs, Section B: 15 Qs, 720 Marks total)
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f1f3ff] border border-[#e1e8fd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#141b2b] font-medium">
                  <StitchIcon name="calendar_today" size={16} className="text-[#3525cd]" />
                  <span>Sunday, 10:00 AM – 01:20 PM</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[#464555] font-mono text-[11px] border border-[#e9edff]">
                    200 Mins
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#006c49] font-medium">
                  <StitchIcon name="verified" size={15} />
                  <span>National Percentile &amp; AIR Predictor included</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setReminderSet(true)}
                  className={`w-full h-11 px-4 rounded-xl text-xs font-headline font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    reminderSet
                      ? 'bg-[#6cf8bb]/30 text-[#006c49] border-[#6cf8bb]'
                      : 'bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] border-[#e1e8fd]'
                  }`}
                >
                  <StitchIcon name={reminderSet ? 'check_circle' : 'notifications_active'} size={16} />
                  <span>{reminderSet ? 'Reminder Registered for Sunday 10:00 AM' : 'Set Reminder'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tests.length > 0) {
                      handleStartExam(tests[0].id);
                    }
                  }}
                  disabled={tests.length === 0}
                  className="w-full h-11 px-4 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-xs font-headline font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <StitchIcon name="how_to_reg" size={16} />
                  <span>{tests.length > 0 ? 'Start Live Mock Test' : 'Loading Tests...'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Full Syllabus Mock Test Series List (2 Columns on Desktop) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline font-bold text-lg text-[#141b2b]">
                  Available Mock Test Series
                </h2>
                <p className="text-xs text-[#464555]">
                  Standard 720-mark national curriculum simulation
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#3525cd] font-semibold">
                <StitchIcon name="tune" size={16} />
                <span>NTA Filtered</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tests.length > 0 ? (
                tests.map((t, idx) => (
                  <div
                    key={t.id}
                    className="rounded-2xl bg-white p-5 shadow-xs border border-[#e9edff] flex flex-col justify-between gap-3 hover:border-[#c3c0ff] transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline font-bold text-base text-[#141b2b]">
                          {t.title}
                        </h3>
                        {idx === 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#6cf8bb]/40 text-[#00714d] text-[10px] font-bold">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#464555] line-clamp-2">
                        {t.description || 'Full-length balanced mock according to latest NTA 2027 syllabus.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#f1f3ff] text-[11px] text-[#464555]">
                          720 Marks
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#f1f3ff] text-[11px] text-[#464555]">
                          {t.durationMinutes || 200} Mins
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#f1f3ff] text-[11px] text-[#464555]">
                          NTA Pattern
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#e2dfff] text-[#3525cd] text-[11px] font-semibold">
                          High Yield
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#f1f3ff]">
                      <Link
                        href="/cbt/results"
                        className="text-xs text-[#3525cd] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <StitchIcon name="insights" size={14} />
                        <span>Sample Scorecard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleStartExam(t.id)}
                        className="h-10 px-4 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-headline font-bold flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>Start Test</span>
                        <StitchIcon name="arrow_forward" size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#777587] col-span-2 bg-white rounded-2xl border border-[#e9edff]">
                  Loading examination blueprints...
                </div>
              )}
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  // Post-Test Detailed Analytics & Scorecard Screen
  if (scorecard) {
    const results = scorecard.results || [];
    const filteredResults = results.filter((r: any) => {
      if (reviewFilter === 'CORRECT') return r.isCorrect;
      if (reviewFilter === 'INCORRECT') return !r.isCorrect && Boolean(r.selectedOption);
      if (reviewFilter === 'UNANSWERED') return !r.selectedOption;
      return true;
    });

    return (
      <AppShell
        title="Kriti NEET"
        subtitle="CBT Scorecard & Diagnostics"
        showBack={true}
        backHref="/cbt"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 bg-white p-6 rounded-2xl border border-[#e9edff] shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center mx-auto">
              <StitchIcon name="verified" size={24} />
            </div>
            <h1 className="font-headline font-bold text-2xl text-[#141b2b]">
              NEET UG Exam Performance Report
            </h1>
            <p className="text-xs text-[#464555]">
              Strict Scoring • NTA Accurate Post-Test Evaluation
            </p>
          </div>

          {/* Key Overall Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs">
              <span className="font-headline font-bold text-3xl text-[#006c49]">
                {scorecard.totalScore}
              </span>
              <p className="text-xs text-[#464555] mt-1 font-medium">
                Total Marks / {scorecard.maxScore || 720}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs">
              <span className="font-headline font-bold text-3xl text-[#3525cd]">
                {scorecard.accuracy}%
              </span>
              <p className="text-xs text-[#464555] mt-1 font-medium">Accuracy</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs">
              <span className="font-headline font-bold text-3xl text-[#141b2b]">
                {scorecard.rankProjection || 'AIR 450'}
              </span>
              <p className="text-xs text-[#464555] mt-1 font-medium">Projected AIR</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#e9edff] shadow-xs">
              <span className="font-headline font-bold text-3xl text-[#ba1a1a]">
                {scorecard.negativeMarks || 0}
              </span>
              <p className="text-xs text-[#464555] mt-1 font-medium">Negative Marks (-1)</p>
            </div>
          </div>

          {/* Question Breakdown with Filter */}
          <section className="bg-white p-6 rounded-2xl border border-[#e9edff] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f1f3ff] pb-3">
              <span className="font-headline font-bold text-sm text-[#141b2b] uppercase tracking-wide">
                Question Review ({filteredResults.length} / {results.length})
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {(['ALL', 'CORRECT', 'INCORRECT', 'UNANSWERED'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setReviewFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg transition-all font-headline font-semibold cursor-pointer ${
                      reviewFilter === filter
                        ? 'bg-[#3525cd] text-white shadow-xs'
                        : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e1e8fd]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {filteredResults.map((r: any, idx: number) => (
                <div
                  key={r.questionId || idx}
                  className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#141b2b]">
                      Q.{idx + 1} {r.chapterTitle ? `• ${r.chapterTitle}` : ''}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold ${
                        r.isCorrect
                          ? 'bg-[#6cf8bb]/40 text-[#00714d]'
                          : r.selectedOption
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : 'bg-[#f1f3ff] text-[#777587]'
                      }`}
                    >
                      {r.marksAwarded > 0 ? `+${r.marksAwarded}` : r.marksAwarded} Marks
                    </span>
                  </div>

                  <p className="text-xs text-[#141b2b] leading-relaxed">
                    {r.questionText || 'Question statement'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#464555] pt-1">
                    <span>
                      Your Choice:{' '}
                      <strong className={r.isCorrect ? 'text-[#006c49]' : 'text-[#ba1a1a]'}>
                        {r.selectedOption || 'Not Attempted'}
                      </strong>
                    </span>
                    <span>
                      Correct Answer:{' '}
                      <strong className="text-[#006c49]">{r.correctOption}</strong>
                    </span>
                  </div>

                  {r.explanation && (
                    <p className="text-xs text-[#464555] bg-white p-3 rounded-lg border border-[#e9edff] leading-relaxed">
                      <strong className="text-[#141b2b]">Explanation: </strong>
                      {r.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 text-center rounded-xl bg-white hover:bg-[#f1f3ff] text-[#141b2b] font-headline font-semibold text-xs border border-[#e9edff] transition-all shadow-xs"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/error-book"
              className="flex-1 py-3 text-center rounded-xl bg-[#ffdad6]/40 hover:bg-[#ffdad6]/60 text-[#ba1a1a] border border-[#ffdad6] font-headline font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <StitchIcon name="psychology" size={16} />
              <span>Reattempt in Error Book</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setScorecard(null);
                setAttemptSession(null);
                setSelectedTestId(null);
              }}
              className="flex-1 py-3 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white font-headline font-bold text-xs transition-all cursor-pointer shadow-xs"
            >
              Take Another Exam
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Active Live CBT Exam Interface (Dedicated Exam Environment - Stitch Design)
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col select-none overflow-x-hidden">
      {/* Top Header: Exam Title, Timer, Submit, and Mobile Palette Trigger */}
      <header className="border-b border-[#e9edff] bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center flex-shrink-0">
            <StitchIcon name="quiz" size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xs sm:text-sm font-headline font-bold text-[#141b2b] truncate">
              {attemptSession.test.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-[#006c49] font-bold">
                +4 / -1 Marking
              </span>
              <span className="text-[#c7c4d8] hidden sm:inline">•</span>
              {saveStatus === 'SAVING' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#3525cd] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd] animate-ping" />
                  Saving...
                </span>
              )}
              {saveStatus === 'SAVED' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#006c49] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
                  Saved
                </span>
              )}
              {saveStatus === 'OFFLINE' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#ba1a1a] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse" />
                  Offline (Retrying...)
                </span>
              )}
              {saveStatus === 'IDLE' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#777587] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#777587]" />
                  Autosave Ready
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-colors ${
              timeLeft < 600
                ? 'bg-[#fff1f0] border-[#ffdad6] text-[#ba1a1a] animate-pulse'
                : 'bg-[#f1f3ff] border-[#e9edff] text-[#3525cd]'
            }`}
          >
            <StitchIcon name="timer" size={16} />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* Mobile Palette Button (< 1024px) */}
          <button
            type="button"
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-xs font-headline font-bold border border-[#e9edff] cursor-pointer"
          >
            <StitchIcon name="layers" size={14} />
            <span>{answeredCount}/{questions.length}</span>
          </button>

          {/* Submit Exam Button */}
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-headline font-bold text-xs transition cursor-pointer active:scale-95 shadow-xs"
          >
            <StitchIcon name="send" size={14} />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Main Examination Grid (Desktop Split / Mobile Full Width) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Question Panel (Left: Cols 1-8 on lg, 1-9 on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-60px)] flex flex-col justify-between">
          <div className="space-y-5 max-w-3xl">
            {/* Question Info Ribbon */}
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-sm text-[#3525cd]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] text-[11px] font-headline font-semibold">
                  {currentQ?.section || 'Section A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#777587] font-mono">
                <span className="text-[#006c49] font-bold">+4</span> / <span className="text-[#ba1a1a] font-bold">-1</span>
                <span>• QID: {currentQ?.questionId}</span>
              </div>
            </div>

            {/* Question Statement Card */}
            <div className="bg-white border border-[#e9edff] rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="text-sm sm:text-base text-[#141b2b] font-medium leading-relaxed break-words font-sans">
                {currentQ?.text}
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQ?.options?.map((opt: any) => {
                const isSelected = currentResp?.selected === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(opt.label)}
                    className={`w-full text-left flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#eef2ff] border-2 border-[#3525cd] text-[#3525cd] font-semibold shadow-xs'
                        : 'bg-white border-[#e9edff] text-[#141b2b] hover:border-[#3525cd]/40 shadow-xs'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-headline font-bold text-xs flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-[#3525cd] text-white' : 'bg-[#f1f3ff] text-[#464555]'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="flex-1 break-words leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop/Tablet Bottom Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#e9edff] max-w-3xl mt-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMarkReview}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-headline font-semibold border transition cursor-pointer ${
                  currentResp?.marked
                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-xs'
                    : 'bg-white text-[#8b5cf6] border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/10'
                }`}
              >
                {currentResp?.marked ? 'Marked for Review' : 'Mark for Review'}
              </button>
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!currentResp?.selected}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] disabled:opacity-40 text-xs font-headline font-semibold text-[#464555] border border-[#e9edff] cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => currentIndex > 0 && handleNavQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#f1f3ff] disabled:opacity-40 text-xs font-headline font-semibold text-[#464555] border border-[#e9edff] cursor-pointer"
              >
                <StitchIcon name="chevron_left" size={16} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => currentIndex < questions.length - 1 && handleNavQuestion(currentIndex + 1)}
                className="min-h-[44px] flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <span>Save &amp; Next</span>
                <StitchIcon name="chevron_right" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Desktop (Right: Cols 9-12 on lg, 10-12 on xl) */}
        <div className="hidden lg:flex col-span-4 xl:col-span-3 border-l border-[#e9edff] bg-white p-5 xl:p-6 flex-col justify-between overflow-y-auto max-h-[calc(100vh-60px)]">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#777587]">
                Question Palette ({questions.length})
              </h3>
              <span className="text-xs text-[#006c49] font-headline font-bold">
                {answeredCount} Answered
              </span>
            </div>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-4 xl:grid-cols-5 gap-2">
              {questions.map((q: any, idx: number) => {
                const resp = responses[q.questionId];
                const isCurrent = currentIndex === idx;
                const isAnswered = Boolean(resp?.selected);
                const isMarked = Boolean(resp?.marked);

                let btnClass = 'bg-[#f1f3ff] text-[#464555] border-[#e9edff] hover:bg-[#e9edff]';
                if (isAnswered && isMarked) {
                  btnClass = 'bg-[#8b5cf6] text-white border-[#8b5cf6]';
                } else if (isMarked) {
                  btnClass = 'bg-[#f59e0b] text-white border-[#f59e0b] font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-[#006c49] text-white border-[#006c49] font-bold';
                }

                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => handleNavQuestion(idx)}
                    className={`h-9 rounded-xl font-headline font-bold text-xs border transition cursor-pointer ${btnClass} ${
                      isCurrent ? 'ring-2 ring-[#3525cd] ring-offset-2 scale-105 z-10' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Color Status Legend */}
            <div className="pt-4 border-t border-[#f1f3ff] space-y-2 text-[11px] text-[#464555]">
              <span className="font-headline font-bold text-[#141b2b] block mb-1">Status Legend:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#006c49]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#f1f3ff] border border-[#e9edff]" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#f59e0b]" />
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#8b5cf6]" />
                  <span>Ans + Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Palette Bottom Sheet / Drawer (< 1024px) */}
      {showMobilePalette && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#141b2b]/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white border-t border-[#e9edff] rounded-t-3xl p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f3ff]">
              <h3 className="text-sm font-headline font-bold text-[#141b2b]">
                Question Palette ({answeredCount}/{questions.length} Attempted)
              </h3>
              <button
                type="button"
                onClick={() => setShowMobilePalette(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#464555] flex items-center justify-center cursor-pointer"
              >
                <StitchIcon name="close" size={16} />
              </button>
            </div>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q: any, idx: number) => {
                const resp = responses[q.questionId];
                const isCurrent = currentIndex === idx;
                const isAnswered = Boolean(resp?.selected);
                const isMarked = Boolean(resp?.marked);

                let btnClass = 'bg-[#f1f3ff] text-[#464555] border-[#e9edff]';
                if (isAnswered && isMarked) {
                  btnClass = 'bg-[#8b5cf6] text-white border-[#8b5cf6]';
                } else if (isMarked) {
                  btnClass = 'bg-[#f59e0b] text-white border-[#f59e0b] font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-[#006c49] text-white border-[#006c49] font-bold';
                }

                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => handleNavQuestion(idx)}
                    className={`h-11 rounded-xl font-headline font-bold text-xs border transition active:scale-95 ${btnClass} ${
                      isCurrent ? 'ring-2 ring-[#3525cd] ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f1f3ff] text-xs text-[#464555]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#006c49]" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#f1f3ff] border border-[#e9edff]" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#f59e0b]" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#8b5cf6]" />
                <span>Answered &amp; Marked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#141b2b]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-[#e9edff] space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff1f0] text-[#ba1a1a] flex items-center justify-center flex-shrink-0">
                <StitchIcon name="warning" size={20} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#141b2b]">Confirm Exam Submission?</h3>
                <p className="text-xs text-[#464555]">
                  You have answered {answeredCount} of {questions.length} questions.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 py-1">
              <div className="p-2.5 rounded-xl bg-[#e6f7ef] border border-[#6cf8bb] text-center">
                <span className="text-[10px] uppercase font-headline font-bold text-[#006c49] block">Answered</span>
                <span className="text-base font-headline font-bold text-[#002113] mt-0.5 block">{answeredCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-center">
                <span className="text-[10px] uppercase font-headline font-bold text-[#777587] block">Unanswered</span>
                <span className="text-base font-headline font-bold text-[#141b2b] mt-0.5 block">{questions.length - answeredCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] text-center">
                <span className="text-[10px] uppercase font-headline font-bold text-[#8b5cf6] block">Review</span>
                <span className="text-base font-headline font-bold text-[#6d28d9] mt-0.5 block">
                  {Object.values(responses).filter((r) => r.marked).length}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#464555] leading-relaxed">
              Are you sure you want to end your exam attempt? Responses will be submitted for immediate server evaluation and weakness detection.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-xs font-headline font-semibold text-[#464555] cursor-pointer"
              >
                Resume Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-headline font-bold text-xs cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CbtExaminationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#464555]">Loading Exam Engine...</p>
          </div>
        </div>
      }
    >
      <CbtExaminationContent />
    </Suspense>
  );
}
