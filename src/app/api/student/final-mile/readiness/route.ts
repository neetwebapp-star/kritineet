import { NextRequest, NextResponse } from 'next/server';
import { ReadinessMatrixService } from '@/lib/final-mile/readiness-matrix-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'student_demo';

    const report = await ReadinessMatrixService.evaluateReadiness(userId);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error fetching final-mile readiness:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
