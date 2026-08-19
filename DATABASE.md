# Database

MongoDB + Mongoose.

## User

| Field | Notes |
|-------|--------|
| email | unique, lowercase |
| passwordHash | never returned |
| firstName, lastName | |
| role | SUPER_ADMIN, SCHOOL_ADMIN, SCHOOL_COORDINATOR, TEACHER, STUDENT, SERVICE_SEEKER |
| schoolId | required for school-scoped roles |
| departmentId | optional |
| status | ACTIVE, INVITED, DISABLED |
| passwordResetTokenHash / passwordResetExpiresAt | |
| lastLoginAt | |

Indexes: unique email; `{ schoolId, role }`.

## School

| Field | Notes |
|-------|--------|
| name | |
| location | |
| contactEmail / contactPhone | |
| status | PENDING, ACTIVE, SUSPENDED |

Indexes: `{ name }`, `{ status, createdAt }`.

## PartnershipApplication

A TVET school cannot self-register. It submits a partnership request. SOLA (super admin) approves or rejects it. Approval creates the School and invites the school administrator.

| Field | Notes |
|-------|--------|
| schoolName, location, contactEmail, contactPhone | |
| adminFirstName, adminLastName, adminEmail | Person who will be invited as SCHOOL_ADMIN |
| message | Optional reason to join |
| status | SUBMITTED, APPROVED, REJECTED |
| schoolId | Set on approval |

Index: `{ status, createdAt }`, `{ adminEmail }`.

## Department

| Field | Notes |
|-------|--------|
| schoolId | required, tenant key |
| name | unique per school |
| description | |
| skills | string tags used later for matching |
| isActive | |

Index: unique `{ schoolId, name }`.

## Invitation

| Field | Notes |
|-------|--------|
| schoolId | tenant key |
| userId | invited user |
| email, role, departmentId | |
| tokenHash | select:false |
| invitedBy | |
| status | PENDING, ACCEPTED, REVOKED |
| expiresAt | 7 days |

Indexes: `{ schoolId, createdAt }`, `{ tokenHash }`.

## AuditLog

actor, action, entityType, entityId, schoolId, metadata, createdAt.

Index: `{ schoolId, createdAt }`, `{ entityType, entityId }`.

## Later models

ServiceSeeker, ServiceRequest, Challenge, Project, Team, TeamMember, Task, Evidence, Feedback, ImpactMetric, Notification.
