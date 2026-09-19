# Week 3 Summary: Real-time & Performance

## Summary of Week 3

In Week 3, the focus shifted towards making Pillar feel alive and highly responsive. We introduced WebSockets and an event-driven architecture to instantly sync state across all connected clients, bypassing the need for manual refreshes.

**Features Implemented:**
- **Realtime Infrastructure (WebSockets):** Integrated `socket.io` to establish persistent WebSocket connections between the Next.js frontend and the Express API server.
- **Event-Driven Workers:** The `realtimeWorker.ts` now listens to BullMQ events (published by the EventBus) and pushes updates directly to connected clients in specific project "rooms".
- **Realtime Kanban Board:** The drag-and-drop `BoardView.tsx` (powered by `@dnd-kit`) now instantly persists state via the `moveIssueAction` and broadcasts `issue.moved` and `issue.updated` events to all active users.
- **Presence Indicators:** Implemented `presence.updated` and `presence.sync` socket events to track which users are currently online and viewing a project.
- **Redis Infrastructure:** Configured Upstash Redis to power BullMQ job queues and manage WebSocket pub/sub state.

---

## Steps to Verify Week 3

To confirm that the Week 3 realtime functionality is working correctly, follow these verification steps:

### 1. Test Real-time Syncing (Multi-Client)
1. Open your browser and navigate to the **Pillar Board View** for a specific project.
2. Open an **Incognito Window** (or a different browser) and log in as a different user (or the same user), navigating to the exact same project board.
3. Place both windows side-by-side.
4. In Window A, **drag and drop** an issue from one status column (e.g., *Todo*) into another (e.g., *In Progress*).
5. **Verify:** Window B should instantly update the issue's position without requiring a page refresh. You should see `Realtime issue moved` in the browser console of Window B.

### 2. Test Real-time Issue Updates
1. Keep both windows open on the project.
2. In Window A, click on an issue to open the `IssueDetail` view.
3. Change the title, priority, or status of the issue.
4. **Verify:** Window B should immediately reflect these changes on the Kanban board or list view. You should see `Realtime issue updated` in the browser console of Window B.

### 3. Verify the Background Workers & Logs
1. Look at your terminal running `pnpm dev`.
2. Check the output logs for the backend API (`apps/api dev`).
3. **Verify:** You should see logs indicating that the `realtimeWorker` is actively picking up jobs from the Redis queue and processing them when you perform actions on the frontend.
4. **Verify:** You should see `[Socket] Authenticated client connected` and `[Socket] User <id> joined room project:<id>` logs when the frontend mounts the `ProjectStore`.

### 4. Test Presence Syncing
1. Ensure both Window A and Window B are on the same project.
2. Close Window B.
3. **Verify:** The frontend state for `activeUsers` (if displayed in the UI) should eventually remove the user from Window B. You can also monitor `presence.updated` in the browser network/console tab.

---

## How this architecture will evolve into Week 4

With real-time functionality stable, future weeks will focus on:
- **Activity Feeds:** Rendering a persistent timeline of events (e.g., "Pranav moved issue to In Progress") using the `activityWorker`.
- **Advanced Caching:** Caching heavy project statistics in Redis.
- **Notifications:** Using the `notificationWorker` to dispatch emails when users are tagged in Tiptap comments or assigned to issues.
