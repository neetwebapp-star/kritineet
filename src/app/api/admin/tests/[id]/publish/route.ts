import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MockQualityValidator } from '@/lib/exam/mock-quality-validator';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const targetStatus = body.isPublished !== undefined ? Boolean(body.isPublished) : true;

    const test = await prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (targetStatus) {
      // Validate before publishing
      const validation = await MockQualityValidator.validateTest(id);
      if (!validation.isValid && !body.force) {
        return NextResponse.json({
          error: 'Test failed quality validation gate',
          validation,
        }, { status: 400 });
      }
    }

    const updated = await prisma.test.update({
      where: { id },
      data: {
        isPublished: targetStatus,
        publishedAt: targetStatus ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      testId: updated.id,
      isPublished: updated.isPublished,
      publishedAt: updated.publishedAt,
    });
  } catch (error: any) {
    console.error('Error toggling test publication:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
