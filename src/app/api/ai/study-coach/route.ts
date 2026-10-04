import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AIStudyCoach } from '@/lib/study-os/ai-study-coach';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { userId, query, date } = body;

    if (!userId) {
      const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (student) userId = student.id;
    }

    if (!userId || !query) {
      return NextResponse.json({ error: 'userId and query are required' }, { status: 400 });
    }

    const planDate = date || new Date().toISOString().split('T')[0];
    const coachResponse = await AIStudyCoach.processCoachCommand(userId, query, planDate);

    return NextResponse.json({ success: true, ...coachResponse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI study coach request failed' }, { status: 500 });
  }
}
