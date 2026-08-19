import { z } from "zod";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { PROJECT_STAGES, TEAM_ROLES } from "./project.constants.js";

export const createProjectSchema = z.object({
  requestId: objectIdSchema
});

export const addMemberSchema = z.object({
  userId: objectIdSchema,
  teamRole: z.enum(TEAM_ROLES).default("GENERAL")
});

export const addTaskSchema = z.object({
  title: z.string().min(3).max(200),
  assigneeId: objectIdSchema.optional(),
  milestone: z.enum(PROJECT_STAGES).optional()
});

export const updateTaskSchema = z.object({
  status: z.enum(["OPEN", "DONE"]).optional(),
  title: z.string().min(3).max(200).optional()
});

export const feedbackSchema = z.object({
  comment: z.string().min(5).max(2000),
  works: z.string().max(1000).optional(),
  needsChange: z.string().max(1000).optional()
});

export const impactSchema = z.object({
  before: z.string().min(5).max(1000),
  after: z.string().min(5).max(1000),
  timeSaved: z.string().max(200).optional(),
  moneySaved: z.string().max(200).optional(),
  peopleHelped: z.string().max(200).optional(),
  satisfaction: z.string().max(200).optional()
});

export const evidenceSchema = z.object({
  note: z.string().min(3).max(1000)
});
