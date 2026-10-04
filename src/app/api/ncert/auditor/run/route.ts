import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const chapter = body.chapter ? parseInt(body.chapter, 10) : null;
    const resume = Boolean(body.resume);
    const resumeRunId = body.resumeRunId || null;

    const engineScript = path.resolve(process.cwd(), 'src/lib/auditor/engine.py');

    // Build python command arguments
    const pythonArgs = [engineScript];
    if (chapter) {
      pythonArgs.push('--chapter', String(chapter));
    }
    if (resume && resumeRunId) {
      pythonArgs.push('--resume', resumeRunId);
    }

    // Spawn detached Python process so Next.js does not timeout or block
    const child = spawn('python', pythonArgs, {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    return NextResponse.json({
      success: true,
      message: chapter 
        ? `Audit started for Class 11 Physics Chapter ${chapter}.`
        : 'Full Book 1 Audit pipeline launched in background.',
      pid: child.pid
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
