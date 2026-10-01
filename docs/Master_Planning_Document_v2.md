# Pillar — The Memory Layer for Engineering Teams
**Master Planning Document · v2.0**

## Core Positioning
Pillar is where your engineering decisions live. Every issue, PR, and architectural decision is connected to the reasoning behind it. Most tools track WHAT was built and WHO built it. Pillar tracks WHY — and makes that WHY searchable, actionable, and intelligent.

### Three Layers. One System.
1. **PLAN:** Issues, cycles, ADRs, RFCs, team coordination (Linear / Plane analogy)
2. **BUILD:** GitHub integration, PR linking, code context, AI checks (GitHub Projects analogy)
3. **SHOW:** Public profile, project showcase, proof of work (Peerlist analogy)

---

## Architecture & Tech Stack
Pillar uses a decoupled monorepo architecture. 

**Recommendation:** Next.js frontend + Separate Node/Express backend. 
*Why?* WebSockets, background jobs (BullMQ), and AI/Webhook processes scale better on a persistent Node server, not serverless API routes.

* **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, dnd-kit, Tiptap, Recharts.
* **Backend:** Node.js, Express, TypeScript, REST APIs.
* **Real-time:** Socket.io.
* **Auth:** NextAuth.js (GitHub OAuth + email/password).
* **Database:** PostgreSQL (hosted on Neon for branching and scale-to-zero), Prisma ORM.
* **Background Jobs & Event Bus:** BullMQ + Redis (Upstash).
* **File Storage & Email:** Cloudinary, Resend.
* **Validation:** Zod.

### AI Stack
* **LLM:** Anthropic Claude API (claude-sonnet-4)
* **Document Embeddings:** OpenAI text-embedding-3-small
* **Code Embeddings:** voyage-code-2
* **Vector Database:** Qdrant Cloud

### Event-Driven Architecture
Every significant action (e.g., `issue.status_changed`) emits an event to the internal **Event Bus** (BullMQ) and writes to an `events` table (JSONB payload). 
* Independent workers (Activity, Realtime, Notification, AI, Analytics) listen to these events.
* This prevents tight coupling and builds the rich history required for all future AI features.

---

## Phased Roadmap

### V1 — The Foundation (Weeks 1–6)
*Goal: Real teams using it.*
* **Week 1:** Monorepo + Auth + Workspace + Event Bus. Prisma schema design for all tables.
* **Week 2:** Issues Engine. Custom statuses, rich text, inline editing, activity logs, comments.
* **Week 3:** Views + Real-Time. Board/Kanban view, List view, Socket.io rooms, presence indicators.
* **Week 4:** Hackathon Mode + Notifications. Deadlines, zero-setup viewer links, email/in-app notifications.
* **Weeks 5-6:** Polish and Ship V1. Dashboards, global search, deployment (Vercel + Railway).

### V2 — The Engineering Layer (Weeks 7–14)
*Goal: Developers open Pillar before GitHub.*
* **Weeks 7-8:** GitHub Integration. Webhooks for PRs/commits, auto-linking, status updates.
* **Week 9:** Cycles + Modules. Time-boxed work, carry-forward, burndown charts, analytics.
* **Week 10:** ADR + RFC System. Structured decision templates, superseded-by chains, bidirectional links to PRs.
* **Week 11:** Standup Intelligence (AI Feature 1). Auto-generates standups based on event history and PR states.
* **Weeks 12-14:** PRD to Project Breakdown (AI Feature 2). AI converts unstructured text into structured modules and issues.

### V3 — The Identity Layer (Weeks 15–22)
*Goal: Developers link Pillar profile instead of LinkedIn.*
* **Weeks 15-16:** Public Profiles. Auto-generated from activity, heatmaps, skills inferred.
* **Week 17:** Project Showcase Pages. Public pages for projects, SEO optimized.
* **Weeks 18-19:** Onboarding Accelerator (AI Feature 3). Day 0 briefs, Context Injectors on issues.
* **Weeks 20-21:** Codebase Conscience (AI Feature 4). GitHub repo indexer + voyage-code-2. Auto-comments on PRs if they contradict ADRs or duplicate logic.
* **Week 22:** Polish and V3 Ship.

### V4 — The Platform (Ongoing)
*Goal: Real product, real revenue.*
* AI Spec Generator, Velocity Forecasting, Tech Debt Tracker, Retrospective Intelligence.

---

## Core Database Schema
* **users, workspaces, workspace_members, invites, projects, project_members**
* **issue_statuses, issues, issue_labels, issue_label_map, issue_relations**
* **issue_activities, comments**
* **modules, module_issues**
* **cycles, cycle_issues**
* **adrs, rfcs, rfc_votes, rfc_comments**
* **events:** `(id, event_type, workspace_id, project_id, actor_id, payload JSONB, created_at)` - The AI foundation.

---

## Engineering Process & Git Workflow

### Repository Structure
* `/apps/web`: Next.js UI, layouts, components.
* `/apps/api`: Express, routes, services, workers, eventBus.
* `/packages/types`: Shared interfaces.

### Git Workflow
* **main:** Production only.
* **develop:** Integration branch. All features merge here first.
* **feature/PIL-42-board-view:** One branch per issue.
* **Commit Convention:** `type(scope): description` (e.g., `feat(issues): add drag-and-drop board view`).

### CI/CD Pipeline
* **GitHub Actions:** TypeScript type check, ESLint, Vitest on every push.
* **Deployments:** Vercel (frontend preview/prod) + Railway (backend preview/prod).
* **Database:** Neon DB branching on every PR.

---

## AI Implementation Guide (RAG Pipeline)
1. **Ingest:** On significant events, chunk content, embed (OpenAI), and store in Qdrant.
2. **Query:** Embed query, vector similarity search in Qdrant (filtered by `project_id`).
3. **Augment:** Combine retrieved chunks with structured Postgres data.
4. **Generate:** Prompt Claude API, validate JSON output with Zod.
5. **Act:** Surface via notification, sidebar, or GitHub API.
