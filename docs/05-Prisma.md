# Prisma & Database Documentation

This document explains the database schema and client configuration.

## 1. `apps/api/prisma/schema.prisma`

**Dependency Graph:**
`schema.prisma`
↓
`PostgreSQL`

**Mental Model:**
*How should I think before writing this file?*
- ✓ Define data source? (Postgres, ENV url).
- ✓ Define models? (User, Workspace, Project, Issue).
- ✓ Define relations? (1-to-many, many-to-many).
- ✓ Enforce cascading? (`onDelete: Cascade` ensures deleting a Workspace deletes its Projects).
- ✓ Define indexes? (`@@index([workspaceId])` for fast lookups).
- ✓ Map table names? (`@@map("users")` for lowercase plural convention in DB).

**Prerequisites:**
- Prisma Schema Language
- Relational Database Normalization
- Foreign Keys and Cascades

---

## 2. `apps/api/src/db/client.ts`

**Dependency Graph:**
`client.ts`
↓
`@prisma/client`

**Mental Model:**
*How should I think before writing this file?*
- ✓ Import PrismaClient?
- ✓ Prevent connection exhaustion? (In development, Next.js / Express hot reloading can create hundreds of connections. Use a global variable to cache the instance).
- ✓ Export a singleton? (`export const prisma = ...`)

**Runtime Lifecycle:**
- **When is this file loaded?** Imported by any service that needs DB access.
- **Who calls it?** Services (e.g., `workspaceService.ts`).
- **When does it finish?** The connection pool stays alive as long as the Node process is running.

---

## Common Interview Questions

- **How is Prisma different from SQL?** Prisma is an ORM (Object-Relational Mapper) that allows you to write database queries using TypeScript methods (`prisma.user.findMany()`) which provides auto-completion and type safety. Raw SQL requires writing raw strings that lack compile-time checks.
- **What does `onDelete: Cascade` do?** If a parent record is deleted (e.g., a Workspace), the database will automatically delete all child records (e.g., Projects, Invites) referencing it, preventing orphaned data and foreign key constraint errors.
