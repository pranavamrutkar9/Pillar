## Technical Debt

- **Duplicate password hash migrations**: Two migration files exist for the same change — 20260705063115_add_password_hash and 20260705064947_add_password_hash. This happened because db push was used instead of migrate dev. Does not break anything currently but should be cleaned up before production deployment.
