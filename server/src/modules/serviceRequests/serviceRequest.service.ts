import { ServiceRequestModel, type ServiceRequestDocument } from "./serviceRequest.model.js";
import { SchoolModel, SCHOOL_STATUSES } from "../schools/school.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { UserModel } from "../users/user.model.js";
import { writeAudit } from "../audit/audit.service.js";
import {
  AuthorizationError,
  BusinessRuleError,
  NotFoundError
} from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { REQUEST_STATUSES, canTransition, type RequestStatus } from "../../common/constants/requestStatus.js";
import { paginatedResult, parsePagination } from "../../common/utils/pagination.js";
import { idOf } from "../../store/db.js";
import { matchSchoolForCategory } from "./matching.js";
import type { AuthUser } from "../auth/auth.types.js";
import type { CreateServiceRequestInput, UpdateServiceRequestInput } from "./serviceRequest.schema.js";

async function enrich(doc: ServiceRequestDocument) {
  const school = doc.schoolId ? await SchoolModel.findById(idOf(doc.schoolId)) : null;
  const department = doc.departmentId ? await DepartmentModel.findById(idOf(doc.departmentId)) : null;
  const teacher = (doc as { teacherId?: { toString(): string } }).teacherId
    ? await UserModel.findById(idOf((doc as { teacherId?: { toString(): string } }).teacherId))
    : null;
  return {
    id: doc._id.toString(),
    seekerId: doc.seekerId.toString(),
    schoolId: doc.schoolId ? doc.schoolId.toString() : null,
    departmentId: doc.departmentId ? doc.departmentId.toString() : null,
    teacherId: (doc as { teacherId?: { toString(): string } }).teacherId
      ? idOf((doc as { teacherId?: { toString(): string } }).teacherId)
      : null,
    schoolName: school ? String(school.name) : null,
    departmentName: department ? String(department.name) : null,
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : null,
    posterType: (doc as { posterType?: string }).posterType ?? "PERSON",
    organization: doc.organization ?? null,
    location: doc.location ?? null,
    problem: doc.problem,
    outcome: doc.outcome,
    whoIsAffected: doc.whoIsAffected ?? null,
    extraInfo: (doc as { extraInfo?: string }).extraInfo ?? null,
    matchReason: (doc as { matchReason?: string }).matchReason ?? null,
    category: doc.category,
    urgency: doc.urgency,
    preferredContact: doc.preferredContact ?? null,
    status: doc.status,
    reviewNote: doc.reviewNote ?? null,
    statusHistory: (doc.statusHistory ?? []).map((item) => ({
      from: item.from,
      to: item.to,
      note: item.note ?? null,
      at: item.at
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export function publicServiceRequest(doc: ServiceRequestDocument) {
  return enrich(doc);
}

export class ServiceRequestService {
  async create(actor: AuthUser, input: CreateServiceRequestInput) {
    this.assertSeeker(actor);
    const match = await matchSchoolForCategory(input.category);
    if (!match) {
      throw new BusinessRuleError(
        "No TVET school currently teaches the skills this problem needs. Try a different category, or wait until a matching school joins."
      );
    }
    if (input.schoolId && input.schoolId !== match.schoolId) {
      await this.assertActiveSchool(input.schoolId);
    }
    const schoolId = input.schoolId ?? match.schoolId;

    const status = input.submit ? REQUEST_STATUSES.SUBMITTED : REQUEST_STATUSES.DRAFT;
    const created = await ServiceRequestModel.create({
      seekerId: actor.id,
      schoolId,
      departmentId: match.departmentId,
      posterType: input.posterType,
      organization: input.organization,
      location: input.location,
      problem: input.problem,
      outcome: input.outcome,
      whoIsAffected: input.whoIsAffected,
      extraInfo: input.extraInfo,
      matchReason: match.reason,
      category: input.category,
      urgency: input.urgency,
      preferredContact: input.preferredContact,
      status,
      statusHistory: input.submit
        ? [
            {
              from: REQUEST_STATUSES.DRAFT,
              to: REQUEST_STATUSES.SUBMITTED,
              actorId: actor.id,
              at: new Date()
            }
          ]
        : []
    });

    await writeAudit({
      actorId: actor.id,
      action: input.submit ? "service_request.submitted" : "service_request.created",
      entityType: "ServiceRequest",
      entityId: created._id.toString(),
      schoolId
    });

    return enrich(created as ServiceRequestDocument);
  }

  async list(
    actor: AuthUser,
    query: { page?: unknown; limit?: unknown; status?: string; category?: string; urgency?: string }
  ) {
    const { page, limit, skip } = parsePagination(query);
    const filter: Record<string, unknown> = this.scopeFilter(actor);
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.urgency) filter.urgency = query.urgency;

    const [items, total] = await Promise.all([
      ServiceRequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ServiceRequestModel.countDocuments(filter)
    ]);
    const mapped = await Promise.all(items.map((item) => enrich(item as ServiceRequestDocument)));
    return paginatedResult(mapped, total, page, limit);
  }

  async get(actor: AuthUser, id: string) {
    const doc = await this.loadScoped(actor, id);
    return publicServiceRequest(doc);
  }

  async update(actor: AuthUser, id: string, input: UpdateServiceRequestInput) {
    const doc = await this.loadScoped(actor, id);
    if (actor.role !== ROLES.SERVICE_SEEKER) {
      throw new AuthorizationError();
    }
    if (![REQUEST_STATUSES.DRAFT, REQUEST_STATUSES.NEEDS_INFORMATION].includes(doc.status)) {
      throw new BusinessRuleError("This request can no longer be edited");
    }
    Object.assign(doc, input);
    await doc.save();
    return publicServiceRequest(doc);
  }

  async submit(actor: AuthUser, id: string) {
    const doc = await this.loadScoped(actor, id);
    this.assertSeeker(actor);
    if (doc.status === REQUEST_STATUSES.NEEDS_INFORMATION) {
      return this.transition(actor, doc, REQUEST_STATUSES.SUBMITTED, "Information provided");
    }
    return this.transition(actor, doc, REQUEST_STATUSES.SUBMITTED);
  }

  async startReview(actor: AuthUser, id: string) {
    this.assertReviewer(actor);
    const doc = await this.loadScoped(actor, id);
    return this.transition(actor, doc, REQUEST_STATUSES.UNDER_REVIEW);
  }

  async accept(actor: AuthUser, id: string, note?: string) {
    this.assertReviewer(actor);
    const doc = await this.loadScoped(actor, id);
    await this.transition(actor, doc, REQUEST_STATUSES.ACCEPTED, note);
    return this.transition(actor, doc, REQUEST_STATUSES.MATCHING);
  }

  async reject(actor: AuthUser, id: string, note?: string) {
    this.assertReviewer(actor);
    const doc = await this.loadScoped(actor, id);
    return this.transition(actor, doc, REQUEST_STATUSES.REJECTED, note);
  }

  async needsInformation(actor: AuthUser, id: string, note?: string) {
    this.assertReviewer(actor);
    const doc = await this.loadScoped(actor, id);
    if (!note) {
      throw new BusinessRuleError("Explain what information is needed");
    }
    return this.transition(actor, doc, REQUEST_STATUSES.NEEDS_INFORMATION, note);
  }

  async assignDepartment(actor: AuthUser, id: string, departmentId: string) {
    this.assertReviewer(actor);
    const doc = await this.loadScoped(actor, id);
    if (doc.status !== REQUEST_STATUSES.MATCHING) {
      throw new BusinessRuleError("Assign a department after the request is accepted");
    }
    const dept = await DepartmentModel.findOne({
      _id: departmentId,
      schoolId: doc.schoolId,
      isActive: true
    }).lean();
    if (!dept) throw new NotFoundError("Department not found");

    doc.departmentId = dept._id;
    const result = await this.transition(actor, doc, REQUEST_STATUSES.ASSIGNED);
    await writeAudit({
      actorId: actor.id,
      action: "service_request.assigned",
      entityType: "ServiceRequest",
      entityId: doc._id.toString(),
      schoolId: doc.schoolId?.toString(),
      metadata: { departmentId }
    });
    return result;
  }

  async assignTeacher(actor: AuthUser, id: string, teacherId: string) {
    this.assertReviewer(actor);
    const doc = await this.loadScoped(actor, id);
    if (doc.status !== REQUEST_STATUSES.ASSIGNED && doc.status !== REQUEST_STATUSES.MATCHING) {
      throw new BusinessRuleError("Assign a teacher after the department is set");
    }
    const teacher = await UserModel.findOne({
      _id: teacherId,
      schoolId: doc.schoolId,
      role: ROLES.TEACHER,
      status: "ACTIVE"
    });
    if (!teacher) throw new NotFoundError("Teacher not found in this school");
    (doc as { teacherId?: unknown }).teacherId = teacher._id;
    await doc.save();
    await writeAudit({
      actorId: actor.id,
      action: "service_request.teacher_assigned",
      entityType: "ServiceRequest",
      entityId: doc._id.toString(),
      schoolId: doc.schoolId?.toString(),
      metadata: { teacherId }
    });
    return enrich(doc);
  }

  private async transition(
    actor: AuthUser,
    doc: ServiceRequestDocument & { save: () => Promise<unknown> },
    to: RequestStatus,
    note?: string
  ) {
    if (!canTransition(doc.status, to)) {
      throw new BusinessRuleError(`Cannot change status from ${doc.status} to ${to}`);
    }
    const from = doc.status;
    doc.status = to;
    if (note) doc.reviewNote = note;
    doc.statusHistory.push({
      from,
      to,
      actorId: actor.id,
      note,
      at: new Date()
    });
    await doc.save();
    await writeAudit({
      actorId: actor.id,
      action: "service_request.status_changed",
      entityType: "ServiceRequest",
      entityId: doc._id.toString(),
      schoolId: doc.schoolId?.toString(),
      metadata: { from, to, note }
    });
    return publicServiceRequest(doc);
  }

  private scopeFilter(actor: AuthUser): Record<string, unknown> {
    if (actor.role === ROLES.SUPER_ADMIN) return {};
    if (actor.role === ROLES.SERVICE_SEEKER) return { seekerId: actor.id };
    if (!actor.schoolId) throw new AuthorizationError();
    return { schoolId: actor.schoolId };
  }

  private async loadScoped(actor: AuthUser, id: string) {
    const doc = await ServiceRequestModel.findById(id);
    if (!doc) throw new NotFoundError("Service request not found");
    if (actor.role === ROLES.SUPER_ADMIN) return doc;
    if (actor.role === ROLES.SERVICE_SEEKER && doc.seekerId.toString() === actor.id) return doc;
    if (actor.schoolId && doc.schoolId?.toString() === actor.schoolId) return doc;
    throw new AuthorizationError("You cannot access another school's data");
  }

  private assertSeeker(actor: AuthUser) {
    if (actor.role !== ROLES.SERVICE_SEEKER) {
      throw new AuthorizationError();
    }
  }

  private assertReviewer(actor: AuthUser) {
    if (
      actor.role !== ROLES.SCHOOL_ADMIN &&
      actor.role !== ROLES.SCHOOL_COORDINATOR &&
      actor.role !== ROLES.SUPER_ADMIN
    ) {
      throw new AuthorizationError();
    }
  }

  private async assertActiveSchool(schoolId: string) {
    const school = await SchoolModel.findById(schoolId).lean();
    if (!school || school.status !== SCHOOL_STATUSES.ACTIVE) {
      throw new NotFoundError("School not found");
    }
  }
}
