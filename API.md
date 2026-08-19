# API

Base URL: `/api/v1`

## Response shape

Success:

```json
{ "success": true, "data": {}, "message": "..." }
```

Paginated lists:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
  }
}
```

Error:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] }
}
```

## Phase 1 endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | no | Liveness |
| POST | `/api/v1/auth/register` | no | Register (service seeker) |
| POST | `/api/v1/auth/login` | no | Login |
| POST | `/api/v1/auth/logout` | yes | Clear session cookie |
| GET | `/api/v1/auth/me` | yes | Current user |
| POST | `/api/v1/auth/forgot-password` | no | Request reset token |
| POST | `/api/v1/auth/reset-password` | no | Reset password |
| POST | `/api/v1/auth/accept-invitation` | no | Activate invited school user |

## Phase 2 endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/partnerships` | no | TVET school submits a partnership request (no account created) |
| GET | `/api/v1/partnerships` | super admin | List partnership requests |
| POST | `/api/v1/partnerships/:id/approve` | super admin | Approve request, create school, invite administrator |
| POST | `/api/v1/partnerships/:id/reject` | super admin | Reject request |
| GET | `/api/v1/schools` | school:view | List schools (own school, or all for super admin) |
| GET | `/api/v1/schools/me` | school:view | Current user's school |
| POST | `/api/v1/schools` | super admin | Create school and invite admin |
| GET | `/api/v1/schools/:id` | school:view | Get school (tenant-checked) |
| PATCH | `/api/v1/schools/:id` | school:manage | Update school profile |
| POST | `/api/v1/schools/:id/status` | super admin | Set school status |
| GET | `/api/v1/schools/:schoolId/departments` | department:view | List departments |
| POST | `/api/v1/schools/:schoolId/departments` | department:manage | Create department |
| PATCH | `/api/v1/schools/:schoolId/departments/:id` | department:manage | Update department |
| GET | `/api/v1/schools/:schoolId/users` | users:view | List school users |
| PATCH | `/api/v1/schools/:schoolId/users/:id` | users:manage | Disable user / set department |
| GET | `/api/v1/schools/:schoolId/invitations` | users:view | List invitations |
| POST | `/api/v1/schools/:schoolId/invitations` | users:manage | Invite coordinator, teacher, or student |
| POST | `/api/v1/schools/:schoolId/invitations/:id/revoke` | users:manage | Revoke invitation |

School A cannot read School B data. Isolation is enforced in services via `resolveSchoolId`.

Later phases add service-requests, projects, evidence, impact.

## Auth

JWT stored in an HTTP-only cookie (`COOKIE_NAME`). CSRF is mitigated by SameSite=Lax in development and Strict in production for cookie-based API use from the first-party SPA.
