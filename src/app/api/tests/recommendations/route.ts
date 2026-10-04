import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextTestRecommendationEngine } from '@/lib/exam/next-test-recommendation-engine';

export async function GET(req: NextRequest) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const recommendation = await NextTestRecommendationEngine.getRecommendation(student.id);
    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
