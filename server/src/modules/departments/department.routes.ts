import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";
import { departmentController } from "./department.controller.js";

export function departmentRoutes(env: Env): Router {
  const router = Router({ mergeParams: true });
  router.use(requireAuth(env));

  router.get("/", requirePermission(PERMISSIONS["department:view"]), departmentController.list);
  router.post("/", requirePermission(PERMISSIONS["department:manage"]), departmentController.create);
  router.patch("/:id", requirePermission(PERMISSIONS["department:manage"]), departmentController.update);

  return router;
}
