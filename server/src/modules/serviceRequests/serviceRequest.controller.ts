import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { ServiceRequestService } from "./serviceRequest.service.js";
import {
  assignDepartmentSchema,
  assignTeacherSchema,
  createServiceRequestSchema,
  reviewNoteSchema,
  updateServiceRequestSchema
} from "./serviceRequest.schema.js";

const requests = new ServiceRequestService();

export const serviceRequestController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = createServiceRequestSchema.parse(req.body);
    const item = await requests.create(req.authUser!, input);
    return sendCreated(res, { request: item }, input.submit ? "Request submitted" : "Draft saved");
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await requests.list(req.authUser!, req.query);
    return sendSuccess(res, data);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const item = await requests.get(req.authUser!, id);
    return sendSuccess(res, { request: item });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const input = updateServiceRequestSchema.parse(req.body);
    const item = await requests.update(req.authUser!, id, input);
    return sendSuccess(res, { request: item }, "Request updated");
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const item = await requests.submit(req.authUser!, id);
    return sendSuccess(res, { request: item }, "Request submitted");
  }),

  startReview: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const item = await requests.startReview(req.authUser!, id);
    return sendSuccess(res, { request: item }, "Review started");
  }),

  accept: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { note } = reviewNoteSchema.parse(req.body ?? {});
    const item = await requests.accept(req.authUser!, id, note);
    return sendSuccess(res, { request: item }, "Request accepted");
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { note } = reviewNoteSchema.parse(req.body ?? {});
    const item = await requests.reject(req.authUser!, id, note);
    return sendSuccess(res, { request: item }, "Request rejected");
  }),

  needsInformation: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { note } = reviewNoteSchema.parse(req.body ?? {});
    const item = await requests.needsInformation(req.authUser!, id, note);
    return sendSuccess(res, { request: item }, "More information requested");
  }),

    assign: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { departmentId } = assignDepartmentSchema.parse(req.body);
    const item = await requests.assignDepartment(req.authUser!, id, departmentId);
    return sendSuccess(res, { request: item }, "Department assigned");
  }),

  assignTeacher: asyncHandler(async (req: Request, res: Response) => {
    const id = objectIdSchema.parse(req.params.id);
    const { teacherId } = assignTeacherSchema.parse(req.body);
    const item = await requests.assignTeacher(req.authUser!, id, teacherId);
    return sendSuccess(res, { request: item }, "Teacher assigned");
  })
};
