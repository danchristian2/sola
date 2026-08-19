# Security

- Passwords hashed with bcrypt (cost 12).
- JWT in HTTP-only, Secure (production), SameSite cookies.
- Helmet, CORS allowlist (`CLIENT_URL`), rate limiting on auth routes.
- Zod validation on all inputs.
- Central RBAC: permission strings, not ad-hoc role checks.
- School tenant isolation in services via `resolveSchoolId`. Never trust client-supplied school IDs for authorization.
- Errors: safe messages to clients; stack traces only in logs.
- No secrets in source. Use `.env` (never committed).
- File uploads (Phase 5): type, size, and name validation behind `FileStorage`.
