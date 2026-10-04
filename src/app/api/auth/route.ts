import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, action } = body;

    if (action === 'demo_login') {
      // One-click demo login as default student
      let student = await prisma.user.findUnique({
        where: { email: 'student@neet2027.com' },
        include: { profile: true },
      });

      if (!student) {
        student = await prisma.user.create({
          data: {
            email: 'student@neet2027.com',
            name: 'Kriti Sharma',
            role: 'STUDENT',
          },
          include: { profile: true },
        });
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
      });

      // Set auth session cookie
      response.cookies.set('kriti_session', student.id, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      return response;
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // For effortless onboarding in this educational OS, auto-provision user if password provided
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: email.split('@')[0],
          role: 'STUDENT',
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('kriti_session', user.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('kriti_session')?.value;
  if (!sessionId) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, user });
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('kriti_session');
  return response;
}
