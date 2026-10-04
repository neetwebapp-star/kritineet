import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SimulationReviewAndActionPlanner } from '@/lib/final-mile/simulation-review-and-action-planner';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let queue = await prisma.simulationReviewQueue.findMany({
      where: { attemptId: id },
      include: {
        question: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If queue is empty, attempt to generate it on demand
    if (queue.length === 0) {
      await SimulationReviewAndActionPlanner.generateReviewQueue(id);
      queue = await prisma.simulationReviewQueue.findMany({
        where: { attemptId: id },
        include: {
          question: {
            include: {
              chapter: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      queue,
    });
  } catch (error: any) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { queueItemId, reviewNotes } = body;

    if (!queueItemId) {
      return NextResponse.json({ success: false, error: 'queueItemId is required' }, { status: 400 });
    }

    const updated = await SimulationReviewAndActionPlanner.markQueueItemReviewed(queueItemId, reviewNotes);

    return NextResponse.json({
      success: true,
      queueItem: updated,
    });
  } catch (error: any) {
    console.error('Error updating review item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
