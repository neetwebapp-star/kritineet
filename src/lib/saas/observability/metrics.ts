/**
 * Phase 8: Metrics, Cost Observability & Centralized Error Tracking
 * Aggregates platform operational telemetry (p50/p95/p99 latency, error rates)
 * and computes estimated monthly infrastructure costs.
 */

import crypto from 'crypto';

export class ObservabilityEngine {
  private static latencySamples: number[] = [];
  private static errorLog: Array<{ errorId: string; route: string; error: string; timestamp: string }> = [];

  /**
   * Records a latency sample in milliseconds
   */
  public static recordLatency(durationMs: number) {
    this.latencySamples.push(durationMs);
    // Keep sliding window of latest 1,000 samples
    if (this.latencySamples.length > 1000) {
      this.latencySamples.shift();
    }
  }

  /**
   * Computes p50, p95, p99 percentiles from recorded samples
   */
  public static calculatePercentiles(): { p50: number; p95: number; p99: number; count: number } {
    if (this.latencySamples.length === 0) {
      return { p50: 0, p95: 0, p99: 0, count: 0 };
    }

    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      count: sorted.length,
    };
  }

  /**
   * Formats a production-safe error response concealing internal stack traces
   */
  public static recordError(route: string, rawError: any): { errorId: string; userMessage: string } {
    const errorId = `ERR_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const errString = rawError instanceof Error ? rawError.message : String(rawError);

    this.errorLog.push({
      errorId,
      route,
      error: errString,
      timestamp: new Date().toISOString(),
    });

    if (this.errorLog.length > 200) {
      this.errorLog.shift();
    }

    return {
      errorId,
      userMessage: `Something went wrong. Error ID: ${errorId}`,
    };
  }

  /**
   * Infrastructure Cost Estimator:
   * Aggregates database, AI inferences, object storage, and compute costs.
   */
  public static getCostEstimates(activeStudentsCount: number = 100, aiQueriesCount: number = 500) {
    // Estimated unit pricing (INR)
    const dbCost = 1500; // Managed Postgres / DB tier
    const storageCost = 300; // Media assets & private PDFs (~50GB)
    const computeCost = 2500; // Next.js server instance
    const aiCostPerQuery = 0.45; // Blended LLM tokens (system fallback is 0)
    const aiCostTotal = Math.round(aiQueriesCount * aiCostPerQuery);

    const totalEstimatedMonthly = dbCost + storageCost + computeCost + aiCostTotal;

    return {
      currency: 'INR',
      period: 'MONTHLY',
      breakdown: {
        database: dbCost,
        storage: storageCost,
        compute: computeCost,
        aiInference: aiCostTotal,
      },
      totalEstimatedMonthly,
      costPerActiveStudent: parseFloat((totalEstimatedMonthly / Math.max(1, activeStudentsCount)).toFixed(2)),
    };
  }
}
