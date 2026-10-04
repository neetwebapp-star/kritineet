/**
 * Phase 8: Persistent Background Job & Queue System
 * Database-backed resilient queue with automatic retries, dead-letter handling,
 * idempotency keys, execution status tracking, and queue metrics.
 */

import prisma from '@/lib/prisma';

export interface EnqueueJobInput {
  queue?: string;
  type: string;
  payload: any;
  idempotencyKey?: string;
  maxAttempts?: number;
}

export type JobHandler = (payload: any) => Promise<any>;

export class PersistentQueue {
  private static handlers: Map<string, JobHandler> = new Map();

  /**
   * Register a handler for a job type
   */
  public static registerHandler(type: string, handler: JobHandler) {
    this.handlers.set(type, handler);
  }

  /**
   * Enqueue a new background job with idempotency deduplication
   */
  public static async enqueue(input: EnqueueJobInput) {
    // If idempotency key provided, check if already enqueued
    if (input.idempotencyKey) {
      const existing = await prisma.backgroundJob.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    return prisma.backgroundJob.create({
      data: {
        queue: input.queue || 'default',
        type: input.type,
        payloadJson: JSON.stringify(input.payload),
        status: 'PENDING',
        maxAttempts: input.maxAttempts ?? 3,
        idempotencyKey: input.idempotencyKey || null,
      },
    });
  }

  /**
   * Picks and executes the next pending job from the queue
   */
  public static async processNext(queue: string = 'default') {
    const job = await prisma.backgroundJob.findFirst({
      where: {
        queue,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!job) return null;

    // Transition to PROCESSING
    await prisma.backgroundJob.update({
      where: { id: job.id },
      data: {
        status: 'PROCESSING',
        attempts: { increment: 1 },
      },
    });

    const handler = this.handlers.get(job.type);
    let payload = {};
    try {
      payload = JSON.parse(job.payloadJson);
    } catch {
      // payload parse error
    }

    try {
      if (handler) {
        await handler(payload);
      }
      // Completed successfully
      return prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          errorDetails: null,
        },
      });
    } catch (err: any) {
      const nextAttempt = job.attempts + 1;
      const isDeadLetter = nextAttempt >= job.maxAttempts;

      return prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: isDeadLetter ? 'DEAD_LETTER' : 'FAILED',
          failedAt: new Date(),
          errorDetails: err?.message || 'Execution error',
        },
      });
    }
  }

  /**
   * Retries jobs marked as FAILED
   */
  public static async retryFailed(queue: string = 'default') {
    return prisma.backgroundJob.updateMany({
      where: {
        queue,
        status: 'FAILED',
      },
      data: {
        status: 'PENDING',
      },
    });
  }

  /**
   * Queue telemetry metrics
   */
  public static async getMetrics(queue: string = 'default') {
    const [pending, processing, completed, failed, deadLetter] = await Promise.all([
      prisma.backgroundJob.count({ where: { queue, status: 'PENDING' } }),
      prisma.backgroundJob.count({ where: { queue, status: 'PROCESSING' } }),
      prisma.backgroundJob.count({ where: { queue, status: 'COMPLETED' } }),
      prisma.backgroundJob.count({ where: { queue, status: 'FAILED' } }),
      prisma.backgroundJob.count({ where: { queue, status: 'DEAD_LETTER' } }),
    ]);

    return {
      queue,
      pending,
      processing,
      completed,
      failed,
      deadLetter,
      total: pending + processing + completed + failed + deadLetter,
    };
  }
}
