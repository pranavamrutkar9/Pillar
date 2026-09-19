# Authentication Documentation

This document explains the NextAuth integration and how the Next.js frontend securely authenticates with the Express backend.

## 1. `apps/web/src/lib/auth.ts`

**Dependency Graph:**
`auth.ts`
↓
`next-auth/providers/github`
↓
`next-auth/providers/credentials`
↓
`fetch` (calls Express API for validation/upsert)

**Mental Model:**
*How should I think before writing this file?*
- ✓ Define Providers? (GitHub, Credentials).
- ✓ Credentials strategy? (In `authorize`, send email/password to Express API. Return user if valid).
- ✓ OAuth strategy? (In `jwt` callback, intercept first login, send profile to Express API to `upsert` the user in PostgreSQL).
- ✓ Token linking? (CRITICAL: Ensure `token.sub` is always set to our PostgreSQL `user.id`, NOT the GitHub ID).
- ✓ Session population? (Map `token.sub` to `session.user.id`).

**Runtime Lifecycle:**
- **When is this file loaded?** By the `[...nextauth]/route.ts` API handler.
- **Who imports it?** NextAuth API routes, Server Components checking sessions.
- **Who calls it?** NextAuth library internals when processing logins or validating sessions.

**Call Hierarchy:**
- **Who calls this file?** NextAuth Route Handler
- **Who does this file call?** Express API (`/api/auth/login`, `/api/auth/signin`)

**Prerequisites:**
- NextAuth configuration objects
- JWT mechanics
- OAuth 2.0 flow

---

## 2. `apps/api/src/routes/auth.ts`

**Dependency Graph:**
`auth.ts`
↓
`bcryptjs`
↓
`prisma`
↓
`eventBus`

**Mental Model:**
*How should I think before writing this file?*
- ✓ What are the endpoints? (`/register`, `/login`, `/signin` for OAuth).
- ✓ Validate input?
- ✓ Hash passwords? (Use `bcrypt.hash` on register).
- ✓ Compare hashes? (Use `bcrypt.compare` on login).
- ✓ Handle OAuth upsert? (Use `prisma.user.upsert` to create or update based on email).
- ✓ Security? (NEVER return the `passwordHash` in the API response).

---

## Common Interview Questions

- **How does NextAuth work in this architecture?** NextAuth runs on the Next.js server. It handles the OAuth handshakes and cookie management. However, it defers to our Express API to actually validate passwords or store user records.
- **What is a JWT?** JSON Web Token. It's a cryptographically signed string that contains claims (like user ID). Because it's signed by `NEXTAUTH_SECRET`, the Express API can trust it without querying the database.
- **Why do we use `upsert` for GitHub login?** A user might log in with GitHub on day 1, and log in with GitHub again on day 2. `upsert` safely creates the user if they don't exist, or updates their profile (like avatar) if they already exist, without throwing duplicate key errors.
