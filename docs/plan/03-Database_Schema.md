## 6. Core Database Schema
Most important thing you do before writing any code. Spend a full day on this. Get the relationships right. Wrong schema in V1 = painful migrations every week in V2.

| Table | Key Fields |
|---|---|
| users | id, email, username, avatar_url, github_id, github_username, created_at |
| workspaces | id, name, slug (unique), owner_id → users, plan, created_at |
| workspace_members | id, workspace_id, user_id, role (admin/member/viewer), joined_at |
| invites | id, workspace_id, email, token (unique), role, invited_by, expires_at, accepted_at |
| projects | id, workspace_id, name, slug, description, status, is_hackathon_mode, deadline, github_repo_id, created_by |
| project_members | id, project_id, user_id, role — separate from workspace membership |
| issue_statuses | id, project_id, name, color, position, is_default, is_done — custom per project |
| issues | id, project_id, title, description (JSON), status_id, priority, assignee_id, creator_id, due_date, estimate, sequence_id (human readable like PIL-42) |
| issue_labels | id, project_id, name, color |
| issue_label_map | issue_id, label_id — many-to-many junction |
| issue_relations | id, issue_id, related_issue_id, relation_type (blocks/blocked_by/duplicate/related) |
| issue_activities | id, issue_id, actor_id, action, old_value, new_value, created_at — append only, never edit |
| comments | id, issue_id, author_id, body (JSON), parent_id (threading), created_at |
| modules | id, project_id, name, description, status, start_date, end_date |
| module_issues | module_id, issue_id — many-to-many junction |
| cycles | id, project_id, name, start_date, end_date, status (draft/active/completed) |
| cycle_issues | cycle_id, issue_id, added_by, added_at — many-to-many with metadata |
| adrs | id, project_id, title, context, decision, alternatives, consequences, status, author_id, superseded_by_id |
| rfcs | id, project_id, title, body (sectioned JSON), status, author_id, vote_counts |
| rfc_votes | id, rfc_id, user_id, vote (approve/request_changes/abstain) |
| rfc_comments | id, rfc_id, section_key, author_id, body, created_at — per-section threading |
| events | id, event_type, workspace_id, project_id, actor_id, payload (JSONB), created_at — AI foundation |
