'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function StudentPracticePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMarked, setIsMarked] = useState(false);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('ALL'); // ALL | PYQ | FINGERTIPS | NCERT
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  const fetchQuestions = () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setResult(null);

    const params = new URLSearchParams();
    params.set('count', '15');
    if (sourceFilter !== 'ALL') params.set('source', sourceFilter);
    if (subjectFilter !== 'ALL') params.set('subject', subjectFilter);
    if (difficultyFilter !== 'ALL') params.set('difficulty', difficultyFilter);
    if (yearFilter !== 'ALL') params.set('year', yearFilter);

    fetch(`/api/student/practice?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setQuestions(json.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [sourceFilter, subjectFilter, difficultyFilter, yearFilter]);

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQ) return;
    setIsSubmitted(true);

    try {
      const res = await fetch('/api/student/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          selectedOption,
        }),
      });

      const json = await res.json();
      setResult(json);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setResult(null);
      setIsMarked(false);
    }
  };

  const handleClear = () => {
    if (!isSubmitted) {
      setSelectedOption(null);
    }
  };

  const SOURCES = [
    { id: 'ALL', label: 'All Questions', icon: 'auto_awesome' },
    { id: 'PYQ', label: 'NEET PYQs', icon: 'history_edu' },
    { id: 'FINGERTIPS', label: 'MTG Fingertips', icon: 'local_fire_department' },
    { id: 'NCERT', label: 'NCERT Drills', icon: 'menu_book' },
  ];

  return (
    <AppShell
      title="Practice & Drill Engine"
      subtitle={
        questions.length > 0
          ? `Question ${currentIndex + 1} of ${questions.length} • ${currentQ?.chapter?.title || 'Syllabus Calibration'}`
          : 'Adaptive NEET Question Practice'
      }
      streakDays={7}
      showBack={true}
      backHref="/"
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/dpp"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e8fd] text-[#3525cd] hover:bg-[#d4defb] text-xs font-bold transition-all"
          >
            <StitchIcon name="bolt" size={14} />
            <span>Launch Timed DPP</span>
          </Link>
          <button
            onClick={fetchQuestions}
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-white border border-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#f1f3ff] transition-colors cursor-pointer"
            title="Refresh question set"
          >
            <StitchIcon name="refresh" size={18} />
          </button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto w-full space-y-6 pb-12">
        {/* Source Mode Filter Tabs */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#e9edff] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar w-full sm:w-auto">
            {SOURCES.map((src) => {
              const isActive = sourceFilter === src.id;
              return (
                <button
                  key={src.id}
                  onClick={() => setSourceFilter(src.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#3525cd] text-white shadow-xs font-bold'
                      : 'bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] hover:bg-[#e1e8fd]'
                  }`}
                >
                  <StitchIcon name={src.icon} size={15} />
                  <span>{src.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f3ff]">
            {/* Subject Dropdown */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-1.5 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#3525cd] cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              <option value="BIO">Biology</option>
              <option value="CHE">Chemistry</option>
              <option value="PHY">Physics</option>
            </select>

            {/* Difficulty Dropdown */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-1.5 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#3525cd] cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Year Dropdown when PYQ is active */}
            {sourceFilter === 'PYQ' && (
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-[#f9f9ff] border border-[#e9edff] rounded-xl px-3 py-1.5 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#3525cd] cursor-pointer"
              >
                <option value="ALL">All PYQ Years</option>
                <option value="2024">NEET 2024</option>
                <option value="2023">NEET 2023</option>
                <option value="2022">NEET 2022</option>
                <option value="2021">NEET 2021</option>
                <option value="2020">NEET 2020</option>
                <option value="2019">NEET 2019</option>
                <option value="2018">NEET 2018</option>
              </select>
            )}
          </div>
        </div>

        {/* Main Interactive Stage */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e9edff] p-16 flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#464555]">Loading verified NEET questions...</p>
          </div>
        ) : !currentQ ? (
          <div className="bg-white rounded-2xl border border-[#e9edff] p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center mx-auto">
              <StitchIcon name="done_all" size={24} />
            </div>
            <h2 className="text-lg font-bold text-[#141b2b]">No Questions Match Current Filters</h2>
            <p className="text-xs text-[#777587] max-w-md mx-auto">
              Try switching your source or subject filter to discover more verified NEET drills and chapter problems.
            </p>
            <button
              onClick={() => {
                setSourceFilter('ALL');
                setSubjectFilter('ALL');
                setDifficultyFilter('ALL');
                setYearFilter('ALL');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e9edff] shadow-xs p-6 sm:p-8 space-y-6">
            {/* Question Top Meta Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-[#f1f3ff]">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                    currentQ.sourceType === 'PYQ'
                      ? 'bg-[#e1e8fd] text-[#3525cd]'
                      : currentQ.sourceType === 'FINGERTIPS'
                      ? 'bg-[#f3e8ff] text-[#7e22ce]'
                      : 'bg-[#6cf8bb]/40 text-[#006c49]'
                  }`}
                >
                  {currentQ.sourceBadge || (currentQ.sourceType === 'PYQ' ? 'NEET PYQ' : currentQ.sourceType === 'FINGERTIPS' ? 'MTG Fingertips' : 'NCERT Line')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#f1f3ff] text-[#464555] font-semibold">
                  {currentQ.difficulty || 'MEDIUM'}
                </span>
                <span className="text-[#c7c4d8]">•</span>
                <span className="text-[#464555] font-medium">
                  {currentQ.chapter?.subjectName || 'Biology'} (Class 11)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/question/${currentQ.id}`}
                  className="flex items-center gap-1 text-[#3525cd] hover:underline font-semibold"
                  target="_blank"
                >
                  <span>Full Detail</span>
                  <StitchIcon name="open_in_new" size={13} />
                </Link>
                <button
                  onClick={() => setIsMarked(!isMarked)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    isMarked ? 'text-[#006c49] font-bold' : 'text-[#777587] hover:text-[#141b2b]'
                  }`}
                >
                  <StitchIcon name={isMarked ? 'bookmark' : 'bookmark_border'} size={15} />
                  <span>{isMarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>
            </div>

            {/* Question Stem Text */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3525cd]">
                Question #{currentIndex + 1}
              </span>
              <p className="text-base sm:text-lg text-[#141b2b] font-medium leading-relaxed whitespace-pre-line">
                {currentQ.questionText}
              </p>
            </div>

            {/* Attached Figures / Diagrams */}
            {currentQ.figures && currentQ.figures.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
                {currentQ.figures.map((fig: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center">
                    <img
                      src={fig.assetPath}
                      alt={fig.caption || `Question Diagram ${idx + 1}`}
                      className="max-h-64 object-contain rounded-lg border border-[#e9edff] bg-white p-2"
                    />
                    {fig.caption && (
                      <p className="text-xs text-[#777587] mt-2 text-center italic">{fig.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt: any) => {
                const isSelected = selectedOption === opt.label;
                const isCorrectOpt = result?.correctOption?.toUpperCase() === opt.label.toUpperCase();
                const isWrongChoice = isSubmitted && isSelected && !result?.isCorrect;

                let optContainer = 'bg-[#f9f9ff] border-[#e9edff] text-[#141b2b] hover:border-[#3525cd]/40 hover:bg-[#f1f3ff]';
                let bubbleStyle = 'bg-white border-[#e9edff] text-[#464555]';

                if (isSubmitted) {
                  if (isCorrectOpt) {
                    optContainer = 'bg-[#e6f7ef] border-[#006c49] text-[#006c49] font-semibold';
                    bubbleStyle = 'bg-[#006c49] text-white';
                  } else if (isWrongChoice) {
                    optContainer = 'bg-[#fff1f0] border-[#ba1a1a] text-[#ba1a1a]';
                    bubbleStyle = 'bg-[#ba1a1a] text-white';
                  } else {
                    optContainer = 'bg-[#f9f9ff] border-[#f1f3ff] text-[#777587] opacity-60';
                    bubbleStyle = 'bg-[#e9edff] text-[#777587]';
                  }
                } else if (isSelected) {
                  optContainer = 'bg-[#e1e8fd] border-[#3525cd] text-[#141b2b] shadow-xs ring-1 ring-[#3525cd]';
                  bubbleStyle = 'bg-[#3525cd] text-white';
                }

                return (
                  <div
                    key={opt.label}
                    onClick={() => !isSubmitted && setSelectedOption(opt.label)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-sm transition-all cursor-pointer ${optContainer}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border transition-all ${bubbleStyle}`}
                    >
                      {opt.label}
                    </span>
                    <span className="flex-1 pt-1 leading-snug font-medium">{opt.text}</span>
                    {isSubmitted && isCorrectOpt && (
                      <StitchIcon name="check_circle" className="text-[#006c49] flex-shrink-0 mt-1" size={20} />
                    )}
                    {isSubmitted && isWrongChoice && (
                      <StitchIcon name="cancel" className="text-[#ba1a1a] flex-shrink-0 mt-1" size={20} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: CLEAR / SUBMIT / NEXT */}
            <div className="flex flex-wrap items-center justify-between pt-5 border-t border-[#f1f3ff] gap-3">
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitted || !selectedOption}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777587] hover:text-[#141b2b] hover:bg-[#f1f3ff] transition-all disabled:opacity-40 cursor-pointer"
              >
                Clear Selection
              </button>

              <div className="flex items-center gap-3">
                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#006c49] hover:bg-[#005a3c] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <StitchIcon name="arrow_forward" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Post-Submission Explanations Card */}
            {isSubmitted && result && (
              <div className="space-y-4 pt-4 border-t border-[#f1f3ff] animate-fade-in">
                <div
                  className={`p-5 rounded-2xl border space-y-2 ${
                    result.isCorrect
                      ? 'bg-[#e6f7ef] border-[#6cf8bb]'
                      : 'bg-[#fff1f0] border-[#ffdad6]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {result.isCorrect ? (
                      <>
                        <StitchIcon name="check_circle" className="text-[#006c49]" size={20} />
                        <span className="text-[#006c49]">Correct! (+4 Marks awarded)</span>
                      </>
                    ) : (
                      <>
                        <StitchIcon name="cancel" className="text-[#ba1a1a]" size={20} />
                        <span className="text-[#ba1a1a]">Incorrect (-1 Mark). Correct option is {result.correctOption}</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-[#141b2b] leading-relaxed pt-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#777587] block mb-1">
                      Step-by-Step NCERT Solution:
                    </span>
                    {result.explanation}
                  </div>
                </div>

                {/* Concept Tested Info */}
                {result.primaryConcept && (
                  <div className="p-4 rounded-xl bg-[#f1f3ff] border border-[#d4defb] text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#3525cd]">
                      <StitchIcon name="menu_book" size={15} />
                      <span>NCERT Concept Tested: {result.primaryConcept.name}</span>
                    </div>
                    {result.primaryConcept.definition && (
                      <p className="text-[#464555] leading-relaxed">{result.primaryConcept.definition}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
