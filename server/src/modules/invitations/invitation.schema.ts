import { z } from "zod";
import { objectIdSchema } from "../../common/utils/pagination.js";

export const createInvitationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  role: z.enum(["SCHOOL_ADMIN", "SCHOOL_COORDINATOR", "TEACHER", "STUDENT"]),
  departmentId: objectIdSchema.optional()
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional()
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
