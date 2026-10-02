## 8. AI Implementation Guide

### 8.1 The RAG Pipeline — Shared Infrastructure for All AI Features
All four AI features share the same underlying pipeline. Build it once in V2. Reuse forever.

| Step | What Happens |
|---|---|
| 1. Ingest | On significant events (issue created, ADR accepted, PR merged, member joined) — chunk content, generate embedding via OpenAI, store in Qdrant with metadata (project_id, type, entity_id, created_at) |
| 2. Query | When an AI feature needs context — embed the query, vector similarity search in Qdrant filtered by project_id, retrieve top-K relevant chunks |
| 3. Augment | Take retrieved chunks + structured data from Postgres (issue fields, relationships, events) and build a rich context string for Claude |
| 4. Generate | Send context + task-specific prompt to Claude API, request structured JSON output, validate with Zod |
| 5. Act | Store result (standup draft, onboarding brief, PR comment) and surface to the right user via notification, sidebar, or GitHub API |

### 8.2 Feature Implementation Details

**Standup Intelligence**
* Trigger: BullMQ cron job at 8am per workspace timezone
* Data: query events table for user activity last 24h, query assigned issues in-progress, query PR states
* Prompt: instruct Claude to return `{ yesterday: string[], today: string[], blockers: string[] }` JSON only
* Blocker detection: pure Postgres logic — no AI needed, just query conditions
* Cost: very cheap — mostly DB queries + one small Claude call per user per morning

**PRD to Project Breakdown**
* Trigger: user submits PRD text via form
* Prompt: instruct Claude to return modules array with nested issues array, priorities, and dependency IDs
* Validation: Zod schema on entire response before showing preview UI
* Fallback: JSON parse failure triggers retry with stricter prompt, max 2 retries then show error
* Cost: medium — one large Claude call per submission, but infrequent

**Onboarding Accelerator**
* Trigger: new project_member row created (`member.joined` event)
* Data: project ADRs, RFCs, last 30 days of events, module structure, contributor activity stats
* Vector search: embed assigned module name, find most relevant ADRs and past related issues
* Context injector: on issue open, embed issue title+description, retrieve top 3 related ADRs/RFCs, show in sidebar
* Cost: medium upfront for Day 0 Brief, then very cheap ongoing (context injector uses cached embeddings)

**Codebase Conscience**
* Trigger: GitHub webhook `pull_request.opened` or `pull_request.synchronize`
* Indexing: on repo connect, index all files with voyage-code-2, re-index only changed files on each push
* Analysis: embed PR diff summary, search ADR embeddings for semantic conflicts, search codebase for duplicate solutions
* Logic checks: test coverage via GitHub API, file churn frequency from git log — pure code, no AI
* Claude call: only when potential conflict found — pass ADR text + PR diff + question about conflict
* Output: structured JSON `{ conflicts, warnings, info }` formatted as GitHub PR comment
* Cost: indexing is one-time per repo, per-PR cost low because most PRs have no conflicts
