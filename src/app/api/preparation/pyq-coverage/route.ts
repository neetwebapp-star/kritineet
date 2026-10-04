import { NextRequest, NextResponse } from 'next/server';
import { CoverageTracker } from '@/lib/preparation/coverage-tracker';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'cmuo5qiz5002xevh8l3g4ds60';
    const pyqCoverage = await CoverageTracker.getPYQCoverage(userId);
    const ncertCoverage = await CoverageTracker.getNCERTCoverage(userId);
    const fingertipsCoverage = await CoverageTracker.getFingertipsCoverage(userId);
    const matrix = await CoverageTracker.getMasteryCoverageMatrix(userId);

    return NextResponse.json({
      pyqCoverage,
      ncertCoverage,
      fingertipsCoverage,
      matrix,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch coverage data' }, { status: 500 });
  }
}
