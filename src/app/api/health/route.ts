import { NextResponse } from 'next/server';
import { HealthService } from '@/lib/production/health-service';
import { PersistentQueue } from '@/lib/saas/queue/persistent-queue';

export async function GET() {
  const report = await HealthService.checkSystemHealth(true);
  const queueMetrics = await PersistentQueue.getMetrics();

  const isHealthy = report.overallStatus === 'HEALTHY' || report.overallStatus === 'DEGRADED';

  return NextResponse.json(
    {
      status: report.overallStatus === 'HEALTHY' ? 'OPERATIONAL' : report.overallStatus,
      overallStatus: report.overallStatus,
      timestamp: report.timestamp,
      uptimeSeconds: report.uptimeSeconds,
      components: report.components,
      services: {
        application: { status: report.components.processAlive.status },
        database: {
          status: report.components.databaseReady.status === 'HEALTHY' ? 'CONNECTED' : report.components.databaseReady.status,
          latencyMs: report.components.databaseReady.latencyMs,
        },
        queue: {
          status: report.components.queueReady.status === 'HEALTHY' ? 'OPERATIONAL' : report.components.queueReady.status,
          pendingJobs: queueMetrics.pending,
          deadLetterJobs: queueMetrics.deadLetter,
        },
        storage: { status: report.components.storageReady.status, engine: 'Local/Object Storage Abstraction' },
        paymentProvider: { status: 'CONFIGURED', provider: 'SANDBOX' },
        aiProvider: { status: 'OPERATIONAL', engine: 'GroundedSystemProvider' },
      },
      durationMs: report.durationMs,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
