'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface Question {
  index: number;
  id: string;
  text: string;
  options: Array<{ key: string; text: string }>;
  difficulty: string;
  conceptName: string | null;
}

export default function MtgChapterTestPage() {
  const params = useParams();
  const chapterId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(2);
  const [subjectName, setSubjectName] = useState('Biology');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    totalQuestions: number;
    correctCount: number;
    scorePercentage: number;
    passed: boolean;
    results: Array<{
      questionId: string;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  } | null>(null);

  useEffect(() => {
    async function loadTest() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ncert/chapter/${chapterId}/fingertips`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions || []);
          setChapterTitle(data.chapterTitle || 'Chapter Test');
          setChapterNumber(data.chapterNumber || 1);
          setSubjectName(data.subjectName || 'Biology');
        }
      } catch (err) {
        console.error('Failed to load MTG chapter test:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [chapterId]);

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(selectedAnswers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const res = await fetch(`/api/ncert/chapter/${chapterId}/fingertips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit chapter test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Kriti NEET" subtitle="MTG Fingertips Chapter Test" showBack backHref="/ncert">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#464555]">Loading authentic MTG questions...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Kriti NEET"
      subtitle={`${subjectName} • Chapter ${chapterNumber} Test`}
      showBack={true}
      backHref="/ncert"
    >
      <div className="space-y-6 pb-20">
        {/* Banner */}
        <section className="bg-gradient-to-r from-[#f1f3ff] via-[#e2dfff] to-[#f9f9ff] rounded-3xl p-5 sm:p-7 border border-[#e1e8fd] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-[#3525cd] text-white px-2.5 py-0.5 rounded-full">
                MTG Fingertips Source-Linked
              </span>
              <span className="text-xs text-[#777587]">Class 11 {subjectName}</span>
            </div>
            <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] mt-1">
              Ch {chapterNumber}: {chapterTitle} — Chapter Test
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-1">
              Comprehensive chapter-level and miscellaneous questions from MTG NCERT at Your Fingertips.
            </p>
          </div>

          {submitted && result && (
            <div className="bg-white px-5 py-3 rounded-2xl border border-[#e9edff] shadow-xs text-right flex-shrink-0">
              <span className="text-xs text-[#777587] block uppercase font-bold">Your Score</span>
              <span className="text-2xl font-bold text-[#006c49]">
                {result.scorePercentage}% ({result.correctCount}/{result.totalQuestions})
              </span>
            </div>
          )}
        </section>

        {/* Questions list */}
        <div className="space-y-5">
          {questions.map((q, idx) => {
            const selected = selectedAnswers[q.id];
            const qResult = result?.results?.find((r) => r.questionId === q.id);

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold bg-[#f1f3ff] text-[#3525cd] px-2.5 py-0.5 rounded-lg">
                    Question {idx + 1}
                  </span>
                  <span className="text-[#777587] font-semibold">
                    Difficulty: {q.difficulty}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-[#141b2b] leading-relaxed">
                  {q.text}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = selected === opt.key;
                    let style = 'bg-[#f9f9ff] text-[#141b2b] border-[#e9edff] hover:border-[#3525cd]';

                    if (submitted && qResult) {
                      if (opt.key === qResult.correctOption) {
                        style = 'bg-[#e7fbf1] text-[#00714d] border-[#6cf8bb] font-bold';
                      } else if (isSelected && opt.key !== qResult.correctOption) {
                        style = 'bg-[#ffedea] text-[#ba1a1a] border-[#ffb4ab] font-bold';
                      }
                    } else if (isSelected) {
                      style = 'bg-[#e2dfff] text-[#3525cd] border-[#3525cd] font-bold shadow-2xs';
                    }

                    return (
                      <button
                        key={opt.key}
                        disabled={submitted}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [q.id]: opt.key,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-2.5 transition-all ${style}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {opt.key}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {submitted && qResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      qResult.isCorrect
                        ? 'bg-[#e7fbf1] text-[#004d33] border border-[#a7e8ca]'
                        : 'bg-[#fff0ed] text-[#8c1d18] border border-[#fcc8be]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <StitchIcon
                        name={qResult.isCorrect ? 'check_circle' : 'cancel'}
                        size={15}
                      />
                      <span>
                        {qResult.isCorrect
                          ? 'Correct Answer!'
                          : `Incorrect. Correct Option is (${qResult.correctOption})`}
                      </span>
                    </div>
                    <p>{qResult.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#e9edff] p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <span className="text-xs text-[#777587]">
            Answered: {Object.keys(selectedAnswers).length} / {questions.length} Questions
          </span>

          {!submitted ? (
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="bg-[#3525cd] hover:bg-[#2b1ea8] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2"
            >
              <StitchIcon name="send" size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit MTG Chapter Test'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/ncert"
                className="bg-[#3525cd] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2b1ea8] transition-all shadow-xs"
              >
                Back to NCERT Syllabus
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
