import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import QuestionInteractiveCard from './QuestionInteractiveCard';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { orderIndex: 'asc' } },
      figures: true,
      chapter: {
        include: {
          subject: { include: { classLevel: true } },
        },
      },
      primaryConcept: true,
    },
  });

  if (!question) {
    notFound();
  }

  // Find related PYQs in the same chapter
  const relatedPyqs = await prisma.question.findMany({
    where: {
      chapterId: question.chapterId,
      sourceType: 'PYQ',
      id: { not: question.id },
      verificationStatus: 'VERIFIED',
    },
    take: 2,
    select: {
      id: true,
      questionText: true,
      examName: true,
      examYear: true,
      difficulty: true,
    },
  });

  // Find related Fingertips questions in the same chapter
  const relatedFingertips = await prisma.question.findMany({
    where: {
      chapterId: question.chapterId,
      sourceType: 'FINGERTIPS',
      id: { not: question.id },
      verificationStatus: 'VERIFIED',
    },
    take: 2,
    select: {
      id: true,
      questionText: true,
      difficulty: true,
      questionType: true,
    },
  });

  // Student-friendly source badge (no internal IDs)
  let badgeText = 'NCERT Question';
  let badgeColor = 'bg-[#6cf8bb]/40 text-[#006c49]';

  if (question.sourceType === 'PYQ') {
    badgeText = `${question.examName || 'NEET'} ${question.examYear || ''}`.trim();
    badgeColor = 'bg-[#e1e8fd] text-[#3525cd]';
  } else if (question.sourceType === 'FINGERTIPS') {
    badgeText = 'MTG Fingertips';
    badgeColor = 'bg-[#f3e8ff] text-[#7e22ce]';
  }

  const whyData = question.whyThisQuestion ? JSON.parse(question.whyThisQuestion) : null;

  return (
    <AppShell
      title="Question Inspector"
      subtitle={`${question.chapter?.subject?.name || 'Biology'} • ${question.chapter?.title || 'Chapter Calibration'}`}
      streakDays={7}
      showBack={true}
      backHref="/practice"
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b] hover:bg-[#e1e8fd] text-xs font-semibold transition-all"
          >
            <StitchIcon name="arrow_back" size={14} />
            <span>Practice Feed</span>
          </Link>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
        {/* Interactive Question Card */}
        <QuestionInteractiveCard
          question={{
            id: question.id,
            questionText: question.questionText,
            questionType: question.questionType,
            difficulty: question.difficulty,
            options: question.options.map((o) => ({ label: o.label, text: o.text })),
            figures: question.figures.map((f) => ({ assetPath: f.assetPath, caption: f.caption })),
            correctOption: question.correctOption,
            explanation: question.explanation || 'Refer to NCERT textbook concepts.',
            badgeText,
            badgeColor,
            chapterTitle: question.chapter?.title || '',
            subjectName: question.chapter?.subject?.name || '',
            conceptName: question.primaryConcept?.name || null,
            conceptDef: question.primaryConcept?.definition || null,
            conceptForm: question.primaryConcept?.formula || null,
            whyThisQuestion: whyData,
          }}
        />

        {/* Knowledge Graph Cross-Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Related PYQs */}
          <div className="bg-white border border-[#e9edff] rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#141b2b]">
              <StitchIcon name="history_edu" size={16} className="text-[#3525cd]" />
              <span>Connected Previous Year Questions</span>
            </div>
            {relatedPyqs.length > 0 ? (
              <div className="space-y-2">
                {relatedPyqs.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/question/${rp.id}`}
                    className="block p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:bg-[#f1f3ff] transition group"
                  >
                    <div className="flex items-center justify-between text-xs text-[#777587] mb-1">
                      <span className="font-bold text-[#3525cd]">{rp.examName} {rp.examYear}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#e9edff] text-[#464555] font-semibold">{rp.difficulty}</span>
                    </div>
                    <p className="text-xs text-[#141b2b] line-clamp-2 font-medium">
                      {rp.questionText}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#777587] italic">No other verified PYQs in this chapter.</p>
            )}
          </div>

          {/* Related Fingertips Questions */}
          <div className="bg-white border border-[#e9edff] rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#141b2b]">
              <StitchIcon name="local_fire_department" size={16} className="text-[#7e22ce]" />
              <span>Related MTG Fingertips Drills</span>
            </div>
            {relatedFingertips.length > 0 ? (
              <div className="space-y-2">
                {relatedFingertips.map((rf) => (
                  <Link
                    key={rf.id}
                    href={`/question/${rf.id}`}
                    className="block p-3 rounded-xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#7e22ce]/40 hover:bg-[#f1f3ff] transition group"
                  >
                    <div className="flex items-center justify-between text-xs text-[#777587] mb-1">
                      <span className="font-bold text-[#7e22ce]">MTG Fingertips</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#e9edff] text-[#464555] font-semibold">{rf.difficulty}</span>
                    </div>
                    <p className="text-xs text-[#141b2b] line-clamp-2 font-medium">
                      {rf.questionText}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#777587] italic">No other Fingertips questions in this chapter.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
