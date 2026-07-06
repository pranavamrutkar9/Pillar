import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/client.js';
import { emit } from '../events/eventBus.js';

const router = Router();

router.post('/signin', async (req, res) => {
  try {
    const { email, username, avatarUrl, githubId, githubUsername } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
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

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error during sign in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
       res.status(400).json({ error: 'Email, password, and name are required' });
       return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
       res.status(400).json({ error: 'User already exists' });
       return;
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
    res.json({ user: safeUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
       res.status(400).json({ error: 'Email and password are required' });
       return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
       res.status(401).json({ error: 'Invalid credentials' });
       return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
       res.status(401).json({ error: 'Invalid credentials' });
       return;
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
