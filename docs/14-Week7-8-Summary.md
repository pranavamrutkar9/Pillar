# Week 7 & 8 Summary: GitHub Integration

These weeks were dedicated to a deep integration with GitHub, allowing issues in Pillar to be automatically linked to and updated by GitHub Pull Requests.

## GitHub App Setup

- Created and configured a GitHub App to receive webhook events from connected repositories.

## Webhook Processing

- **Webhook Listener**: Built a secure endpoint to receive GitHub webhooks.
  - **Signature Verification**: Verifies the `x-hub-signature-256` header to ensure payloads genuinely originate from GitHub.
  - **Idempotency**: Uses the `x-github-delivery` header (`deliveryId`) to prevent processing the same webhook event multiple times, a critical requirement for at-least-once delivery systems.
- **`githubService` Normalization**: The service layer normalizes raw GitHub payloads into standard internal events before dispatching them.

## Background Workers & Linking

- **Fan-out to BullMQ**: Normal events are fanned out to a dedicated GitHub worker queue.
- **`githubLinkWorker`**: 
  - **PR Parsing**: Parses PR titles and bodies using regex to find issue references (e.g., `PIL-123`).
  - **Linking**: Looks up the issue by `slug` and `sequenceId` and performs an upsert on the `PullRequestIssue` junction table to establish the link.
- **Auto-updating Status**: When a PR is merged, the system detects the event and automatically updates the corresponding Pillar issue's status to "Done".

## UI Updates

- **PR Card UI**: Added a UI component inside the Issue Detail view to display linked Pull Requests, their CI status, and review state.
