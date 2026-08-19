import type { Request, Response } from "express";
import type { Env } from "../../config/env.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { SchoolService } from "./school.service.js";
import {
  createSchoolSchema,
  schoolStatusSchema,
  updateSchoolSchema
} from "./school.schema.js";
import { objectIdSchema } from "../../common/utils/pagination.js";

export function createSchoolController(env: Env) {
  const schools = new SchoolService(env);

  return {
    create: asyncHandler(async (req: Request, res: Response) => {
      const input = createSchoolSchema.parse(req.body);
      const result = await schools.createBySuperAdmin(req.authUser!, input);
      return sendCreated(res, result, "School created");
    }),

    list: asyncHandler(async (req: Request, res: Response) => {
      const data = await schools.list(req.authUser!, req.query);
      return sendSuccess(res, data);
    }),

    directory: asyncHandler(async (_req: Request, res: Response) => {
      const items = await schools.listDirectory();
      return sendSuccess(res, { items });
    }),

    me: asyncHandler(async (req: Request, res: Response) => {
      const schoolId = req.authUser!.schoolId;
      if (!schoolId) {
        return sendSuccess(res, { school: null });
      }
      const school = await schools.get(req.authUser!, schoolId);
      return sendSuccess(res, { school });
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
      const id = objectIdSchema.parse(req.params.id);
      const school = await schools.get(req.authUser!, id);
      return sendSuccess(res, { school });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const id = objectIdSchema.parse(req.params.id);
      const input = updateSchoolSchema.parse(req.body);
      const school = await schools.update(req.authUser!, id, input);
      return sendSuccess(res, { school }, "School updated");
    }),

    setStatus: asyncHandler(async (req: Request, res: Response) => {
      const id = objectIdSchema.parse(req.params.id);
      const { status } = schoolStatusSchema.parse(req.body);
      const school = await schools.setStatus(req.authUser!, id, status);
      return sendSuccess(res, { school }, "School status updated");
    })
  };
}
