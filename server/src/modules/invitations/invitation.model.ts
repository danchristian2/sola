import { InvitationModel as StoreInvitationModel } from "../../store/collections.js";
import { ROLES, type Role } from "../../common/constants/roles.js";

export const INVITATION_STATUSES = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REVOKED: "REVOKED"
} as const;

export const INVITEABLE_ROLES = [
  ROLES.SCHOOL_ADMIN,
  ROLES.SCHOOL_COORDINATOR,
  ROLES.TEACHER,
  ROLES.STUDENT
] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES];

export const InvitationModel = StoreInvitationModel;
