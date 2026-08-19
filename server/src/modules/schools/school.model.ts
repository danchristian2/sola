export const SCHOOL_STATUSES = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED"
} as const;

export type SchoolStatus = (typeof SCHOOL_STATUSES)[keyof typeof SCHOOL_STATUSES];

export { SchoolModel } from "../../store/collections.js";
