import { Router } from "express";
import type { Env } from "../../config/env.js";
import { createSchoolController } from "./school.controller.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";

export function schoolRoutes(env: Env): Router {
  const router = Router();
  const controller = createSchoolController(env);

  router.get("/directory", controller.directory);
  router.get("/", requireAuth(env), requirePermission(PERMISSIONS["school:view"]), controller.list);
  router.get("/me", requireAuth(env), requirePermission(PERMISSIONS["school:view"]), controller.me);
  router.post("/", requireAuth(env), requirePermission(PERMISSIONS["school:manage"]), controller.create);
  router.get("/:id", requireAuth(env), requirePermission(PERMISSIONS["school:view"]), controller.get);
  router.patch("/:id", requireAuth(env), requirePermission(PERMISSIONS["school:manage"]), controller.update);
  router.post(
    "/:id/status",
    requireAuth(env),
    requirePermission(PERMISSIONS["school:manage"]),
    controller.setStatus
  );

  return router;
}
