import { Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { prisma } from '../db/client.js';
import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const emailWorker = new Worker('pillar-email', async (job) => {
  const { toUserId, subject, text } = job.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!user || !user.email) return;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Pillar <notifications@pillar.com>', // Update with verified domain later
        to: user.email,
        subject,
        text,
      });
      console.log(`[EmailWorker] Sent email to ${user.email}: ${subject}`);
    } else {
      console.log(`[EmailWorker] (Dry run - no API key) Email to ${user.email}: ${subject}`);
      console.log(`[EmailWorker] Payload Body: \n${text}`);
    }
  } catch (error) {
    console.error(`[EmailWorker] Failed to send email to user ${toUserId}:`, error);
  }
}, { connection: redis as any });

emailWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[EmailWorker Error]', err);
});
