import { NextRequest, NextResponse } from 'next/server';
import { ExamUpdatesEngine } from '@/lib/exam-intelligence/exam-updates-engine';

export async function GET(req: NextRequest) {
  try {
    const editionId = req.nextUrl.searchParams.get('editionId') || undefined;
    const result = await ExamUpdatesEngine.getStudentVerifiedUpdates(editionId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch exam updates' }, { status: 500 });
  }
}
