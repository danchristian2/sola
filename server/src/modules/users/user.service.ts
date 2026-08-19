import { UserModel } from "./user.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { writeAudit } from "../audit/audit.service.js";
import { AuthorizationError, BusinessRuleError, NotFoundError } from "../../common/errors/AppError.js";
import { ROLES, USER_STATUSES } from "../../common/constants/roles.js";
import { resolveSchoolId } from "../../common/middleware/tenant.js";
import { paginatedResult, parsePagination } from "../../common/utils/pagination.js";
import type { AuthUser } from "../auth/auth.types.js";

function idString(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String((value as { toString(): string }).toString());
}

export function publicUser(user: {
  _id: { toString(): string };
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId?: unknown;
  departmentId?: unknown;
  status: string;
  createdAt: Date | string;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    schoolId: idString(user.schoolId),
    departmentId: idString(user.departmentId),
    status: user.status,
    createdAt: user.createdAt
  };
}

export class UserService {
  async list(
    actor: AuthUser,
    schoolId: string,
    query: { page?: unknown; limit?: unknown; role?: string; status?: string }
  ) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const { page, limit, skip } = parsePagination(query);
    const filter: Record<string, unknown> = { schoolId: allowedId };
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter)
    ]);
    return paginatedResult(items.map(publicUser), total, page, limit);
  }

  async update(
    actor: AuthUser,
    schoolId: string,
    userId: string,
    input: { status?: string; departmentId?: string | null }
  ) {
    const allowedId = resolveSchoolId(actor, schoolId);
    if (actor.role !== ROLES.SUPER_ADMIN && actor.role !== ROLES.SCHOOL_ADMIN) {
      throw new AuthorizationError();
    }

    const user = await UserModel.findOne({ _id: userId, schoolId: allowedId });
    if (!user) throw new NotFoundError("User not found");
    if (user.id === actor.id && input.status === USER_STATUSES.DISABLED) {
      throw new BusinessRuleError("You cannot disable your own account");
    }

    if (input.departmentId) {
      const dept = await DepartmentModel.findOne({
        _id: input.departmentId,
        schoolId: allowedId
      }).lean();
      if (!dept) throw new NotFoundError("Department not found");
      user.departmentId = dept._id;
    } else if (input.departmentId === null) {
      user.departmentId = undefined;
    }

    if (input.status) {
      user.status = input.status as typeof user.status;
    }

    await user.save();
    await writeAudit({
      actorId: actor.id,
      action: "user.updated",
      entityType: "User",
      entityId: user._id.toString(),
      schoolId: allowedId
    });
    return publicUser(user);
  }
}
