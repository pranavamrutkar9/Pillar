# Frontend Documentation

This document explains the core frontend patterns, specifically focusing on data mutation via Server Actions.

## 1. `apps/web/src/actions/workspaceActions.ts`

**Dependency Graph:**
`workspaceActions.ts`
↓
`next/headers` (cookies)
↓
`next/cache` (revalidatePath)
↓
`fetch` (calls Express API)

**Mental Model:**
*How should I think before writing this file?*
- ✓ Is it a server action? (Must start with `"use server";`)
- ✓ Do we need auth? (Extract `next-auth.session-token` from cookies).
- ✓ Where is the API? (Read `process.env.API_URL`).
- ✓ Construct fetch request? (Include `Authorization: Bearer <token>`, serialize body).
- ✓ Handle errors? (Check `!res.ok`, throw standard Error).
- ✓ Update UI? (Call `revalidatePath("/")` to clear Next.js cache and reflect new data).

**Runtime Lifecycle:**
- **When is this file loaded?** Executed on the Next.js Node server when a client component invokes it.
- **Who imports it?** Client components (like `WorkspaceForm.tsx`).
- **Who calls it?** Triggered by an RPC call from the browser when a form is submitted.
- **What calls next?** It makes an HTTP request to the Express API.
- **When does it finish?** When it returns data or throws an error back to the client.

**Call Hierarchy:**
- **Who calls this file?** `WorkspaceForm` (React Client Component)
- **Who does this file call?** `cookies()`, `fetch()`, `revalidatePath()`

**Prerequisites:**
- Next.js Server Actions
- Cache revalidation strategies
- Cookie manipulation

---

## Common Interview Questions

- **Why use Server Actions instead of client-side `fetch`?** Server Actions execute securely on the server. They have direct access to HTTP-only cookies, prevent API keys from leaking to the browser, and simplify state management by eliminating the need for `useState` and `useEffect` just to submit a form.
- **What does `revalidatePath` do?** It tells the Next.js App Router cache that data has changed for a specific route. On the next render, Next.js will refetch server components for that path rather than serving stale HTML.
- **How does the API know who is making the request?** The server action reads the NextAuth session cookie and forwards it as a Bearer token in the Authorization header to the Express API.
