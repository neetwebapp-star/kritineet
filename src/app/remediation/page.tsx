'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

function ConceptRemediationContent() {
  const searchParams = useSearchParams();
  const conceptId = searchParams.get('conceptId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<'STEP1' | 'STEP2' | 'STEP3'>('STEP1');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stepResult, setStepResult] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<{ STEP1?: boolean; STEP2?: boolean; STEP3?: boolean }>({});

  const [weaknesses, setWeaknesses] = useState<any[]>([]);

  useEffect(() => {
    if (!conceptId) {
      fetch('/api/student/weaknesses?limit=6')
        .then((res) => res.json())
        .then((json) => {
          if (json.weaknesses) setWeaknesses(json.weaknesses);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
      return;
    }
    fetch(`/api/student/remediation?conceptId=${encodeURIComponent(conceptId)}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [conceptId]);

  if (loading) {
    return (
      <AppShell title="Remediation Studio" subtitle="Loading Framework" streakDays={7} showBack={true} backHref="/">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#464555] font-headline font-semibold">Loading NCERT Remediation Framework...</p>
        </div>
      </AppShell>
    );
  }

  if (!conceptId || !data || data.error) {
    return (
      <AppShell title="Remediation Studio" subtitle="Targeted Concept Remediation" streakDays={7} showBack={true} backHref="/">
        <div className="max-w-3xl mx-auto space-y-6 mt-4">
          <div className="bg-white border border-[#e9edff] rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                <StitchIcon name="psychology" size={22} />
              </div>
              <div>
                <h2 className="text-base font-headline font-bold text-[#141b2b]">Active Concept Remediation Engine</h2>
                <p className="text-xs text-[#464555]">
                  Select an identified weak concept to launch the 3-step mastery ladder (Foundation Drill &rarr; Medium &rarr; NEET PYQ).
                </p>
              </div>
            </div>
            <Link
              href="/error-book"
              className="text-xs font-headline font-semibold text-[#3525cd] hover:underline flex items-center gap-1"
            >
              <span>Error Book</span>
              <StitchIcon name="arrow_forward" size={14} />
            </Link>
          </div>

          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-headline font-bold tracking-wider text-[#464555] uppercase">
                Weak Concepts Requiring Immediate Remediation ({weaknesses.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weaknesses.map((w: any) => (
                  <div
                    key={w.conceptId}
                    className="p-4 rounded-xl border border-[#e9edff] bg-white hover:border-[#3525cd]/40 transition shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                          {w.subjectCode || 'NEET'} &bull; {w.status || 'WEAK'}
                        </span>
                        <span className="text-xs font-semibold text-[#464555]">
                          Mastery: {w.masteryScore}%
                        </span>
                      </div>
                      <h4 className="text-sm font-headline font-bold text-[#141b2b] mb-1">{w.name}</h4>
                      <p className="text-xs text-[#464555] line-clamp-2 mb-3">{w.definition}</p>
                    </div>
                    <Link
                      href={`/remediation?conceptId=${encodeURIComponent(w.conceptId)}`}
                      className="w-full text-center py-2 px-3 rounded-lg bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs transition"
                    >
                      Start 3-Step Remediation
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e9edff] rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#cbe963]/30 text-[#141b2b] flex items-center justify-center mx-auto">
                <StitchIcon name="check_circle" size={24} />
              </div>
              <h3 className="text-base font-headline font-bold text-[#141b2b]">No High-Risk Concepts Flagged!</h3>
              <p className="text-xs text-[#464555] max-w-md mx-auto">
                All tracked concepts have sufficient mastery. Attempt DPPs, CBT simulations, or test your NCERT recall to uncover new diagnostic opportunities.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/dpp"
                  className="px-4 py-2 rounded-xl bg-[#3525cd] text-white font-headline font-bold text-xs"
                >
                  Solve DPP
                </Link>
                <Link
                  href="/cbt"
                  className="px-4 py-2 rounded-xl bg-[#f2f3ff] text-[#3525cd] font-headline font-bold text-xs"
                >
                  Attempt Mock CBT
                </Link>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  const { concept, workedExplanation, drillQuestions, currentMastery } = data;
  const currentQ =
    activeStep === 'STEP1'
      ? drillQuestions.step1_easy
      : activeStep === 'STEP2'
      ? drillQuestions.step2_medium
      : drillQuestions.step3_pyq;

  const handleCheckAnswer = async () => {
    if (!selectedOption || !currentQ) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption.toUpperCase() === currentQ.correctOption.toUpperCase();
    try {
      const res = await fetch('/api/student/remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: concept.id,
          questionId: currentQ.id,
          isCorrect,
          timeSpentSeconds: 45,
        }),
      });
      const json = await res.json();
      setStepResult({ isCorrect, ...json });
      setCompletedSteps((prev) => ({ ...prev, [activeStep]: isCorrect }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextStep = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setStepResult(null);

    if (activeStep === 'STEP1') setActiveStep('STEP2');
    else if (activeStep === 'STEP2') setActiveStep('STEP3');
  };

  return (
    <AppShell
      title="Targeted Remediation Studio"
      subtitle={`${concept.subjectName} • ${concept.chapterTitle}`}
      streakDays={7}
      showBack={true}
      backHref="/error-book"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border border-[#e9edff] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-[#e2dfff] text-[#3525cd]">
                3-Step Mastery Ladder
              </span>
              <span className="text-xs text-[#777587]">• {concept.subjectName}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-headline font-bold text-[#141b2b]">{concept.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#777587]">Current Mastery:</span>
            <span className="px-3 py-1 rounded-full font-headline font-bold bg-[#e6f7ef] border border-[#6cf8bb] text-[#006c49]">
              {currentMastery.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => { setActiveStep('STEP1'); setSelectedOption(null); setIsSubmitted(false); }}
            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
              activeStep === 'STEP1'
                ? 'bg-[#e2dfff] border-[#3525cd] text-[#3525cd]'
                : completedSteps.STEP1
                ? 'bg-[#e6f7ef] border-[#6cf8bb] text-[#006c49]'
                : 'bg-white border-[#e9edff] text-[#464555]'
            }`}
          >
            <span className="text-[10px] font-headline font-bold block uppercase tracking-wider text-[#777587]">Step 1</span>
            <span className="text-xs font-headline font-bold">Foundation Drill (Easy)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveStep('STEP2'); setSelectedOption(null); setIsSubmitted(false); }}
            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
              activeStep === 'STEP2'
                ? 'bg-[#e2dfff] border-[#3525cd] text-[#3525cd]'
                : completedSteps.STEP2
                ? 'bg-[#e6f7ef] border-[#6cf8bb] text-[#006c49]'
                : 'bg-white border-[#e9edff] text-[#464555]'
            }`}
          >
            <span className="text-[10px] font-headline font-bold block uppercase tracking-wider text-[#777587]">Step 2</span>
            <span className="text-xs font-headline font-bold">Application Drill (Medium)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveStep('STEP3'); setSelectedOption(null); setIsSubmitted(false); }}
            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
              activeStep === 'STEP3'
                ? 'bg-[#e2dfff] border-[#3525cd] text-[#3525cd]'
                : completedSteps.STEP3
                ? 'bg-[#e6f7ef] border-[#6cf8bb] text-[#006c49]'
                : 'bg-white border-[#e9edff] text-[#464555]'
            }`}
          >
            <span className="text-[10px] font-headline font-bold block uppercase tracking-wider text-[#777587]">Step 3</span>
            <span className="text-xs font-headline font-bold">NEET PYQ Validation</span>
          </button>
        </div>

        {/* NCERT Concept Framework Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#e9edff] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-headline font-bold text-[#3525cd]">
            <StitchIcon name="menu_book" size={18} className="text-[#3525cd]" />
            <span>Official NCERT Theory &amp; Formulas: {concept.name}</span>
          </div>

          {concept.definition && (
            <p className="text-xs sm:text-sm text-[#141b2b] leading-relaxed bg-[#f9f9ff] p-4 rounded-xl border border-[#e9edff]">
              {concept.definition}
            </p>
          )}

          {concept.formula && (
            <div className="p-3.5 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] font-mono text-xs text-[#3525cd]">
              <strong>Core Formula:</strong> {concept.formula}
            </div>
          )}

          {concept.laws && (
            <div className="text-xs text-[#777587] italic">
              <strong>Governing Principle:</strong> {concept.laws}
            </div>
          )}
        </div>

        {/* Active Drill Question */}
        {currentQ ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e9edff] space-y-6 shadow-xs">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#f1f3ff]">
              <span className="font-headline font-bold text-[#3525cd]">
                {currentQ.sourceType === 'PYQ' ? `${currentQ.examName || 'NEET'} ${currentQ.examYear || ''}` : 'NCERT Targeted Drill'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[#464555] font-headline font-bold">
                {currentQ.difficulty}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#141b2b] font-medium leading-relaxed">
              {currentQ.questionText}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt: any) => {
                const isSelected = selectedOption === opt.label;
                const isCorrect = opt.label.toUpperCase() === currentQ.correctOption.toUpperCase();

                let style = 'bg-white border-[#e9edff] text-[#141b2b] hover:border-[#3525cd]/40';
                if (isSubmitted) {
                  if (isCorrect) {
                    style = 'bg-[#e6f7ef] border-[#6cf8bb] text-[#006c49] font-semibold';
                  } else if (isSelected) {
                    style = 'bg-[#fff1f0] border-[#ffdad6] text-[#ba1a1a] font-semibold';
                  }
                } else if (isSelected) {
                  style = 'bg-[#eef2ff] border-2 border-[#3525cd] text-[#3525cd] font-semibold';
                }

                return (
                  <div
                    key={opt.label}
                    onClick={() => !isSubmitted && setSelectedOption(opt.label)}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition shadow-xs ${style}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#f1f3ff] flex items-center justify-center font-headline font-bold text-xs shrink-0 mt-0.5">
                      {opt.label}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-[#f1f3ff]">
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] font-headline font-bold text-xs text-white disabled:opacity-50 transition shadow-xs cursor-pointer"
                >
                  Verify Response
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`px-3.5 py-2 rounded-xl text-xs font-headline font-bold flex items-center gap-1.5 ${
                    stepResult?.isCorrect
                      ? 'bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb]'
                      : 'bg-[#fff1f0] text-[#ba1a1a] border border-[#ffdad6]'
                  }`}>
                    {stepResult?.isCorrect ? (
                      <>
                        <StitchIcon name="check" size={16} />
                        <span>Correct (+Mastery)</span>
                      </>
                    ) : (
                      <>
                        <StitchIcon name="close" size={16} />
                        <span>Incorrect. Correct: Option {currentQ.correctOption}</span>
                      </>
                    )}
                  </div>

                  {activeStep !== 'STEP3' ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="min-h-[44px] flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs transition shadow-xs cursor-pointer"
                    >
                      <span>Next Step</span>
                      <StitchIcon name="chevron_right" size={16} />
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#006c49] hover:bg-[#005a3c] text-white font-headline font-bold text-xs transition shadow-xs flex items-center gap-1"
                    >
                      <span>Complete Remediation</span>
                      <StitchIcon name="check" size={16} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Explanation on submit */}
            {isSubmitted && currentQ.explanation && (
              <div className="p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-xs text-[#464555] leading-relaxed">
                <strong className="text-[#141b2b] block mb-1 font-headline font-bold">NCERT Solution:</strong>
                {currentQ.explanation}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-[#e9edff] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f7ef] text-[#006c49] flex items-center justify-center mx-auto">
              <StitchIcon name="check" size={24} />
            </div>
            <h3 className="text-base font-headline font-bold text-[#141b2b]">Concept Drill Complete</h3>
            <p className="text-xs text-[#777587]">All questions for this step have been cleared.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ConceptRemediationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555] font-headline font-semibold">Loading NCERT Remediation Framework...</p>
          </div>
        </div>
      }
    >
      <ConceptRemediationContent />
    </React.Suspense>
  );
}
