import type { Request } from "express";
import { AuthorizationError, ValidationError } from "../errors/AppError.js";
import { ROLES } from "../constants/roles.js";
import type { AuthUser } from "../../modules/auth/auth.types.js";

export function assertSameSchool(req: Request, schoolId: string | null | undefined): void {
  const user = req.authUser;
  if (!user) {
    throw new AuthorizationError();
  }
  resolveSchoolId(user, schoolId ?? undefined);
}

export function resolveSchoolId(user: AuthUser, requestedSchoolId?: string): string {
  if (user.role === ROLES.SUPER_ADMIN) {
    if (!requestedSchoolId) {
      throw new ValidationError("schoolId is required");
    }
    return requestedSchoolId;
  }
  if (!user.schoolId) {
    throw new AuthorizationError("You cannot access another school's data");
  }
  if (requestedSchoolId && requestedSchoolId !== user.schoolId) {
    throw new AuthorizationError("You cannot access another school's data");
  }
  return user.schoolId;
}
