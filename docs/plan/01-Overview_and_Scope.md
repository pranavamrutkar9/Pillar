# Pillar: The Memory Layer for Engineering Teams
Master Planning Document · v2.0

## Core positioning:
Pillar is where your engineering decisions live. Every issue, PR, and architectural decision is connected to the reasoning behind it.
Your team never loses context again.

Most tools track WHAT was built and WHO built it.
Pillar tracks WHY — and makes that WHY searchable, actionable, and intelligent.

## 1. What Is Pillar
Engineering teams lose context constantly. A new developer joins and has no idea why the codebase is structured the way it is. A decision made six months ago gets reversed because nobody remembers the reasoning. A PR breaks an architectural principle that was never documented anywhere. Pillar solves this.

### Three layers. One system.
| Layer | Name | What It Does | Analogy |
|---|---|---|---|
| 1 | PLAN | Issues, cycles, ADRs, RFCs, team coordination | Linear / Plane |
| 2 | BUILD | GitHub integration, PR linking, code context, AI checks | GitHub Projects |
| 3 | SHOW | Public profile, project showcase, proof of work | Peerlist |

**The insight that makes Pillar different from every competitor:**
* Linear shows what you planned.
* GitHub shows what you committed.
* LinkedIn shows what you claimed.
* Pillar connects all three — automatically, truthfully, without manual updating. Your profile is just a live reflection of your actual work.

## 2. Scope Decisions (What Was Cut and Why)
Scope explosion kills execution. These decisions were made deliberately to keep Pillar buildable solo and positioned sharply.

| Decision | Reason |
|---|---|
| Cut: Social feed + following | Low retention, high complexity, moderation nightmare early on. Nobody uses developer feeds consistently. |
| Cut: Skill verification | Zero trust signal with a small user base. Adds no real value until you have thousands of users. |
| Cut: Burnout detection | Psychological and HR territory. High false positive risk. Avoid entirely. |
| Cut: Proof-of-work PDF (V4+) | Needs rich data history first. Premature before V3 is solid. |
| Keep: Public profiles | Not social — it is proof of work. Core to value prop for student and developer users. |
| Keep: Hackathon mode | Your wedge. Niche, viral loop, emotional attachment, real users fast. |
| Keep: ADR + RFC system | Strongest differentiator. Nobody else does this inside a PM tool. |

## 10. Honest Expectations
| Version | Baseline | With AI Assist | What You Have |
|---|---|---|---|
| V1 | 5–6 weeks | 4–5 weeks | A real PM tool with real users |
| V2 | +6–8 weeks | +5–6 weeks | Engineers' daily workflow tool |
| V3 | +8–10 weeks | +6–8 weeks | Platform with identity layer |
| V4 | Ongoing | Ongoing | Real product, real revenue potential |

**What ChatGPT got right that stays true for Pillar:**
Your roadmap's biggest threat is not lack of ambition. It is over-ambition.
You are not beating Linear on generic PM tooling.
You win only on: engineering memory, searchable context, AI-assisted coordination.
Stay in that lane.

Ship V1 to real users. Watch them. Fix what breaks.
Then V2. Then V3.

The developer who shipped ugly V1 to 10 real users beats the developer who spent 6 months perfecting a V3 nobody has seen. Every single time.

## 11. What To Do Tomorrow Morning
The roadmap means nothing until you start. Here is day 1, step by step.

* **Step 1** — The name is Pillar. You already decided. Done.
* **Step 2** — Open schema.prisma. Write these models only:
  `User`, `Workspace`, `WorkspaceMember`, `Project`, `Issue`, `IssueStatus`, `IssueActivity`, `IssueComment`, `Label`, `Event`
  Get every relation and foreign key right. Spend real time here. This is the most important thing you will do this week.
* **Step 3** — Init the monorepo. pnpm workspaces, apps/web, apps/api, packages/types.
* **Step 4** — Set up docker-compose.yml. Get Postgres and Redis running locally.
* **Step 5** — Connect Neon. Create a free project. Paste the connection string. Run `prisma migrate dev --name init`. See your tables created.
* **Step 6** — Get one user logged in via GitHub OAuth. One session. Stored in DB.
* **Step 7** — Get one workspace created and stored. Read it back. Prove it exists.

That is day 1. Not the board. Not the AI. Not the landing page.
User exists. Workspace exists. Event bus wired. You can prove it in the database.
Everything else follows from that.
