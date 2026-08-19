export const PARTNERSHIP_STATUSES = {
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export type PartnershipStatus =
  (typeof PARTNERSHIP_STATUSES)[keyof typeof PARTNERSHIP_STATUSES];

export { PartnershipApplicationModel } from "../../store/collections.js";
