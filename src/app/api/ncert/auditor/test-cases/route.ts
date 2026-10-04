import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const testSuitePath = path.resolve(process.cwd(), 'src/lib/auditor/test_suite.py');

    // Run python test suite with --json flag
    const { stdout, stderr } = await execPromise(`python "${testSuitePath}" --json`, {
      cwd: process.cwd(),
      timeout: 30000
    });

    let suiteData: any = {};
    try {
      suiteData = JSON.parse(stdout.trim());
    } catch {
      suiteData = { rawOutput: stdout };
    }

    return NextResponse.json({
      success: true,
      data: suiteData,
      stdout
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
