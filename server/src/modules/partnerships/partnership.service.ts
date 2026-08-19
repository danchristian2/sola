import {
  PartnershipApplicationModel,
  PARTNERSHIP_STATUSES
} from "./partnership.model.js";
import { UserModel } from "../users/user.model.js";
import { SchoolService } from "../schools/school.service.js";
import { writeAudit } from "../audit/audit.service.js";
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError
} from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { paginatedResult, parsePagination } from "../../common/utils/pagination.js";
import type { Env } from "../../config/env.js";
import type { AuthUser } from "../auth/auth.types.js";
import type { ApplyPartnershipInput } from "./partnership.schema.js";

function publicApplication(doc: {
  _id: { toString(): string };
  schoolName: string;
  location: string;
  contactEmail: string;
  contactPhone?: string | null;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  message?: string | null;
  status: string;
  reviewNote?: string | null;
  schoolId?: { toString(): string } | null;
  createdAt: Date | string;
}) {
  return {
    id: doc._id.toString(),
    schoolName: doc.schoolName,
    location: doc.location,
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone ?? null,
    adminFirstName: doc.adminFirstName,
    adminLastName: doc.adminLastName,
    adminEmail: doc.adminEmail,
    message: doc.message ?? null,
    status: doc.status,
    reviewNote: doc.reviewNote ?? null,
    schoolId: doc.schoolId ? doc.schoolId.toString() : null,
    createdAt: doc.createdAt
  };
}

export class PartnershipService {
  constructor(private readonly env: Env) {}

  async apply(input: ApplyPartnershipInput) {
    const adminEmail = input.adminEmail.toLowerCase();
    const existingUser = await UserModel.findOne({ email: adminEmail }).lean();
    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    const open = await PartnershipApplicationModel.findOne({
      adminEmail,
      status: PARTNERSHIP_STATUSES.SUBMITTED
    }).lean();
    if (open) {
      throw new ConflictError("A partnership request for this email is already under review");
    }

    const application = await PartnershipApplicationModel.create({
      ...input,
      adminEmail,
      contactEmail: input.contactEmail.toLowerCase(),
      status: PARTNERSHIP_STATUSES.SUBMITTED
    });

    await writeAudit({
      action: "partnership.submitted",
      entityType: "PartnershipApplication",
      entityId: application._id.toString(),
      metadata: { schoolName: application.schoolName, adminEmail }
    });

    return publicApplication(application);
  }

  async list(actor: AuthUser, query: { page?: unknown; limit?: unknown; status?: string }) {
    this.assertSuperAdmin(actor);
    const { page, limit, skip } = parsePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    const [items, total] = await Promise.all([
      PartnershipApplicationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PartnershipApplicationModel.countDocuments(filter)
    ]);
    return paginatedResult(items.map(publicApplication), total, page, limit);
  }

  async approve(actor: AuthUser, applicationId: string, note?: string) {
    this.assertSuperAdmin(actor);
    const application = await PartnershipApplicationModel.findById(applicationId);
    if (!application) throw new NotFoundError("Partnership request not found");
    if (application.status !== PARTNERSHIP_STATUSES.SUBMITTED) {
      throw new BusinessRuleError("Only submitted requests can be approved");
    }

    const schools = new SchoolService(this.env);
    const created = await schools.createBySuperAdmin(actor, {
      name: application.schoolName,
      location: application.location,
      contactEmail: application.contactEmail,
      contactPhone: application.contactPhone,
      admin: {
        firstName: application.adminFirstName,
        lastName: application.adminLastName,
        email: application.adminEmail
      }
    });

    application.status = PARTNERSHIP_STATUSES.APPROVED;
    application.reviewedBy = actor.id;
    application.reviewNote = note;
    application.schoolId = created.school.id;
    await application.save();

    await writeAudit({
      actorId: actor.id,
      action: "partnership.approved",
      entityType: "PartnershipApplication",
      entityId: application._id.toString(),
      schoolId: created.school.id
    });

    return {
      application: publicApplication(application),
      school: created.school,
      invitation: created.invitation,
      token: created.token
    };
  }

  async reject(actor: AuthUser, applicationId: string, note?: string) {
    this.assertSuperAdmin(actor);
    const application = await PartnershipApplicationModel.findById(applicationId);
    if (!application) throw new NotFoundError("Partnership request not found");
    if (application.status !== PARTNERSHIP_STATUSES.SUBMITTED) {
      throw new BusinessRuleError("Only submitted requests can be rejected");
    }

    application.status = PARTNERSHIP_STATUSES.REJECTED;
    application.reviewedBy = actor.id;
    application.reviewNote = note;
    await application.save();

    await writeAudit({
      actorId: actor.id,
      action: "partnership.rejected",
      entityType: "PartnershipApplication",
      entityId: application._id.toString()
    });

    return publicApplication(application);
  }

  private assertSuperAdmin(actor: AuthUser) {
    if (actor.role !== ROLES.SUPER_ADMIN) {
      throw new AuthorizationError();
    }
  }
}
