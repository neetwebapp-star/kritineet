import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GlobalSearchEngine } from '@/lib/intelligence/search-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const student = await prisma.user.findUnique({
      where: { email: 'student@neet2027.com' },
      select: { id: true },
    });

    const results = await GlobalSearchEngine.search(query, student?.id);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
