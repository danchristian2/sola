import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { ProjectService } from "./project.service.js";
import {
  addMemberSchema,
  addTaskSchema,
  createProjectSchema,
  evidenceSchema,
  feedbackSchema,
  impactSchema,
  updateTaskSchema
} from "./project.schema.js";

const projects = new ProjectService();

export const projectController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = createProjectSchema.parse(req.body);
    const item = await projects.create(req.authUser!, requestId);
    return sendCreated(res, { project: item }, "Project started");
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const items = await projects.list(req.authUser!);
    return sendSuccess(res, { items });
  }),

  portfolio: asyncHandler(async (req: Request, res: Response) => {
    const items = await projects.portfolio(req.authUser!);
    return sendSuccess(res, { items });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const item = await projects.get(req.authUser!, id);
    return sendSuccess(res, { project: item });
  }),

  byRequest: asyncHandler(async (req: Request, res: Response) => {
    const requestId = objectIdSchema.parse(req.params.requestId);
    const item = await projects.byRequest(req.authUser!, requestId);
    return sendSuccess(res, { project: item });
  }),

  addMember: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { userId, teamRole } = addMemberSchema.parse(req.body);
    const item = await projects.addMember(req.authUser!, id, userId, teamRole);
    return sendSuccess(res, { project: item }, "Student added to the team");
  }),

  addTask: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const input = addTaskSchema.parse(req.body);
    const item = await projects.addTask(req.authUser!, id, input);
    return sendSuccess(res, { project: item }, "Task added");
  }),

  updateTask: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const taskId = objectIdSchema.parse(req.params.taskId);
    const input = updateTaskSchema.parse(req.body);
    const item = await projects.updateTask(req.authUser!, id, taskId, input);
    return sendSuccess(res, { project: item }, "Task updated");
  }),

  evidence: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { note } = evidenceSchema.parse(req.body);
    const item = await projects.addEvidence(req.authUser!, id, note);
    return sendSuccess(res, { project: item }, "Evidence recorded");
  }),

  feedback: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const input = feedbackSchema.parse(req.body);
    const item = await projects.addFeedback(req.authUser!, id, input);
    return sendSuccess(res, { project: item }, "Feedback recorded");
  }),

  impact: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const input = impactSchema.parse(req.body);
    const item = await projects.setImpact(req.authUser!, id, input);
    return sendSuccess(res, { project: item }, "Impact recorded");
  }),

  advance: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const item = await projects.advance(req.authUser!, id);
    return sendSuccess(res, { project: item }, "Project moved to the next stage");
  })
};
