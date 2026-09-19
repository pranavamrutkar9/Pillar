# Architecture Decisions

This document outlines the core architectural decisions made in Week 1, explaining why specific approaches were chosen, the alternatives considered, and why those alternatives were rejected.

## Why Express instead of Next.js Route Handlers?

**Why this approach was chosen:**
- **Separation of Concerns:** Keeps the frontend (Next.js) strictly focused on UI and rendering, while the backend handles business logic, database transactions, and background jobs.
- **Background Jobs:** Next.js Serverless environments (like Vercel) have strict execution timeouts (e.g., 10-60 seconds) and don't natively support long-running processes. Express running on a standard server allows us to easily run workers (like BullMQ) in the same process or a sidecar process.
- **Portability:** The API can be consumed by other clients in the future (e.g., a mobile app) without being tied to the Next.js ecosystem.

**Alternatives considered:**
- **Next.js Route Handlers (App Router):** Rejected because they run in a serverless environment by default on platforms like Vercel, which makes running persistent background workers (BullMQ) or long-lived database connections difficult and introduces cold-start latency.
- **tRPC:** Rejected to maintain a standard RESTful API surface that is easier to debug and document for third-party consumers.

## Why Prisma instead of Drizzle?

**Why this approach was chosen:**
- **Developer Experience:** Prisma provides an extremely readable schema definition language (`schema.prisma`) which makes it easy to visualize complex relationships.
- **Maturity & Ecosystem:** It has robust migration tooling and extensive community support. The generated types are highly ergonomic.

**Alternatives considered:**
- **Drizzle ORM:** Rejected because, although it offers better performance and SQL-like syntax, its migration tooling is less mature, and defining complex relational schemas takes more boilerplate compared to Prisma's DSL.
- **Raw SQL / pg:** Rejected because it sacrifices type safety and development velocity.

## Why PostgreSQL instead of MongoDB?

**Why this approach was chosen:**
- **Relational Data:** Pillar’s data model is highly relational (Users have Workspaces, Workspaces have Projects, Projects have Issues with Assignees and Labels). PostgreSQL handles these JOINs and foreign key constraints flawlessly.
- **JSONB Support:** PostgreSQL offers excellent JSONB support, allowing us to store unstructured data (like `Issue.description` or `Event.payload`) without giving up the benefits of a relational database.

**Alternatives considered:**
- **MongoDB:** Rejected because managing complex relations (like users, workspace members, project members) requires multiple queries or complex aggregation pipelines, and enforcing data integrity is harder.
- **MySQL:** Rejected primarily due to preference; PostgreSQL generally has better JSON support and more advanced indexing options.

## Why Service Layer instead of putting logic inside routes?

**Why this approach was chosen:**
- **Reusability:** Business logic (e.g., `workspaceService.create`) can be called from multiple places, such as an HTTP route, a GraphQL resolver, or a background worker.
- **Testability:** Services can be unit-tested in isolation without needing to mock Express request and response objects.

**Alternatives considered:**
- **Fat Controllers (Logic in Routes):** Rejected because it leads to duplicated code, bloated route files, and makes it impossible to reuse the logic elsewhere without making an HTTP call.

## Why BullMQ?

**Why this approach was chosen:**
- **Reliability:** Built on Redis, BullMQ provides robust queues with built-in retries, backoff strategies, and delayed jobs.
- **Decoupling:** Allows us to offload heavy tasks (like sending notifications or updating real-time graphs) from the main HTTP request lifecycle, ensuring fast response times for the user.

**Alternatives considered:**
- **AWS SQS:** Rejected because it adds cloud infrastructure dependency too early and complicates local development.
- **Node-cron / in-memory queues:** Rejected because they are not durable; if the server restarts, pending jobs are lost.

## Why NextAuth?

**Why this approach was chosen:**
- **Integration:** It is purpose-built for Next.js, providing seamless integration with the App Router.
- **Providers:** It offers out-of-the-box support for OAuth providers like GitHub, as well as Custom Credentials.

**Alternatives considered:**
- **Clerk / Auth0:** Rejected to avoid vendor lock-in and potential costs at scale. We want to own our user data completely in our own database.
- **Passport.js:** Rejected because configuring it to work smoothly within Next.js Server Components and Actions is cumbersome compared to NextAuth.

## Why JWT?

**Why this approach was chosen:**
- **Stateless:** The Next.js frontend can verify the user's identity via the JWT without needing to do a database lookup on every single page load.
- **Decoupled API Authentication:** The Express API can easily verify the JWT sent in the `Authorization` header by sharing the `NEXTAUTH_SECRET`.

**Alternatives considered:**
- **Database Sessions:** Rejected because they introduce an extra database query for every authenticated API request, which can become a bottleneck.

## Why Server Actions?

**Why this approach was chosen:**
- **Simplicity:** Server Actions allow us to call our Express API securely from the server side without exposing our API routes directly to the client browser.
- **Cookie Management:** They have direct access to the Next.js `cookies()` API, making it trivial to extract the session token and forward it to the Express API.

**Alternatives considered:**
- **Direct Client Fetch:** Rejected because it would require exposing the Express API directly to the browser, handling CORS, and manually managing tokens on the client side.
