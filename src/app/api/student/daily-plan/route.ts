import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DailyLearningPlanEngine } from '@/lib/intelligence/daily-learning-plan-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;

    const plan = await DailyLearningPlanEngine.getOrGenerateDailyPlan(student.id, date);
    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
