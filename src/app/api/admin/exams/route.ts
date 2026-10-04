import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ExamRegistry } from '@/lib/exam-intelligence/exam-registry';
import { ExamUpdatesEngine } from '@/lib/exam-intelligence/exam-updates-engine';
import { SyllabusEngine } from '@/lib/exam-intelligence/syllabus-engine';
import { ExamPatternVersionEngine } from '@/lib/exam-intelligence/exam-pattern-version-engine';

export async function GET(req: NextRequest) {
  try {
    const editions = await prisma.examEdition.findMany({
      include: {
        exam: true,
        updates: { orderBy: { publicationDate: 'desc' } },
        syllabi: { orderBy: { version: 'desc' } },
        patternVersions: { orderBy: { versionNumber: 'desc' } },
        rules: true,
      },
      orderBy: { editionYear: 'desc' },
    });

    const sources = await prisma.examOfficialSource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ editions, sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin exam data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_UPDATE') {
      const update = await ExamUpdatesEngine.createUpdate(body.params);
      return NextResponse.json({ success: true, update });
    }

    if (action === 'VERIFY_UPDATE') {
      const result = await ExamUpdatesEngine.verifyUpdate(body.updateId, body.adminUserId || 'admin_user');
      return NextResponse.json({ success: true, result });
    }

    if (action === 'CREATE_SOURCE') {
      const source = await ExamRegistry.registerOfficialSource(body.params);
      return NextResponse.json({ success: true, source });
    }

    if (action === 'CREATE_SYLLABUS_VERSION') {
      const syllabus = await SyllabusEngine.createSyllabusVersion(body.params);
      return NextResponse.json({ success: true, syllabus });
    }

    if (action === 'COMPUTE_SYLLABUS_DIFF') {
      const diff = await SyllabusEngine.computeSyllabusDiff(body.fromSyllabusId, body.toSyllabusId);
      return NextResponse.json({ success: true, diff });
    }

    if (action === 'APPLY_SYLLABUS_IMPACT') {
      const result = await SyllabusEngine.applySyllabusContentImpact(body.syllabusId, body.adminUserId);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'CREATE_PATTERN_VERSION') {
      const pattern = await ExamPatternVersionEngine.createPatternVersion(body.params);
      return NextResponse.json({ success: true, pattern });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin exam operation failed' }, { status: 500 });
  }
}
