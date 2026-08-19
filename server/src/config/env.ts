import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(16).default("sola-demo-jwt-secret-key"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  COOKIE_NAME: z.string().default("sola_token"),
  FILE_STORAGE_PROVIDER: z.enum(["local"]).default("local"),
  FILE_STORAGE_DIR: z.string().default("./uploads"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${details}`);
  }
  return parsed.data;
}
