import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Check NEET 2027 Edition
    const edition2027 = await prisma.examEdition.findFirst({
      where: { editionYear: 2027 },
      include: {
        exam: true,
      },
    });

    // 2. Look for any official notification that explicitly confirmed 2027 date or mode
    const officialDateNotice = await prisma.officialNotification.findFirst({
      where: {
        status: 'PUBLISHED',
        category: 'EXAM_DATE',
        examYear: 2027,
      },
      orderBy: { publishedAt: 'desc' },
    });

    const officialModeNotice = await prisma.officialNotification.findFirst({
      where: {
        status: 'PUBLISHED',
        category: 'EXAM_MODE',
        examYear: 2027,
      },
      orderBy: { publishedAt: 'desc' },
    });

    // 3. Current active syllabus version
    const activeSyllabus = await prisma.officialSyllabusVersion.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { publishedAt: 'desc' },
    });

    // 4. Latest verified notification across all official sources
    const latestVerifiedNotice = await prisma.officialNotification.findFirst({
      where: { status: 'PUBLISHED', isNeetRelevant: true },
      orderBy: { publishedAt: 'desc' },
    });

    // 5. Official sources last check timestamp
    const lastCheck = await prisma.officialSourceCheck.findFirst({
      orderBy: { checkedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      examYear: 2027,
      statusCard: {
        examDate: officialDateNotice
          ? (JSON.parse(officialDateNotice.officialFactExtractJson || '{}').examDate || officialDateNotice.title)
          : 'NEET 2027 exam date has not yet been officially announced.',
        isDateOfficiallyAnnounced: !!officialDateNotice,
        examDateOfficialSource: officialDateNotice?.officialSourceUrl || null,

        examMode: officialModeNotice
          ? (JSON.parse(officialModeNotice.officialFactExtractJson || '{}').examMode || 'Officially Confirmed')
          : 'Not yet officially announced',
        isModeOfficiallyAnnounced: !!officialModeNotice,
        examModeOfficialSource: officialModeNotice?.officialSourceUrl || null,

        syllabusVersion: activeSyllabus
          ? `${activeSyllabus.title} (${activeSyllabus.versionCode})`
          : 'NMC / UGMEB Core Edition (Latest Authoritative)',
        syllabusAuthority: activeSyllabus?.authority || 'UGMEB / NMC',
        syllabusLastVerified: activeSyllabus?.publishedAt || null,

        applicationStatus: 'Not yet open',
        applicationNotice: null,

        lastOfficialUpdate: latestVerifiedNotice
          ? {
              id: latestVerifiedNotice.id,
              title: latestVerifiedNotice.title,
              authority: latestVerifiedNotice.authority,
              publishedAt: latestVerifiedNotice.publishedAt,
              officialDocumentUrl: latestVerifiedNotice.officialDocumentUrl,
              officialSourceUrl: latestVerifiedNotice.officialSourceUrl,
              isHistorical: latestVerifiedNotice.isHistorical,
            }
          : null,

        lastVerifiedAt: lastCheck?.checkedAt || new Date(),
        sourcesMonitored: ['National Testing Agency (NTA)', 'NTA NEET Portal', 'National Medical Commission (NMC)'],
      },
    });
  } catch (error: any) {
    console.error('Error fetching official exam status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
