'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { NumericalScaffold } from '@/components/stitch/NumericalScaffold';

interface Question {
  id: string;
  stem: string;
  options: { key: string; label: string; sub: string }[];
  correctOption?: string;
  explanation?: string;
  ncertRef: string;
  difficulty?: string;
  sourceBadge?: string;
  concept?: string | null;
  chapterTitle?: string;
}

export default function DppPracticePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [qId: string]: string }>({});
  const [confidenceRatings, setConfidenceRatings] = useState<{ [qId: string]: 'GUESS' | '50_50' | 'FAIRLY_CONFIDENT' | 'CERTAIN' }>({});
  const [markedQuestions, setMarkedQuestions] = useState<{ [qId: string]: boolean }>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showNcertHint, setShowNcertHint] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins

  useEffect(() => {
    fetch('/api/dpp/session?limit=15')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load DPP questions:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentQIndex];
  const selectedKey = currentQ ? selectedOptions[currentQ.id] : undefined;

  const handleSelectOption = (key: string) => {
    if (!currentQ) return;
    setSelectedOptions((prev) => ({ ...prev, [currentQ.id]: key }));
  };

  const handleMarkReview = () => {
    if (!currentQ) return;
    setMarkedQuestions((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleClear = () => {
    if (!currentQ) return;
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleSaveAndNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setShowNcertHint(false);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handleSubmitDpp = async () => {
    setSubmitting(true);
    try {
      const responsesPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selectedOptions[q.id] || null,
        confidence: confidenceRatings[q.id] || 'FAIRLY_CONFIDENT',
        timeSpent: 45,
      }));

      const res = await fetch('/api/dpp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responsesPayload,
          timeSpentSeconds: 1500 - timeLeft,
          dppTitle: 'DPP Challenger Sprint',
        }),
      });

      const data = await res.json();
      setSubmissionResult(data.summary);
      setShowSubmitModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(selectedOptions).length;
  const markedCount = Object.values(markedQuestions).filter(Boolean).length;

  if (loading) {
    return (
      <AppShell title="DPP Challenger" subtitle="Loading live questions...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#464555]">Assembling verified NCERT & MTG questions...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (submissionResult) {
    return (
      <AppShell title="DPP Results" subtitle="Attempt summary & mastery impact">
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-6">
          <div className="bg-white rounded-3xl p-8 border border-[#e9edff] shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#e6f7ef] text-[#006c49] flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="font-headline font-bold text-2xl text-[#141b2b]">
              DPP Session Completed!
            </h2>
            <p className="text-xs text-[#777587] max-w-md mx-auto">
              Your responses have updated your concept mastery scores, and any missed items are now in your Spaced Revision queue.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <span className="text-[10px] font-bold uppercase text-[#777587] block">Score</span>
                <span className="text-xl font-bold text-[#3525cd]">{submissionResult.score} / {submissionResult.maxScore}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <span className="text-[10px] font-bold uppercase text-[#006c49] block">Correct</span>
                <span className="text-xl font-bold text-[#006c49]">{submissionResult.correctCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <span className="text-[10px] font-bold uppercase text-[#ba1a1a] block">Incorrect</span>
                <span className="text-xl font-bold text-[#ba1a1a]">{submissionResult.incorrectCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <span className="text-[10px] font-bold uppercase text-[#777587] block">Accuracy</span>
                <span className="text-xl font-bold text-[#141b2b]">{submissionResult.accuracy}%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-6">
              <Link
                href="/error-book"
                className="px-5 py-3 rounded-xl bg-white border border-[#e9edff] text-xs font-bold text-[#141b2b] hover:bg-[#f1f3ff] transition-all"
              >
                Review in Error Book
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition-all shadow-xs"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell title="DPP Challenger" subtitle="Topic Questions">
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <p className="text-sm text-[#777587]">No verified questions currently available for this selection.</p>
          <Link href="/ncert" className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold">
            Explore NCERT Library
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`DPP: ${currentQ.chapterTitle || 'NEET Target Session'}`}
      subtitle={`${questions.length} Questions • +4 / -1 • Real NCERT`}
      showBack={true}
      backHref="/dashboard"
      rightAction={
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e9edff] rounded-xl shadow-xs">
            <StitchIcon name="timer" size={16} className="text-[#006c49]" />
            <span className="font-mono font-bold text-xs text-[#141b2b]">
              {formatTimer(timeLeft)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#e9edff] text-[#141b2b]"
          >
            <StitchIcon name="grid_view" size={18} />
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e9edff] shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-[#e1e8fd] text-[#3525cd] font-headline font-bold text-xs">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  {currentQ.sourceBadge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] text-[10px] font-bold">
                      {currentQ.sourceBadge}
                    </span>
                  )}
                  {currentQ.difficulty && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#6cf8bb]/20 text-[#006c49]">
                      {currentQ.difficulty}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleMarkReview}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    markedQuestions[currentQ.id]
                      ? 'bg-[#3525cd] text-white shadow-xs'
                      : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e9edff]'
                  }`}
                >
                  <StitchIcon name="bookmark" size={14} />
                  <span>{markedQuestions[currentQ.id] ? 'Marked' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Stem */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg font-medium text-[#141b2b] leading-relaxed">
                  {currentQ.stem}
                </p>

                {currentQ.concept && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f9f9ff] border border-[#e9edff] text-xs text-[#777587]">
                    <StitchIcon name="psychology" size={14} className="text-[#3525cd]" />
                    <span>Concept: {currentQ.concept}</span>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedKey === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3525cd] bg-[#eef0ff] ring-2 ring-[#3525cd]/20 shadow-xs'
                          : 'border-[#e9edff] bg-white hover:bg-[#f9f9ff]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-headline font-bold text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#3525cd] text-white'
                              : 'bg-[#f1f3ff] text-[#464555]'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm font-medium text-[#141b2b]">
                          {opt.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#3525cd] text-white flex items-center justify-center">
                          <StitchIcon name="check" size={13} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Confidence Calibration Selector */}
              {selectedKey && (
                <div className="p-3.5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-2 animate-fadeIn">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587] block">
                    How confident are you in this answer? (Metacognitive Calibration)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'GUESS', label: 'Guess (🎲)', desc: 'Low certainty' },
                      { key: '50_50', label: '50/50 (⚖️)', desc: 'Eliminated 2' },
                      { key: 'FAIRLY_CONFIDENT', label: 'Confident (🎯)', desc: 'Recall strong' },
                      { key: 'CERTAIN', label: '100% Certain (⭐)', desc: 'Definite' },
                    ].map((conf) => {
                      const isConfActive = (confidenceRatings[currentQ.id] || 'FAIRLY_CONFIDENT') === conf.key;
                      return (
                        <button
                          key={conf.key}
                          type="button"
                          onClick={() => setConfidenceRatings((prev) => ({ ...prev, [currentQ.id]: conf.key as any }))}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                            isConfActive
                              ? 'bg-[#e1e8fd] border-[#3525cd] text-[#3525cd] font-bold shadow-2xs'
                              : 'bg-white border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff]'
                          }`}
                        >
                          <div className="text-xs">{conf.label}</div>
                          <div className="text-[10px] text-[#777587] mt-0.5">{conf.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowNcertHint(!showNcertHint)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#3525cd] hover:underline cursor-pointer"
                >
                  <StitchIcon name="lightbulb" size={14} />
                  <span>{showNcertHint ? 'Hide NCERT Source Anchor' : 'Show NCERT Source Anchor'}</span>
                </button>
                {showNcertHint && (
                  <div className="mt-2 p-3.5 rounded-xl bg-[#fff8e1] border border-[#ffe082] text-xs text-[#8d6e63] animate-fadeIn">
                    <span className="font-bold text-[#5d4037]">NCERT Anchor: </span>
                    {currentQ.ncertRef}
                  </div>
                )}
                <NumericalScaffold
                  questionText={currentQ.stem}
                  subjectCode="PHYSICS"
                  explanation={currentQ.explanation}
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f1f3ff]">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!selectedKey}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777587] hover:text-[#ba1a1a] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2.5 rounded-xl border border-[#e9edff] bg-white text-xs font-bold text-[#464555] hover:bg-[#f1f3ff] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentQIndex === questions.length - 1 ? 'Finish & Submit' : 'Save & Next'}</span>
                    <StitchIcon name="arrow_forward" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Palette Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f3ff]">
                <h3 className="font-headline font-bold text-sm text-[#141b2b]">
                  Question Palette
                </h3>
                <span className="text-xs text-[#777587]">
                  {answeredCount} / {questions.length} answered
                </span>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(selectedOptions[q.id]);
                  const isMarked = Boolean(markedQuestions[q.id]);
                  const isCurrent = currentQIndex === idx;

                  let bgClass = 'bg-[#f1f3ff] text-[#464555] border-[#e9edff]';
                  if (isCurrent) {
                    bgClass = 'ring-2 ring-[#3525cd] bg-[#3525cd] text-white font-bold';
                  } else if (isMarked) {
                    bgClass = 'bg-[#4f46e5] text-white';
                  } else if (isAnswered) {
                    bgClass = 'bg-[#006c49] text-white';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentQIndex(idx);
                        setShowNcertHint(false);
                      }}
                      className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#f1f3ff] text-[11px] text-[#777587]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
                  <span>Review ({markedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f1f3ff] border border-[#e9edff]" />
                  <span>Unanswered ({questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-[#3525cd]" />
                  <span>Current</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 rounded-2xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Submit Practice Session</span>
                <StitchIcon name="check_circle" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-[#e9edff]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center shrink-0">
                  <StitchIcon name="quiz" size={24} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    Submit DPP Session?
                  </h3>
                  <p className="text-xs text-[#777587]">
                    You have completed {answeredCount} of {questions.length} questions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] text-xs text-[#464555] leading-relaxed">
                Submitting will record your attempts in your preparation profile, recalculate your concept mastery, and update your Spaced Repetition queue.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#f1f3ff] transition-all cursor-pointer"
                >
                  Keep Practicing
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDpp}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? 'Evaluating...' : 'Yes, Submit DPP'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
