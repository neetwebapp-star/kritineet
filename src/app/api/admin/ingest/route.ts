import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { exec } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const assets = await prisma.contentAsset.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        pageLogs: {
          orderBy: { pageNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ assets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const zipName = body.zipName || 'kebo1dd.zip';
    const limitPdfs = body.limitPdfs || 2;
    const limitPages = body.limitPages || 8;

    const scriptPath = path.resolve(process.cwd(), 'scripts', 'ingest_drive_zip.py');
    const command = `python "${scriptPath}" --zip "${zipName}" --limit-pdfs ${limitPdfs} --limit-pages ${limitPages}`;

    // Execute ingestion worker asynchronously
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Ingestion worker error:', err, stderr);
      } else {
        console.log('Ingestion worker completed:', stdout);
      }
    });

    return NextResponse.json({
      message: 'ZIP Ingestion pipeline job launched',
      targetZip: zipName,
      limitPdfs,
      limitPages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
