import { SchoolModel, SCHOOL_STATUSES } from "./school.model.js";
import { UserModel } from "../users/user.model.js";
import { writeAudit } from "../audit/audit.service.js";
import { publicSchool } from "./school.types.js";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError
} from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { resolveSchoolId } from "../../common/middleware/tenant.js";
import { paginatedResult, parsePagination } from "../../common/utils/pagination.js";
import { InvitationService } from "../invitations/invitation.service.js";
import type { Env } from "../../config/env.js";
import type { AuthUser } from "../auth/auth.types.js";
import type { CreateSchoolInput, UpdateSchoolInput } from "./school.schema.js";
import type { SchoolStatus } from "./school.model.js";

export class SchoolService {
  constructor(private readonly env: Env) {}

  async createBySuperAdmin(actor: AuthUser, input: CreateSchoolInput) {
    this.assertSuperAdmin(actor);
    await this.assertEmailFree(input.admin.email);

    const school = await SchoolModel.create({
      name: input.name,
      location: input.location,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      status: SCHOOL_STATUSES.ACTIVE
    });

    const invitations = new InvitationService(this.env);
    try {
      const invite = await invitations.create(
        actor,
        school._id.toString(),
        {
          email: input.admin.email,
          firstName: input.admin.firstName,
          lastName: input.admin.lastName,
          role: ROLES.SCHOOL_ADMIN
        },
        this.env.NODE_ENV !== "production"
      );

      await writeAudit({
        actorId: actor.id,
        action: "school.created",
        entityType: "School",
        entityId: school._id.toString(),
        schoolId: school._id.toString()
      });

      return { school: publicSchool(school), ...invite };
    } catch (err) {
      await SchoolModel.deleteOne({ _id: school._id });
      throw err;
    }
  }

  async list(actor: AuthUser, query: { page?: unknown; limit?: unknown }) {
    const { page, limit, skip } = parsePagination(query);
    if (actor.role !== ROLES.SUPER_ADMIN) {
      const schoolId = resolveSchoolId(actor);
      const school = await SchoolModel.findById(schoolId);
      if (!school) throw new NotFoundError("School not found");
      return paginatedResult([publicSchool(school)], 1, 1, 1);
    }

    const [items, total] = await Promise.all([
      SchoolModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      SchoolModel.countDocuments()
    ]);
    return paginatedResult(items.map(publicSchool), total, page, limit);
  }

  async listDirectory() {
    const items = await SchoolModel.find({ status: SCHOOL_STATUSES.ACTIVE })
      .sort({ name: 1 })
      .select("name location");
    return items.map((school) => ({
      id: school._id.toString(),
      name: school.name,
      location: school.location ?? null
    }));
  }

  async get(actor: AuthUser, schoolId: string) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const school = await SchoolModel.findById(allowedId);
    if (!school) throw new NotFoundError("School not found");
    return publicSchool(school);
  }

  async update(actor: AuthUser, schoolId: string, input: UpdateSchoolInput) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const school = await SchoolModel.findByIdAndUpdate(allowedId, input, { new: true });
    if (!school) throw new NotFoundError("School not found");
    await writeAudit({
      actorId: actor.id,
      action: "school.updated",
      entityType: "School",
      entityId: school._id.toString(),
      schoolId: school._id.toString()
    });
    return publicSchool(school);
  }

  async setStatus(actor: AuthUser, schoolId: string, status: SchoolStatus) {
    this.assertSuperAdmin(actor);
    const school = await SchoolModel.findByIdAndUpdate(schoolId, { status }, { new: true });
    if (!school) throw new NotFoundError("School not found");
    return publicSchool(school);
  }

  private assertSuperAdmin(actor: AuthUser) {
    if (actor.role !== ROLES.SUPER_ADMIN) {
      throw new AuthorizationError();
    }
  }

  private async assertEmailFree(email: string) {
    const existing = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }
  }
}
