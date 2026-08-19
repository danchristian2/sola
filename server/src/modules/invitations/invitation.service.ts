import { InvitationModel, INVITATION_STATUSES, INVITEABLE_ROLES } from "./invitation.model.js";
import { UserModel } from "../users/user.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { writeAudit } from "../audit/audit.service.js";
import {
  AuthenticationError,
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError
} from "../../common/errors/AppError.js";
import { ROLES, USER_STATUSES, type Role } from "../../common/constants/roles.js";
import { resolveSchoolId } from "../../common/middleware/tenant.js";
import { hashPassword } from "../../common/utils/password.js";
import { randomToken, sha256 } from "../../common/utils/crypto.js";
import { signAccessToken } from "../../common/utils/jwt.js";
import { permissionsForRole } from "../../common/rbac/index.js";
import { paginatedResult, parsePagination } from "../../common/utils/pagination.js";
import type { Env } from "../../config/env.js";
import type { AuthUser } from "../auth/auth.types.js";
import type { AcceptInvitationInput, CreateInvitationInput } from "./invitation.schema.js";

const COORDINATOR_INVITE_ROLES: Role[] = [ROLES.TEACHER, ROLES.STUDENT];

function publicInvitation(doc: {
  _id: { toString(): string };
  schoolId: { toString(): string };
  userId: { toString(): string };
  email: string;
  role: Role;
  departmentId?: { toString(): string };
  status: string;
  expiresAt: Date;
  createdAt: Date;
}) {
  return {
    id: doc._id.toString(),
    schoolId: doc.schoolId.toString(),
    userId: doc.userId.toString(),
    email: doc.email,
    role: doc.role,
    departmentId: doc.departmentId ? doc.departmentId.toString() : null,
    status: doc.status,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt
  };
}

export class InvitationService {
  constructor(private readonly env: Env) {}

  async create(actor: AuthUser, schoolId: string, input: CreateInvitationInput, revealToken: boolean) {
    const allowedId = resolveSchoolId(actor, schoolId);
    this.assertCanInvite(actor, input.role);

    if (input.departmentId) {
      const dept = await DepartmentModel.findOne({
        _id: input.departmentId,
        schoolId: allowedId
      }).lean();
      if (!dept) throw new NotFoundError("Department not found");
    }

    const existing = await UserModel.findOne({ email: input.email.toLowerCase() }).lean();
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const token = randomToken();
    const user = await UserModel.create({
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(randomToken()),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      schoolId: allowedId,
      departmentId: input.departmentId,
      status: USER_STATUSES.INVITED
    });

    const invitation = await InvitationModel.create({
      schoolId: allowedId,
      userId: user._id,
      email: user.email,
      role: input.role,
      departmentId: input.departmentId,
      tokenHash: sha256(token),
      invitedBy: actor.id,
      status: INVITATION_STATUSES.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await writeAudit({
      actorId: actor.id,
      action: "user.invited",
      entityType: "User",
      entityId: user._id.toString(),
      schoolId: allowedId,
      metadata: { role: input.role, email: user.email }
    });

    return {
      invitation: publicInvitation(invitation),
      token: revealToken ? token : undefined
    };
  }

  async list(actor: AuthUser, schoolId: string, query: { page?: unknown; limit?: unknown }) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const { page, limit, skip } = parsePagination(query);
    const filter = { schoolId: allowedId };
    const [items, total] = await Promise.all([
      InvitationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      InvitationModel.countDocuments(filter)
    ]);
    return paginatedResult(items.map(publicInvitation), total, page, limit);
  }

  async revoke(actor: AuthUser, schoolId: string, invitationId: string) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const invitation = await InvitationModel.findOne({
      _id: invitationId,
      schoolId: allowedId
    });
    if (!invitation) throw new NotFoundError("Invitation not found");
    if (invitation.status !== INVITATION_STATUSES.PENDING) {
      throw new BusinessRuleError("Only pending invitations can be revoked");
    }

    invitation.status = INVITATION_STATUSES.REVOKED;
    await invitation.save();

    await UserModel.updateOne(
      { _id: invitation.userId, status: USER_STATUSES.INVITED },
      { status: USER_STATUSES.DISABLED }
    );

    return publicInvitation(invitation);
  }

  async accept(input: AcceptInvitationInput) {
    const invitation = await InvitationModel.findOne({
      tokenHash: sha256(input.token),
      status: INVITATION_STATUSES.PENDING,
      expiresAt: { $gt: new Date() }
    }).select("+tokenHash");

    if (!invitation) {
      throw new AuthenticationError("Invitation is invalid or expired");
    }

    const user = await UserModel.findById(invitation.userId).select("+passwordHash");
    if (!user || user.status === USER_STATUSES.DISABLED) {
      throw new AuthenticationError("Invitation is invalid or expired");
    }

    user.passwordHash = await hashPassword(input.password);
    user.firstName = input.firstName ?? user.firstName;
    user.lastName = input.lastName ?? user.lastName;
    user.status = USER_STATUSES.ACTIVE;
    await user.save();

    invitation.status = INVITATION_STATUSES.ACCEPTED;
    invitation.acceptedAt = new Date();
    await invitation.save();

    await writeAudit({
      actorId: user._id.toString(),
      action: "user.invitation_accepted",
      entityType: "User",
      entityId: user._id.toString(),
      schoolId: invitation.schoolId.toString()
    });

    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
      status: user.status,
      permissions: permissionsForRole(user.role)
    };

    return {
      user: authUser,
      token: signAccessToken(this.env, {
        sub: authUser.id,
        role: authUser.role,
        schoolId: authUser.schoolId
      })
    };
  }

  private assertCanInvite(actor: AuthUser, role: Role) {
    if (!(INVITEABLE_ROLES as readonly string[]).includes(role)) {
      throw new BusinessRuleError("This role cannot be invited into a school");
    }
    if (actor.role === ROLES.SUPER_ADMIN || actor.role === ROLES.SCHOOL_ADMIN) {
      return;
    }
    if (actor.role === ROLES.SCHOOL_COORDINATOR && COORDINATOR_INVITE_ROLES.includes(role)) {
      return;
    }
    throw new AuthorizationError("You cannot invite this role");
  }
}
