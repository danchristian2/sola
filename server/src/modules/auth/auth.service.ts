import { UserModel } from "../users/user.model.js";
import { writeAudit } from "../audit/audit.service.js";
import {
  AuthenticationError,
  ConflictError,
  ValidationError
} from "../../common/errors/AppError.js";
import { ROLES, USER_STATUSES } from "../../common/constants/roles.js";
import { permissionsForRole } from "../../common/rbac/index.js";
import { hashPassword, verifyPassword } from "../../common/utils/password.js";
import { randomToken, sha256 } from "../../common/utils/crypto.js";
import { signAccessToken } from "../../common/utils/jwt.js";
import type { Env } from "../../config/env.js";
import type { AuthUser } from "./auth.types.js";
import type { DemoInput, LoginInput, RegisterInput } from "./auth.schema.js";

function toAuthUser(user: {
  _id: { toString(): string };
  email: string;
  firstName: string;
  lastName: string;
  role: AuthUser["role"];
  schoolId?: { toString(): string } | null;
  status: string;
}): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    schoolId: user.schoolId ? user.schoolId.toString() : null,
    status: user.status,
    permissions: permissionsForRole(user.role)
  };
}

export class AuthService {
  constructor(private readonly env: Env) {}

  async register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
    if (input.role !== ROLES.SERVICE_SEEKER) {
      throw new ValidationError("Public registration is only available for service seekers");
    }

    const existing = await UserModel.findOne({ email: input.email.toLowerCase() }).lean();
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const created = await UserModel.create({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: ROLES.SERVICE_SEEKER,
      status: USER_STATUSES.ACTIVE
    });

    await writeAudit({
      actorId: created._id.toString(),
      action: "user.created",
      entityType: "User",
      entityId: created._id.toString()
    });

    const user = toAuthUser(created);
    const token = signAccessToken(this.env, {
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId
    });
    return { user, token };
  }

  async login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
    const record = await UserModel.findOne({ email: input.email.toLowerCase() }).select(
      "+passwordHash"
    );
    if (!record) {
      throw new AuthenticationError("Invalid email or password");
    }
    if (record.status !== USER_STATUSES.ACTIVE) {
      throw new AuthenticationError(
        record.status === USER_STATUSES.INVITED
          ? "Accept your invitation before signing in"
          : "This account is disabled"
      );
    }

    const ok = await verifyPassword(input.password, record.passwordHash);
    if (!ok) {
      throw new AuthenticationError("Invalid email or password");
    }

    record.lastLoginAt = new Date();
    await record.save();

    const user = toAuthUser(record);
    const token = signAccessToken(this.env, {
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId
    });
    return { user, token };
  }

  async enterDemo(input: DemoInput): Promise<{ user: AuthUser; token: string }> {
    const record = await UserModel.findOne({ email: input.email });
    if (!record || record.status !== USER_STATUSES.ACTIVE) {
      throw new AuthenticationError("Unknown demo persona");
    }
    record.lastLoginAt = new Date();
    await record.save();
    const user = toAuthUser(record);
    const token = signAccessToken(this.env, {
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId
    });
    return { user, token };
  }

  async me(userId: string): Promise<AuthUser> {
    const record = await UserModel.findById(userId);
    if (!record || record.status !== USER_STATUSES.ACTIVE) {
      throw new AuthenticationError("Session is no longer valid");
    }
    return toAuthUser(record);
  }

  async forgotPassword(email: string): Promise<string | null> {
    const record = await UserModel.findOne({ email: email.toLowerCase() });
    if (!record) {
      return null;
    }
    const token = randomToken();
    record.passwordResetTokenHash = sha256(token);
    record.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await record.save();
    return token;
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const record = await UserModel.findOne({
      passwordResetTokenHash: sha256(token),
      passwordResetExpiresAt: { $gt: new Date() }
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!record) {
      throw new AuthenticationError("Reset token is invalid or expired");
    }

    record.passwordHash = await hashPassword(password);
    record.passwordResetTokenHash = undefined;
    record.passwordResetExpiresAt = undefined;
    await record.save();

    await writeAudit({
      actorId: record._id.toString(),
      action: "user.password_reset",
      entityType: "User",
      entityId: record._id.toString(),
      schoolId: record.schoolId?.toString()
    });
  }
}
