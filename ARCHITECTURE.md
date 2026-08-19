# SOLA Architecture

SOLA is a **modular monolith**. One deployable backend, one React client, one MongoDB database. Module boundaries are explicit so they can be extracted later if needed.

## Product workflow

```
SERVICE SEEKER
  → SUBMIT REQUEST
  → SOLA / SCHOOL REVIEWS
  → TVET SCHOOL ACCEPTS / ASSIGNS
  → CHALLENGE CREATED
  → TEACHER / DEPARTMENT ASSIGNED
  → STUDENT TEAM ASSIGNED
  → RESEARCH → DESIGN → DEVELOPMENT → TESTING
  → CLIENT FEEDBACK → IMPROVEMENT
  → DELIVERY / DEPLOYMENT
  → IMPACT MEASUREMENT
  → COMPLETION
```

Every feature must support:

**Problem → Validation → Matching → Project → Development → Testing → Delivery → Feedback → Impact**

## Primary users

1. TVET schools (solution providers)
2. Service seekers (clients / problem owners)

Secondary: coordinators, teachers, students (builders under school supervision).

SOLA is not a student marketplace, LMS, or generic school MIS.

## Repository layout

```
sola/
  server/     Express API (TypeScript)
  client/     React + Vite app
  docs live at repo root
```

## Backend modules

| Module | Responsibility |
|--------|----------------|
| auth | Register, login, logout, session, password reset |
| users | User profiles, invitations, role assignment |
| schools | Multi-school tenancy, onboarding |
| serviceSeekers | Client organizations / individuals |
| serviceRequests | Problem intake and request state machine |
| challenges | School-facing challenge created from an accepted request |
| departments | School departments and skill coverage |
| teams | Student teams and roles |
| projects | Delivery lifecycle |
| tasks | Simple task tracking |
| evidence | Files and proof of work |
| feedback | Client ratings and comments |
| impact | Measurable outcomes |
| notifications | In-app notifications (email/SMS behind adapter) |
| reports | Dashboards and aggregations |

Controllers stay thin. Business rules live in services.

## Frontend

Role-based route groups:

- `public/` landing, login, register
- `service-seeker/` simple request + tracking UX
- `school/` school admin dashboard
- `coordinator/` review, assign, monitor
- `teacher/` assigned projects and tasks
- `student/` my projects, my tasks, progress
- `admin/` platform super admin

## Multi-school isolation

Every school-owned entity has `schoolId`. Authorization is enforced on the backend. A user from School A cannot read School B private data.

## Permissions

Roles map to permissions. Do not scatter `if (role === ...)` checks. Use a central permission catalog (`server/src/common/rbac`).

## File storage

`FileStorage` is an interface. Phase 1 uses local disk. Later: S3-compatible or Cloudinary without changing modules.

## Notifications

In-app first. `NotificationChannel` abstraction for email/SMS later.

## Matching

Phase 4+: deterministic rules (category, skills, department, availability). No AI in MVP.

## Implementation phases

1. Foundation
2. Schools and users
3. Service requests (this phase)
4. Projects
5. Evidence and feedback
6. Impact
7. Analytics dashboards
8. Hardening and deployment
