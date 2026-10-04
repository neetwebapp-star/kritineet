import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CbtExamEngine } from '@/lib/intelligence/cbt-engine';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
    });
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized: Student session required' }, { status: 401 });
    }

    const { id } = await params;
    const session = await CbtExamEngine.startAttempt(id, student.id);
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
