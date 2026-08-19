import pino from "pino";
import type { Env } from "./env.js";

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    redact: ["req.headers.cookie", "password", "passwordHash"],
    transport:
      env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined
  });
}

export type Logger = ReturnType<typeof createLogger>;
