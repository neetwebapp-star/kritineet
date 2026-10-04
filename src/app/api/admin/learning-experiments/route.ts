import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { InterventionAndExperimentService } from '@/lib/student-intelligence/intervention-and-experiment-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const experimentId = searchParams.get('id');

    if (experimentId) {
      const evaluation = await InterventionAndExperimentService.evaluateExperiment(experimentId);
      return NextResponse.json({
        success: true,
        experiment: evaluation,
      });
    }

    const experiments = await prisma.learningExperiment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json({
      success: true,
      experiments: experiments.map((e) => ({
        id: e.id,
        name: e.name,
        hypothesis: e.hypothesis,
        interventionType: e.interventionType,
        status: e.status,
        minSampleSize: e.minSampleSize,
        enrolledStudents: e._count.assignments,
        createdAt: e.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to retrieve learning experiments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.hypothesis || !body.interventionType) {
      return NextResponse.json({ success: false, error: 'Name, hypothesis, and interventionType are required' }, { status: 400 });
    }

    const experiment = await InterventionAndExperimentService.createExperiment({
      name: body.name,
      hypothesis: body.hypothesis,
      interventionType: body.interventionType,
      variantAConfig: body.variantAConfig || {},
      variantBConfig: body.variantBConfig || {},
      minSampleSize: body.minSampleSize || 30,
    });

    return NextResponse.json({
      success: true,
      experiment,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create experiment' }, { status: 500 });
  }
}
