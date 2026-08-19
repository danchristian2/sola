import { DepartmentModel, type DepartmentDocument } from "./department.model.js";
import { writeAudit } from "../audit/audit.service.js";
import { ConflictError, NotFoundError } from "../../common/errors/AppError.js";
import { resolveSchoolId } from "../../common/middleware/tenant.js";
import type { AuthUser } from "../auth/auth.types.js";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "./department.schema.js";

export function publicDepartment(dept: DepartmentDocument) {
  return {
    id: dept._id.toString(),
    schoolId: dept.schoolId.toString(),
    name: dept.name,
    description: dept.description ?? null,
    skills: dept.skills,
    isActive: dept.isActive
  };
}

export class DepartmentService {
  async create(actor: AuthUser, schoolId: string, input: CreateDepartmentInput) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const existing = await DepartmentModel.findOne({
      schoolId: allowedId,
      name: input.name
    }).lean();
    if (existing) {
      throw new ConflictError("A department with this name already exists");
    }

    const dept = await DepartmentModel.create({
      schoolId: allowedId,
      name: input.name,
      description: input.description,
      skills: input.skills
    });

    await writeAudit({
      actorId: actor.id,
      action: "department.created",
      entityType: "Department",
      entityId: dept._id.toString(),
      schoolId: allowedId
    });

    return publicDepartment(dept);
  }

  async list(actor: AuthUser, schoolId: string) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const items = await DepartmentModel.find({ schoolId: allowedId }).sort({ name: 1 });
    return items.map(publicDepartment);
  }

  async update(actor: AuthUser, schoolId: string, departmentId: string, input: UpdateDepartmentInput) {
    const allowedId = resolveSchoolId(actor, schoolId);
    const dept = await DepartmentModel.findOneAndUpdate(
      { _id: departmentId, schoolId: allowedId },
      input,
      { new: true }
    );
    if (!dept) throw new NotFoundError("Department not found");
    return publicDepartment(dept);
  }
}
