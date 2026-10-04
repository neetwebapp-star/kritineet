import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    // In production, ensure admin role
    // For local evaluation or admin access:
    const [
      totalLogsCount,
      usageLogs,
      feedbacks,
      rateLimits,
    ] = await Promise.all([
      prisma.aIUsageLog.count(),
      prisma.aIUsageLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aIFeedback.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { message: true, user: { select: { email: true } } },
      }),
      prisma.aIRateLimit.findMany({
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Aggregate statistics
    let totalTokens = 0;
    let totalCost = 0.0;
    let totalLatency = 0;
    let groundedCount = 0;
    const modeCounts: Record<string, number> = {};
    const providerCounts: Record<string, number> = {};

    for (const log of usageLogs) {
      totalTokens += log.totalTokens;
      totalCost += log.estimatedCost;
      totalLatency += log.latencyMs;
      if (log.groundingStatus === 'GROUNDED' || log.groundingStatus === 'PARTIALLY_GROUNDED') {
        groundedCount++;
      }
      modeCounts[log.mode] = (modeCounts[log.mode] || 0) + 1;
      providerCounts[log.provider] = (providerCounts[log.provider] || 0) + 1;
    }

    const averageLatencyMs = usageLogs.length > 0 ? Math.round(totalLatency / usageLogs.length) : 0;
    const groundingRate = usageLogs.length > 0 ? (groundedCount / usageLogs.length) * 100 : 100.0;

    const helpfulFeedbacks = feedbacks.filter(f => f.isHelpful).length;
    const feedbackSatisfactionRate = feedbacks.length > 0 ? (helpfulFeedbacks / feedbacks.length) * 100 : 100.0;

    return NextResponse.json({
      metrics: {
        totalQueries: totalLogsCount,
        recentSampleSize: usageLogs.length,
        totalTokens,
        totalCost,
        averageLatencyMs,
        groundingRate: parseFloat(groundingRate.toFixed(1)),
        feedbackSatisfactionRate: parseFloat(feedbackSatisfactionRate.toFixed(1)),
        modeCounts,
        providerCounts,
      },
      recentLogs: usageLogs.slice(0, 15),
      recentFeedback: feedbacks.slice(0, 15),
      activeRateLimits: rateLimits.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
