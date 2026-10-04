import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const finalMileActive = await prisma.finalMileConfiguration.count({ where: { isActive: true } });
    const totalSimulationsCreated = await prisma.examSimulation.count();
    const totalSimulationAttempts = await prisma.examSimulationAttempt.count();
    const evaluatedResults = await prisma.examSimulationResult.count();

    const readinessDistribution = await prisma.examReadinessSnapshot.groupBy({
      by: ['overallStatus'],
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalStudents,
        finalMileActive,
        totalSimulationsCreated,
        totalSimulationAttempts,
        evaluatedResults,
        readinessDistribution,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin final-mile analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
