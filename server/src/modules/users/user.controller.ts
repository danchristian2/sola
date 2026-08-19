import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/http.js";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { UserService } from "./user.service.js";
import { listUsersQuerySchema, updateSchoolUserSchema } from "./user.schema.js";

const users = new UserService();

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = objectIdSchema.parse(req.params.schoolId);
    const query = listUsersQuerySchema.parse(req.query);
    const data = await users.list(req.authUser!, schoolId, query);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = objectIdSchema.parse(req.params.schoolId);
    const id = objectIdSchema.parse(req.params.id);
    const input = updateSchoolUserSchema.parse(req.body);
    const user = await users.update(req.authUser!, schoolId, id, input);
    return sendSuccess(res, { user }, "User updated");
  })
};
