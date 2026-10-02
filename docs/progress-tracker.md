## Technical Debt

- **Duplicate password hash migrations**: Two migration files exist for the same change — 20260705063115_add_password_hash and 20260705064947_add_password_hash. This happened because db push was used instead of migrate dev. Does not break anything currently but should be cleaned up before production deployment.

- **Schema divergence — CycleIssue junction table**: The roadmap specified a many-to-many CycleIssue junction table (cycle_id, issue_id, added_by, added_at). The actual implementation uses a simpler one-to-many relationship with cycleId and moduleId as direct foreign keys on the Issue model. This means an issue can only belong to one cycle and one module at a time. Acceptable for V1 but should be migrated to junction tables before V2 analytics features are built, since cycle velocity and burndown calculations become inaccurate when issues move between cycles.

- **Audit report inaccuracy**: The Week 9 codebase audit incorrectly listed CycleIssue and ModuleIssue as existing models. They were in the original schema design but were simplified to direct foreign keys (cycleId, moduleId on Issue) during implementation. The audit tool was reading a cached or stale schema reference.
