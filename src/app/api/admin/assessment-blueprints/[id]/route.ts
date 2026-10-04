import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blueprint = await prisma.assessmentBlueprint.findUnique({
      where: { id },
      include: {
        blueprintRules: true,
        qualityReports: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        testForms: true,
      },
    });

    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    return NextResponse.json({ blueprint });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch blueprint' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.assessmentBlueprint.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        targetQuestionCount: body.targetQuestionCount !== undefined ? body.targetQuestionCount : undefined,
        targetDurationMinutes: body.targetDurationMinutes !== undefined ? body.targetDurationMinutes : undefined,
      },
    });

    return NextResponse.json({ success: true, blueprint: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update blueprint' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.assessmentBlueprint.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true, message: 'Blueprint archived' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to archive blueprint' }, { status: 500 });
  }
}
