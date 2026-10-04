'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface QuestionInteractiveCardProps {
  question: {
    id: string;
    questionText: string;
    questionType: string;
    difficulty: string;
    options: Array<{ label: string; text: string }>;
    figures: Array<{ assetPath: string; caption?: string | null }>;
    correctOption: string;
    explanation: string;
    badgeText: string;
    badgeColor: string;
    chapterTitle: string;
    subjectName: string;
    conceptName?: string | null;
    conceptDef?: string | null;
    conceptForm?: string | null;
    whyThisQuestion?: any;
  };
}

export default function QuestionInteractiveCard({ question }: QuestionInteractiveCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [showConcept, setShowConcept] = useState<boolean>(true);

  const isCorrect = selectedOption?.toUpperCase() === question.correctOption.toUpperCase();

  const handleSelect = (label: string) => {
    if (isSubmitted) return;
    setSelectedOption(label);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className="bg-white border border-[#e9edff] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
      {/* Question Header Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f3ff]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#f1f3ff] text-[#464555]">
            {question.questionType.replace('_', ' ')}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              question.difficulty === 'EASY'
                ? 'bg-[#e6f7ef] text-[#006c49]'
                : question.difficulty === 'MEDIUM'
                ? 'bg-[#fff8e1] text-[#b78103]'
                : 'bg-[#fff1f0] text-[#ba1a1a]'
            }`}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-[#e1e8fd] text-[#3525cd]">
          {question.badgeText}
        </div>
      </div>

      {/* Question Text */}
      <div className="text-[#141b2b] text-base md:text-lg font-medium leading-relaxed whitespace-pre-line">
        {question.questionText}
      </div>

      {/* Attached Diagrams/Figures */}
      {question.figures && question.figures.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-[#f9f9ff] border border-[#e9edff]">
          {question.figures.map((fig, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="relative w-full max-h-72 aspect-video bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 border border-[#e9edff]">
                <img
                  src={fig.assetPath}
                  alt={fig.caption || `Question Figure ${idx + 1}`}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
              {fig.caption && (
                <p className="text-xs text-[#777587] mt-2 text-center italic">{fig.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options List */}
      <div className="space-y-3 pt-2">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.label;
          const isThisCorrect = opt.label.toUpperCase() === question.correctOption.toUpperCase();
          const isWrongChoice = isSubmitted && isSelected && !isThisCorrect;

          let optionStyle = 'bg-[#f9f9ff] border-[#e9edff] text-[#141b2b] hover:border-[#3525cd]/40 hover:bg-[#f1f3ff]';
          let bubbleStyle = 'bg-white border-[#e9edff] text-[#464555]';

          if (isSubmitted) {
            if (isThisCorrect) {
              optionStyle = 'bg-[#e6f7ef] border-[#006c49] text-[#006c49] font-semibold';
              bubbleStyle = 'bg-[#006c49] text-white';
            } else if (isWrongChoice) {
              optionStyle = 'bg-[#fff1f0] border-[#ba1a1a] text-[#ba1a1a]';
              bubbleStyle = 'bg-[#ba1a1a] text-white';
            } else {
              optionStyle = 'bg-[#f9f9ff] border-[#f1f3ff] text-[#777587] opacity-60';
              bubbleStyle = 'bg-[#e9edff] text-[#777587]';
            }
          } else if (isSelected) {
            optionStyle = 'bg-[#e1e8fd] border-[#3525cd] text-[#141b2b] shadow-xs ring-1 ring-[#3525cd]';
            bubbleStyle = 'bg-[#3525cd] text-white';
          }

          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              disabled={isSubmitted}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 cursor-pointer ${optionStyle}`}
            >
              <div
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 border transition-colors ${bubbleStyle}`}
              >
                {opt.label}
              </div>
              <div className="flex-1 text-sm md:text-base font-normal pt-1 leading-snug">
                {opt.text}
              </div>
              {isSubmitted && isThisCorrect && (
                <StitchIcon name="check_circle" className="text-[#006c49] flex-shrink-0 mt-1" size={20} />
              )}
              {isSubmitted && isWrongChoice && (
                <StitchIcon name="cancel" className="text-[#ba1a1a] flex-shrink-0 mt-1" size={20} />
              )}
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#f1f3ff]">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white transition text-xs shadow-xs cursor-pointer active:scale-95"
          >
            Check Answer
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                isCorrect
                  ? 'bg-[#e6f7ef] text-[#006c49] border border-[#6cf8bb]'
                  : 'bg-[#fff1f0] text-[#ba1a1a] border border-[#ffdad6]'
              }`}
            >
              {isCorrect ? (
                <>
                  <StitchIcon name="check_circle" className="text-[#006c49]" size={16} />
                  <span>Correct! (+4 Marks)</span>
                </>
              ) : (
                <>
                  <StitchIcon name="cancel" className="text-[#ba1a1a]" size={16} />
                  <span>Incorrect (-1 Mark). Correct: Option {question.correctOption}</span>
                </>
              )}
            </div>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] hover:bg-[#e1e8fd] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Try again"
            >
              <StitchIcon name="refresh" size={14} />
              <span>Retry</span>
            </button>
            <Link
              href={`/ai-tutor?questionId=${question.id}&mode=SOLVE_QUESTION`}
              className="p-2 rounded-xl bg-[#e1e8fd] text-[#3525cd] hover:bg-[#d4defb] transition flex items-center gap-1.5 text-xs font-semibold"
              title="Ask AI Tutor"
            >
              <StitchIcon name="smart_toy" size={14} />
              <span>Ask AI Tutor</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-[#777587]">
          <Link
            href={`/ai-tutor?questionId=${question.id}&mode=SOLVE_QUESTION`}
            className="text-[#3525cd] hover:underline flex items-center gap-1 font-semibold"
          >
            <StitchIcon name="smart_toy" size={14} />
            <span>AI Doubt Solver</span>
          </Link>
          <span>•</span>
          <span>Targeting NEET 2027</span>
        </div>
      </div>

      {/* Accordions for NCERT Concept & Detailed Explanation */}
      {isSubmitted && (
        <div className="space-y-4 pt-4 border-t border-[#f1f3ff] animate-fade-in">
          {/* NCERT Concept Tested */}
          {question.conceptName && (
            <div className="bg-[#f1f3ff] border border-[#d4defb] rounded-2xl p-4 space-y-2">
              <button
                onClick={() => setShowConcept(!showConcept)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#3525cd]">
                  <StitchIcon name="menu_book" size={16} />
                  <span>NCERT Concept Tested: {question.conceptName}</span>
                </div>
                <StitchIcon name={showConcept ? "expand_less" : "expand_more"} size={16} className="text-[#464555]" />
              </button>

              {showConcept && (
                <div className="pt-2 text-xs text-[#141b2b] space-y-2 border-t border-[#d4defb]/60 mt-1">
                  {question.conceptDef && (
                    <p className="leading-relaxed">
                      <strong className="text-[#141b2b]">Key Definition: </strong>
                      {question.conceptDef}
                    </p>
                  )}
                  {question.conceptForm && (
                    <div className="p-2.5 rounded-lg bg-white border border-[#d4defb] font-mono text-xs text-[#3525cd]">
                      <strong>Formula: </strong> {question.conceptForm}
                    </div>
                  )}
                  <p className="text-[11px] text-[#777587]">
                    Source: Official NCERT Textbook ({question.subjectName} • {question.chapterTitle})
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Detailed Solution / Explanation */}
          <div className="bg-[#f9f9ff] border border-[#e9edff] rounded-2xl p-4 space-y-2">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#006c49]">
                <StitchIcon name="auto_awesome" size={16} />
                <span>Step-by-Step Verified Solution</span>
              </div>
              <StitchIcon name={showExplanation ? "expand_less" : "expand_more"} size={16} className="text-[#464555]" />
            </button>

            {showExplanation && (
              <div className="pt-2 text-xs text-[#141b2b] whitespace-pre-line leading-relaxed border-t border-[#e9edff] mt-1">
                {question.explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
