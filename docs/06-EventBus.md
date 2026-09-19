# EventBus Documentation

This document explains the event-driven architecture implemented using BullMQ and Redis.

## 1. `apps/api/src/events/eventBus.ts`

**Dependency Graph:**
`eventBus.ts`
↓
`bullmq` (Queue)
↓
`redis.ts` (Connection)

**Mental Model:**
*How should I think before writing this file?*
- ✓ Define queues? (Create separate queues for different domains: `activity`, `realtime`, `notification`).
- ✓ Configure connection? (Pass the shared Redis instance to each Queue).
- ✓ Implement `emit` function? (Take an `eventType` and `payload`).
- ✓ Fan-out pattern? (Add the job to *all* relevant queues so different workers can process the same event independently).
- ✓ Resiliency? (Configure job options like `attempts: 3` and `backoff` strategies).

**Runtime Lifecycle:**
- **When is this file loaded?** Imported by any service that needs to trigger a background action.
- **Who calls it?** Services (e.g., `workspaceService.ts` calls `emit('workspace.created', ...)`).
- **What calls next?** BullMQ serializes the payload, pushes it to Redis, and returns immediately to the caller. The workers pick it up later.

**Call Hierarchy:**
- **Who calls this file?** Services / Route handlers.
- **Who does this file call?** `Queue.add()`, which communicates with Redis via TCP.

**Prerequisites:**
- Message Queues (Pub/Sub vs Point-to-Point)
- Redis data structures
- Event-driven architecture concepts

---

## Common Interview Questions

- **What is BullMQ?** A Node.js library that implements a fast, robust queue system on top of Redis. It handles job scheduling, retries, concurrency, and rate limiting.
- **Why use an EventBus instead of calling functions directly?** If `workspaceService` directly called `emailService`, a failure in sending the email would crash the workspace creation. By emitting an event, we decouple the actions. The HTTP response is fast, and the email is sent reliably in the background.
- **What is the Fan-out pattern?** Instead of pushing a job to one specific queue (like `send-email`), we push a generic event (`workspace.created`) to multiple domain queues (Activity, Realtime, Notification). Each domain has its own worker that decides what to do with that event.
