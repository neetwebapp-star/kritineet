import { NextResponse } from 'next/server';
import { ResilientWorker } from '@/lib/production/resilient-worker';

export async function GET() {
  try {
    const health = await ResilientWorker.getWorkerHealth();
    return NextResponse.json(health, {
      status: health.status === 'HEALTHY' ? 200 : 503,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'UNAVAILABLE',
        error: error?.message || 'Worker health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
