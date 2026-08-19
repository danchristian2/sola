import { z } from "zod";
import { USER_STATUSES } from "../../common/constants/roles.js";
import { objectIdSchema } from "../../common/utils/pagination.js";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  role: z.enum(["SCHOOL_ADMIN", "SCHOOL_COORDINATOR", "TEACHER", "STUDENT"]).optional(),
  status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.INVITED, USER_STATUSES.DISABLED]).optional()
});

export const updateSchoolUserSchema = z.object({
  status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.DISABLED]).optional(),
  departmentId: objectIdSchema.nullable().optional()
});
