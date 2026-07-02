import { Router } from 'express';
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

export default router;
