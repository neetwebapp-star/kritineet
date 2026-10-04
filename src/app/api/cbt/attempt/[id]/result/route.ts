import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { id } = await params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.userId !== student.id) {
      return NextResponse.json({ error: 'Unauthorized: Access denied to other student results' }, { status: 403 });
    }

    if (!attempt.analyticsJson) {
      return NextResponse.json({ error: 'Attempt has not been submitted or analyzed yet' }, { status: 400 });
    }

    const result = JSON.parse(attempt.analyticsJson);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
