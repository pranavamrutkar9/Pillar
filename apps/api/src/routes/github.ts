import { Router, Request, Response } from "express";
import { githubService } from "../services/github.service.js";
import { webhook } from "../lib/github/webhook.js";
import { prisma } from "../db/client.js";

export const githubRouter = Router();

// Used for raw body parsing required by GitHub signature verification
// In your main index.ts, ensure this route is mounted before any body-parsers, 
// or configure body-parser to preserve raw body for this route.
githubRouter.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const event = req.headers["x-github-event"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;

  if (!signature || !event || !deliveryId) {
    res.status(400).send("Missing required headers");
    return;
  }

  // Idempotency check: Have we processed this delivery before?
  const existingEvent = await prisma.githubWebhookEvent.findUnique({
    where: { deliveryId }
  });
  
  if (existingEvent) {
    res.status(200).send("Already processed");
    return;
  }

  const rawBody = req.body;
  const payloadString = rawBody.toString('utf8');
  
  const isValid = await webhook.verifySignature(payloadString, signature);
  if (!isValid) {
    res.status(401).send("Invalid signature");
    return;
  }

  let payload;
  try {
    payload = JSON.parse(payloadString);
  } catch (e) {
    res.status(400).send("Invalid JSON payload");
    return;
  }

  // Persist raw event
  const webhookEvent = await prisma.githubWebhookEvent.create({
    data: {
      deliveryId,
      event,
      payload
    }
  });

  try {
    // Process the event
    await githubService.processWebhookEvent(event, payload);
    
    // Mark as processed successfully
    await prisma.githubWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processedAt: new Date() }
    });
    
    res.status(200).send("Event processed");
  } catch (error: any) {
    console.error("Failed to process webhook:", error);
    // Mark as failed
    await prisma.githubWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: { error: error.message }
    });
    res.status(500).send("Internal Server Error");
  }
});

// Callback for GitHub App post-installation
githubRouter.get("/setup", async (req: Request, res: Response) => {
  const installationId = req.query.installation_id as string;
  const setupAction = req.query.setup_action as string; // 'install' or 'update'

  // Here you could redirect the user back to the frontend with the installation ID
  // so they can choose which project to link it to.
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/github/callback?installation_id=${installationId}&action=${setupAction}`);
});
