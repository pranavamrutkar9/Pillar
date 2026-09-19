# Week 2 Summary & Project Evolution

## Summary of Week 2

In Week 2, we heavily expanded the feature set of Pillar by introducing relational entities and the core workflow engine. We built upon the foundation from Week 1 to implement Projects, Issues, Comments, Labels, and Statuses.

**Features Implemented:**
- **Projects:** Creation, settings, and listing within a workspace.
- **Issues Engine:** Full issue tracking with creation, detail views, and filtering.
- **Comments & Activity:** Integrated a rich text editor (Tiptap) for comments and implemented an activity log tracking issue changes.
- **Labels & Statuses:** Customizable statuses (e.g., Backlog, Todo, In Progress) and labels for issues.
- **API Validation & Error Handling:** Implemented Zod schemas for robust request validation and global Express error handling middleware.
- **Project-Level Authorization:** Added `projectAuth` middleware to ensure users have access to specific projects.

---

## How this architecture will evolve

Pillar continues to grow, and our focus will shift towards performance, real-time features, and deeper integrations.

### Week 2 (Completed)
- **Projects & Issues:** We added heavily relational features. The `schema.prisma` grew significantly to support the issue engine.
- **Validation:** Zod is now standard across the API for all new entities.
- **Rich Text:** Tiptap is powering comment threads on the frontend.

↓

### Week 3 (Real-time & Performance)
- **Realtime Infrastructure:** The `realtimeWorker.ts` will evolve to push updates via WebSockets (e.g., Socket.io) when database records change (e.g., new comments, status updates).
- **Advanced Caching:** Redis will be used for caching expensive queries (like calculating issue statistics for a project dashboard).
- **Shared Types:** Deeper utilization of `packages/types` to ensure perfect alignment between the Next.js frontend and Express API DTOs.
- **API Versioning:** Preparing routes to be versioned (e.g., `routes/v1/`).

↓

### Production (Scale)
- **Process Separation:** The `workers/index.ts` will be run as a completely separate deployment from the main API.
- **Database Read Replicas:** `prisma` client might be configured to route read-only queries.
- **Microservices?** The event-driven BullMQ setup allows us to easily extract domains like Notifications into separate services.
