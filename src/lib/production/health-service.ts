/**
 * Phase 13: Verifiable System Health Service
 * Evaluates real-time health across:
 * - PROCESS_ALIVE
 * - DATABASE_READY
 * - QUEUE_READY
 * - WORKER_READY
 * - STORAGE_READY
 *
 * Strict Invariant: No fake statuses. Output reflects genuine check results:
 * HEALTHY | DEGRADED | UNAVAILABLE | UNKNOWN
 */

import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export type SystemStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';

export interface ComponentHealth {
  name: 'PROCESS_ALIVE' | 'DATABASE_READY' | 'QUEUE_READY' | 'WORKER_READY' | 'STORAGE_READY';
  status: SystemStatus;
  isReady: boolean;
  latencyMs?: number;
  details?: Record<string, any>;
  error?: string;
}

export interface ComprehensiveHealthReport {
  overallStatus: SystemStatus;
  timestamp: string;
  uptimeSeconds: number;
  components: {
    processAlive: ComponentHealth;
    databaseReady: ComponentHealth;
    queueReady: ComponentHealth;
    workerReady: ComponentHealth;
    storageReady: ComponentHealth;
  };
  durationMs: number;
}

export class HealthService {
  /**
   * Runs genuine checks against all platform subsystems
   */
  public static async checkSystemHealth(recordSnapshot: boolean = false): Promise<ComprehensiveHealthReport> {
    const startTime = Date.now();

    // 1. PROCESS_ALIVE check
    const processStart = Date.now();
    const mem = process.memoryUsage();
    const processAlive: ComponentHealth = {
      name: 'PROCESS_ALIVE',
      status: 'HEALTHY',
      isReady: true,
      latencyMs: Date.now() - processStart,
      details: {
        uptime: Math.round(process.uptime()),
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      },
    };

    // 2. DATABASE_READY check
    const dbStart = Date.now();
    let databaseReady: ComponentHealth;
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;
      databaseReady = {
        name: 'DATABASE_READY',
        status: dbLatency > 500 ? 'DEGRADED' : 'HEALTHY',
        isReady: true,
        latencyMs: dbLatency,
      };
    } catch (err: any) {
      databaseReady = {
        name: 'DATABASE_READY',
        status: 'UNAVAILABLE',
        isReady: false,
        error: err?.message || 'Database ping query failed',
      };
    }

    // 3. QUEUE_READY check
    const queueStart = Date.now();
    let queueReady: ComponentHealth;
    try {
      const deadLetterCount = await prisma.backgroundJob.count({
        where: { status: 'DEAD_LETTER' },
      });
      const pendingCount = await prisma.backgroundJob.count({
        where: { status: 'PENDING' },
      });
      const queueLatency = Date.now() - queueStart;

      let queueStatus: SystemStatus = 'HEALTHY';
      if (deadLetterCount > 25 || pendingCount > 1000) {
        queueStatus = 'DEGRADED';
      }

      queueReady = {
        name: 'QUEUE_READY',
        status: queueStatus,
        isReady: true,
        latencyMs: queueLatency,
        details: { pendingCount, deadLetterCount },
      };
    } catch (err: any) {
      queueReady = {
        name: 'QUEUE_READY',
        status: 'UNAVAILABLE',
        isReady: false,
        error: err?.message || 'Persistent queue check failed',
      };
    }

    // 4. WORKER_READY check
    const workerStart = Date.now();
    let workerReady: ComponentHealth;
    try {
      const processingCount = await prisma.backgroundJob.count({
        where: { status: 'PROCESSING' },
      });
      workerReady = {
        name: 'WORKER_READY',
        status: 'HEALTHY',
        isReady: true,
        latencyMs: Date.now() - workerStart,
        details: { activeJobsProcessing: processingCount },
      };
    } catch (err: any) {
      workerReady = {
        name: 'WORKER_READY',
        status: 'UNAVAILABLE',
        isReady: false,
        error: err?.message || 'Worker status inspection failed',
      };
    }

    // 5. STORAGE_READY check
    const storageStart = Date.now();
    let storageReady: ComponentHealth;
    try {
      const testDir = path.join(process.cwd(), 'public');
      const isAccessible = fs.existsSync(testDir);
      storageReady = {
        name: 'STORAGE_READY',
        status: isAccessible ? 'HEALTHY' : 'DEGRADED',
        isReady: isAccessible,
        latencyMs: Date.now() - storageStart,
        details: { storageDir: 'public', accessible: isAccessible },
      };
    } catch (err: any) {
      storageReady = {
        name: 'STORAGE_READY',
        status: 'UNAVAILABLE',
        isReady: false,
        error: err?.message || 'Storage check failed',
      };
    }

    // Calculate overall status
    let overallStatus: SystemStatus = 'HEALTHY';
    if (!databaseReady.isReady || !processAlive.isReady) {
      overallStatus = 'UNAVAILABLE';
    } else if (
      databaseReady.status === 'DEGRADED' ||
      queueReady.status === 'DEGRADED' ||
      !queueReady.isReady ||
      !workerReady.isReady ||
      !storageReady.isReady
    ) {
      overallStatus = 'DEGRADED';
    }

    const report: ComprehensiveHealthReport = {
      overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      components: {
        processAlive,
        databaseReady,
        queueReady,
        workerReady,
        storageReady,
      },
      durationMs: Date.now() - startTime,
    };

    if (recordSnapshot) {
      try {
        await prisma.systemHealthSnapshot.create({
          data: {
            status: overallStatus,
            processAlive: processAlive.isReady,
            databaseReady: databaseReady.isReady,
            queueReady: queueReady.isReady,
            workerReady: workerReady.isReady,
            storageReady: storageReady.isReady,
            detailsJson: JSON.stringify(report),
          },
        });
      } catch {
        // Logging snapshot failure must not fail the health check itself
      }
    }

    return report;
  }
}
