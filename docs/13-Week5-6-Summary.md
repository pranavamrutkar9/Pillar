# Week 5 & 6 Summary: Dashboards, Search, & Deployment

These weeks were focused on improving global discoverability, preparing the application for production, and establishing end-to-end testing.

## Dashboard & Global Search

- **Dashboard**: Created a unified dashboard view using `getDashboard()` to aggregate relevant projects, recent issues, and activity for the current user.
- **Global Search**: Implemented a global search functionality across the workspace.
  - **Raw SQL**: We utilized raw SQL queries to optimize full-text search capabilities.
  - **Membership Guard**: Strict membership checks were added to ensure users can only search across projects and workspaces they are explicitly authorized to access.

## Landing Page & Deployment

- **Landing Page**: Built an introductory landing page for the application.
- **Deployment Config**: Configured deployment settings, ensuring environment variables, build scripts, and production database connections are correctly wired up.

## E2E Testing

- **Playwright Setup**: Integrated Playwright for comprehensive end-to-end testing to ensure critical user flows (login, workspace creation, issue management) function correctly in a real browser environment.
