export { ServiceRequestModel } from "../../store/collections.js";

export type ServiceRequestDocument = {
  _id: { toString(): string };
  seekerId: { toString(): string };
  schoolId?: { toString(): string };
  departmentId?: { toString(): string };
  organization?: string;
  location?: string;
  problem: string;
  outcome: string;
  whoIsAffected?: string;
  category: string;
  urgency: string;
  preferredContact?: string;
  status: string;
  reviewNote?: string;
  statusHistory: Array<{
    from: string;
    to: string;
    actorId?: unknown;
    note?: string;
    at: Date | string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
  save: () => Promise<unknown>;
};
