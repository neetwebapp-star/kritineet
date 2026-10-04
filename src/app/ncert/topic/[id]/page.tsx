'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';
import { AIRabbitTeacher } from '@/components/stitch/AIRabbitTeacher';
import { PHYSICS_MIND_MAPS, PhysicsMindMapMeta } from '@/lib/mindmaps/physics-mindmap-registry';
import { getChemistryMindMapForChapter } from '@/lib/mindmaps/chemistry-mindmap-registry';
import { ChapterMindMapCard } from '@/components/mindmaps/ChapterMindMapCard';
import { ChapterNativeMindMap } from '@/components/mindmaps/ChapterNativeMindMap';
import { NCERTSidebar, SidebarChapter } from '@/components/ncert/NCERTSidebar';
import { NCERTHeader, ReadingMode } from '@/components/ncert/NCERTHeader';
import { NCERTSectionView } from '@/components/ncert/NCERTSectionView';

interface TopicData {
  id: string;
  topicNumber: string;
  title: string;
  slug: string;
  orderIndex: number;
  pageStart: number;
  pageEnd: number;
  sourceProvenance: string;
  contentHtml: string;
  contentMarkdown: string;
  explanations: {
    hinglish: string;
    english: string;
    hindi: string;
  };
  audioScripts: {
    hinglish: string;
    english: string;
    hindi: string;
    audioUrl?: string;
  };
  subtopics: Array<{
    id: string;
    subtopicNumber: string;
    title: string;
    orderIndex: number;
    contentHtml?: string;
  }>;
  figures: Array<{
    id: string;
    figureNumber: string;
    caption: string;
    imagePath: string;
    pageNumber: number;
  }>;
  tables: Array<{
    id: string;
    tableNumber: string;
    caption: string;
    htmlContent: string;
    pageNumber: number;
  }>;
}

interface ChapterTopicItem {
  id: string;
  topicNumber: string;
  title: string;
  isCurrent: boolean;
  status: string;
  dppCompleted: boolean;
}

interface QuestionItem {
  index: number;
  id: string;
  text: string;
  options: Array<{ key: string; text: string }>;
  difficulty: string;
  source: string;
  exam?: string;
  bookName?: string;
  conceptName: string | null;
}

export default function NcertTopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = (params?.id as string) || '2.1';

  // State
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [chapter, setChapter] = useState<{
    id: string;
    chapterNumber: number;
    title: string;
    slug: string;
    topicsList: ChapterTopicItem[];
  } | null>(null);
  const [subject, setSubject] = useState<{ name: string; code: string } | null>(null);
  const [classLevel, setClassLevel] = useState<{ name: string } | null>(null);
  const [unit, setUnit] = useState<{ title: string; unitNumber: number } | null>(null);
  const [navigation, setNavigation] = useState<{
    prevTopic: { id: string; topicNumber: string; title: string } | null;
    nextTopic: { id: string; topicNumber: string; title: string } | null;
    isLastTopicInChapter: boolean;
    isChapterCompleted: boolean;
    dppQuestionCount: number;
    mtgQuestionCount?: number;
  } | null>(null);
  const [progress, setProgress] = useState<{
    status: string;
    contentRead: boolean;
    explanationUsed: boolean;
    audioListened: boolean;
    dppCompleted: boolean;
    dppScore: number | null;
  } | null>(null);

  // Active view tab: 6 Pillars (Textbook, Explanation, Audio, DPP, MTG, Mind Map)
  const [activeTab, setActiveTab] = useState<'textbook' | 'explanation' | 'audio' | 'dpp' | 'fingertips' | 'mindmap'>('textbook');
  const [explanationLang, setExplanationLang] = useState<'hinglish' | 'english' | 'hindi'>('hinglish');

  // Compute matching Physics mind maps for the current chapter
  const matchingPhysicsMaps = React.useMemo(() => {
    if (!chapter) return [];
    const chSlug = chapter.slug?.toLowerCase() || '';
    const chTitle = chapter.title?.toLowerCase() || '';
    return PHYSICS_MIND_MAPS.filter(
      (m) =>
        m.chapterSlug.toLowerCase() === chSlug ||
        m.chapterTitle.toLowerCase() === chTitle ||
        chTitle.includes(m.chapterTitle.toLowerCase()) ||
        m.chapterTitle.toLowerCase().includes(chTitle)
    );
  }, [chapter]);

  // Compute matching Chemistry mind map for the current chapter
  const matchingChemistryMap = React.useMemo(() => {
    if (!chapter) return undefined;
    return getChemistryMindMapForChapter({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      classLevel: classLevel?.name?.includes('12') ? 12 : 11,
      subjectName: subject?.name || '',
    });
  }, [chapter, classLevel, subject]);

  // DPP State
  const [dppQuestions, setDppQuestions] = useState<QuestionItem[]>([]);
  const [selectedDppAnswers, setSelectedDppAnswers] = useState<Record<string, string>>({});
  const [dppSubmitted, setDppSubmitted] = useState(false);
  const [dppResult, setDppResult] = useState<any>(null);
  const [dppSubmitting, setDppSubmitting] = useState(false);

  // MTG Fingertips State
  const [mtgQuestions, setMtgQuestions] = useState<QuestionItem[]>([]);
  const [selectedMtgAnswers, setSelectedMtgAnswers] = useState<Record<string, string>>({});
  const [mtgSubmitted, setMtgSubmitted] = useState(false);
  const [mtgResult, setMtgResult] = useState<any>(null);
  const [mtgSubmitting, setMtgSubmitting] = useState(false);

  // Chapter celebration modal
  const [showCelebration, setShowCelebration] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Phase 7: Active NCERT Recall Checkpoint State
  const [recallAnswer, setRecallAnswer] = useState('');
  const [recallVerified, setRecallVerified] = useState(false);
  const [recallError, setRecallError] = useState(false);

  // NCERT Intelligent Reader Visual State
  const [readingMode, setReadingMode] = useState<ReadingMode>('learning');
  const [showHighlights, setShowHighlights] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [subjectChapters, setSubjectChapters] = useState<SidebarChapter[]>([]);

  // Compute effective chapters tree for the sidebar
  const effectiveChaptersList: SidebarChapter[] = React.useMemo(() => {
    if (subjectChapters && subjectChapters.length > 0) {
      return subjectChapters;
    }
    if (!chapter) return [];
    return [
      {
        id: chapter.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        slug: chapter.slug,
        topics: chapter.topicsList.map((t) => ({
          id: t.id,
          topicNumber: t.topicNumber,
          title: t.title,
        })),
      },
    ];
  }, [subjectChapters, chapter]);

  // Fetch topic details
  useEffect(() => {
    let isMounted = true;
    async function fetchTopic() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ncert/topic/${topicId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setTopic(data.topic);
          setChapter(data.chapter);
          setSubject(data.subject);
          setClassLevel(data.classLevel);
          setUnit(data.unit);
          setNavigation(data.navigation);
          setProgress(data.progress);
          if (data.subjectChapters && data.subjectChapters.length > 0) {
            setSubjectChapters(data.subjectChapters);
          }

          if (data.progress?.dppCompleted) {
            setDppSubmitted(true);
          }
        }
      } catch (err) {
        console.error('Failed to load topic:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTopic();
    return () => {
      isMounted = false;
    };
  }, [topicId]);

  // Load DPP questions when switching to DPP tab
  useEffect(() => {
    if (activeTab === 'dpp' && dppQuestions.length === 0) {
      fetch(`/api/ncert/topic/${topicId}/dpp`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setDppQuestions(data.questions || []);
          }
        })
        .catch(console.error);
    }
  }, [activeTab, topicId, dppQuestions.length]);

  // Load MTG Fingertips questions when switching to Fingertips tab
  useEffect(() => {
    if (activeTab === 'fingertips' && mtgQuestions.length === 0) {
      fetch(`/api/ncert/topic/${topicId}/fingertips`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setMtgQuestions(data.questions || []);
          }
        })
        .catch(console.error);
    }
  }, [activeTab, topicId, mtgQuestions.length]);

  // Mark topic as completed
  const handleMarkComplete = async () => {
    try {
      const res = await fetch(`/api/ncert/topic/${topicId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          explanationUsed: activeTab === 'explanation',
          audioListened: activeTab === 'audio',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress((prev) =>
          prev ? { ...prev, status: 'COMPLETED', contentRead: true } : null
        );
        if (data.isChapterCompleted) {
          setShowCelebration(true);
        }
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  // Submit DPP
  const handleSubmitDpp = async () => {
    if (Object.keys(selectedDppAnswers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setDppSubmitting(true);
    try {
      const answersPayload = Object.entries(selectedDppAnswers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const res = await fetch(`/api/ncert/topic/${topicId}/dpp/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();
      if (data.success) {
        setDppResult({
          scorePercentage: data.scorePercentage,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          results: data.results,
        });
        setDppSubmitted(true);
        setProgress((prev) =>
          prev
            ? {
                ...prev,
                status: 'COMPLETED',
                dppCompleted: true,
                dppScore: data.scorePercentage,
              }
            : null
        );

        if (data.isChapterCompleted) {
          setShowCelebration(true);
        }
      }
    } catch (err) {
      console.error('Failed to submit DPP:', err);
    } finally {
      setDppSubmitting(false);
    }
  };

  // Submit MTG Fingertips
  const handleSubmitMtg = async () => {
    if (Object.keys(selectedMtgAnswers).length === 0) {
      alert('Please answer at least one MTG question before submitting.');
      return;
    }

    setMtgSubmitting(true);
    try {
      const answersPayload = Object.entries(selectedMtgAnswers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const res = await fetch(`/api/ncert/topic/${topicId}/fingertips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();
      if (data.success) {
        setMtgResult({
          scorePercentage: data.scorePercentage,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          results: data.results,
        });
        setMtgSubmitted(true);
        setProgress((prev) =>
          prev ? { ...prev, status: 'COMPLETED' } : null
        );

        if (data.isChapterCompleted) {
          setShowCelebration(true);
        }
      }
    } catch (err) {
      console.error('Failed to submit MTG practice:', err);
    } finally {
      setMtgSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Kriti NEET" subtitle="NCERT Learning System" showBack backHref="/ncert">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#464555]">
            Loading NCERT Content & Provenance...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!topic || !chapter) {
    return (
      <AppShell title="Kriti NEET" subtitle="NCERT Learning System" showBack backHref="/ncert">
        <div className="text-center py-16 space-y-4">
          <h2 className="text-xl font-bold text-[#ba1a1a]">Topic Not Found</h2>
          <p className="text-sm text-[#464555]">The requested NCERT topic could not be located.</p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 bg-[#3525cd] text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <StitchIcon name="arrow_back" size={16} />
            <span>Return to NCERT Index</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Kriti NEET"
      subtitle=""
      showBack={false}
      hideNav={true}
      fluid={true}
    >
      <div className="flex flex-col lg:flex-row -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar: NCERT Chapters & Topics Tree */}
        <NCERTSidebar
          subjectName={subject?.name || 'Physics'}
          classLevelName={classLevel?.name || 'Class 11'}
          currentChapterId={chapter.id}
          currentTopicId={topic.id}
          chapters={effectiveChaptersList}
          isOpenMobile={sidebarMobileOpen}
          onCloseMobile={() => setSidebarMobileOpen(false)}
        />

        {/* Right / Main Reading & Learning Area */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#fbfbfe]">
          {/* Header with Breadcrumb & Reading Mode Switcher matching reference */}
          <NCERTHeader
            classLevelName={classLevel?.name || 'Class 11'}
            subjectName={subject?.name || 'Physics'}
            chapterTitle={chapter.title}
            chapterNumber={chapter.chapterNumber}
            chapterId={chapter.id}
            topicNumber={topic.topicNumber}
            readingMode={readingMode}
            onReadingModeChange={setReadingMode}
            onToggleSidebarMobile={() => setSidebarMobileOpen(true)}
          />

          <div className="p-3 sm:p-6 space-y-6 flex-1 pb-24">
            {/* Compact Pillar Quick Actions Strip */}
            <section className="bg-white rounded-2xl p-1 border border-[#e9edff] shadow-2xs flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('textbook')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'textbook'
                    ? 'bg-[#3525cd] text-white shadow-2xs'
                    : 'text-[#464555] hover:bg-[#f1f3ff]'
                }`}
              >
                <StitchIcon name="auto_stories" size={14} />
                <span>📖 NCERT Text</span>
              </button>

              <button
                onClick={() => setActiveTab('explanation')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'explanation'
                    ? 'bg-[#3525cd] text-white shadow-2xs'
                    : 'text-[#464555] hover:bg-[#f1f3ff]'
                }`}
              >
                <StitchIcon name="psychology" size={14} />
                <span>🧠 AI Explanation</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'audio'
                    ? 'bg-[#3525cd] text-white shadow-2xs'
                    : 'text-[#464555] hover:bg-[#f1f3ff]'
                }`}
              >
                <StitchIcon name="headphones" size={14} />
                <span>🎧 Audio Capsule</span>
              </button>

              <button
                onClick={() => setActiveTab('dpp')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'dpp'
                    ? 'bg-[#3525cd] text-white shadow-2xs'
                    : 'text-[#464555] hover:bg-[#f1f3ff]'
                }`}
              >
                <StitchIcon name="local_fire_department" size={14} />
                <span>🎯 DPP {progress?.dppCompleted ? '✓' : ''}</span>
              </button>

              <button
                onClick={() => setActiveTab('fingertips')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'fingertips'
                    ? 'bg-[#3525cd] text-white shadow-2xs'
                    : 'text-[#464555] hover:bg-[#f1f3ff]'
                }`}
              >
                <StitchIcon name="checklist" size={14} />
                <span>📚 MTG {mtgSubmitted ? '✓' : ''}</span>
              </button>

              <Link
                href={`/ncert/chapter/${chapter?.id || ''}/mindmap`}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-[#464555] hover:bg-[#3525cd] hover:text-white"
              >
                <StitchIcon name="account_tree" size={14} />
                <span>🗺️ Mind Map</span>
              </Link>
            </section>

            {/* TAB 1: NCERT Textbook Content (Standardized Reader Engine) */}
            {activeTab === 'textbook' && (
              <NCERTSectionView
                topic={topic}
                subjectName={subject?.name || 'Physics'}
                readingMode={readingMode}
                showHighlights={showHighlights}
                onToggleHighlights={setShowHighlights}
                onImageClick={(src) => setZoomedImage(src)}
                prevTopic={navigation?.prevTopic}
                nextTopic={navigation?.nextTopic}
                onFinishChapter={() => setShowCelebration(true)}
                onOpenDpp={() => setActiveTab('dpp')}
                onOpenMtg={() => setActiveTab('fingertips')}
                recallState={{
                  answer: recallAnswer,
                  verified: recallVerified,
                  error: recallError,
                  onAnswerChange: (val) => {
                    setRecallAnswer(val);
                    setRecallError(false);
                  },
                  onVerify: () => {
                    if (recallAnswer.trim().length >= 3) {
                      setRecallVerified(true);
                      setRecallError(false);
                    } else {
                      setRecallError(true);
                    }
                  },
                }}
              />
            )}

        {/* TAB 2: AI Hinglish Explanation */}
        {activeTab === 'explanation' && (
          <article className="bg-white rounded-2xl p-5 sm:p-8 border border-[#e9edff] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f3ff] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                  <StitchIcon name="psychology" size={18} />
                </span>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#141b2b]">
                    AI Conceptual Breakdown
                  </h3>
                  <p className="text-xs text-[#777587]">
                    NEET UG 2027 Pattern Analysis & High-Yield Simplification
                  </p>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center bg-[#f1f3ff] p-1 rounded-xl">
                <button
                  onClick={() => setExplanationLang('hinglish')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    explanationLang === 'hinglish'
                      ? 'bg-white text-[#3525cd] shadow-2xs'
                      : 'text-[#464555] hover:text-[#3525cd]'
                  }`}
                >
                  Hinglish
                </button>
                <button
                  onClick={() => setExplanationLang('english')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    explanationLang === 'english'
                      ? 'bg-white text-[#3525cd] shadow-2xs'
                      : 'text-[#464555] hover:text-[#3525cd]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setExplanationLang('hindi')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    explanationLang === 'hindi'
                      ? 'bg-white text-[#3525cd] shadow-2xs'
                      : 'text-[#464555] hover:text-[#3525cd]'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Explanation Body */}
            <div className="bg-[#f9f9ff] rounded-2xl p-5 sm:p-6 border border-[#e9edff] leading-relaxed text-sm sm:text-base text-[#141b2b] whitespace-pre-line space-y-3">
              {explanationLang === 'hinglish' && topic.explanations.hinglish}
              {explanationLang === 'english' && topic.explanations.english}
              {explanationLang === 'hindi' && topic.explanations.hindi}
            </div>

            {/* High-Yield Exam Traps & Tips Capsule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#fff9e6] rounded-2xl p-4 border border-[#ffe082] flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffc107] text-[#5d4037] flex items-center justify-center flex-shrink-0">
                  <StitchIcon name="warning" size={17} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#8d6e63] uppercase tracking-wide block mb-1">
                    NEET Trap Alert • {topic.title}
                  </span>
                  <p className="text-[#3e2723]">
                    Focus on verbatim NCERT distinctions and exceptional cases in {topic.title}. NTA frequently frames assertion-reason and match-the-column questions around exceptions, specific examples, and classification boundaries.
                  </p>
                </div>
              </div>

              <div className="bg-[#e8f5e9] rounded-2xl p-4 border border-[#a5d6a7] flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4caf50] text-white flex items-center justify-center flex-shrink-0">
                  <StitchIcon name="auto_awesome" size={17} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#2e7d32] uppercase tracking-wide block mb-1">
                    Active Recall Key
                  </span>
                  <p className="text-[#1b5e20]">
                    Review the {topic.subtopics.length > 0 ? `${topic.subtopics.length} subtopics` : 'core concepts'} of {topic.title} before attempting the Topic DPP and MTG Fingertips practice questions.
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* TAB 3: Audio Capsule with Reusable AI Rabbit Teacher */}
        {activeTab === 'audio' && (
          <AIRabbitTeacher
            topicTitle={topic.title}
            topicNumber={topic.topicNumber}
            audioScripts={topic.audioScripts}
            onTopicCompleteSuggested={() => {
              // Suggest moving to DPP
            }}
          />
        )}

        {/* TAB 4: Topic DPP (Daily Practice Problem) */}
        {activeTab === 'dpp' && (
          <article className="bg-white rounded-2xl p-5 sm:p-8 border border-[#e9edff] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f3ff] flex-wrap gap-2">
              <div>
                <h3 className="font-headline font-bold text-base sm:text-lg text-[#141b2b]">
                  Topic DPP: {topic.title}
                </h3>
                <p className="text-xs text-[#777587]">
                  {dppQuestions.length} High-Yield NEET Questions on this section
                </p>
              </div>

              {dppSubmitted && (
                <div className="inline-flex items-center gap-2 bg-[#e7fbf1] text-[#00714d] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#6cf8bb]">
                  <StitchIcon name="verified" size={16} />
                  <span>
                    Score: {dppResult?.scorePercentage ?? progress?.dppScore ?? 100}%
                  </span>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {dppQuestions.map((q, qIndex) => {
                const selected = selectedDppAnswers[q.id];
                const submittedResult = dppResult?.results?.find((r: any) => r.questionId === q.id);

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-[#e2dfff] text-[#3525cd] px-2.5 py-0.5 rounded-lg">
                        Q{qIndex + 1} • {q.exam || 'NEET Standard'}
                      </span>
                      <span className="text-[11px] font-semibold text-[#777587]">
                        Difficulty: {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-[#141b2b] leading-relaxed">
                      {q.text}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt) => {
                        const isSelected = selected === opt.key;
                        let optionStyle =
                          'bg-white text-[#141b2b] border-[#e9edff] hover:border-[#3525cd]';

                        if (dppSubmitted && submittedResult) {
                          if (opt.key === submittedResult.correctOption) {
                            optionStyle =
                              'bg-[#e7fbf1] text-[#00714d] border-[#6cf8bb] font-bold';
                          } else if (
                            isSelected &&
                            opt.key !== submittedResult.correctOption
                          ) {
                            optionStyle =
                              'bg-[#ffedea] text-[#ba1a1a] border-[#ffb4ab] font-bold';
                          }
                        } else if (isSelected) {
                          optionStyle =
                            'bg-[#e2dfff] text-[#3525cd] border-[#3525cd] font-bold shadow-2xs';
                        }

                        return (
                          <button
                            key={opt.key}
                            disabled={dppSubmitted}
                            onClick={() =>
                              setSelectedDppAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt.key,
                              }))
                            }
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-2.5 transition-all ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {dppSubmitted && submittedResult && (
                      <div
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          submittedResult.isCorrect
                            ? 'bg-[#e7fbf1] text-[#004d33] border border-[#a7e8ca]'
                            : 'bg-[#fff0ed] text-[#8c1d18] border border-[#fcc8be]'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1">
                          <StitchIcon
                            name={
                              submittedResult.isCorrect
                                ? 'check_circle'
                                : 'cancel'
                            }
                            size={14}
                          />
                          <span>
                            {submittedResult.isCorrect
                              ? 'Correct Answer!'
                              : `Incorrect. Correct Option is (${submittedResult.correctOption})`}
                          </span>
                        </div>
                        <p>{submittedResult.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DPP Action Toolbar */}
            <div className="pt-4 border-t border-[#f1f3ff] flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-[#777587]">
                Answered: {Object.keys(selectedDppAnswers).length} / {dppQuestions.length}
              </span>

              {!dppSubmitted ? (
                <button
                  disabled={dppSubmitting}
                  onClick={handleSubmitDpp}
                  className="bg-[#3525cd] hover:bg-[#2b1ea8] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2"
                >
                  <StitchIcon name="send" size={16} />
                  <span>{dppSubmitting ? 'Evaluating...' : 'Submit Topic DPP'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDppSubmitted(false);
                      setDppResult(null);
                      setSelectedDppAnswers({});
                    }}
                    className="bg-[#f1f3ff] text-[#3525cd] px-4 py-2 rounded-xl text-xs font-bold border border-[#e1e8fd] hover:bg-[#e2dfff] transition-all"
                  >
                    Retake DPP
                  </button>
                  <button
                    onClick={() => setActiveTab('fingertips')}
                    className="bg-[#3525cd] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2b1ea8] transition-all flex items-center gap-1.5"
                  >
                    <span>Practice MTG Questions</span>
                    <StitchIcon name="arrow_forward" size={15} />
                  </button>
                </div>
              )}
            </div>
          </article>
        )}

        {/* TAB 5: MTG Fingertips Practice */}
        {activeTab === 'fingertips' && (
          <article className="bg-white rounded-2xl p-5 sm:p-8 border border-[#e9edff] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f3ff] flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-[#3525cd] text-white px-2.5 py-0.5 rounded-md">
                    MTG Fingertips Practice
                  </span>
                  <span className="text-xs text-[#777587]">Source: MTG NCERT at your Fingertips</span>
                </div>
                <h3 className="font-headline font-bold text-base sm:text-lg text-[#141b2b] mt-1">
                  Topic {topic.topicNumber}: {topic.title}
                </h3>
              </div>

              {mtgSubmitted && (
                <div className="inline-flex items-center gap-2 bg-[#e7fbf1] text-[#00714d] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#6cf8bb]">
                  <StitchIcon name="verified" size={16} />
                  <span>Score: {mtgResult?.scorePercentage ?? 100}%</span>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {mtgQuestions.map((q, qIndex) => {
                const selected = selectedMtgAnswers[q.id];
                const submittedResult = mtgResult?.results?.find((r: any) => r.questionId === q.id);

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-[#e2dfff] text-[#3525cd] px-2.5 py-0.5 rounded-lg">
                        Q{qIndex + 1} • MTG Fingertips
                      </span>
                      <span className="text-[11px] font-semibold text-[#777587]">
                        Difficulty: {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-[#141b2b] leading-relaxed">
                      {q.text}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt) => {
                        const isSelected = selected === opt.key;
                        let optionStyle =
                          'bg-white text-[#141b2b] border-[#e9edff] hover:border-[#3525cd]';

                        if (mtgSubmitted && submittedResult) {
                          if (opt.key === submittedResult.correctOption) {
                            optionStyle =
                              'bg-[#e7fbf1] text-[#00714d] border-[#6cf8bb] font-bold';
                          } else if (
                            isSelected &&
                            opt.key !== submittedResult.correctOption
                          ) {
                            optionStyle =
                              'bg-[#ffedea] text-[#ba1a1a] border-[#ffb4ab] font-bold';
                          }
                        } else if (isSelected) {
                          optionStyle =
                            'bg-[#e2dfff] text-[#3525cd] border-[#3525cd] font-bold shadow-2xs';
                        }

                        return (
                          <button
                            key={opt.key}
                            disabled={mtgSubmitted}
                            onClick={() =>
                              setSelectedMtgAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt.key,
                              }))
                            }
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-2.5 transition-all ${optionStyle}`}
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
                    {mtgSubmitted && submittedResult && (
                      <div
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          submittedResult.isCorrect
                            ? 'bg-[#e7fbf1] text-[#004d33] border border-[#a7e8ca]'
                            : 'bg-[#fff0ed] text-[#8c1d18] border border-[#fcc8be]'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1">
                          <StitchIcon
                            name={
                              submittedResult.isCorrect
                                ? 'check_circle'
                                : 'cancel'
                            }
                            size={14}
                          />
                          <span>
                            {submittedResult.isCorrect
                              ? 'Correct Answer!'
                              : `Incorrect. Correct Option is (${submittedResult.correctOption})`}
                          </span>
                        </div>
                        <p>{submittedResult.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* MTG Action Toolbar */}
            <div className="pt-4 border-t border-[#f1f3ff] flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-[#777587]">
                Answered: {Object.keys(selectedMtgAnswers).length} / {mtgQuestions.length} Questions
              </span>

              {!mtgSubmitted ? (
                <button
                  disabled={mtgSubmitting}
                  onClick={handleSubmitMtg}
                  className="bg-[#3525cd] hover:bg-[#2b1ea8] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2"
                >
                  <StitchIcon name="send" size={16} />
                  <span>{mtgSubmitting ? 'Evaluating...' : 'Submit MTG Practice'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMtgSubmitted(false);
                      setMtgResult(null);
                      setSelectedMtgAnswers({});
                    }}
                    className="bg-[#f1f3ff] text-[#3525cd] px-4 py-2 rounded-xl text-xs font-bold border border-[#e1e8fd] hover:bg-[#e2dfff] transition-all"
                  >
                    Retake Practice
                  </button>
                  {navigation?.nextTopic && (
                    <Link
                      href={`/ncert/topic/${navigation.nextTopic.id}`}
                      className="bg-[#006c49] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#005237] transition-all flex items-center gap-1.5"
                    >
                      <span>Next Topic: {navigation.nextTopic.topicNumber}</span>
                      <StitchIcon name="arrow_forward" size={15} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </article>
        )}

        {/* TAB 6: High-Yield Chapter Mind Map */}
        {activeTab === 'mindmap' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e9edff] shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f1f3ff] text-[#3525cd] flex items-center justify-center mx-auto shadow-xs">
                <StitchIcon name="account_tree" size={28} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#141b2b]">
                  {chapter?.title || 'Chapter'} Mind Map
                </h3>
                <p className="text-xs text-[#777587] max-w-md mx-auto mt-1">
                  Open the full dedicated high-resolution visual mind map viewer with pan, zoom, fit-to-screen, and print support.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={`/ncert/chapter/${chapter?.id || ''}/mindmap`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <StitchIcon name="fullscreen" size={18} />
                  <span>Launch Dedicated Mind Map Viewer</span>
                </Link>
              </div>
            </div>
          </section>
        )}
          </div>
        </div>
      </div>

      {/* Bottom Persistent Navigation Bar (for non-textbook tabs) */}
      {activeTab !== 'textbook' && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e9edff] p-3 sm:p-4 transition-all shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {navigation?.prevTopic ? (
              <Link
                href={`/ncert/topic/${navigation.prevTopic.id}`}
                className="flex items-center gap-1.5 text-xs font-bold text-[#464555] hover:text-[#3525cd] p-2 rounded-xl hover:bg-[#f1f3ff] transition-all"
              >
                <StitchIcon name="arrow_back" size={16} />
                <span className="hidden sm:inline">
                  Prev: {navigation.prevTopic.topicNumber}
                </span>
                <span className="sm:hidden">Prev</span>
              </Link>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('fingertips')}
                className="bg-[#f1f3ff] text-[#3525cd] hover:bg-[#e2dfff] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border border-[#e1e8fd] transition-all flex items-center gap-1.5"
              >
                <StitchIcon name="checklist" size={16} />
                <span>MTG Practice</span>
              </button>

              {navigation?.nextTopic ? (
                <Link
                  href={`/ncert/topic/${navigation.nextTopic.id}`}
                  className="bg-[#3525cd] hover:bg-[#2b1ea8] text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="hidden sm:inline">
                    Next: {navigation.nextTopic.topicNumber} {navigation.nextTopic.title}
                  </span>
                  <span className="sm:hidden">
                    Next: {navigation.nextTopic.topicNumber}
                  </span>
                  <StitchIcon name="arrow_forward" size={16} />
                </Link>
              ) : (
                <button
                  onClick={() => setShowCelebration(true)}
                  className="bg-[#006c49] hover:bg-[#005237] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <StitchIcon name="emoji_events" size={17} />
                  <span>Finish Chapter 🎉</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

        {/* Chapter Completed Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#e9edff] shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 rounded-full bg-[#e7fbf1] text-[#006c49] mx-auto flex items-center justify-center text-3xl shadow-xs">
                🎉
              </div>

              <div>
                <span className="text-xs font-bold text-[#006c49] uppercase tracking-wider block">
                  Chapter Completed!
                </span>
                <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] mt-1">
                  Ch {chapter.chapterNumber}: {chapter.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#464555] mt-2">
                  All topics, NCERT diagrams, and Fingertips practice for this chapter are complete! Proceed to mastery:
                </p>
              </div>

              {/* Next Steps Reinforcement Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-left">
                <Link
                  href={`/ncert/chapter/${chapter.id}?tab=mindmap`}
                  className="p-3 rounded-xl bg-[#f9f9ff] hover:bg-[#e2dfff] border border-[#e9edff] text-xs font-semibold text-[#141b2b] flex items-center gap-2 transition-all"
                >
                  <StitchIcon name="account_tree" size={17} className="text-[#3525cd]" />
                  <span>Mind Map</span>
                </Link>

                <Link
                  href={`/flashcards?chapter=${encodeURIComponent(chapter.title)}`}
                  className="p-3 rounded-xl bg-[#f9f9ff] hover:bg-[#e2dfff] border border-[#e9edff] text-xs font-semibold text-[#141b2b] flex items-center gap-2 transition-all"
                >
                  <StitchIcon name="style" size={17} className="text-[#3525cd]" />
                  <span>Flashcards</span>
                </Link>

                <Link
                  href={`/practice?chapterId=${chapter.id}`}
                  className="p-3 rounded-xl bg-[#f9f9ff] hover:bg-[#e2dfff] border border-[#e9edff] text-xs font-semibold text-[#141b2b] flex items-center gap-2 transition-all"
                >
                  <StitchIcon name="quiz" size={17} className="text-[#3525cd]" />
                  <span>Full Chapter Practice</span>
                </Link>

                <Link
                  href={`/ncert/chapter/${chapter.id}/test`}
                  className="p-3 rounded-xl bg-[#e2dfff] hover:bg-[#d6def7] border border-[#3525cd] text-xs font-bold text-[#3525cd] flex items-center gap-2 transition-all shadow-2xs"
                >
                  <StitchIcon name="assignment" size={17} className="text-[#3525cd]" />
                  <span>MTG Chapter Test</span>
                </Link>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCelebration(false)}
                  className="flex-1 bg-[#f1f3ff] text-[#464555] py-2.5 rounded-xl text-xs font-bold hover:bg-[#e2e7f8] transition-all"
                >
                  Stay on Topic
                </button>
                <Link
                  href="/ncert"
                  className="flex-1 bg-[#3525cd] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#2b1ea8] transition-all shadow-xs"
                >
                  Next Chapter
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Zoomed Image Lightbox */}
        {zoomedImage && (
          <div
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 shadow-2xl relative">
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
              >
                ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomedImage}
                alt="NCERT diagram high-res"
                className="max-h-[82vh] object-contain mx-auto rounded-lg"
              />
            </div>
          </div>
        )}
    </AppShell>
  );
}
