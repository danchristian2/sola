import { z } from "zod";
import { REQUEST_CATEGORIES, URGENCY_LEVELS } from "../../common/constants/categories.js";
import { objectIdSchema } from "../../common/utils/pagination.js";

export const createServiceRequestSchema = z.object({
  schoolId: objectIdSchema.optional(),
  posterType: z.enum(["PERSON", "BUSINESS", "INSTITUTION", "ORGANIZATION", "COMMUNITY"]).default("PERSON"),
  organization: z.string().max(160).optional(),
  location: z.string().max(160).optional(),
  problem: z.string().min(10).max(2000),
  outcome: z.string().min(5).max(1000),
  whoIsAffected: z.string().max(500).optional(),
  extraInfo: z.string().max(2000).optional(),
  category: z.nativeEnum(REQUEST_CATEGORIES).default(REQUEST_CATEGORIES.OTHER),
  urgency: z.nativeEnum(URGENCY_LEVELS).default(URGENCY_LEVELS.NORMAL),
  preferredContact: z.string().max(160).optional(),
  submit: z.boolean().optional()
});

export const updateServiceRequestSchema = createServiceRequestSchema.partial();

export const reviewNoteSchema = z.object({
  note: z.string().max(1000).optional()
});

export const assignDepartmentSchema = z.object({
  departmentId: objectIdSchema
});

export const assignTeacherSchema = z.object({
  teacherId: objectIdSchema
});

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
