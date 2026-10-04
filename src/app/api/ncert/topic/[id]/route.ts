import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await resolveUser(req);

    // Find topic by ID or by topicNumber if passed (e.g. "2.1")
    let topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        subtopics: {
          orderBy: { orderIndex: 'asc' },
        },
        chapter: {
          include: {
            unit: {
              include: {
                subject: {
                  include: {
                    classLevel: true,
                  },
                },
              },
            },
            topics: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                topicNumber: true,
                title: true,
                orderIndex: true,
              },
            },
          },
        },
      },
    });

    if (!topic) {
      // Try finding by topicNumber
      const topicByNum = await prisma.topic.findFirst({
        where: { topicNumber: id },
        include: {
          subtopics: {
            orderBy: { orderIndex: 'asc' },
          },
          chapter: {
            include: {
              unit: {
                include: {
                  subject: {
                    include: {
                      classLevel: true,
                    },
                  },
                },
              },
              topics: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  topicNumber: true,
                  title: true,
                  orderIndex: true,
                },
              },
            },
          },
        },
      });

      if (!topicByNum) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
      topic = topicByNum;
    }

    // Fetch user progress for all topics in this chapter to display the stepper
    const allTopicIds = topic.chapter.topics.map((t) => t.id);
    const userProgressRecords = await prisma.topicProgress.findMany({
      where: {
        userId: user.id,
        topicId: { in: allTopicIds },
      },
    });

    const progressMap = new Map<string, (typeof userProgressRecords)[0]>();
    for (const p of userProgressRecords) {
      progressMap.set(p.topicId, p);
    }

    // Determine current user progress on this topic
    let currentProgress = progressMap.get(topic.id);
    if (!currentProgress) {
      // Auto-initialize to IN_PROGRESS when student opens it
      currentProgress = await prisma.topicProgress.create({
        data: {
          userId: user.id,
          topicId: topic.id,
          status: 'IN_PROGRESS',
        },
      });
    }

    // Compute previous and next topics in this chapter
    const currentOrder = topic.orderIndex;
    const sortedTopics = [...topic.chapter.topics].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const currentIndex = sortedTopics.findIndex((t) => t.id === topic.id);

    const prevTopic = currentIndex > 0 ? sortedTopics[currentIndex - 1] : null;
    const nextTopic =
      currentIndex < sortedTopics.length - 1
        ? sortedTopics[currentIndex + 1]
        : null;
    const isLastTopicInChapter = currentIndex === sortedTopics.length - 1;

    // Check if entire chapter is completed
    const completedCount = sortedTopics.filter(
      (t) => progressMap.get(t.id)?.status === 'COMPLETED'
    ).length;
    const isChapterCompleted =
      sortedTopics.length > 0 && completedCount === sortedTopics.length;

    // Fetch relevant figures for this chapter/topic by page proximity
    let figures: any[] = [];
    if (topic.pageStart) {
      figures = await prisma.contentFigure.findMany({
        where: {
          chapterId: topic.chapterId,
          pageNumber: {
            gte: Math.max(1, topic.pageStart - 1),
            lte: (topic.pageEnd || topic.pageStart) + 1,
          },
        },
        take: 8,
        orderBy: { pageNumber: 'asc' },
      });
    }

    if (!figures || figures.length === 0) {
      figures = await prisma.contentFigure.findMany({
        where: { chapterId: topic.chapterId },
        take: 6,
        orderBy: { pageNumber: 'asc' },
      });
    }

    // Fetch relevant tables for this chapter/topic
    const tables = await prisma.contentTable.findMany({
      where: { chapterId: topic.chapterId },
      take: 4,
      orderBy: { pageNumber: 'asc' },
    });

    // Count DPP questions available
    const dppQuestionCount = await prisma.question.count({
      where: {
        OR: [{ topicId: topic.id }, { chapterId: topic.chapterId }],
      },
    });

    // Count MTG Fingertips questions for this topic
    const mtgQuestionCount = await prisma.question.count({
      where: {
        topicId: topic.id,
        sourceType: 'FINGERTIPS',
      },
    });

    // Fetch sibling chapters of the subject for the full sidebar chapter tree
    const subjectChapters = topic.chapter.unit?.subject?.id
      ? await prisma.chapter.findMany({
          where: {
            unit: { subjectId: topic.chapter.unit.subject.id },
            slug: { not: { startsWith: 'test-' } },
          },
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            slug: true,
            topics: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                topicNumber: true,
                title: true,
              },
            },
          },
        })
      : [];

    return NextResponse.json({
      success: true,
      subjectChapters,
      topic: {
        id: topic.id,
        topicNumber: topic.topicNumber,
        title: topic.title,
        slug: topic.slug,
        orderIndex: topic.orderIndex,
        pageStart: topic.pageStart,
        pageEnd: topic.pageEnd,
        sourceProvenance: topic.sourceProvenance,
        contentHtml: topic.contentHtml,
        contentMarkdown: topic.contentMarkdown,
        explanations: {
          hinglish: topic.hinglishExplanation,
          english: topic.englishExplanation,
          hindi: topic.hindiExplanation,
        },
        audioScripts: {
          hinglish: topic.audioScriptHinglish,
          english: topic.audioScriptEnglish,
          hindi: topic.audioScriptHindi,
          audioUrl: topic.audioUrl,
        },
        subtopics: topic.subtopics.map((s) => ({
          id: s.id,
          subtopicNumber: s.subtopicNumber,
          title: s.title,
          orderIndex: s.orderIndex,
          contentHtml: s.contentHtml,
        })),
        figures: figures.map((f) => ({
          id: f.id,
          figureNumber: f.figureNumber,
          caption: f.caption,
          imagePath: f.imagePath,
          pageNumber: f.pageNumber,
        })),
        tables: tables.map((t) => ({
          id: t.id,
          tableNumber: t.tableNumber || '',
          caption: t.title || '',
          htmlContent: `<div class="table-preview p-2 bg-white rounded border border-slate-200">${t.rowsJson || ''}</div>`,
          pageNumber: t.pageNumber,
        })),
      },
      chapter: {
        id: topic.chapter.id,
        chapterNumber: topic.chapter.chapterNumber,
        title: topic.chapter.title,
        slug: topic.chapter.slug,
        ncertBookCode: topic.chapter.ncertBookCode,
        topicsList: sortedTopics.map((t) => {
          const prog = progressMap.get(t.id);
          return {
            id: t.id,
            topicNumber: t.topicNumber,
            title: t.title,
            isCurrent: t.id === topic.id,
            status: prog?.status || 'NOT_STARTED',
            dppCompleted: prog?.dppCompleted || false,
          };
        }),
      },
      unit: topic.chapter.unit
        ? {
            id: topic.chapter.unit.id,
            unitNumber: topic.chapter.unit.unitNumber,
            title: topic.chapter.unit.title,
          }
        : null,
      subject: topic.chapter.unit?.subject
        ? {
            id: topic.chapter.unit.subject.id,
            name: topic.chapter.unit.subject.name,
            code: topic.chapter.unit.subject.code,
          }
        : null,
      classLevel: topic.chapter.unit?.subject?.classLevel
        ? {
            id: topic.chapter.unit.subject.classLevel.id,
            name: topic.chapter.unit.subject.classLevel.name,
            code: topic.chapter.unit.subject.classLevel.code,
            order: topic.chapter.unit.subject.classLevel.order,
          }
        : null,
      navigation: {
        prevTopic,
        nextTopic,
        isLastTopicInChapter,
        isChapterCompleted,
        dppQuestionCount,
        mtgQuestionCount,
      },
      progress: {
        status: currentProgress.status,
        contentRead: currentProgress.contentRead,
        explanationUsed: currentProgress.explanationUsed,
        audioListened: currentProgress.audioListened,
        dppCompleted: currentProgress.dppCompleted,
        dppScore: currentProgress.dppScore,
        completedAt: currentProgress.completedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}
