/**
 * Phase 6: Auth Helper for AI Routes
 * Resolves current user by x-user-id header, body userId, or default student.
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function resolveUser(req?: NextRequest, explicitUserId?: string) {
  if (explicitUserId) {
    const user = await prisma.user.findUnique({ where: { id: explicitUserId } });
    if (user) return user;
  }

  if (req) {
    const headerUserId = req.headers.get('x-user-id');
    if (headerUserId) {
      const user = await prisma.user.findUnique({ where: { id: headerUserId } });
      if (user) return user;
    }
  }

  // Default to student@neet2027.com
  let student = await prisma.user.findUnique({
    where: { email: 'student@neet2027.com' },
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        email: 'student@neet2027.com',
        name: 'NEET 2027 Aspirant',
        role: 'STUDENT',
      },
    });
  }

  return student;
}
