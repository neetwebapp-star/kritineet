import { NextRequest, NextResponse } from 'next/server';
import { MockQualityValidator } from '@/lib/exam/mock-quality-validator';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const result = await MockQualityValidator.validateTest(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error validating test:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
