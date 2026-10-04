'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface RetestQuestion {
  id: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctOption: string;
  explanation: string;
  difficulty: string;
  sourceType: string;
  mistakeContext?: {
    mistakeCount: number;
    mistakeType: string;
    lastAnswer: string;
  };
  primaryConcept?: {
    id: string;
    name: string;
    definition: string | null;
  };
  chapter?: {
    title: string;
    subject?: { name: string };
  };
}

export default function ErrorQuarantineRetestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<RetestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch('/api/student/retry-mistakes?limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load retry mistakes:', err);
        setLoading(false);
      });
  }, []);

  const currentQ = questions[currentIndex];

  const handleVerify = async () => {
    if (!selectedOption || !currentQ || hasEvaluated) return;

    const correct = selectedOption.toUpperCase() === currentQ.correctOption.toUpperCase();
    setIsCorrect(correct);
    setHasEvaluated(true);

    if (correct) {
      setScoreCount((prev) => prev + 1);
      // Mark as learned/resolved via API
      try {
        await fetch('/api/student/mistakes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQ.id,
            action: 'MARK_LEARNED',
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasEvaluated(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <AppShell title="Error Quarantine Retest" subtitle="Loading quarantined mistakes...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#ba1a1a] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#464555]">Assembling your active quarantined mistakes...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (completed) {
    return (
      <AppShell title="Retest Completed" subtitle="Quarantine review complete">
        <div className="max-w-2xl mx-auto space-y-6 py-8 animate-fadeIn text-center">
          <div className="bg-white rounded-3xl p-8 border border-[#e9edff] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#e6f7ef] text-[#006c49] flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="font-headline font-bold text-2xl text-[#141b2b]">
              Quarantine Retest Complete!
            </h2>
            <p className="text-xs text-[#777587]">
              Successfully cleared {scoreCount} of {questions.length} quarantined mistakes. The system has updated your Spaced Revision intervals and resolved mastery flags.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Link
                href="/error-book"
                className="px-5 py-2.5 rounded-xl border border-[#e9edff] text-xs font-bold text-[#141b2b] hover:bg-[#f1f3ff]"
              >
                View Error Book
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold shadow-xs hover:bg-[#2b1ea8]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell title="Error Quarantine Retest" subtitle="Zero active mistakes">
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#e6f7ef] text-[#006c49] flex items-center justify-center mx-auto">
            <StitchIcon name="verified" size={24} />
          </div>
          <h3 className="font-bold text-base text-[#141b2b]">No Quarantined Mistakes!</h3>
          <p className="text-xs text-[#777587]">All previous errors have been resolved or your quarantine is clean.</p>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold inline-block">
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Error Quarantine Retest"
      subtitle={`Question ${currentIndex + 1} of ${questions.length} • Resolve Mistake`}
      showBack={true}
      backHref="/error-book"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e9edff] shadow-xs space-y-6">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f3ff]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#fff1f0] text-[#ba1a1a] text-xs font-bold border border-[#ffdad6]">
                Quarantined Error
              </span>
              {currentQ.chapter && (
                <span className="text-xs font-semibold text-[#464555]">
                  {currentQ.chapter.title}
                </span>
              )}
            </div>
            {currentQ.mistakeContext && (
              <span className="text-xs text-[#ba1a1a] font-bold">
                Erred {currentQ.mistakeContext.mistakeCount}x previously ({currentQ.mistakeContext.mistakeType})
              </span>
            )}
          </div>

          {/* Stem */}
          <div className="space-y-2">
            <p className="text-base sm:text-lg font-medium text-[#141b2b] leading-relaxed">
              {currentQ.questionText}
            </p>
            {currentQ.primaryConcept && (
              <span className="inline-block text-xs text-[#3525cd] font-semibold bg-[#f1f3ff] px-2.5 py-0.5 rounded-md">
                Concept: {currentQ.primaryConcept.name}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.label;
              let btnStyle = 'border-[#e9edff] bg-white hover:bg-[#f9f9ff]';

              if (hasEvaluated) {
                if (opt.label === currentQ.correctOption) {
                  btnStyle = 'border-[#006c49] bg-[#e6f7ef] text-[#006c49] font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-[#ba1a1a] bg-[#fff1f0] text-[#ba1a1a] font-bold';
                }
              } else if (isSelected) {
                btnStyle = 'border-[#3525cd] bg-[#eef0ff] ring-2 ring-[#3525cd]/20';
              }

              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => !hasEvaluated && setSelectedOption(opt.label)}
                  disabled={hasEvaluated}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-xs font-bold">
                      {opt.label}
                    </span>
                    <span className="text-sm font-medium text-[#141b2b]">
                      {opt.text}
                    </span>
                  </div>
                  {hasEvaluated && opt.label === currentQ.correctOption && (
                    <StitchIcon name="check_circle" size={18} className="text-[#006c49]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Evaluation Banner */}
          {hasEvaluated && (
            <div className={`p-4 rounded-2xl border space-y-2 animate-fadeIn ${
              isCorrect ? 'bg-[#e6f7ef] border-[#6cf8bb] text-[#006c49]' : 'bg-[#fff1f0] border-[#ffdad6] text-[#ba1a1a]'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <StitchIcon name={isCorrect ? 'check_circle' : 'cancel'} size={18} />
                <span>{isCorrect ? 'Correct! Mistake quarantine status resolved.' : 'Incorrect. Retained in quarantine queue.'}</span>
              </div>
              <p className="text-xs text-[#464555] leading-relaxed pt-1">
                <span className="font-bold">Explanation: </span>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3ff]">
            {!hasEvaluated ? (
              <button
                type="button"
                onClick={handleVerify}
                disabled={!selectedOption}
                className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs"
              >
                Verify Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish Retest' : 'Next Question'}</span>
                <StitchIcon name="arrow_forward" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
