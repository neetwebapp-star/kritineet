import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const sources = await prisma.officialSource.findMany({
      include: {
        checks: {
          orderBy: { checkedAt: 'desc' },
          take: 5,
        },
      },
    });

    const healthReport = sources.map((s) => {
      const latestCheck = s.checks[0] || null;
      return {
        code: s.code,
        name: s.name,
        authority: s.authority,
        websiteUrl: s.websiteUrl,
        noticeBoardUrl: s.noticeBoardUrl,
        status: s.status, // HEALTHY | DEGRADED | OUTAGE
        lastCheckedAt: s.lastCheckedAt,
        lastSuccessAt: s.lastSuccessAt,
        lastFailureAt: s.lastFailureAt,
        lastFailureReason: s.lastFailureReason,
        latestLatencyMs: latestCheck?.latencyMs || 0,
        latestHttpStatus: latestCheck?.httpStatus || 200,
        recentChecks: s.checks.map((c) => ({
          checkedAt: c.checkedAt,
          status: c.status,
          latencyMs: c.latencyMs,
          httpStatus: c.httpStatus,
        })),
      };
    });

    const allHealthy = healthReport.every((s) => s.status === 'HEALTHY');

    return NextResponse.json({
      status: allHealthy ? 'HEALTHY' : 'PARTIAL_OUTAGE',
      checkedAt: new Date(),
      sources: healthReport,
    });
  } catch (error: any) {
    console.error('Error fetching source health:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
