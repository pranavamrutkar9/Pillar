# Redis & Workers Documentation

This document explains the Redis configuration and the background workers that process events.

## 1. `apps/api/src/lib/redis.ts`

**Dependency Graph:**
`redis.ts`
↓
`ioredis`

**Mental Model:**
*How should I think before writing this file?*
- ✓ Import Redis client?
- ✓ Connect to server? (Use `process.env.REDIS_URL`).
- ✓ Export a singleton? (Ensure the whole app shares one connection pool to avoid `maxmemory` or connection limits).

**Runtime Lifecycle:**
- **When is this file loaded?** First imported by `eventBus.ts` or `index.ts`.
- **When does it finish?** Lives for the duration of the Node process.

---

## 2. `apps/api/src/workers/activityWorker.ts`

**Dependency Graph:**
`activityWorker.ts`
↓
`bullmq` (Worker)
↓
`redis.ts`
↓
`prisma` (client.ts)

**Mental Model:**
*How should I think before writing this file?*
- ✓ Define Worker? (Listen to the `pillar-activity` queue).
- ✓ Define processor function? (Extract `eventType` and `payload` from the job).
- ✓ Handle logic? (In this case, format the payload and save an `Event` record to Postgres via Prisma).
- ✓ Error handling? (If the processor throws an error, BullMQ automatically retries based on the backoff config).

**Runtime Lifecycle:**
- **When is this file loaded?** Imported by `apps/api/src/workers/index.ts`, which is imported by the main `index.ts`.
- **Who calls it?** BullMQ internals call the processor function whenever a new job appears in Redis.
- **What calls next?** `prisma.event.create()`.

**Call Hierarchy:**
- **Who calls this file?** Redis (via BullMQ polling/pubsub).
- **Who does this file call?** `prisma.event.create`.

**Prerequisites:**
- Background processing
- Redis as a message broker
- Promises and async error handling in workers

---

## 3. `apps/api/src/workers/github/githubWorker.ts`

**Queue**: pillar-github

**Mental Model:**
- ✓ Listens to the `pillar-github` queue
- ✓ Acts as a router — does NOT contain business logic directly
- ✓ Routes jobs to four specialized handlers based on eventType:
  - `handleLinkEvent` — parses PR titles/bodies for issue keys (e.g. PIL-42), creates PullRequestIssue records
  - `handleIssueEvent` — auto-updates issue status when a linked PR merges
  - `handleSyncEvent` — handles bulk historical sync when a repo is connected
  - `handleInstallationEvent` — handles GitHub App installation events
- ✓ Never calls Prisma or external APIs directly — delegates to handlers

**Runtime Lifecycle:**
- **When is it loaded?** Imported by workers/index.ts on server start
- **Who calls it?** BullMQ when a job lands in pillar-github queue
- **What calls next?** Delegates to handler files in workers/github/

**Call Hierarchy:**
- **Who calls this file?** Redis via BullMQ
- **Who does this file call?** handleLinkEvent, handleIssueEvent, handleSyncEvent, handleInstallationEvent

---

## Common Interview Questions

- **Why run workers in the same process as the Express API?** For Week 1, it simplifies deployment. We only need to run one Docker container (or one Node command) to get both the web server and the background processors. As we scale, we can easily split them into separate processes by modifying `index.ts`.
- **What happens if Redis goes down?** BullMQ will throw connection errors. The API might fail to `emit` events (depending on how we catch those errors). Unprocessed jobs currently in Redis might be lost if Redis isn't configured for persistence (AOF/RDB).
