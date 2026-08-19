import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { DepartmentService } from "./department.service.js";
import { createDepartmentSchema, updateDepartmentSchema } from "./department.schema.js";

const departments = new DepartmentService();

export const departmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = objectIdSchema.parse(req.params.schoolId);
    const input = createDepartmentSchema.parse(req.body);
    const department = await departments.create(req.authUser!, schoolId, input);
    return sendCreated(res, { department }, "Department created");
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = objectIdSchema.parse(req.params.schoolId);
    const items = await departments.list(req.authUser!, schoolId);
    return sendSuccess(res, { items });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = objectIdSchema.parse(req.params.schoolId);
    const id = objectIdSchema.parse(req.params.id);
    const input = updateDepartmentSchema.parse(req.body);
    const department = await departments.update(req.authUser!, schoolId, id, input);
    return sendSuccess(res, { department }, "Department updated");
  })
};
