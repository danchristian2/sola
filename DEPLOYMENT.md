# Deployment

Phase 8. Until then, local development:

1. MongoDB running
2. `server`: `npm run build && npm start`
3. `client`: `npm run build` and serve `dist/`

Production checklist: strong `JWT_SECRET`, HTTPS, Secure cookies, CORS allowlist, Mongo auth, log aggregation, backups.
