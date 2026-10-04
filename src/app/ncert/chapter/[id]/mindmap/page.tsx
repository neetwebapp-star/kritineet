'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DedicatedMindMapViewer } from '@/components/mindmaps/DedicatedMindMapViewer';
import { getUnifiedMindMapForChapter, UnifiedMindMapMeta } from '@/lib/mindmaps/unified-mindmap-registry';

interface ChapterInfo {
  id: string;
  chapterNumber: number;
  title: string;
  slug: string;
  subject: { name: string; code: string };
  classLevel?: { name: string; code: string } | null;
}

export default function DedicatedChapterMindMapPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<ChapterInfo | null>(null);
  const [mindMap, setMindMap] = useState<UnifiedMindMapMeta | null>(null);

  useEffect(() => {
    if (!chapterId) return;

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ncert/chapter/${encodeURIComponent(chapterId)}`);
        const data = await res.json();
        if (data.success && data.chapter) {
          const ch = data.chapter;
          setChapter(ch);
          const classNum = ch.classLevel?.code?.includes('12') ? 12 : 11;

          // Priority 1: Use mind map directly from chapter API
          if (data.mindMaps && data.mindMaps.length > 0) {
            setMindMap(data.mindMaps[0]);
          } else {
            const matched = getUnifiedMindMapForChapter({
              id: ch.id,
              slug: ch.slug,
              title: ch.title,
              chapterNumber: ch.chapterNumber,
              classLevel: classNum,
              subjectName: ch.subject?.name,
            });
            setMindMap(matched || null);
          }
        } else {
          // Direct fallback resolution if chapter not in API
          const matched = getUnifiedMindMapForChapter({ id: chapterId });
          if (matched) {
            setMindMap(matched);
            setChapter({
              id: matched.chapterId || chapterId,
              chapterNumber: matched.chapterNumber,
              title: matched.chapterTitle,
              slug: matched.chapterSlug,
              subject: { name: matched.subject, code: matched.subject.toUpperCase() },
              classLevel: { name: `Class ${matched.classLevel}`, code: `CLASS_${matched.classLevel}` },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load mindmap for chapter:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0f1d] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#a0aec0] font-headline font-semibold">
          Opening Chapter Mind Map Viewer...
        </p>
      </div>
    );
  }

  return (
    <DedicatedMindMapViewer
      mindMap={mindMap}
      chapterTitle={chapter?.title}
      chapterNumber={chapter?.chapterNumber}
      subjectName={chapter?.subject?.name}
      classLevel={chapter?.classLevel?.code?.includes('12') ? 12 : 11}
      backHref={`/ncert/chapter/${chapterId}`}
      onBack={() => router.push(`/ncert/chapter/${chapterId}`)}
    />
  );
}
