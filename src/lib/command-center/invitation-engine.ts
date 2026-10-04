/**
 * Phase 7: Invitation Engine
 * Manages signed invitation tokens with expiry and one-time use
 * for secure Parent-Student and Mentor-Student onboarding without role escalation.
 */

import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { RelationshipEngine } from './relationship-engine';

export class InvitationEngine {
  public static async createInvitation(
    inviterId: string,
    email: string,
    role: 'PARENT' | 'MENTOR',
    studentId?: string,
    expiryDays: number = 7
  ) {
    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
    if (!inviter) throw new Error('Inviter not found');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    return prisma.invitation.create({
      data: {
        inviterId,
        email: email.toLowerCase().trim(),
        role,
        studentId: studentId || null,
        token,
        expiresAt,
        isUsed: false,
      },
    });
  }

  public static async acceptInvitation(token: string, acceptorId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.isUsed) {
      throw new Error('Invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error('Invitation has expired');
    }

    const acceptor = await prisma.user.findUnique({ where: { id: acceptorId } });
    if (!acceptor) throw new Error('Acceptor user not found');

    // Create the appropriate authorized relationship
    if (invitation.role === 'PARENT' && invitation.studentId) {
      await RelationshipEngine.requestParentLink(acceptorId, invitation.studentId, 'PARENT');
      // Automatically activate based on the trusted invitation
      const rel = await prisma.parentStudentRelationship.findUnique({
        where: {
          parentId_studentId: { parentId: acceptorId, studentId: invitation.studentId },
        },
      });
      if (rel) {
        await RelationshipEngine.approveParentLink(rel.id, invitation.inviterId);
      }
    } else if (invitation.role === 'MENTOR' && invitation.studentId) {
      await RelationshipEngine.assignMentor(acceptorId, invitation.studentId, invitation.inviterId);
    }

    // Mark invitation as used (one-time use)
    return prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }
}
