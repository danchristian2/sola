import { ProjectModel } from "../../store/collections.js";
import { ServiceRequestModel } from "../serviceRequests/serviceRequest.model.js";
import { UserModel } from "../users/user.model.js";
import { writeAudit } from "../audit/audit.service.js";
import {
  AuthorizationError,
  BusinessRuleError,
  NotFoundError
} from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { REQUEST_STATUSES } from "../../common/constants/requestStatus.js";
import { idOf, newId } from "../../store/db.js";
import { PROJECT_STAGES, type ProjectStage } from "./project.constants.js";
import type { AuthUser } from "../auth/auth.types.js";

function publicProject(doc: Record<string, unknown>) {
  const team = (doc.team as Array<Record<string, unknown>>) ?? [];
  const tasks = (doc.tasks as Array<Record<string, unknown>>) ?? [];
  return {
    id: idOf(doc._id),
    requestId: idOf(doc.requestId),
    schoolId: idOf(doc.schoolId),
    departmentId: doc.departmentId ? idOf(doc.departmentId) : null,
    teacherId: idOf(doc.teacherId),
    title: String(doc.title ?? ""),
    stage: String(doc.stage ?? "INVESTIGATE"),
    team: team.map((member) => ({
      userId: idOf(member.userId),
      name: String(member.name ?? ""),
      teamRole: String(member.teamRole ?? "GENERAL")
    })),
    tasks: tasks.map((task) => ({
      id: String(task.id ?? task._id ?? ""),
      title: String(task.title ?? ""),
      status: String(task.status ?? "OPEN"),
      assigneeId: task.assigneeId ? idOf(task.assigneeId) : null,
      milestone: String(task.milestone ?? "")
    })),
    evidence: ((doc.evidence as Array<Record<string, unknown>>) ?? []).map((item) => ({
      note: String(item.note ?? ""),
      at: item.at
    })),
    feedback: ((doc.feedback as Array<Record<string, unknown>>) ?? []).map((item) => ({
      comment: String(item.comment ?? ""),
      works: item.works ?? null,
      needsChange: item.needsChange ?? null,
      at: item.at
    })),
    impact: (doc.impact as Record<string, unknown> | null) ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export class ProjectService {
  async create(actor: AuthUser, requestId: string) {
    if (actor.role !== ROLES.TEACHER && actor.role !== ROLES.SCHOOL_COORDINATOR && actor.role !== ROLES.SCHOOL_ADMIN) {
      throw new AuthorizationError();
    }
    const request = await ServiceRequestModel.findById(requestId);
    if (!request) throw new NotFoundError("Service request not found");
    if (actor.schoolId && idOf(request.schoolId) !== actor.schoolId) {
      throw new AuthorizationError();
    }
    if (![REQUEST_STATUSES.ASSIGNED, REQUEST_STATUSES.IN_PROGRESS].includes(request.status as string)) {
      throw new BusinessRuleError("Start a project after the request is assigned to a department");
    }
    const existing = await ProjectModel.findOne({ requestId });
    if (existing) return publicProject(existing);

    const created = await ProjectModel.create({
      requestId,
      schoolId: idOf(request.schoolId),
      departmentId: request.departmentId ? idOf(request.departmentId) : undefined,
      teacherId: actor.role === ROLES.TEACHER ? actor.id : idOf((request as { teacherId?: unknown }).teacherId) || actor.id,
      title: String(request.problem).slice(0, 120),
      stage: "INVESTIGATE",
      team: [],
      tasks: [],
      evidence: [],
      feedback: [],
      impact: null
    });

    if (request.status === REQUEST_STATUSES.ASSIGNED) {
      request.status = REQUEST_STATUSES.IN_PROGRESS;
      request.statusHistory = [
        ...((request.statusHistory as unknown[]) ?? []),
        {
          from: REQUEST_STATUSES.ASSIGNED,
          to: REQUEST_STATUSES.IN_PROGRESS,
          actorId: actor.id,
          at: new Date().toISOString()
        }
      ];
      await request.save();
    }

    await writeAudit({
      actorId: actor.id,
      action: "project.created",
      entityType: "Project",
      entityId: created._id.toString(),
      schoolId: actor.schoolId ?? undefined
    });
    return publicProject(created);
  }

  async list(actor: AuthUser) {
    const filter: Record<string, unknown> = {};
    if (actor.role === ROLES.SERVICE_SEEKER) {
      const mine = await ServiceRequestModel.find({ seekerId: actor.id });
      const ids = mine.map((item) => idOf(item._id));
      filter.requestId = { $in: ids };
    } else if (actor.role === ROLES.STUDENT) {
      const all = await ProjectModel.find(actor.schoolId ? { schoolId: actor.schoolId } : {});
      return all
        .map(publicProject)
        .filter((project) => project.team.some((member) => member.userId === actor.id));
    } else if (actor.role !== ROLES.SUPER_ADMIN) {
      if (!actor.schoolId) throw new AuthorizationError();
      filter.schoolId = actor.schoolId;
    }
    const items = await ProjectModel.find(filter);
    return items.map(publicProject);
  }

  async get(actor: AuthUser, id: string) {
    const items = await this.list(actor);
    const found = items.find((item) => item.id === id);
    if (!found) throw new NotFoundError("Project not found");
    return found;
  }

  async byRequest(actor: AuthUser, requestId: string) {
    const items = await this.list(actor);
    return items.find((item) => item.requestId === requestId) ?? null;
  }

  async addMember(actor: AuthUser, id: string, userId: string, teamRole: string) {
    this.assertStaff(actor);
    const doc = await this.loadSchoolProject(actor, id);
    const student = await UserModel.findOne({ _id: userId, schoolId: actor.schoolId, role: ROLES.STUDENT });
    if (!student) throw new NotFoundError("Student not found in this school");
    const team = ((doc.team as Array<Record<string, unknown>>) ?? []).filter((member) => idOf(member.userId) !== userId);
    team.push({
      userId,
      name: `${student.firstName} ${student.lastName}`,
      teamRole
    });
    doc.team = team;
    await doc.save();
    return publicProject(doc);
  }

  async addTask(actor: AuthUser, id: string, input: { title: string; assigneeId?: string; milestone?: string }) {
    this.assertStaff(actor);
    const doc = await this.loadSchoolProject(actor, id);
    const tasks = ((doc.tasks as Array<Record<string, unknown>>) ?? []).concat({
      id: newId(),
      title: input.title,
      status: "OPEN",
      assigneeId: input.assigneeId,
      milestone: input.milestone ?? doc.stage
    });
    doc.tasks = tasks;
    await doc.save();
    return publicProject(doc);
  }

  async updateTask(actor: AuthUser, id: string, taskId: string, input: { status?: string; title?: string }) {
    const doc = await this.loadVisibleProject(actor, id);
    const tasks = ((doc.tasks as Array<Record<string, unknown>>) ?? []).map((task) => {
      if (String(task.id) !== taskId) return task;
      return { ...task, ...input };
    });
    doc.tasks = tasks;
    await doc.save();
    return publicProject(doc);
  }

  async addEvidence(actor: AuthUser, id: string, note: string) {
    const doc = await this.loadVisibleProject(actor, id);
    const evidence = ((doc.evidence as Array<Record<string, unknown>>) ?? []).concat({
      note,
      at: new Date().toISOString()
    });
    doc.evidence = evidence;
    await doc.save();
    return publicProject(doc);
  }

  async addFeedback(actor: AuthUser, id: string, input: { comment: string; works?: string; needsChange?: string }) {
    const doc = await this.loadVisibleProject(actor, id);
    const feedback = ((doc.feedback as Array<Record<string, unknown>>) ?? []).concat({
      ...input,
      at: new Date().toISOString()
    });
    doc.feedback = feedback;
    if (doc.stage === "TEST") doc.stage = "IMPROVE";
    await doc.save();
    const request = await ServiceRequestModel.findById(idOf(doc.requestId));
    if (request && request.status === REQUEST_STATUSES.TESTING) {
      request.status = REQUEST_STATUSES.AWAITING_CLIENT_FEEDBACK;
      await request.save();
    }
    return publicProject(doc);
  }

  async setImpact(actor: AuthUser, id: string, impact: Record<string, unknown>) {
    const doc = await this.loadVisibleProject(actor, id);
    doc.impact = impact;
    await doc.save();
    return publicProject(doc);
  }

  async advance(actor: AuthUser, id: string) {
    this.assertStaff(actor);
    const doc = await this.loadSchoolProject(actor, id);
    const index = PROJECT_STAGES.indexOf(doc.stage as ProjectStage);
    if (index < 0 || index >= PROJECT_STAGES.length - 1) {
      throw new BusinessRuleError("This project cannot move further");
    }
    const next = PROJECT_STAGES[index + 1];
    doc.stage = next;
    await doc.save();

    const request = await ServiceRequestModel.findById(idOf(doc.requestId));
    if (request) {
      if (next === "TEST") request.status = REQUEST_STATUSES.TESTING;
      if (next === "DELIVERED") request.status = REQUEST_STATUSES.DELIVERED;
      if (next === "COMPLETED") request.status = REQUEST_STATUSES.COMPLETED;
      await request.save();
    }
    return publicProject(doc);
  }

  async portfolio(actor: AuthUser) {
    const items = await this.list(actor);
    return items.filter((item) => item.stage === "COMPLETED" || item.impact);
  }

  private assertStaff(actor: AuthUser) {
    if (![ROLES.TEACHER, ROLES.SCHOOL_COORDINATOR, ROLES.SCHOOL_ADMIN].includes(actor.role)) {
      throw new AuthorizationError();
    }
  }

  private async loadSchoolProject(actor: AuthUser, id: string) {
    const doc = await ProjectModel.findById(id);
    if (!doc) throw new NotFoundError("Project not found");
    if (actor.role !== ROLES.SUPER_ADMIN && actor.schoolId && idOf(doc.schoolId) !== actor.schoolId) {
      throw new AuthorizationError();
    }
    return doc;
  }

  private async loadVisibleProject(actor: AuthUser, id: string) {
    await this.get(actor, id);
    const doc = await ProjectModel.findById(id);
    if (!doc) throw new NotFoundError("Project not found");
    return doc;
  }
}
