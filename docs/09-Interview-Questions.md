# Common Interview Questions

This document compiles the architectural and technical interview questions scattered throughout the documentation. It serves as a study guide for understanding the "why" behind the code.

## Architecture
1. **Why Express instead of Next.js Route Handlers?**
   - Vercel's serverless environment imposes strict timeouts and isn't designed for long-running processes or persistent database connections. Express gives us total control over the runtime, allowing us to run background workers and maintain DB connection pools efficiently.

2. **Why Prisma instead of Drizzle?**
   - Prisma's schema DSL is highly readable, its migration tooling is mature, and it generates excellent TypeScript types. While Drizzle is faster and closer to SQL, Prisma optimizes for developer experience and velocity.

3. **Why PostgreSQL instead of MongoDB?**
   - Pillar's domain (Workspaces, Projects, Issues, Users, Labels) is highly relational. Postgres handles complex JOINs, foreign key constraints, and cascading deletes natively. Its JSONB support also handles unstructured data perfectly.

4. **Why use Services?**
   - To decouple business logic from the HTTP layer. A service can be tested independently and called from multiple entry points (REST route, WebSocket handler, background worker) without mocking `req` and `res`.

## Authentication
5. **How does NextAuth work with our custom backend?**
   - NextAuth manages the OAuth flow with GitHub and handles session cookies in the browser. In its callbacks, it communicates with our Express API to either validate passwords or upsert GitHub profiles into our Postgres database. It then creates a JWT linking the session to our internal Postgres `user.id`.

6. **What is JWT and why use it?**
   - JSON Web Token. It's a signed token that proves identity. It allows our API to be stateless—the API can verify the signature using the `NEXTAUTH_SECRET` without needing to query the database to validate a session string on every request.

7. **Why use `upsert` for OAuth logins?**
   - Because a user might log in with GitHub multiple times. `upsert` prevents duplicate key errors by creating the user if they don't exist, and updating them if they do, in a single atomic database operation.

## Database & Prisma
8. **Why do we use transactions?**
   - To ensure atomic operations. When creating a workspace, we must also create a `WorkspaceMember` record to make the creator an admin. If the first succeeds and the second fails, the data is corrupt. Transactions ensure both succeed, or both roll back.

9. **What does `onDelete: Cascade` do?**
   - It's a foreign key constraint. If a Workspace is deleted, Postgres automatically deletes all related Projects, Invites, and Members, preventing orphaned data.

10. **How is Prisma different from SQL?**
    - Prisma is an ORM. You interact with the database using type-safe TypeScript methods rather than raw SQL strings, providing auto-completion and preventing SQL injection natively.

## Event-Driven Architecture & Redis
11. **What is BullMQ?**
    - A robust, Redis-based queue for Node.js used for handling background jobs, delayed tasks, and retries.

12. **Why emit events after a database commit?**
    - If you emit an event before the transaction commits, a background worker might pick up the event immediately and try to query the database for a record that hasn't been saved yet.

13. **What is the Fan-out pattern?**
    - Emitting a single generic event (e.g., `workspace.created`) and pushing it to multiple domain-specific queues (Activity, Realtime, Notification). Each worker independently decides what to do with the event.

14. **Why run workers in the same process as the Express API?**
    - For simplicity in early development. It requires only one start command. The architecture is designed so they can easily be split into separate microservices later by pointing a different process to the same Redis instance.

## Frontend
15. **Why use Server Actions instead of client-side `fetch`?**
    - Server Actions execute on the Next.js server, meaning they can securely access HTTP-only cookies (like the NextAuth session token) and prevent sensitive logic or API URLs from being exposed to the browser.

16. **What does `revalidatePath` do?**
    - It clears the Next.js App Router cache for a specific path, forcing the server to re-render the page with fresh data from the API on the next request.

17. **How does optimistic update with revert work in dnd-kit?**
    - When a user drops an item, the frontend immediately updates the local state to show the new position, providing instant feedback. Simultaneously, it sends an API request. If the request fails, the `catch` block reverts the local state back to its previous value.

## Advanced & Integration
18. **Why Socket.io over Supabase Realtime?**
    - Since we have our own Express server and handle complex transactions internally, using Socket.io keeps our architecture cohesive without introducing a third-party real-time dependency that requires syncing state.

19. **How does GitHub webhook signature verification prevent spoofing?**
    - GitHub hashes the payload using our configured secret and sends it in the `x-hub-signature-256` header. We recalculate the hash using the exact same secret and payload. If they match, we know it truly came from GitHub and the payload wasn't tampered with.

20. **Why store deliveryId for idempotency?**
    - Webhook providers guarantee "at-least-once" delivery, meaning they might send the exact same event multiple times (e.g., if our server took too long to respond). Storing `deliveryId` allows us to check if we've already processed it, preventing duplicate records or actions.

21. **Why use $queryRaw with parameterized values instead of string concatenation?**
    - String concatenation exposes the database to SQL injection attacks. Parameterized values send the data separately from the query structure, ensuring the database treats user input strictly as data, never as executable code.

22. **How does viewer token auth work alongside JWT (viewerAuth middleware)?**
    - It allows unauthenticated external users to view specific resources (like a Hackathon project board) using a pre-shared token URL, without granting them an account. The middleware checks for this token and grants read-only access.

23. **What is BullMQ retry strategy and why does it matter for webhooks?**
    - If a worker fails to process an event (e.g., a network blip when calling the GitHub API), BullMQ automatically retries the job with exponential backoff. This ensures transient errors don't cause permanent data loss.

24. **Why membership check before returning dashboard or search results?**
    - To enforce tenant isolation. The system must guarantee that a user cannot see issues, projects, or workspaces they are not a member of, even if they guess the ID or search for related terms.

## GitHub Integration
25. **Why does githubWorker act as a router instead of containing all logic directly?**
    - Single Responsibility Principle. Each handler file owns one concern (linking, issue updates, sync, installation). The worker itself stays small and readable. Adding a new GitHub event type means adding a new handler file — not modifying the worker.

26. **Why store the raw GitHub webhook payload before processing it?**
    - Auditability and replay. If processing fails, the raw payload is preserved in GithubWebhookEvent. We can re-process it without GitHub resending the webhook. The deliveryId ensures idempotency — resending the same webhook is a no-op.
