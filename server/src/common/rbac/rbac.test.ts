import { hasPermission, permissionsForRole } from "../rbac/index.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLES } from "../constants/roles.js";
import { describe, expect, it } from "vitest";

describe("RBAC", () => {
  it("does not give students request review permission", () => {
    expect(hasPermission(ROLES.STUDENT, PERMISSIONS["service_request:review"])).toBe(false);
  });

  it("lets service seekers create requests", () => {
    expect(hasPermission(ROLES.SERVICE_SEEKER, PERMISSIONS["service_request:create"])).toBe(true);
  });

  it("lets coordinators review requests and assign projects", () => {
    const perms = permissionsForRole(ROLES.SCHOOL_COORDINATOR);
    expect(perms).toContain(PERMISSIONS["service_request:review"]);
    expect(perms).toContain(PERMISSIONS["project:assign"]);
  });

  it("lets coordinators invite teachers", () => {
    expect(hasPermission(ROLES.SCHOOL_COORDINATOR, PERMISSIONS["users:manage"])).toBe(true);
    expect(hasPermission(ROLES.SCHOOL_COORDINATOR, PERMISSIONS["department:manage"])).toBe(true);
  });

  it("does not let service seekers manage users", () => {
    expect(hasPermission(ROLES.SERVICE_SEEKER, PERMISSIONS["users:manage"])).toBe(false);
  });
});
