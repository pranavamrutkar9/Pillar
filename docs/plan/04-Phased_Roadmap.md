## 7. Phased Roadmap

### V1 — The Foundation
Timeline: 5–6 weeks · Goal: Real teams using it

**Week 1 — Monorepo + Auth + Workspace + Event Bus**
* pnpm workspaces monorepo — /apps/web (Next.js), /apps/api (Express), /packages/types (shared TS)
* Prisma schema — design ALL tables now including events table and future V2 tables. Migrations are painful to add later.
* Event bus setup — eventBus.ts, BullMQ queues, activityWorker, realtimeWorker, notificationWorker. 100 lines. Do it now.
* Auth — NextAuth.js with GitHub OAuth + email/password
* Workspace creation, settings, invite via link or email, roles (Admin/Member/Viewer)
* docker-compose.yml for local dev — Postgres + Redis running locally
* End of week: user signs up, creates workspace, invites teammate, event bus processes first events

**Week 2 — Issues Engine**
* Custom issue statuses per project — not hardcoded, configurable
* Issue creation — title, Tiptap rich text, status, priority, assignee, due date, labels
* Issue detail page with all fields editable inline
* Every issue action emits an event — status change, assignment, comment, creation
* Activity log on issue page — reads from issue_activities, append-only
* Comment threads with nesting
* End of week: full issue lifecycle working, activity history correct, events table filling up

**Week 3 — Views + Real-Time**
* Board view — Kanban with dnd-kit, drag cards across status columns, optimistic updates
* List view — table style, inline field editing, bulk status change
* Socket.io rooms — users join project room on open, leave on close
* RealtimeWorker broadcasts events to Socket.io rooms — board updates live
* Presence indicators — who is currently viewing this project
* End of week: two people on the same board see changes live

**Week 4 — Hackathon Mode + Notifications**
* Hackathon mode toggle on project creation — sets deadline, activates countdown
* Countdown timer visible to all team members on board header
* Crunch mode — last 6 hours, board auto-filters to In Progress and critical issues
* Zero-setup viewer join link — no signup required, read-only access
* In-app notification centre — assigned to issue, mentioned in comment, status changed on your issue
* Email notifications via Resend — instant critical + daily digest

**Weeks 5–6 — Polish and Ship V1**
* Project dashboard — your assigned issues, recent project activity, project health overview
* Global search — issues and comments across all projects in workspace
* End-to-end testing of all critical flows with Playwright
* Deploy — Next.js on Vercel, Express on Railway, Neon for Postgres, Railway Redis
* Connect Neon — create project, set DATABASE_URL, run prisma migrate deploy
* Landing page — one page, clear value prop, sign up CTA
* Onboard 3–5 real teams from college — watch them, fix confusion immediately

*V1 is done when real people use it without you explaining it to them. Ship ugly. Ugly and used beats beautiful and unseen every single time.*

---

### V2 — The Engineering Layer
Timeline: 6–8 weeks after V1 · Goal: Developers open Pillar before GitHub

**Weeks 7–8 — GitHub Integration**
* GitHub OAuth — connect repo to project via installation
* Webhook listener on Express — PR opened, merged, closed, review requested, commit pushed
* GitHub events normalized and emitted to internal event bus — GithubService
* Auto-link PRs to issues via #PIL-42 in PR title or description
* Issue status auto-updates when linked PR merges — configurable target status
* PR card visible on issue — status, reviewer count, CI checks passing/failing
* PR list view inside project showing all linked PRs across issues

**Week 9 — Cycles + Modules**
* Cycles — time-boxed work periods, drag issues in/out, burndown chart, cycle summary on close
* Carry-forward — unfinished cycle issues roll to next cycle automatically
* Modules — group issues by feature with progress bar, spans multiple cycles
* Issues belong to both a cycle (when) and a module (what) simultaneously
* Cycle analytics — velocity, completion rate, scope change over time

**Week 10 — ADR + RFC System**
* ADR platform — structured template: Context, Decision, Alternatives Considered, Consequences
* ADR status flow — Proposed → Accepted → Deprecated → Superseded
* Superseded-by chain — old decision links forward to new one, full decision history preserved
* Link ADRs to issues, PRs, and modules — bidirectional relationships
* RFC board — per-section comment threads (not just bottom comments), vote system
* RFC status — Draft → In Review → Accepted → Implemented
* One click: accepted RFC spawns issues directly into project with pre-filled descriptions
* This is your biggest differentiator. Neither Linear nor Plane has this.

**Week 11 — Standup Intelligence (AI Feature 1)**
* Cron job via BullMQ at 8am per workspace timezone
* Reads events table for each user — last 24h of activity
* Reads assigned in-progress issues and linked PR states from Postgres
* Claude generates structured standup: `{ yesterday: [], today: [], blockers: [] }`
* Blocker detection is pure logic — issues stuck 48h+ in same status, PRs waiting 24h+ for review
* User reviews draft, edits inline, posts to team async feed in one click
* Smart nudge — 'Waiting on Arjun review. He has 7 pending. Flag this?'
* Cost — cheap per day: mostly Postgres queries + one small Claude call per user

**Weeks 12–14 — PRD to Project Breakdown (AI Feature 2)**
* Input — paste PRD text, Notion URL, bullet points, or any unstructured description
* Claude returns structured JSON matching your DB schema: modules, issues, priorities, dependencies
* Zod validates JSON before showing preview — retry with stricter prompt on failure, max 2 retries
* Clarifying questions surfaced for ambiguous requirements before finalising
* Full editable preview — change anything before one-click project creation
* Creates entire project structure: modules, issues, labels, dependencies in one transaction
* This is your demo feature. PRD to structured project in 90 seconds. Show this to anyone.

*V2 milestone: a developer opens Pillar before they open GitHub. That is the retention signal you are looking for.*

---

### V3 — The Identity Layer
Timeline: 8–10 weeks after V2 · Goal: Developers link Pillar profile instead of LinkedIn

**Weeks 15–16 — Public Profiles**
* Auto-generated profile from all V1 and V2 activity — no manual input, ever
* Shows: projects, role played, issues closed, ADRs authored, PRs linked, modules owned
* Activity graph — contribution heatmap across all projects over time
* Skills inferred from project tech stacks and module ownership patterns
* Custom URL — pillar.dev/username
* Privacy controls — choose what is public vs private per project

**Week 17 — Project Showcase Pages**
* Every project gets a public page (owner controls visibility)
* Shows: description, team with roles, tech stack, live demo link, roadmap status
* Completed cycles shown as shipped milestones with dates
* Follow this project — get notified when things ship
* SEO optimised — public pages indexed, searchable by project name and tech stack

**Weeks 18–19 — Onboarding Accelerator (AI Feature 3)**
* **Day 0 Brief** — auto-generated the moment someone joins a project
  * What this project is and why it exists (from ADRs and project description)
  * Top 5 decisions they need to know (relevant ADRs ranked by impact on their module)
  * Who to talk to — contributors ranked by ownership of their assigned module
  * Current state of the project — blocked issues, critical bugs, what is on fire right now
  * First 3 suggested issues — starter tasks that build familiarity without touching risky code
* **Context Injector** — persistent sidebar on every issue
  * Why this issue exists — linked ADRs and RFCs surfaced inline
  * Who to ask if stuck — top contributors to related areas of the codebase
  * Known gotchas — extracted from past issue comments and PR discussion history
* **Day 7 Readiness Report** — for both the new joiner and their lead
  * What they have explored based on activity patterns
  * Gaps in coverage — what they have not touched yet
  * Suggested first ownership issue — something real, not a tutorial task

**Weeks 20–21 — Codebase Conscience (AI Feature 4)**
* GitHub repo indexer — reads codebase, generates code embeddings via voyage-code-2
* Cross-references codebase embeddings with ADR and RFC embeddings in Qdrant
* Triggers on every PR opened via GitHub webhook
* Checks: does this PR contradict an existing ADR?
* Checks: is this solving a problem already solved elsewhere in the codebase?
* Checks: does this touch high-churn files with no test coverage?
* Checks: is this modifying a module owned by someone not in the review?
* Posts structured comment on GitHub PR — only when something real is detected, never noise
* Fully configurable — teams choose which checks to enable

**Week 22 — Polish and V3 Ship**
* Performance audit — public profile pages use static generation where possible
* SEO — public profiles and project showcase pages fully indexable
* V3 deploy and load testing
* Target: 20+ teams onboarded, weekly active usage established

*V3 milestone: a developer links their Pillar profile instead of their LinkedIn. That is the identity signal you are looking for.*

---

### V4 — The Platform
Timeline: Ongoing · Goal: Real product, real revenue

* Spec Generator (AI) — issue description to full engineering spec with edge cases, data model, API surface
* Velocity Forecasting — probabilistic completion dates with confidence intervals, not fake Gantt charts
* Tech Debt Tracker — log debt items with business cost attached, ROI calculator for fixing them
* Retrospective Intelligence — data-backed retro generated automatically from cycle events
* Mobile app — React Native, quick issue creation, one-tap standup approve, push notifications
* Self-hostable — Dockerfile + docker-compose.yml, one-command local deploy, open source option for GitHub stars
* Billing — Stripe, team plan, seat management, usage limits per plan tier
* Public API + webhooks — let others build on top of Pillar
* Slack and Discord integration — standup posts, issue alerts, PRD submission from messages
* Impact Analyzer — before starting an issue, see exactly which files you will touch and what might break
