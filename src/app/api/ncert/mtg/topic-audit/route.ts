import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const classLevel = searchParams.get('classLevel');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const topicId = searchParams.get('topicId');
    const runIdParam = searchParams.get('runId');

    // 1. Fetch audit runs
    const runs: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM MTGTopicAuditRun ORDER BY createdAt DESC`
    );

    if (!runs || runs.length === 0) {
      return NextResponse.json({ error: 'No audit run found. Please run the auditor engine.' }, { status: 404 });
    }

    const postRun = runs.find((r) => r.status === 'POST_REPAIR_AUDIT') || runs[0];
    const preRun = runs.find((r) => r.status === 'PRE_REPAIR_AUDIT') || null;
    const activeRun = runIdParam ? runs.find((r) => r.id === runIdParam) || postRun : postRun;

    const summary = typeof activeRun.summaryJson === 'string' 
      ? JSON.parse(activeRun.summaryJson) 
      : activeRun.summaryJson || {};

    // 2. Fetch evidence if specific topic requested
    let evidenceList: any[] = [];
    if (topicId) {
      evidenceList = await prisma.$queryRawUnsafe(
        `SELECT * FROM MTGTopicAuditEvidence WHERE topicAuditItemId = ? LIMIT 50`,
        topicId
      );
    }

    // 3. Build query for items
    let itemQuery = `SELECT * FROM MTGTopicAuditItem WHERE auditRunId = ?`;
    const params: any[] = [activeRun.id];

    if (subject && subject !== 'ALL') {
      itemQuery += ` AND UPPER(subject) = ?`;
      params.push(subject.toUpperCase());
    }

    if (classLevel && classLevel !== 'ALL') {
      itemQuery += ` AND classLevel LIKE ?`;
      params.push(`%${classLevel}%`);
    }

    if (status && status !== 'ALL') {
      if (status === 'VERIFIED') {
        itemQuery += ` AND status LIKE '%VERIFIED%'`;
      } else if (status === 'UNMAPPED') {
        itemQuery += ` AND status LIKE '%UNMAPPED%'`;
      } else if (status === 'MISPLACED') {
        itemQuery += ` AND status LIKE '%MISPLACED%'`;
      } else if (status === 'PARTIAL') {
        itemQuery += ` AND status LIKE '%PARTIAL%'`;
      } else if (status === 'CORRUPT_TITLE') {
        itemQuery += ` AND status LIKE '%CORRUPT%'`;
      }
    }

    if (search) {
      itemQuery += ` AND (chapterTitle LIKE ? OR topicTitle LIKE ? OR topicNumber LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    itemQuery += ` ORDER BY subject ASC, classLevel ASC, chapterNumber ASC, id ASC`;

    const items: any[] = await prisma.$queryRawUnsafe(itemQuery, ...params);

    // 4. Load repair log and repair queue
    let repairLogSummary: any = null;
    const repairLogPath = path.resolve(process.cwd(), 'docs/MTG_TOPIC_REPAIR_LOG.json');
    if (fs.existsSync(repairLogPath)) {
      try {
        repairLogSummary = JSON.parse(fs.readFileSync(repairLogPath, 'utf-8'));
      } catch (e) {
        console.error('Error parsing repair log:', e);
      }
    }

    let repairQueueSummary = { totalRepairs: 0, byAction: {} as Record<string, number> };
    const repairQueuePath = path.resolve(process.cwd(), 'docs/MTG_TOPIC_REPAIR_QUEUE.json');
    if (fs.existsSync(repairQueuePath)) {
      try {
        const repairData = JSON.parse(fs.readFileSync(repairQueuePath, 'utf-8'));
        repairQueueSummary.totalRepairs = repairData.totalRepairs || 0;
        const byAct: Record<string, number> = {};
        for (const item of (repairData.repairQueue || [])) {
          byAct[item.action] = (byAct[item.action] || 0) + 1;
        }
        repairQueueSummary.byAction = byAct;
      } catch (e) {
        console.error('Error parsing repair queue:', e);
      }
    }

    let examScorerAudit: any = null;
    const scorerAuditPath = path.resolve(process.cwd(), 'docs/MTG_EXAM_SCORER_AUDIT_RESULT.json');
    if (fs.existsSync(scorerAuditPath)) {
      try {
        examScorerAudit = JSON.parse(fs.readFileSync(scorerAuditPath, 'utf-8'));
      } catch (e) {
        console.error('Error parsing exam scorer audit:', e);
      }
    }

    let examScorerRepairLog: any = null;
    const scorerRepairLogPath = path.resolve(process.cwd(), 'docs/MTG_EXAM_SCORER_REPAIR_LOG.json');
    if (fs.existsSync(scorerRepairLogPath)) {
      try {
        examScorerRepairLog = JSON.parse(fs.readFileSync(scorerRepairLogPath, 'utf-8'));
      } catch (e) {
        console.error('Error parsing exam scorer repair log:', e);
      }
    }

    return NextResponse.json({
      activeRunId: activeRun.id,
      postRun: {
        id: postRun.id,
        createdAt: postRun.createdAt,
        totalChapters: postRun.totalChapters,
        totalTopics: postRun.totalTopics,
        totalSourceMCQs: postRun.totalSourceMCQs,
        totalAppMCQs: postRun.totalAppMCQs,
        totalMatched: postRun.totalMatched,
        totalMissing: postRun.totalMissing,
        totalExtra: postRun.totalExtra,
        totalMisplaced: postRun.totalMisplaced,
        totalDuplicates: postRun.totalDuplicates,
        totalBroken: postRun.totalBroken,
        globalParityRate: postRun.globalParityRate,
        globalVerificationRate: postRun.globalVerificationRate,
        chaptersVerified: postRun.chaptersVerified,
        chaptersFailed: postRun.chaptersFailed,
        topicsVerified: postRun.topicsVerified,
        topicsFailed: postRun.topicsFailed,
        status: postRun.status
      },
      preRun: preRun ? {
        id: preRun.id,
        createdAt: preRun.createdAt,
        totalChapters: preRun.totalChapters,
        totalTopics: preRun.totalTopics,
        totalSourceMCQs: preRun.totalSourceMCQs,
        totalAppMCQs: preRun.totalAppMCQs,
        totalMatched: preRun.totalMatched,
        totalMissing: preRun.totalMissing,
        totalExtra: preRun.totalExtra,
        totalMisplaced: preRun.totalMisplaced,
        totalDuplicates: preRun.totalDuplicates,
        totalBroken: preRun.totalBroken,
        globalParityRate: preRun.globalParityRate,
        globalVerificationRate: preRun.globalVerificationRate,
        chaptersVerified: preRun.chaptersVerified,
        chaptersFailed: preRun.chaptersFailed,
        topicsVerified: preRun.topicsVerified,
        topicsFailed: preRun.topicsFailed,
        status: preRun.status
      } : null,
      repairLogSummary: repairLogSummary ? {
        executionCompletedAt: repairLogSummary.executionCompletedAt,
        elapsedSeconds: repairLogSummary.elapsedSeconds,
        chaptersProcessed: repairLogSummary.chaptersProcessed,
        totalCreatedTopics: repairLogSummary.totalCreatedTopics,
        totalRenamedTopics: repairLogSummary.totalRenamedTopics,
        totalMovedQuestions: repairLogSummary.totalMovedQuestions,
        postMcqCount: repairLogSummary.postMcqCount,
        postTopicCount: repairLogSummary.postTopicCount
      } : null,
      repairQueueSummary,
      examScorerAudit: examScorerAudit ? {
        auditRunId: examScorerAudit.auditRunId,
        timestamp: examScorerAudit.timestamp,
        globalMetrics: examScorerAudit.globalMetrics,
        classificationDistribution: examScorerAudit.classificationDistribution,
        totalRepairTasks: examScorerAudit.totalRepairTasks,
        chapterAudit: examScorerAudit.chapterAudit
      } : null,
      examScorerRepairLog: examScorerRepairLog || [],
      itemsCount: items.length,
      items,
      evidence: evidenceList
    });
  } catch (error: any) {
    console.error('Topic audit API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
