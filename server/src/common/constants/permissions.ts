export const PERMISSIONS = {
  "users:manage": "users:manage",
  "users:view": "users:view",
  "school:manage": "school:manage",
  "school:view": "school:view",
  "partnership:review": "partnership:review",
  "department:manage": "department:manage",
  "department:view": "department:view",
  "service_request:create": "service_request:create",
  "service_request:view": "service_request:view",
  "service_request:review": "service_request:review",
  "project:create": "project:create",
  "project:view": "project:view",
  "project:update": "project:update",
  "project:assign": "project:assign",
  "evidence:upload": "evidence:upload",
  "impact:create": "impact:create",
  "impact:view": "impact:view"
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
