import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUnifiedMindMapForChapter } from '@/lib/mindmaps/unified-mindmap-registry';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Search by id or slug
    const chapter = await prisma.chapter.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        subject: {
          include: {
            classLevel: true,
          },
        },
        unit: true,
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
          },
        },
      },
    });

    if (!chapter || chapter.chapterNumber > 20 || !chapter.unitId) {
      return NextResponse.json({ success: false, error: 'Chapter not found in active curriculum' }, { status: 404 });
    }

    // Match canonical unified mind map
    const classNum = chapter.subject.classLevel?.code?.includes('12') ? 12 : 11;
    const unifiedMap = getUnifiedMindMapForChapter({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      classLevel: classNum,
      subjectName: chapter.subject.name,
    });
    const matchingMindMaps = unifiedMap ? [unifiedMap] : [];

    return NextResponse.json({
      success: true,
      chapter: {
        id: chapter.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        slug: chapter.slug,
        ncertBookCode: chapter.ncertBookCode,
        subject: chapter.subject,
        unit: chapter.unit,
        classLevel: chapter.subject.classLevel || null,
        topics: chapter.topics,
      },
      mindMaps: matchingMindMaps,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
