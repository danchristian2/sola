import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import type { Env } from "./config/env.js";
import type { Logger } from "./config/logger.js";
import { errorHandler } from "./common/middleware/errorHandler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { schoolRoutes } from "./modules/schools/school.routes.js";
import { departmentRoutes } from "./modules/departments/department.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { invitationRoutes, publicInvitationRoutes } from "./modules/invitations/invitation.routes.js";
import { partnershipRoutes } from "./modules/partnerships/partnership.routes.js";
import { serviceRequestRoutes } from "./modules/serviceRequests/serviceRequest.routes.js";
import { projectRoutes } from "./modules/projects/project.routes.js";

export function createApp(env: Env, logger: Logger) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === "test" ? 1000 : 30,
    standardHeaders: true,
    legacyHeaders: false
  });

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" }, message: "SOLA API" });
  });

  app.use("/api/v1/auth", authLimiter, authRoutes(env));
  app.use("/api/v1/auth", publicInvitationRoutes(env));
  app.use("/api/v1/partnerships", authLimiter, partnershipRoutes(env));
  app.use("/api/v1/service-requests", serviceRequestRoutes(env));
  app.use("/api/v1/projects", projectRoutes(env));
  app.use("/api/v1/schools/:schoolId/departments", departmentRoutes(env));
  app.use("/api/v1/schools/:schoolId/users", userRoutes(env));
  app.use("/api/v1/schools/:schoolId/invitations", invitationRoutes(env));
  app.use("/api/v1/schools", schoolRoutes(env));

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found", details: [] }
    });
  });

  app.use(errorHandler(logger));
  return app;
}
