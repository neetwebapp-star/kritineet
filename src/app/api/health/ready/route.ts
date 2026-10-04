import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ready: true, status: 'READY', timestamp: new Date().toISOString() }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ready: false, status: 'NOT_READY', error: error.message }, { status: 503 });
  }
}
