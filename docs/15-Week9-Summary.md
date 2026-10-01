# Week 9 Summary: Cycles & Modules

This week focused on implementing project management groupings: **Cycles** (sprints) and **Modules** (epics). We also built a robust analytics engine to calculate burndown charts and velocity.

## 1. Cycles (Sprints)
Cycles allow teams to time-box their work into predictable chunks (e.g., 2 weeks).
- **States:** A cycle can be `PLANNED` (future), `ACTIVE` (ongoing), or `COMPLETED` (past).
- **Date Management:** Cycles rely on strict `startsAt` and `endsAt` dates which govern how scope creep is calculated.
- **Deterministic Carry-Forward:** When a cycle is completed, `cycleWorker.ts` runs via BullMQ. It searches for unfinished issues (not in a "Done" status) and automatically moves them to the next available `PLANNED` cycle. If no planned cycle exists, it falls back to an `ACTIVE` cycle.

## 2. Cycle Analytics & Burndown
A sophisticated event-replay system was built in `cycleAnalytics.service.ts` to calculate real-time metrics.

### Summary Metrics
- **Initial Scope:** Total points of issues added *before* the cycle's `startsAt` date.
- **Added Scope (Scope Creep):** Points added *after* the cycle officially started.
- **Removed Scope:** Points removed *after* the cycle started.
- **Velocity:** Total points of all completed issues in the cycle.
- **Completion Rate:** `(Velocity / Final Scope) * 100`.

### Burndown Chart
Instead of saving nightly snapshots in cron jobs, the burndown chart evaluates the raw `Event` table on-the-fly. It replays all `issue.added_to_cycle`, `issue.removed_from_cycle`, `issue.updated`, and `issue.moved` events chronologically. By simulating these events day-by-day, it accurately plots the "Remaining Points" against an "Ideal" linear burndown line.

## 3. Modules (Epics)
Modules represent larger, long-running feature groupings (like "GitHub Integration" or "User Authentication") that span across multiple cycles. 
- Issues can belong to a module independently of their cycle assignment.
- Dedicated UI pages allow users to view progress grouped purely by these features.

## 4. Notable Fixes & Learnings
- **Double-Counting Bug:** We encountered an issue where `Initial/Added Scope` was doubled. This was traced back to `activityWorker.ts` duplicate-writing events that were already persisted synchronously by `event.service.ts`. The worker was updated to act purely as an asynchronous hook rather than a database writer, enforcing `event.service.ts` as the single source of truth for the event log.
