import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return NextResponse.json(
      {
        ready: true,
        status: 'READY',
        databaseLatencyMs: latency,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ready: false,
        status: 'NOT_READY',
        error: error.message || 'Database unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
