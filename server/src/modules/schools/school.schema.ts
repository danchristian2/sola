import { z } from "zod";
import { SCHOOL_STATUSES } from "./school.model.js";

export const createSchoolSchema = z.object({
  name: z.string().min(2).max(160),
  location: z.string().min(1).max(160),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  admin: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email()
  })
});

export const updateSchoolSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  location: z.string().min(1).max(160).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional()
});

export const schoolStatusSchema = z.object({
  status: z.enum([SCHOOL_STATUSES.PENDING, SCHOOL_STATUSES.ACTIVE, SCHOOL_STATUSES.SUSPENDED])
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
