import { z } from "zod";
import { ROLES } from "../../common/constants/roles.js";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  role: z.enum([ROLES.SERVICE_SEEKER]).default(ROLES.SERVICE_SEEKER)
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(120),
  password: z.string().min(1)
});

export const demoSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(120)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(72)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DemoInput = z.infer<typeof demoSchema>;
