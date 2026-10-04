import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CoverageTracker } from '@/lib/study-os/coverage-tracker';
import { ReviewsAndAnalyticsService } from '@/lib/study-os/reviews-and-analytics-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const subjectCode = searchParams.get('subjectCode') || undefined;

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const [ncertCoverage, pyqCoverage, fingertipsCoverage, healthVector] = await Promise.all([
      CoverageTracker.getNCERTCoverage(userId, subjectCode),
      CoverageTracker.getPYQCoverage(userId, { subjectCode }),
      CoverageTracker.getFingertipsCoverage(userId, { subjectCode }),
      ReviewsAndAnalyticsService.getPreparationHealth(userId),
    ]);

    return NextResponse.json({
      userId,
      ncertCoverage,
      pyqCoverage,
      fingertipsCoverage,
      preparationHealth: healthVector,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch progress metrics' }, { status: 500 });
  }
}
