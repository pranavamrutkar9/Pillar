import { prisma } from '../db/client.js';
import { emit } from '../events/eventBus.js';
import crypto from 'crypto';
import { WorkspaceRole } from '@prisma/client';

export const inviteService = {
  async createInvite(data: { workspaceId: string; email: string; role: WorkspaceRole; invitedBy: string }) {
    const token = crypto.randomUUID();
    const expiryDays = parseInt(process.env.INVITE_EXPIRY_DAYS || '7', 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const invite = await prisma.invite.create({
      data: {
        workspaceId: data.workspaceId,
        email: data.email,
        role: data.role,
        invitedBy: data.invitedBy,
        token,
        expiresAt,
      },
    });

    await emit('invite.created', { inviteId: invite.id, email: invite.email, workspaceId: invite.workspaceId });

    return invite;
  },

  async getInviteByToken(token: string) {
    return prisma.invite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: { name: true },
        },
        sender: {
          select: { username: true, email: true },
        },
      },
    });
  },

  async getPendingInvitesForEmail(email: string) {
    return prisma.invite.findMany({
      where: {
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        workspace: {
          select: { name: true },
        },
        sender: {
          select: { username: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async acceptInvite(data: { token: string; userId: string; userEmail: string }) {
    const invite = await prisma.invite.findUnique({
      where: { token: data.token },
      include: { workspace: true },
    });

    if (!invite) {
      const err = new Error('Invite not found') as any;
      err.code = 'INVITE_NOT_FOUND';
      throw err;
    }

    if (invite.acceptedAt) {
      const err = new Error('Invite already accepted') as any;
      err.code = 'INVITE_ACCEPTED';
      throw err;
    }

    if (new Date() > invite.expiresAt) {
      const err = new Error('Invite expired') as any;
      err.code = 'INVITE_EXPIRED';
      throw err;
    }

    if (invite.email !== data.userEmail) {
      const err = new Error('Email mismatch: You can only accept invites sent to your email') as any;
      err.code = 'EMAIL_MISMATCH';
      throw err;
    }

    let isAlreadyMember = false;

    await prisma.$transaction(async (tx) => {
      const existingMember = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId: data.userId,
          },
        },
      });

      if (existingMember) {
        isAlreadyMember = true;
        return;
      }

      await tx.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: data.userId,
          role: invite.role,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });

    if (isAlreadyMember) {
      return { success: true, workspaceId: invite.workspaceId };
    }

    await emit('member.joined', { workspaceId: invite.workspaceId, userId: data.userId });

    return { success: true, workspaceId: invite.workspaceId };
  },

  async revokeInvite(inviteId: string) {
    await prisma.invite.delete({
      where: { id: inviteId },
    });
  },
};
