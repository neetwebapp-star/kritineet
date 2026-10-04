import { NextRequest, NextResponse } from 'next/server';
import { checkSourceHealth } from '@/lib/nta-intelligence/official-source-fetcher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetSource = body.sourceCode; // 'NTA' | 'NEET_PORTAL' | 'NMC' | undefined (check all)

    const results: any[] = [];

    if (targetSource) {
      const res = await checkSourceHealth(targetSource);
      results.push({
        source: targetSource,
        status: res.source.status,
        httpStatus: res.result.httpStatus,
        latencyMs: res.result.latencyMs,
      });
    } else {
      const sources: Array<'NTA' | 'NEET_PORTAL' | 'NMC'> = ['NTA', 'NEET_PORTAL', 'NMC'];
      for (const s of sources) {
        try {
          const res = await checkSourceHealth(s);
          results.push({
            source: s,
            status: res.source.status,
            httpStatus: res.result.httpStatus,
            latencyMs: res.result.latencyMs,
          });
        } catch (e: any) {
          results.push({
            source: s,
            status: 'FAILED',
            error: e.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Official sources verification completed',
      timestamp: new Date(),
      results,
    });
  } catch (error: any) {
    console.error('Error checking official sources:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
