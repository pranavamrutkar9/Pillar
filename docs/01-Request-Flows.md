# Request Flows

Understanding how a request travels through the system is critical. Below are the complete request flows for the features implemented in Week 1.

## Register

User
↓
Browser (Fills out form, clicks Submit)
↓
Next.js (Client Component triggers API call)
↓
Express Route (`POST /api/auth/register`)
↓
bcrypt (Hashes password)
↓
Prisma (`user.create`)
↓
Database (PostgreSQL inserts user)
↓
Response (`200 OK` with user data, minus hash)
↓
UI Update (Redirects to Login)

*Explanation: The user submits their email and password. The frontend directly calls the Express backend (or via a server action if configured). Express hashes the password, saves to Postgres, and returns success. No session is created yet; the user must log in.*

## Login (Credentials)

User
↓
Browser (Clicks Login)
↓
Next.js (NextAuth `signIn("credentials")`)
↓
NextAuth Authorize Callback
↓
Express Route (`POST /api/auth/login`)
↓
Prisma (`user.findUnique`)
↓
bcrypt (`bcrypt.compare`)
↓
NextAuth JWT Callback (Sets `token.sub = user.id`)
↓
Next.js (Sets Session Cookie)
↓
UI Update (Redirects to Dashboard)

*Explanation: NextAuth intercepts the login attempt. In its authorize callback, it sends the credentials to our Express backend. The backend verifies the hash. If valid, NextAuth creates a JWT containing the user's ID and sets it as a cookie in the user's browser.*

## GitHub Login

User
↓
Browser (Clicks "Login with GitHub")
↓
Next.js (NextAuth `signIn("github")`)
↓
GitHub (OAuth Consent Screen)
↓
Next.js (NextAuth OAuth Callback)
↓
NextAuth JWT Callback
↓
Express Route (`POST /api/auth/signin` - Upserts User)
↓
Prisma (`user.upsert`)
↓
EventBus (Emits `user.signed_in`)
↓
NextAuth (Sets `token.sub = database_cuid`)
↓
UI Update (Redirects to Dashboard)

*Explanation: The user authenticates via GitHub. NextAuth receives the GitHub profile. In the JWT callback, Next.js sends the profile to Express to ensure the user exists in our database (`upsert`). Express emits an event. NextAuth then issues a JWT tied to our internal database ID.*

## Create Workspace

User
↓
Browser (Types name, clicks "Create Workspace")
↓
Next.js Server Action (`createWorkspaceAction`)
↓
Cookies API (Extracts `next-auth.session-token`)
↓
Express Route (`POST /api/workspaces`)
↓
Middleware (`requireAuth` validates JWT)
↓
Service (`workspaceService.create`)
↓
Prisma Transaction (Creates Workspace + WorkspaceMember)
↓
EventBus (Emits `workspace.created` to BullMQ)
↓
Response (`201 Created`)
↓
Next.js (`revalidatePath("/")`)
↓
UI Update (Shows new workspace)

*Explanation: The Server Action securely reads the JWT cookie and forwards it to the API. The API middleware verifies the JWT. The service layer handles the complex logic of generating a slug and executing a transaction to create the workspace and make the creator an ADMIN. It then emits a background event before returning success.*

## Fetch Workspaces

User
↓
Browser (Navigates to Dashboard)
↓
Next.js Server Component (or client fetch)
↓
Express Route (`GET /api/workspaces`)
↓
Middleware (`requireAuth`)
↓
Service (`workspaceService.getByUser`)
↓
Prisma (`workspace.findMany` with relations)
↓
Database
↓
Response (Array of Workspaces)
↓
UI Update (Renders Workspace List)

*Explanation: A standard authenticated GET request. The service layer queries all workspaces where the current user is a member, including relation data (owner details, member roles) in a single query.*

## Send Invite

User (Admin)
↓
Browser (Submits email and role)
↓
Next.js Server Action (`createInviteAction`)
↓
Express Route (`POST /api/workspaces/:id/invites`)
↓
Middleware (`requireWorkspaceAdmin`)
↓
Service (`inviteService.createInvite`)
↓
Prisma (`invite.create` with unique token)
↓
EventBus (Emits `invite.created` - worker will send email)
↓
Response (`201 Created`)
↓
UI Update (Shows pending invite)

*Explanation: The API uses specific authorization middleware to ensure the requester is an Admin of that exact workspace. It generates a secure token and saves the invite. An event is emitted so a background worker can actually send the email without blocking the HTTP response.*

## Accept Invite

User (Invitee)
↓
Browser (Clicks link in email `/invite?token=xyz`)
↓
Next.js Server Action (`acceptInviteAction`)
↓
Express Route (`POST /api/invites/:token/accept`)
↓
Middleware (`requireAuth` ensures user is logged in)
↓
Service (`inviteService.acceptInvite`)
↓
Prisma Transaction (Deletes Invite, Creates WorkspaceMember)
↓
Response (`200 OK`)
↓
Next.js (`revalidatePath("/")`)
↓
UI Update (User now sees the workspace)

*Explanation: The invitee must be logged in to accept. The backend finds the invite by token, verifies it hasn't expired, adds the user to the workspace with the specified role, and deletes the invite record, all within a transaction.*

## Create Issue

User
↓
Browser (Submits new issue details)
↓
Next.js Server Action / API Route
↓
Service (`issueService.create`)
↓
Prisma Transaction
(Creates issue with atomic sequence increment, creates activity log, inserts event into events table)
↓
EventBus (Emits `issue.created` after commit)
↓
Response (`201 Created`)

*Explanation: The creation logic is encapsulated in a transaction to guarantee that the issue, its initial activity log, and the audit event are all saved together. The event is only broadcasted to the message broker after the transaction successfully commits to avoid race conditions.*

## Move Issue

User
↓
Browser (Drags and drops issue to new column)
↓
UI Update (Optimistic UI updates column immediately)
↓
Next.js API Call
↓
Service (`issueService.moveIssue`)
↓
Prisma (Updates issue status and position)
↓
EventBus (Emits `issue.moved`)
↓
Response (`200 OK`)

*Explanation: The UI updates instantly using optimistic rendering. In the background, the server processes the move. If the request fails, the UI reverts the change. Upon success, an event is emitted so that other connected clients can see the move in real-time.*

## GitHub Webhook

GitHub
↓
Express Route (`POST /api/github/webhook`)
↓
Middleware (Extracts raw body, verifies `x-hub-signature-256`)
↓
Idempotency Check (Checks `deliveryId` in database)
↓
Prisma (Persists raw webhook event)
↓
`githubService.processWebhookEvent`
↓
EventBus (Fans out standard event to BullMQ)
↓
`githubLinkWorker` (Picks up job)
↓
Regex parsing (Finds issue ID from PR body/title)
↓
Prisma (Upserts `PullRequestIssue` link)

*Explanation: Security and idempotency are critical here. We must verify the signature to ensure it's from GitHub, and check the delivery ID so we don't process the same webhook twice. Once persisted, the payload is normalized and processed asynchronously by workers.*

## Notification

System (Worker / Service)
↓
EventBus (Emits event, e.g., `issue.assigned`)
↓
BullMQ (`notificationWorker` picks up event)
↓
Prisma (Inserts into `notifications` table)
↓
User's Browser (Polling / WebSocket receives update)
↓
NotificationCenter (Displays new unread notification)

*Explanation: Notifications are handled entirely in the background. The core request flow emits an event and returns immediately. The worker processes the event, determines who should be notified, and saves it. The client then pulls or is pushed the update.*
