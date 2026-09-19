# Week 1 Summary & Project Evolution

## Summary of Week 1

In Week 1, we established the foundational architecture for Pillar. We chose a modern, scalable stack and implemented the core authentication and workspace management features.

**Core Stack:**
- **Frontend:** Next.js (App Router), TailwindCSS, NextAuth.
- **Backend:** Express, Prisma, PostgreSQL.
- **Background Jobs:** BullMQ, Redis (ioredis).
- **Monorepo:** Turborepo/pnpm workspaces separating `apps/web`, `apps/api`, and `packages/types`.

**Features Implemented:**
- User Registration and Credentials Login.
- GitHub OAuth Integration (Upserting to Postgres).
- JWT-based authentication bridging Next.js and Express.
- Workspace creation and retrieval.
- Role-based invitations (Inviting users to workspaces).
- Event-driven background architecture (EventBus and ActivityWorker).

---

## How this architecture will evolve

Pillar is designed to grow gracefully. Here is how we expect the files and architecture established today to evolve over time.

### Week 1 (Foundation)
- **Monolithic API:** Everything runs in one Express server (`index.ts`).
- **In-process Workers:** The background workers are instantiated in the same Node process as the API.
- **Direct Next.js Fetch:** Server Actions use `fetch` to talk to the Express API.

↓

### Week 2 (Completed)
- **Projects & Issues:** We added heavily relational features. The `schema.prisma` grew significantly.
- **Realtime Infrastructure:** We prepared for realtime updates (WebSockets).
- **Shared Types:** The `packages/types` directory became critical for keeping Next.js and Express DTOs aligned.

↓

### Week 3 (Performance & Refactoring)
- **Advanced Caching:** Redis will be used not just for BullMQ, but for caching expensive queries (like calculating issue statistics for a project dashboard).
- **API Versioning:** `routes/` might be nested under `routes/v1/`.
- **GraphQL / tRPC Consideration:** If the frontend data requirements become too complex for standard REST, we might expose a GraphQL endpoint on the Express server.

↓

### Production (Scale)
- **Process Separation:** The `workers/index.ts` will be run as a completely separate deployment from the main `index.ts`. If the API scales to 10 instances, we might scale the workers to 5 instances, independently.
- **Database Read Replicas:** `prisma` client might be configured to route read-only queries to read replicas.
- **Microservices?** The event-driven BullMQ setup allows us to easily extract domains. If Notifications become a huge bottleneck, we can move `notificationWorker.ts` into a completely separate repository written in Go or Rust, simply by having it listen to the `pillar-notification` Redis queue.
