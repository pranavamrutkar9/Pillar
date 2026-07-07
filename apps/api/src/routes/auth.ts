import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/client.js';
import { emit } from '../events/eventBus.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router();

router.post('/signin', asyncHandler(async (req, res) => {
  const { email, username, avatarUrl, githubId, githubUsername } = req.body;

  if (!email) {
    throw new Error('Email is required');
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      avatarUrl,
      githubId,
      githubUsername,
    },
    create: {
      email,
      username: githubUsername,
      avatarUrl,
      githubId,
      githubUsername,
    },
  });

  await emit('user.signed_in', { userId: user.id, email: user.email });
  return successResponse(res, user);
}));

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username: email.split('@')[0] + Math.random().toString(36).substring(2, 6),
      passwordHash,
    },
  });

  const { passwordHash: _, ...safeUser } = user;
  return successResponse(res, safeUser);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw Object.assign(new Error('Invalid credentials'), { name: 'UnauthorizedError' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid credentials'), { name: 'UnauthorizedError' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return successResponse(res, safeUser);
}));

export default router;
