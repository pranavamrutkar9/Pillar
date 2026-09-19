# Backend Documentation

This document explains the core backend files, their responsibilities, and how to think about them.

## 1. `apps/api/src/index.ts`

**Dependency Graph:**
`index.ts`
↓
`routes/*`, `workers/*`
↓
`express`

**Mental Model:**
*How should I think before writing this file?*
- ✓ Import Express?
- ✓ Register middleware (JSON parsing, CORS)?
- ✓ Initialize background workers?
- ✓ Mount domain-specific routers (`/api/auth`, `/api/workspaces`)?
- ✓ Start listening on a port?
This is the entry point. Keep it clean. It should only wire things together.

**Runtime Lifecycle:**
- **When is it loaded?** On server start (`node index.js`).
- **Who imports it?** Nobody. It is the root execution script.
- **What calls next?** It sets up listeners. Incoming HTTP requests trigger the mounted routes.

**Prerequisites:**
- Express application lifecycle
- Node.js module resolution

---

## 2. `apps/api/src/routes/workspaces.ts`

**Dependency Graph:**
`workspaces.ts`
↓
`requireAuth`, `requireWorkspaceAdmin`
↓
`workspaceService`, `inviteService`

**Mental Model:**
*How should I think before writing this file?*
- ✓ What is the resource? (Workspaces)
- ✓ Does it require auth? (Yes, apply `requireAuth` router-wide)
- ✓ Validate input? (Check if `name` is string and not empty)
- ✓ Extract user ID from `req.user`?
- ✓ Call the Service Layer? (Pass validated DTO)
- ✓ Catch errors and return 500?

**Runtime Lifecycle:**
- **When is it loaded?** Bootstrapped by `index.ts`.
- **Who calls it?** Express router when a request hits `/api/workspaces/*`.
- **What calls next?** Middleware -> Service Layer -> Response.

**Call Hierarchy:**
- **Who calls this file?** `index.ts` -> Express Router
- **Who does this file call?** `requireAuth` -> `workspaceService.create` -> `res.json`

---

## 3. `apps/api/src/services/workspaceService.ts`

**Dependency Graph:**
`workspaceService.ts`
↓
`prisma`
↓
`eventBus`

**Mental Model:**
*How should I think before writing this file?*
- ✓ Does it need a transaction? (Yes, creating a workspace and the owner's membership must succeed or fail together).
- ✓ Handle edge cases? (Slug collision generation).
- ✓ Emit events? (Yes, after successful commit, emit `workspace.created` for downstream workers).
- ✓ Return the created object?

**Runtime Lifecycle:**
- **When is it loaded?** Imported by `routes/workspaces.ts`.
- **Who calls it?** The route handler.
- **What calls next?** Prisma Client, then EventBus, then returns to the route.

**Call Hierarchy:**
- **Who calls this file?** `workspaces.ts`
- **Who does this file call?** `prisma.$transaction`, `emit('workspace.created')`

---

## 4. `apps/api/src/middleware/requireAuth.ts`

**Dependency Graph:**
`requireAuth.ts`
↓
`next-auth/jwt`

**Mental Model:**
*How should I think before writing this file?*
- ✓ How do we identify the user? (JWT passed via headers/cookies).
- ✓ Extract the token? (Use `getToken` from NextAuth with `NEXTAUTH_SECRET`).
- ✓ Validate token? (Check if `token.sub` exists).
- ✓ Mutate request? (Attach `req.user = { id: token.sub }`).
- ✓ Call `next()` or return `401`?

**Runtime Lifecycle:**
- **When is it loaded?** Imported by protected routes.
- **Who calls it?** Express router pipeline before the main handler.
- **When does it finish?** When it calls `next()` or `res.status(401)`.

**Prerequisites:**
- Express Middleware signature `(req, res, next)`
- NextAuth JWT decoding strategies

---

## Common Interview Questions

- **Why use Services?** To decouple business logic from HTTP transport, making code reusable and easier to unit test.
- **Why do we use transactions?** To ensure data integrity. If creating a workspace succeeds but adding the owner as an admin fails, the database would be in an invalid state. Transactions ensure both happen, or neither happens.
- **Why emit events after commit?** If we emit an event *before* the transaction commits, a worker might pick up the event and try to query the database for a record that isn't fully saved yet, causing a race condition error.
- **What is middleware?** A function that executes during the request-response cycle, allowing us to inspect, modify, or reject a request before it reaches the final route handler (e.g., authentication, logging).

---

## 5. `apps/api/src/services/issue.service.ts`

**Mental Model:**
- **Sequence IDs**: We use atomic database increments to give each issue a readable ID (like `PIL-123`) instead of relying solely on UUIDs for user display.
- **Transactions & Activities**: Creating an issue, setting its initial status, and logging that creation in `IssueActivity` all happen inside one transaction.
- **Events**: We emit `issue.created` only *after* the transaction commits, ensuring background workers find the data when they query for it.

---

## 6. `apps/api/src/services/github.service.ts`

**Mental Model:**
- **Webhook Normalization**: GitHub sends raw, complex JSON payloads. This service strips out the noise and normalizes the payload into a standard internal event format.
- **Fan-out**: It acts as a dispatcher. Once normalized, it publishes events to BullMQ, letting specialized workers (like linkers or syncers) handle the heavy lifting asynchronously.

---

## 7. `apps/api/src/workers/github/githubLinkWorker.ts`

**Mental Model:**
- **Regex Parsing**: This worker uses regex against PR titles and bodies to detect patterns like `Fixes PIL-45` or just `PIL-45`.
- **Lookup & Upsert**: It splits the slug (`PIL`) and sequence ID (`45`), looks up the issue in the database, and performs an upsert into the `PullRequestIssue` junction table to map the PR to the issue.

---

## 8. `apps/api/src/services/searchService.ts`

**Mental Model:**
- **Membership Guard**: Security first. We always verify that the user requesting the search is actually a member of the workspace/project they are querying.
- **Raw SQL & JSONB**: To efficiently search across unstructured data (like our JSONB `description` field) or do complex joins quickly, we leverage `$queryRaw`.
- **Parameterized SQL**: We always use parameterized values in `$queryRaw` to prevent SQL injection vulnerabilities. String concatenation in queries is strictly forbidden.
