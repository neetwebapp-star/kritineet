import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const runs: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        id, createdAt, completedAt, status, targetClass, targetSubject, targetBook,
        totalChapters, auditedChapters, totalSections, auditedSections,
        totalTopics, auditedTopics, totalBlocks, auditedBlocks,
        totalFigures, auditedFigures, totalTables, auditedTables,
        criticalCount, warningCount, infoCount, passCount,
        currentStage, currentProgress, checkpointChapter, errorMessage
      FROM NCERTAuditRun
      ORDER BY createdAt DESC
      LIMIT 20
    `);

    const latestRun = runs.length > 0 ? runs[0] : null;

    return NextResponse.json({
      success: true,
      latestRun,
      history: runs
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
