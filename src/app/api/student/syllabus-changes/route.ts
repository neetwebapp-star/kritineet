import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const changes = await prisma.officialSyllabusChange.findMany({
      include: {
        newVersion: {
          select: {
            versionCode: true,
            title: true,
            publishedAt: true,
            authority: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalChanges: changes.length,
      added: changes.filter((c) => c.changeType === 'ADDED').length,
      removed: changes.filter((c) => c.changeType === 'REMOVED').length,
      modified: changes.filter((c) => c.changeType === 'MODIFIED').length,
      renamed: changes.filter((c) => c.changeType === 'RENAMED').length,
    };

    return NextResponse.json({
      success: true,
      summary,
      changes,
    });
  } catch (error: any) {
    console.error('Error fetching syllabus changes:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
