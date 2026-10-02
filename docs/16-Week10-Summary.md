# Week 10: ADR & RFC System Summary

## Overview
In Week 10, we built a fully integrated Architecture Decision Record (ADR) and Request For Comments (RFC) system. This system acts as the foundational knowledge base for engineering decisions, enabling teams to not just document architecture, but actively debate it and seamlessly spawn actionable work from it.

## Database Schema Updates

The `schema.prisma` file was expanded with new models specifically designed for knowledge retention and project management integration:

### ADR Models
- `Adr`: Represents an architectural decision with fields for `title`, `context`, `decision`, `alternatives`, and `consequences`.
- **State Machine**: Enforces a strict status flow (`PROPOSED` → `ACCEPTED` → `DEPRECATED`).
- **Supersession**: Bidirectional relationship where a new `ACCEPTED` ADR can supersede an old one (`supersededById`).
- **Link Junctions**: `AdrIssue`, `AdrModule`, and `AdrPullRequest` to support cross-referencing decisions with project execution.

### RFC Models
- `Rfc`: The parent proposal container featuring `DRAFT`, `IN_REVIEW`, `ACCEPTED`, and `IMPLEMENTED` states.
- `RfcSection`: Allows RFCs to be broken down into specific modular topics.
- `RfcSectionComment`: Enables per-section discussion and feedback.
- `RfcVote`: Upsert-based voting (`APPROVE`, `REQUEST_CHANGES`, `ABSTAIN`).
- `RfcImplementationTask`: Stores engineering tasks identified during the RFC process.

## Backend Architecture

### 1. ADR Service (`adr.service.ts`)
- **Strict State Enforcement**: Prevents invalid transitions (e.g., cannot manually move to `SUPERSEDED`; must use the `supersedeAdr` method).
- **Supersession Logic**: Replaces the legacy decision and maps the bidirectional pointer to the new `ACCEPTED` decision. Added a technical debt note that transitive cycle detection (`A→B→C→A`) is a planned V2 feature.
- **Event Bus Integration**: Emits events (e.g., `adr.created`, `adr.accepted`) post-transaction.

### 2. RFC Service (`rfc.service.ts`)
- **Voting Upserts**: Prevents duplicate votes per user on the same RFC using Prisma's upsert capability.
- **Section Commenting**: Validates that only users with valid `ProjectMember` access can post comments. Emits highly specific payload events pointing to the exact `rfcId` and `commentId`.
- **The "1-Click Issue Spawner"**: A revolutionary feature that converts `RfcImplementationTask` rows into real `Issue` models.
  - **Sequential ID Generation**: Uses `project.nextIssueSequence` batch incrementing instead of random numbers to preserve database constraints.
  - **Idempotency**: Protects against double-clicking by checking `!task.generatedIssueId`.
  - **Backlinks**: Automatically inserts a TipTap markdown block into the generated issue specifying exactly which RFC it came from.

## Frontend UI (Next.js App Router)

- **ADR Hero Pages**: Added `ClientAdrsPage` and `ClientAdrDetail` with a premium aesthetic. Fixed UX issues by introducing a dynamic `<select>` dropdown for supersession, listing only valid, `ACCEPTED` alternative ADRs to prevent users from manually copying IDs.
- **RFC Hero Pages**: Built `ClientRfcsPage` and `ClientRfcDetail` featuring:
  - **Lifecycle Action Bar**: Shows status badges and triggers state machine updates.
  - **Voting Module**: Displays sticky up/down vote aggregates and highlights the user's current vote.
  - **Implementation Checklist**: Allows users to dynamically add tasks. 
  - **Gradient Spawner Button**: An acceptance-gated button that visually generates issues, updates the UI idempotently with green checkmarks, and handles Server Action API boundary routing securely.

## Technical Debt & Known Limitations
1. **Transitive Supersession Cycles**: The ADR system actively prevents direct supersession loops (`A→B→A`), but deep transitive loops (`A→B→C→A`) are not detected in V1.
2. **Comment Threads UI**: The backend routes and schemas for `RfcSectionComment` are fully built and tested, but the frontend "Discuss Section" button currently acts as a UX placeholder until inline rich-text thread rendering is implemented.
