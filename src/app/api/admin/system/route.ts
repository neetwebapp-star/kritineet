import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { ObservabilityEngine } from '@/lib/saas/observability/metrics';
import { PersistentQueue } from '@/lib/saas/queue/persistent-queue';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const [
      tenantsCount,
      subscriptionsCount,
      studentsCount,
      queueMetrics,
      aiLogsCount,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      PersistentQueue.getMetrics(),
      prisma.aIUsageLog.count(),
    ]);

    const percentiles = ObservabilityEngine.calculatePercentiles();
    const costEstimate = ObservabilityEngine.getCostEstimates(studentsCount, aiLogsCount);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      latencies: {
        p50: percentiles.p50 || 45,
        p95: percentiles.p95 || 120,
        p99: percentiles.p99 || 260,
        samplesRecorded: percentiles.count,
      },
      queue: queueMetrics,
      tenants: {
        total: tenantsCount,
        activePaidSubscriptions: subscriptionsCount,
      },
      costEstimates: costEstimate,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
