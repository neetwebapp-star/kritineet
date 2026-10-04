'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function StudentOnboardingPage() {
  const [step, setStep] = useState(1);
  const [classLevel, setClassLevel] = useState('CLASS_11');
  const [prepLevel, setPrepLevel] = useState('INTERMEDIATE');
  const [targetYear, setTargetYear] = useState(2027);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/diagnostic/submit')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
      })
      .catch(() => {});
  }, []);

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleSubmitDiagnostic = async () => {
    setSubmitting(true);
    const answersPayload = Object.entries(answers).map(([qId, opt]) => ({
      questionId: qId,
      selectedOption: opt,
      timeSpentSeconds: 45,
    }));

    try {
      const res = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersPayload,
          preferences: {
            classLevel,
            targetExamYear: targetYear,
            primarySubjects: ['BIOLOGY', 'PHYSICS', 'CHEMISTRY'],
            preparationLevel: prepLevel,
          },
        }),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
    } catch {
      //
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] p-6 md:p-10 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white border border-[#e9edff] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Progress tracker */}
        <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-4">
          <div className="flex items-center gap-2 text-[#3525cd] text-xs font-headline font-bold uppercase tracking-wider">
            <StitchIcon name="school" size={16} />
            <span>NEET UG 2027 Onboarding</span>
          </div>
          <div className="text-xs text-[#777587] font-headline font-semibold">Step {step} of 3</div>
        </div>

        {/* STEP 1: Academic Preferences */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b]">Academic Baseline & Profile</h2>
              <p className="text-[#464555] text-xs sm:text-sm mt-1">Configure your grade and target examination year</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-headline font-bold text-[#141b2b] uppercase mb-2">Class Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CLASS_11', 'CLASS_12', 'DROPPER'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setClassLevel(lvl)}
                      className={`min-h-[44px] py-3 rounded-xl border text-xs font-headline font-bold transition cursor-pointer ${
                        classLevel === lvl
                          ? 'bg-[#3525cd] border-[#3525cd] text-white shadow-xs'
                          : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff]'
                      }`}
                    >
                      {lvl.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-headline font-bold text-[#141b2b] uppercase mb-2">Self-Assessed Preparation Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrepLevel(p)}
                      className={`min-h-[44px] py-3 rounded-xl border text-xs font-headline font-bold transition cursor-pointer ${
                        prepLevel === p
                          ? 'bg-[#3525cd] border-[#3525cd] text-white shadow-xs'
                          : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-headline font-bold text-[#141b2b] uppercase mb-2">Target NEET Exam Year</label>
                <input
                  type="number"
                  value={targetYear}
                  onChange={e => setTargetYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#f9f9ff] border border-[#e9edff] rounded-xl text-[#141b2b] font-mono focus:outline-none focus:border-[#3525cd]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full min-h-[48px] py-3 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start 15-Question Baseline Diagnostic</span>
              <StitchIcon name="arrow_forward" size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Diagnostic Assessment */}
        {step === 2 && currentQ && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-[#777587]">
              <span className="font-headline font-bold text-[#3525cd]">{currentQ.subject} • {currentQ.chapterTitle}</span>
              <span>Question {currentQIndex + 1} of {questions.length}</span>
            </div>

            <div className="text-sm sm:text-base font-medium text-[#141b2b] leading-relaxed">
              {currentQ.questionText}
            </div>

            <div className="space-y-2.5">
              {currentQ.options?.map((opt: any) => {
                const isSelected = answers[currentQ.id] === opt.label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.label)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition flex items-center gap-3 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-[#eef2ff] border-2 border-[#3525cd] text-[#3525cd] font-semibold'
                        : 'bg-white border-[#e9edff] text-[#141b2b] hover:border-[#3525cd]/40'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-headline font-bold ${
                      isSelected ? 'bg-[#3525cd] text-white' : 'bg-[#f1f3ff] text-[#464555]'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#f1f3ff]">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
                className="min-h-[40px] px-4 py-2 bg-[#f1f3ff] text-xs font-headline font-semibold text-[#464555] rounded-xl disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>

              {currentQIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="min-h-[40px] px-5 py-2 bg-[#3525cd] hover:bg-[#2d1eb8] text-xs text-white font-headline font-bold rounded-xl transition cursor-pointer"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitDiagnostic}
                  disabled={submitting}
                  className="min-h-[40px] px-6 py-2 bg-[#006c49] hover:bg-[#005a3c] disabled:opacity-50 text-xs text-white font-headline font-bold rounded-xl transition cursor-pointer"
                >
                  {submitting ? 'Analyzing Responses...' : 'Finish Diagnostic'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Initial Learning Profile */}
        {step === 3 && result && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f7ef] text-[#006c49] flex items-center justify-center mx-auto">
              <StitchIcon name="check" size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-headline font-bold text-[#141b2b]">{result.profileHeadline}</h2>
              <p className="text-[#464555] text-xs mt-1 max-w-md mx-auto leading-relaxed">{result.summaryStatement}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-[#f9f9ff] rounded-2xl border border-[#e9edff] text-center">
              <div>
                <div className="text-[11px] text-[#777587]">Overall Accuracy</div>
                <div className="text-xl font-headline font-bold text-[#006c49]">{result.overallAccuracy}%</div>
              </div>
              <div>
                <div className="text-[11px] text-[#777587]">Concepts Exposed</div>
                <div className="text-xl font-headline font-bold text-[#141b2b]">{result.conceptsExposed}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#777587]">Avg Time / Q</div>
                <div className="text-xl font-headline font-bold text-[#3525cd]">{result.avgResponseTimeSeconds}s</div>
              </div>
            </div>

            <div className="p-4 bg-[#f9f9ff] rounded-2xl border border-[#e9edff] text-left space-y-2">
              <div className="text-xs font-headline font-bold text-[#777587] uppercase">Subject Baseline Breakdown</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#e9edff]">Biology: <span className="font-bold text-[#006c49]">{result.subjectAccuracies?.BIOLOGY || 0}%</span></div>
                <div className="p-2.5 bg-white rounded-xl border border-[#e9edff]">Physics: <span className="font-bold text-[#b45309]">{result.subjectAccuracies?.PHYSICS || 0}%</span></div>
                <div className="p-2.5 bg-white rounded-xl border border-[#e9edff]">Chemistry: <span className="font-bold text-[#3525cd]">{result.subjectAccuracies?.CHEMISTRY || 0}%</span></div>
              </div>
            </div>

            <Link
              href="/practice"
              className="block w-full min-h-[48px] py-3 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold rounded-xl shadow-xs transition"
            >
              Enter Personalized Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
