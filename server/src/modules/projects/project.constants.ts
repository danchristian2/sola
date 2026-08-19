export const PROJECT_STAGES = [
  "INVESTIGATE",
  "DESIGN",
  "BUILD",
  "TEST",
  "IMPROVE",
  "DELIVERED",
  "COMPLETED"
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[keyof typeof PROJECT_STAGES];

export const TEAM_ROLES = [
  "BACKEND",
  "FRONTEND",
  "DATABASE",
  "UI_UX",
  "TESTING",
  "GENERAL"
] as const;
