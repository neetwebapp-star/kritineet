import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { RbacEngine } from '@/lib/command-center/rbac-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'ADMIN');

    if (!RbacEngine.hasPermission(actor.role, 'STUDENT_VIEW') || (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin permissions required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        OR: search ? [
          { name: { contains: search } },
          { email: { contains: search } },
        ] : undefined,
      },
      take: 50,
      orderBy: { [sortBy]: sortOrder },
      include: {
        profile: true,
        _count: {
          select: {
            attempts: true,
            mistakes: true,
            assignmentsAssigned: true,
          },
        },
      },
    });

    const sanitized = students.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      targetYear: s.profile?.targetExamYear || 2027,
      currentStreak: s.profile?.currentStreak || 0,
      totalAttempted: s.profile?.totalAttempted || 0,
      accuracyRate: s.profile?.accuracyRate || 0.0,
      testsCompleted: s._count.attempts,
      unresolvedMistakes: s._count.mistakes,
      activeAssignments: s._count.assignmentsAssigned,
      lastActiveAt: s.updatedAt,
    }));

    return NextResponse.json({ students: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
