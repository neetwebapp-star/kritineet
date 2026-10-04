import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const examYearStr = searchParams.get('examYear');
    const alertLevel = searchParams.get('alertLevel') || '';
    const authority = searchParams.get('authority') || '';
    const isHistoricalStr = searchParams.get('isHistorical');

    // Build filter
    const where: any = {
      status: 'PUBLISHED',
      isNeetRelevant: true,
    };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (alertLevel && alertLevel !== 'ALL') {
      where.alertLevel = alertLevel;
    }

    if (authority && authority !== 'ALL') {
      where.authority = authority;
    }

    if (examYearStr && examYearStr !== 'ALL') {
      where.examYear = parseInt(examYearStr, 10);
    }

    if (isHistoricalStr !== null && isHistoricalStr !== undefined && isHistoricalStr !== 'ALL') {
      where.isHistorical = isHistoricalStr === 'true';
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { aiSummary: { contains: search.trim() } },
        { noticeNumber: { contains: search.trim() } },
      ];
    }

    const notifications = await prisma.officialNotification.findMany({
      where,
      include: {
        source: {
          select: {
            name: true,
            code: true,
            authority: true,
            status: true,
          },
        },
        readStates: {
          where: { userId: user.id },
          select: { readAt: true },
        },
        impacts: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    const items = notifications.map((n) => {
      let facts = null;
      try {
        facts = n.officialFactExtractJson ? JSON.parse(n.officialFactExtractJson) : null;
      } catch (e) {}

      return {
        id: n.id,
        noticeNumber: n.noticeNumber,
        title: n.title,
        authority: n.authority,
        category: n.category,
        alertLevel: n.alertLevel,
        status: n.status,
        examYear: n.examYear,
        isHistorical: n.isHistorical,
        publishedAt: n.publishedAt,
        lastVerifiedAt: n.lastVerifiedAt,
        officialSourceUrl: n.officialSourceUrl,
        officialDocumentUrl: n.officialDocumentUrl,
        documentHash: n.documentHash,
        aiSummary: n.aiSummary,
        aiSummaryEvidence: n.aiSummaryEvidence,
        studentActionRequired: n.studentActionRequired,
        isRead: n.readStates.length > 0,
        facts,
        source: n.source,
        impacts: n.impacts,
      };
    });

    const unreadCount = items.filter((item) => !item.isRead).length;

    return NextResponse.json({
      success: true,
      count: items.length,
      unreadCount,
      notifications: items,
    });
  } catch (error: any) {
    console.error('Error fetching NTA notifications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
