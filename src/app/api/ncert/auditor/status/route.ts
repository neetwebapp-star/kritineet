import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const auditRunId = searchParams.get('auditRunId');

    let run: any = null;
    if (auditRunId) {
      const runs: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM NCERTAuditRun WHERE id = '${auditRunId.replace(/'/g, "''")}'
      `);
      run = runs.length > 0 ? runs[0] : null;
    } else {
      const latest: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM NCERTAuditRun ORDER BY createdAt DESC LIMIT 1
      `);
      run = latest.length > 0 ? latest[0] : null;
    }

    if (!run) {
      return NextResponse.json({
        success: false,
        message: 'No audit runs found.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      run
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
