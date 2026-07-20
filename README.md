<div align="center">
  <img src="./apps/web/public/next.svg" alt="Pillar Logo" width="200" style="filter: invert(1);"/>
  <h1>Pillar</h1>
  <p><strong>The memory layer for modern engineering teams.</strong></p>
  <p>
    Pillar is an open-source, blazing fast issue tracker designed to keep you in flow. Plan cycles, write technical specs, and ship faster without the clutter.
  </p>
</div>

---

## 📸 Screenshots

*(Add screenshots here)*
- **Dashboard:** `![Dashboard](./docs/dashboard.png)`
- **Issue Board:** `![Board](./docs/board.png)`
- **Command Palette:** `![Search](./docs/search.png)`

## ✨ Features

- **Keyboard-First Design:** Move fast without reaching for the mouse.
- **Optimistic UI:** Instant UI updates that feel magical.
- **Hackathon Mode:** Strip away the noise when you just need to ship.
- **Global Search:** Find any issue, project, or comment instantly.
- **Viewer Links:** Share read-only views with stakeholders effortlessly.
- **Real-Time Sync:** WebSockets keep your whole team on the exact same page.

## 🏗️ Architecture

Pillar uses a decoupled monorepo architecture:
1. **API Server (Express):** Handles business logic, database connections, and WebSocket broadcasting.
2. **Web Client (Next.js):** App Router based frontend using Server Components and Client Components appropriately.
3. **Worker (BullMQ):** Background jobs for webhooks, email notifications, and heavy data processing.

## 📁 Folder Structure

```text
Pillar/
├── apps/
│   ├── api/                # Express backend + Socket.io + Workers
│   │   ├── src/
│   │   │   ├── routes/     # Express route handlers
│   │   │   ├── services/   # Core business logic
│   │   │   ├── db/         # Prisma client
│   │   │   └── workers/    # BullMQ job processors
│   └── web/                # Next.js frontend
│       ├── src/
│       │   ├── app/        # App Router pages (Server Components)
│       │   └── components/ # Reusable React UI (Client Components)
├── packages/               # Shared logic (if extracted later)
├── e2e/                    # Playwright tests
├── prisma/                 # Database schema and migrations
└── railway.json            # Deployment config
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, TipTap (Rich Text)
- **Backend:** Express, Node.js, Socket.io
- **Database:** PostgreSQL, Prisma ORM
- **Queue/Cache:** Redis, BullMQ
- **Authentication:** NextAuth.js (GitHub OAuth + Credentials)
- **Deployment:** Railway / Vercel

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- PostgreSQL database
- Redis server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranavamrutkar9/Pillar.git
   cd Pillar
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Copy the example config and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *(Be sure to update `DATABASE_URL` and `REDIS_URL`)*

4. **Initialize Database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Servers**
   ```bash
   pnpm run dev
   ```
   - Frontend runs on `http://localhost:3000`
   - API runs on `http://localhost:4000`

## ⚙️ Environment Variables

See `.env.example` for a complete list. Key variables include:
- `DATABASE_URL`: Postgres connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth session encryption
- `GITHUB_CLIENT_ID` / `SECRET`: For OAuth login
- `API_URL` & `FRONTEND_URL`: For CORS and API requests

## 🚢 Deployment

Pillar is designed to be easily deployed to PaaS providers like Railway.

1. **Railway:** Connect your GitHub repo.
2. Railway will read the `railway.json` file.
3. Provision **PostgreSQL** and **Redis** plugins in your Railway project.
4. Add all environment variables to the service.
5. Deploy!

## 🗺️ Roadmap

- [x] Workspaces & Projects
- [x] Kanban Boards
- [x] Real-time Updates (Socket.io)
- [x] Hackathon Mode
- [x] Viewer Links
- [ ] Built-in ADRs (Architecture Decision Records)
- [ ] Built-in RFCs (Request for Comments)
- [ ] Slack Integration
- [ ] Webhooks API

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
