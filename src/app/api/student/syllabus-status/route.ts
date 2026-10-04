import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const activeSyllabus = await prisma.officialSyllabusVersion.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { publishedAt: 'desc' },
      include: {
        changesAsNew: true,
      },
    });

    if (!activeSyllabus) {
      return NextResponse.json({
        success: false,
        message: 'No active syllabus version found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      syllabus: {
        id: activeSyllabus.id,
        versionCode: activeSyllabus.versionCode,
        examYear: activeSyllabus.examYear,
        authority: activeSyllabus.authority,
        title: activeSyllabus.title,
        sourceUrl: activeSyllabus.sourceUrl,
        documentHash: activeSyllabus.documentHash,
        publishedAt: activeSyllabus.publishedAt,
        effectiveFrom: activeSyllabus.effectiveFrom,
        status: activeSyllabus.status,
        totalUnits: activeSyllabus.totalUnits,
        totalChapters: activeSyllabus.totalChapters,
        totalTopics: activeSyllabus.totalTopics,
        details: activeSyllabus.syllabusJson ? JSON.parse(activeSyllabus.syllabusJson) : null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching syllabus status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
