import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { HealthService } from '@/lib/production/health-service';
import { ObservabilityService } from '@/lib/production/observability-service';
import { ResilientWorker } from '@/lib/production/resilient-worker';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');

    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const startTime = Date.now();

    // 1. Get Genuine Comprehensive Health Report
    const healthReport = await HealthService.checkSystemHealth(true);

    // 2. Counts and DB stats
    const [
      studentsCount,
      mentorsCount,
      parentsCount,
      verifiedQuestionsCount,
      reviewQueueCount,
      publishedTestsCount,
      aiLogsCount,
      workerHealth,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.question.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.question.count({ where: { verificationStatus: 'PENDING_REVIEW' } }),
      prisma.test.count({ where: { isPublished: true } }),
      prisma.aIUsageLog.count(),
      ResilientWorker.getWorkerHealth(),
    ]);

    const dbLatencyMs = Date.now() - startTime;
    const metrics = ObservabilityService.getMetricsSummary();
    const slowQueries = ObservabilityService.getSlowQueries();
    const alerts = ObservabilityService.getAlerts();

    return NextResponse.json({
      status: healthReport.overallStatus === 'HEALTHY' ? 'OPERATIONAL' : healthReport.overallStatus,
      overallStatus: healthReport.overallStatus,
      timestamp: healthReport.timestamp,
      uptimeSeconds: healthReport.uptimeSeconds,
      components: healthReport.components,
      database: {
        status: healthReport.components.databaseReady.status === 'HEALTHY' ? 'CONNECTED' : healthReport.components.databaseReady.status,
        engine: 'SQLite (Prisma ORM)',
        latencyMs: dbLatencyMs,
        slowQueriesDetected: slowQueries.length,
      },
      worker: workerHealth,
      metrics,
      slowQueries: slowQueries.slice(0, 10),
      alerts: alerts.slice(0, 10),
      questionBank: {
        totalVerified: verifiedQuestionsCount,
        pendingReviewQueue: reviewQueueCount,
        status: reviewQueueCount === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      },
      testEngine: {
        publishedMocks: publishedTestsCount,
        status: 'OPERATIONAL',
      },
      aiProvider: {
        status: 'ACTIVE',
        totalInferencesLogged: aiLogsCount,
        primaryEngine: 'SYSTEM_ENGINE (Local Grounded)',
      },
      usersSummary: {
        students: studentsCount,
        mentors: mentorsCount,
        parents: parentsCount,
      },
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
