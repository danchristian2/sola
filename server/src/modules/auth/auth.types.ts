import type { Role } from "../../common/constants/roles.js";
import type { Permission } from "../../common/constants/permissions.js";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  schoolId: string | null;
  status: string;
  permissions: readonly Permission[];
}

export interface JwtPayload {
  sub: string;
  role: Role;
  schoolId: string | null;
}
