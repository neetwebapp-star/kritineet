import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);
    const classLevelParam = searchParams.get('classLevel'); // '11' | '12' | 'all'
    const subjectParam = searchParams.get('subject'); // 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS'

    // Fetch ClassLevels
    const classLevels = await prisma.classLevel.findMany({
      orderBy: { order: 'asc' },
      include: {
        subjects: {
          orderBy: { code: 'asc' },
          include: {
            units: {
              orderBy: { unitNumber: 'asc' },
              include: {
                chapters: {
                  where: {
                    slug: { not: { startsWith: 'test-' } },
                    chapterNumber: { lte: 20 },
                    unitId: { not: null },
                  },
                  orderBy: { chapterNumber: 'asc' },
                  include: {
                    topics: {
                      orderBy: { orderIndex: 'asc' },
                      select: {
                        id: true,
                        topicNumber: true,
                        title: true,
                        slug: true,
                        orderIndex: true,
                        pageStart: true,
                        pageEnd: true,
                        _count: {
                          select: {
                            subtopics: true,
                            questions: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Fetch user topic progress for quick lookup
    const userProgress = await prisma.topicProgress.findMany({
      where: { userId: user.id },
      select: {
        topicId: true,
        status: true,
        contentRead: true,
        explanationUsed: true,
        audioListened: true,
        dppCompleted: true,
        dppScore: true,
        completedAt: true,
      },
    });

    const progressMap = new Map<string, (typeof userProgress)[0]>();
    for (const p of userProgress) {
      progressMap.set(p.topicId, p);
    }

    // Attach progress and filter if params provided
    const hierarchy = classLevels.map((cl) => {
      let filteredSubjects = cl.subjects;
      if (subjectParam) {
        filteredSubjects = filteredSubjects.filter(
          (s) => s.code.toUpperCase() === subjectParam.toUpperCase()
        );
      }

      return {
        id: cl.id,
        name: cl.name,
        code: cl.code,
        order: cl.order,
        subjects: filteredSubjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          units: s.units.map((u) => ({
            id: u.id,
            unitNumber: u.unitNumber,
            title: u.title,
            chapters: u.chapters.map((ch) => {
              const chapterTopics = ch.topics.map((t) => {
                const prog = progressMap.get(t.id);
                return {
                  id: t.id,
                  topicNumber: t.topicNumber,
                  title: t.title,
                  slug: t.slug,
                  orderIndex: t.orderIndex,
                  pageStart: t.pageStart,
                  pageEnd: t.pageEnd,
                  subtopicCount: t._count.subtopics,
                  questionCount: t._count.questions,
                  progress: {
                    status: prog?.status || 'NOT_STARTED',
                    contentRead: prog?.contentRead || false,
                    dppCompleted: prog?.dppCompleted || false,
                    dppScore: prog?.dppScore ?? null,
                    completedAt: prog?.completedAt || null,
                  },
                };
              });

              const completedTopicsCount = chapterTopics.filter(
                (t) => t.progress.status === 'COMPLETED'
              ).length;

              return {
                id: ch.id,
                chapterNumber: ch.chapterNumber,
                ncertBookCode: ch.ncertBookCode,
                title: ch.title,
                slug: ch.slug,
                topicsCount: chapterTopics.length,
                completedTopicsCount,
                isCompleted:
                  chapterTopics.length > 0 &&
                  completedTopicsCount === chapterTopics.length,
                topics: chapterTopics,
              };
            }),
          })),
        })),
      };
    });

    // Quick summary
    let totalChapters = 0;
    let totalTopics = 0;
    let completedTopics = 0;

    for (const cl of hierarchy) {
      for (const s of cl.subjects) {
        for (const u of s.units) {
          for (const ch of u.chapters) {
            totalChapters++;
            totalTopics += ch.topicsCount;
            completedTopics += ch.completedTopicsCount;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalChapters,
        totalTopics,
        completedTopics,
        percentComplete:
          totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      },
      hierarchy,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch NCERT hierarchy' },
      { status: 500 }
    );
  }
}
