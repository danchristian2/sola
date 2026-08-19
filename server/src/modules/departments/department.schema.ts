import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  skills: z.array(z.string().min(1).max(80)).max(30).default([])
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  isActive: z.boolean().optional()
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
