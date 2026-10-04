import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const auditRunId = searchParams.get('auditRunId');
    const severity = searchParams.get('severity'); // CRITICAL, WARNING, INFO, PASS, or ALL
    const chapter = searchParams.get('chapter');
    const issueType = searchParams.get('issueType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const offset = (page - 1) * pageSize;

    // If no auditRunId supplied, get latest completed or latest run
    let targetRunId = auditRunId;
    if (!targetRunId) {
      const latest: any[] = await prisma.$queryRawUnsafe(`
        SELECT id FROM NCERTAuditRun ORDER BY createdAt DESC LIMIT 1
      `);
      if (latest.length > 0) {
        targetRunId = latest[0].id;
      }
    }

    if (!targetRunId) {
      return NextResponse.json({
        success: true,
        issues: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      });
    }

    // Build WHERE clause
    const conditions: string[] = [`auditRunId = '${targetRunId.replace(/'/g, "''")}'`];
    if (severity && severity !== 'ALL') {
      conditions.push(`severity = '${severity.replace(/'/g, "''")}'`);
    }
    if (chapter && chapter !== 'ALL') {
      conditions.push(`chapterNumber = ${parseInt(chapter, 10)}`);
    }
    if (issueType && issueType !== 'ALL') {
      conditions.push(`issueType = '${issueType.replace(/'/g, "''")}'`);
    }

    const whereClause = conditions.join(' AND ');

    // Count query
    const countRes: any[] = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM NCERTAuditIssue WHERE ${whereClause}
    `);
    const total = Number(countRes[0]?.count || 0);

    // Data query
    const issues: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        id, auditRunId, severity, issueType, className, subjectName, bookCode,
        chapterNumber, chapterTitle, sectionNumber, topicNumber, sourcePage,
        sourceBlockId, appRecordId, sourceContent, appContent, detectedDifference,
        confidence, recommendedAction, createdAt
      FROM NCERTAuditIssue
      WHERE ${whereClause}
      ORDER BY 
        CASE severity 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'WARNING' THEN 2 
          WHEN 'INFO' THEN 3 
          ELSE 4 
        END ASC,
        chapterNumber ASC,
        sourcePage ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    // Counts breakdown for this run
    const breakdownRes: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'WARNING' THEN 1 END) as warning,
        COUNT(CASE WHEN severity = 'INFO' THEN 1 END) as info,
        COUNT(CASE WHEN severity = 'PASS' THEN 1 END) as pass
      FROM NCERTAuditIssue
      WHERE auditRunId = '${targetRunId.replace(/'/g, "''")}'
    `);

    const counts = breakdownRes[0] || { critical: 0, warning: 0, info: 0, pass: 0 };

    return NextResponse.json({
      success: true,
      auditRunId: targetRunId,
      issues,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      counts: {
        critical: Number(counts.critical),
        warning: Number(counts.warning),
        info: Number(counts.info),
        pass: Number(counts.pass),
        total: Number(counts.critical) + Number(counts.warning) + Number(counts.info) + Number(counts.pass)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
