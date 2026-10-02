## 3. Architecture Decision
**Next.js Frontend + Separate Node/Express Backend**

Recommendation: Next.js frontend + Separate Node/Express backend

Why NOT Next.js full stack (API routes only):
* WebSockets are painful in Next.js API routes — you need them for real-time boards
* Background jobs, event bus, webhook listeners do not belong in a Next.js server
* Cannot scale frontend and backend independently
* AI pipeline, vector indexing, GitHub webhook handling all need a proper server process
* BullMQ workers need a persistent Node process — not serverless functions

The separation is clean:
* Next.js owns the UI.
* Express owns business logic, events, AI, sockets, and background jobs.

This is exactly how Linear, Plane, and most serious tools are structured.

## 4. Tech Stack

### 4.1 Full Stack
| Layer | Choice + Reason |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript — industry standard, excellent DX, you know it |
| Backend | Node.js + Express + TypeScript — familiar, fast to build, easy to structure cleanly |
| API Style | REST for CRUD operations. tRPC for type-safe internal calls between frontend and backend. |
| Real-time | Socket.io — best WebSocket layer for Node.js, handles all real-time needs in one place |
| Auth | NextAuth.js — GitHub OAuth + email/password, session management built in, runs on your infra |
| ORM | Prisma — type-safe, excellent migrations, works perfectly with TypeScript and PostgreSQL |
| Database | PostgreSQL — relational, handles your complex graph of issues/ADRs/PRs/events correctly |
| Background Jobs | BullMQ + Redis — for standup generation, AI jobs, GitHub sync, notifications, cron jobs |
| File Storage | Cloudinary — free tier generous, great image transformation API, simple SDK |
| Email | Resend — dead simple email API, free tier generous, Next.js friendly |

### 4.2 Database Provider — Neon
PostgreSQL is the right database for Pillar. 
Neon = PostgreSQL hosted on cloud. Same concept as MongoDB Atlas but for Postgres.
Your connection string goes in DATABASE_URL. Prisma connects. Zero difference in your code.

**Neon's unique advantage — Database Branching:**
Create an instant full copy of your database for every feature branch. Test Prisma migrations against real data without touching production. Delete the branch when the PR closes. Like Git branches but for your database.
Scale to zero — compute sleeps when idle, wakes in ~100ms. Free tier: 3GB storage + 10 branches. Most generous of all options.

Why not MongoDB — honest answer:
Pillar is a relationship-heavy system. Issues link to Cycles, Modules, PRs, ADRs, RFCs, Contributors, and Events simultaneously. That is a graph, not documents. MongoDB works for the first 3 weeks. By month 2, your aggregation pipelines for the board view, burndown charts, and AI event queries become 40-line nightmares. The single most common reason MERN PM tools never get past V1 is the developer tried to model a relational system in a document database and gave up.

### 4.3 Why Not Supabase Features
| Supabase Feature | Decision + Reason |
|---|---|
| Hosted PostgreSQL | Use it — most generous free tier, excellent dashboard for debugging |
| Supabase Auth | Skip — use NextAuth.js. More control, no vendor dependency on critical auth flows. |
| Supabase Realtime | Skip — use Socket.io. Handles all real-time needs including ephemeral presence, cursors, locks. |
| Supabase Storage | Skip — use Cloudinary. Supabase Storage is designed for Supabase Auth JWTs, not NextAuth. |
| PostgREST API | Skip — use your Express API. PostgREST cannot run BullMQ workers or Socket.io. |
| Edge Functions | Skip — use Express. Stateless functions cannot run persistent WebSocket or job queue processes. |

### 4.4 UI and Frontend
| Layer | Choice + Reason |
|---|---|
| Styling | Tailwind CSS — you know it, no context switch, great with shadcn |
| Components | shadcn/ui — unstyled, composable, Tailwind-based, you own the code not a package |
| Drag and Drop | dnd-kit — best modern DnD library, purpose-built for Kanban boards |
| Rich Text Editor | Tiptap — extensible, React-friendly, used by Linear and Notion |
| State Management | Zustand — lightweight, simple, replaces Redux for most use cases |
| Data Fetching | TanStack Query (React Query) — server state, caching, optimistic updates |
| Charts | Recharts — React-native, simple API, sufficient for burndown and velocity charts |
| Icons | Lucide React — clean, consistent, Tailwind-friendly |

### 4.5 AI Stack
| Layer | Choice + Reason |
|---|---|
| LLM | Anthropic Claude API (claude-sonnet-4) — best reasoning, large context window, structured JSON output |
| Document Embeddings | OpenAI text-embedding-3-small — cheap, fast, great for issues/ADRs/comments semantic search |
| Code Embeddings | voyage-code-2 — purpose-built for code understanding, significantly better than generic models |
| Vector Database | Qdrant Cloud free tier — managed, no infra overhead, filter by project_id natively |
| AI Job Queue | BullMQ — same queue as all background jobs, AI tasks are just another job type |
| Streaming | Vercel AI SDK — handles SSE streaming from Claude to Next.js frontend cleanly |
| Validation | Zod — validate every JSON response from Claude before touching your database |

### 4.6 Infrastructure
| Layer | Choice + Reason |
|---|---|
| Frontend | Vercel — zero config for Next.js, free tier, automatic preview deployments per PR |
| Backend | Railway — simplest Node/Express deployment, one-click Redis, clean environment variables |
| Database | Neon — PostgreSQL with branching, scale to zero, 3GB free tier |
| Redis | Railway Redis (dev) then Upstash (prod) — serverless Redis, generous free tier |
| Vector DB | Qdrant Cloud — managed, free tier sufficient for V1 and V2 |
| CI/CD | GitHub Actions — type check, lint, test on every PR. Auto deploy to Vercel on merge. |
| Monitoring | Better Stack free tier — uptime monitoring + log management |
| Error Tracking | Sentry free tier — catches runtime errors in both Next.js and Express |
| Docker | docker-compose.yml for local dev only — Postgres + Redis + Qdrant on your machine |

### 4.7 Developer Experience
| Tool | Purpose |
|---|---|
| pnpm workspaces | Monorepo — web + api + shared types in one repo, one install command |
| packages/types | Shared TypeScript interfaces used by both frontend and backend — no duplication |
| ESLint + Prettier | Code quality and formatting — set up on day 1, never argue about formatting again |
| Husky + lint-staged | Pre-commit hooks — runs lint and type check before every commit automatically |
| Vitest | Unit testing — fast, TypeScript-native, replaces Jest |
| Zod | Runtime validation — validate API inputs, form data, and all AI JSON outputs |
| Playwright | E2E testing — add in V2 for critical flows (auth, issue creation, board drag-drop) |

## 5. Event-Driven Architecture — From Day 1
This is the most important architectural decision in the entire project. Build it in week 1. Not week 7.

### 5.1 The Problem — Tight Coupling
Most developers build this way first. It works for V1. It becomes a rewrite in V2.
The wrong way — what most people build:
```javascript
app.patch('/issues/:id/status', async (req, res) => {
  await prisma.issue.update(...) // update DB
  await sendEmail(assignee, ...) // notify
  io.to(room).emit('issue:updated', ...) // realtime
  await prisma.issueActivity.create(...) // log
  res.json({ success: true })
})
```
By V2 this same controller has 12 more lines: syncGithubStatus, queueStandupUpdate, updateCycleBurndown, notifyMentions, checkCodebaseConscience, updateOnboardingContext...
Change one thing. Risk breaking all of them. Add a new feature. Find every controller that needs updating. This is tight coupling. It is how side projects die in V2.

### 5.2 The Solution — Event-Driven
The right way — controller does ONE thing, emits ONE event, done forever:
```javascript
app.patch('/issues/:id/status', async (req, res) => {
  const issue = await prisma.issue.update(...)
  
  eventBus.emit('issue.status_changed', {
    issueId: issue.id,
    projectId: issue.projectId,
    actorId: req.user.id,
    oldStatus: req.body.oldStatus,
    newStatus: req.body.status,
    timestamp: new Date()
  })
  
  res.json({ success: true })
})
```
The controller never changes again. Ever.
New feature = new worker file that listens to the event. Zero changes to existing code.

Each service is an independent listener — add new ones in V2/V3 without touching V1 code:
| Service | What It Listens For and Does |
|---|---|
| ActivityService | Listens to all events → writes to issue_activities table (the human-readable log) |
| EventLogService | Listens to all events → writes to events table as JSONB (the AI's food) |
| RealtimeService | Listens to all events → pushes Socket.io update to subscribed project room |
| NotificationService | Listens to relevant events → sends in-app alerts and emails via Resend |
| AIService (V2+) | Listens to events → queues AI jobs in BullMQ for standup, conscience, onboarding |
| GithubService (V2+) | Receives GitHub webhooks → normalizes → emits to internal event bus |
| AnalyticsService (V2+) | Listens to events → maintains pre-computed stats for burndown and velocity |

### 5.3 The Events Table — Your AI's Foundation
Every significant action emits an event to this table. This is what makes your AI features powerful in V2 and V3.
events table schema:
`id, event_type, workspace_id, project_id, actor_id, payload (JSONB), created_at`

Events emitted from day 1:
`issue.created`, `issue.status_changed`, `issue.assigned`, `issue.commented`, `issue.relation_added`, `cycle.started`, `cycle.completed`, `module.created`, `adr.proposed`, `adr.accepted`, `rfc.approved`, `member.joined`, `project.created`, `workspace.created`

Events emitted from V2 (GitHub connected):
`pr.opened`, `pr.merged`, `pr.review_requested`, `commit.pushed`, `pr.linked_to_issue`

Why this matters:
* Standup Intelligence reads this table every morning per user.
* Onboarding Accelerator reads 30 days of events to understand project state.
* Codebase Conscience compares PR events against ADR events.
Without this table built from day 1, your V2 AI has no history to work from. With it, AI features are powerful from the moment you switch them on.

### 5.4 Event Bus Implementation — BullMQ + Redis
Your event bus is just BullMQ. Not Kafka. Not RabbitMQ. Just BullMQ.

```typescript
// eventBus.ts
import { Queue, Worker } from 'bullmq'
import { redis } from './redis'

export const emit = (eventType: string, payload: any) => {
  new Queue(eventType, { connection: redis }).add(eventType, payload)
}

// activityWorker.ts — a Worker is just a listener
new Worker('issue.status_changed', async (job) => {
  await activityService.handleStatusChange(job.data)
}, { connection: redis })

// aiWorker.ts — added in V2, zero changes to any existing code
new Worker('issue.status_changed', async (job) => {
  await aiService.logForStandup(job.data)
}, { connection: redis })
```
