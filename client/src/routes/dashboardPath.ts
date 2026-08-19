import type { Role } from "../types";

export function dashboardPath(role: Role): string {
  switch (role) {
    case "SERVICE_SEEKER":
      return "/app/seeker";
    case "TEACHER":
      return "/app/teacher";
    case "SCHOOL_COORDINATOR":
      return "/app/coordinator";
    case "SCHOOL_ADMIN":
      return "/app/school";
    case "SUPER_ADMIN":
      return "/app/admin";
    default:
      return "/login";
  }
}
