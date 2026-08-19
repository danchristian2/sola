import { PERMISSIONS, type Permission } from "../constants/permissions.js";
import { ROLES, type Role } from "../constants/roles.js";

const ALL = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: ALL,
  SCHOOL_ADMIN: [
    PERMISSIONS["users:manage"],
    PERMISSIONS["users:view"],
    PERMISSIONS["school:manage"],
    PERMISSIONS["school:view"],
    PERMISSIONS["department:manage"],
    PERMISSIONS["department:view"],
    PERMISSIONS["service_request:view"],
    PERMISSIONS["service_request:review"],
    PERMISSIONS["project:create"],
    PERMISSIONS["project:view"],
    PERMISSIONS["project:update"],
    PERMISSIONS["project:assign"],
    PERMISSIONS["evidence:upload"],
    PERMISSIONS["impact:create"],
    PERMISSIONS["impact:view"]
  ],
  SCHOOL_COORDINATOR: [
    PERMISSIONS["users:manage"],
    PERMISSIONS["users:view"],
    PERMISSIONS["school:view"],
    PERMISSIONS["department:manage"],
    PERMISSIONS["department:view"],
    PERMISSIONS["service_request:view"],
    PERMISSIONS["service_request:review"],
    PERMISSIONS["project:create"],
    PERMISSIONS["project:view"],
    PERMISSIONS["project:update"],
    PERMISSIONS["project:assign"],
    PERMISSIONS["evidence:upload"],
    PERMISSIONS["impact:create"],
    PERMISSIONS["impact:view"]
  ],
  TEACHER: [
    PERMISSIONS["school:view"],
    PERMISSIONS["department:view"],
    PERMISSIONS["service_request:view"],
    PERMISSIONS["project:create"],
    PERMISSIONS["project:view"],
    PERMISSIONS["project:update"],
    PERMISSIONS["evidence:upload"],
    PERMISSIONS["impact:create"],
    PERMISSIONS["impact:view"]
  ],
  STUDENT: [
    PERMISSIONS["project:view"],
    PERMISSIONS["evidence:upload"]
  ],
  SERVICE_SEEKER: [
    PERMISSIONS["service_request:create"],
    PERMISSIONS["service_request:view"],
    PERMISSIONS["project:view"],
    PERMISSIONS["impact:create"],
    PERMISSIONS["impact:view"]
  ]
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission);
}
