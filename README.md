<div align="center">
  <img src="https://via.placeholder.com/150x150/09090b/ffffff?text=Pillar" alt="Pillar Logo" width="120" />
  <h1>Pillar</h1>
  <p><b>The Memory Layer for Engineering Teams</b></p>
  <p>Pillar is where your engineering decisions live. Every issue, pull request, and architectural decision is connected to the reasoning behind it.</p>
</div>

<br />

## Why Pillar?

Most tools track *what* was built and *who* built it. **Pillar tracks *why***—and makes that reasoning searchable, actionable, and intelligent. 

Engineering teams lose context constantly. A new developer joins and has no idea why the codebase is structured the way it is. A decision made six months ago gets reversed because nobody remembers the reasoning. Pillar solves this by acting as the unified layer between your planning, building, and execution.

## Core Features

- 🧠 **Architecture Decision Records (ADRs)**: A robust platform to propose, accept, and supersede technical decisions. Maintains a bidirectional history of all structural choices.
- 💬 **Request for Comments (RFCs)**: Premium hero screens for technical proposals. Features sticky voting, section-based discussion threads, and strict lifecycle states.
- ⚡ **1-Click Issue Spawner**: Stop duplicating work. Seamlessly convert accepted RFC implementation tasks directly into actionable project tickets with built-in idempotency.
- 🔄 **Cycles & Modules**: Time-boxed work periods with automatic carry-forward for unfinished issues, paired with feature-based progress tracking.
- 🛠️ **Real-Time Issues Engine**: Full kanban boards with optimistic drag-and-drop updates, rich-text markdown editors, and customizable project statuses.
- ⏱️ **Hackathon & Crunch Mode**: Toggle strict project deadlines with live countdown timers, automatic critical-issue filtering, and read-only viewer links for presentations.
- 🐙 **GitHub Integration**: Bi-directional syncing. Issues automatically update their statuses when linked Pull Requests are opened, merged, or closed.

## Tech Stack

Pillar is built for scale, speed, and clean separation of concerns.

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Zustand, React Query
- **Backend**: Node.js, Express, TypeScript, Socket.io (Realtime)
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Queue & Background Jobs**: BullMQ + Redis
- **Architecture**: Strictly Event-Driven (Every action emits to an internal event bus for AI consumption and background processing).

## Getting Started

### Prerequisites
- Node.js (v20+)
- pnpm
- Docker Desktop (for local Postgres & Redis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pillar.git
   cd pillar
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start local infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Environment Configuration**
   Copy the example environment files and fill in your keys (GitHub OAuth, Neon Database URL, etc.)
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

5. **Database Setup**
   ```bash
   pnpm db:migrate
   ```

6. **Run the development servers**
   ```bash
   pnpm dev
   ```
   *The frontend will start on `localhost:3000` and the API will start on `localhost:4000`.*

## License

Pillar is proprietary software. All rights reserved.
