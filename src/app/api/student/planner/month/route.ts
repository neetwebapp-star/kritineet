import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const { searchParams } = new URL(req.url);

    // Month in YYYY-MM format (default: 2026-10)
    const month = searchParams.get('month') || '2026-10';

    const dayPlans = await prisma.dailyStudyPlan.findMany({
      where: {
        userId: user.id,
        date: { startsWith: month },
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            taskType: true,
            status: true,
            estimatedMinutes: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const monthsSummary = [
      { key: '2026-10', name: 'October 2026', phase: 'Phase 1: Foundation', totalDays: 27 },
      { key: '2026-11', name: 'November 2026', phase: 'Phase 1: Foundation', totalDays: 30 },
      { key: '2026-12', name: 'December 2026', phase: 'Phase 1/2: Class 12 Transition', totalDays: 31 },
      { key: '2027-01', name: 'January 2027', phase: 'Phase 2: Multi-Chapter Rigor', totalDays: 31 },
      { key: '2027-02', name: 'February 2027', phase: 'Phase 2: Syllabus Completion', totalDays: 28 },
      { key: '2027-03', name: 'March 2027', phase: 'Phase 3: CBT Mocks & Full Course', totalDays: 31 },
      { key: '2027-04', name: 'April 2027', phase: 'Phase 4: Final Consolidation', totalDays: 30 },
      { key: '2027-05', name: 'May 2027', phase: 'Phase 4: Peak 7-Day Mode', totalDays: 5 },
    ];

    const currentMonthDays = dayPlans.map((d) => ({
      date: d.date,
      dayNumber: parseInt(d.date.split('-')[2], 10),
      plannedMinutes: d.plannedMinutes,
      status: d.status,
      stage: d.preparationStage,
      hasTest: d.tasks.some((t) => ['CHAPTER_TEST', 'HALF_BOOK_TEST', 'MOCK_TEST'].includes(t.taskType)),
      hasMock: d.tasks.some((t) => t.taskType === 'MOCK_TEST'),
      ncertTopicsCount: d.tasks.filter((t) => t.taskType === 'NCERT_READ').length,
      taskCount: d.tasks.length,
      completedTaskCount: d.tasks.filter((t) => t.status === 'COMPLETED').length,
    }));

    const totalTopicsInMonth = dayPlans.reduce(
      (sum, d) => sum + d.tasks.filter((t) => t.taskType === 'NCERT_READ').length,
      0
    );

    const totalTestsInMonth = dayPlans.reduce(
      (sum, d) => sum + d.tasks.filter((t) => ['CHAPTER_TEST', 'HALF_BOOK_TEST', 'MOCK_TEST'].includes(t.taskType)).length,
      0
    );

    return NextResponse.json({
      success: true,
      selectedMonth: month,
      monthsList: monthsSummary,
      stats: {
        totalDaysInPlan: currentMonthDays.length,
        totalTopicsScheduled: totalTopicsInMonth,
        totalTestsScheduled: totalTestsInMonth,
        totalPlannedHours: Math.round((dayPlans.reduce((s, d) => s + d.plannedMinutes, 0) / 60) * 10) / 10,
      },
      days: currentMonthDays,
    });
  } catch (error: any) {
    console.error('Error fetching monthly planner data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
