import { collection } from "./db.js";

export const UserModel = collection("users");
export const SchoolModel = collection("schools");
export const DepartmentModel = collection("departments");
export const InvitationModel = collection("invitations");
export const AuditLogModel = collection("audits");
export const PartnershipApplicationModel = collection("partnerships");
export const ServiceRequestModel = collection("serviceRequests");
export const ProjectModel = collection("projects");
