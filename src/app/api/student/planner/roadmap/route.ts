import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);

    const phases = [
      {
        phaseId: 'PHASE_1',
        title: 'Phase 1: Core Foundation & Class 11 Mastery',
        dateRange: '5 Oct 2026 – 13 Dec 2026',
        dayRange: 'Days 1 to 70',
        totalDays: 70,
        objective: 'Verbatim NCERT Class 11 coverage, primary concept acquisition, topic practice, early DPPs, and 2-3-5-7 spaced repetition.',
        milestones: [
          { day: 35, title: 'Half-Book Milestone Test (Class 11 Part A)', date: '2026-11-08', type: 'HALF_BOOK_TEST' },
          { day: 70, title: 'Half-Book Milestone Test (Class 11 Part B)', date: '2026-12-13', type: 'HALF_BOOK_TEST' },
        ],
        status: 'ACTIVE',
      },
      {
        phaseId: 'PHASE_2',
        title: 'Phase 2: Class 12 Syllabus & Multi-Chapter Rigor',
        dateRange: '14 Dec 2026 – 26 Feb 2027',
        dayRange: 'Days 71 to 145',
        totalDays: 75,
        objective: 'Class 12 NCERT completion while maintaining Class 11 long-term retention via R5 (+14d) and R6 (+30d) reviews.',
        milestones: [
          { day: 110, title: 'Half-Book Milestone Test (Class 12 Part A)', date: '2027-01-22', type: 'HALF_BOOK_TEST' },
          { day: 145, title: 'Half-Book Milestone Test (Class 12 Part B)', date: '2027-02-26', type: 'HALF_BOOK_TEST' },
        ],
        status: 'UPCOMING',
      },
      {
        phaseId: 'PHASE_3',
        title: 'Phase 3: Full Course Integration & CBT Mocks',
        dateRange: '27 Feb 2027 – 7 Apr 2027',
        dayRange: 'Days 146 to 185',
        totalDays: 40,
        objective: 'Full syllabus completion milestone reached. Shift to REVISION + MOCK MODE with 720-mark official NEET CBT simulations every 6 days.',
        milestones: [
          { day: 150, title: '🎉 FULL SYLLABUS COMPLETION MILESTONE', date: '2027-03-03', type: 'SYLLABUS_COMPLETE' },
          { day: 156, title: 'Full-Length CBT Simulation (Mock #2)', date: '2027-03-09', type: 'MOCK_TEST' },
          { day: 162, title: 'Full-Length CBT Simulation (Mock #3)', date: '2027-03-15', type: 'MOCK_TEST' },
          { day: 168, title: 'Full-Length CBT Simulation (Mock #4)', date: '2027-03-21', type: 'MOCK_TEST' },
          { day: 174, title: 'Full-Length CBT Simulation (Mock #5)', date: '2027-03-27', type: 'MOCK_TEST' },
          { day: 180, title: 'Full-Length CBT Simulation (Mock #6)', date: '2027-04-02', type: 'MOCK_TEST' },
        ],
        status: 'UPCOMING',
      },
      {
        phaseId: 'PHASE_4',
        title: 'Phase 4: High-Yield Consolidation & Peak Readiness',
        dateRange: '8 Apr 2027 – 5 May 2027',
        dayRange: 'Days 186 to 213',
        totalDays: 28,
        objective: 'Zero new unlearned material. Focus on high-yield NCERT facts, Physics formulas, Organic reactions, Error notebook, and final 7-day mode.',
        milestones: [
          { day: 206, title: 'Final Full-Length All India Mock Test', date: '2027-04-28', type: 'MOCK_TEST' },
          { day: 207, title: '🌟 FINAL 7-DAY PEAK READINESS MODE BEGINS', date: '2027-04-29', type: 'FINAL_7_DAY_MODE' },
          { day: 213, title: '🎯 NEET UG 2027 EXAM READINESS GATE', date: '2027-05-05', type: 'EXAM_DAY' },
        ],
        status: 'UPCOMING',
      },
    ];

    const milestonesCount = phases.reduce((s, p) => s + p.milestones.length, 0);

    return NextResponse.json({
      success: true,
      startDate: '2026-10-05',
      endDate: '2027-05-05',
      totalDays: 213,
      phases,
      milestonesCount,
    });
  } catch (error: any) {
    console.error('Error fetching roadmap data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
