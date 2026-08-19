# SOLA

**Solutions-Oriented Learning & Action**

SOLA connects people and organizations who have real-world problems with TVET schools that have the technical skills and student talent needed to develop practical solutions.

> Real Problems. Real Skills. Real Solutions.

The **school** is the solution provider. The **service seeker** is the client. **Students** build solutions under school supervision. SOLA organizes, tracks, and measures the full lifecycle.

## Problem

TVET schools have skilled students and workshops. Communities, businesses, and institutions have practical problems. There is no structured way to connect them, supervise delivery, and measure impact.

## Solution

A multi-school platform that runs this workflow:

**Problem → Validation → Matching → Project → Development → Testing → Delivery → Feedback → Impact**

## Architecture

Modular monolith: Node.js / Express / TypeScript backend + React / Vite frontend + MongoDB.

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Phase 3 (current)

Service requests: a client submits a problem, the school reviews it, and valid status changes are enforced.

Phase 2 delivered schools, invitations, and partnership review.

## Setup

```powershell
cd C:\Users\HP\Projects\sola
npm install
npm run dev
```

MongoDB must be running on `mongodb://127.0.0.1:27017`. Install [MongoDB Community](https://www.mongodb.com/try/download/community) if you do not have it. Or set `MONGODB_URI` in `server/.env` to a MongoDB Atlas connection string.

## Development

```powershell
cd C:\Users\HP\Projects\sola
npm run dev
```

Then seed demo users (optional):

```bash
npm run seed
```

- API: http://localhost:4000
- Client: http://localhost:5173

## Demo seed

```bash
cd server && npm run seed
```

All seed records are labeled `[DEMO]`. Password for demo accounts: `Password12!`

- `demo.admin@sola.local` — platform admin
- `demo.schooladmin@sola.local` — school admin
- `demo.coordinator@sola.local` — coordinator
- `demo.teacher@sola.local` — teacher
- `demo.student@sola.local` — student
- `demo.seeker@sola.local` — service seeker

Never treat seed data as real impact.

## Testing

```bash
cd server && npm test
cd ../client && npm test
```

## Documentation

| File | Purpose |
|------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Modules, tenancy, workflow |
| [API.md](./API.md) | REST endpoints |
| [DATABASE.md](./DATABASE.md) | Models and indexes |
| [SECURITY.md](./SECURITY.md) | Auth, RBAC, isolation |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment variables |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Git workflow |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy notes |
# sola
