import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";
import { userController } from "./user.controller.js";

export function userRoutes(env: Env): Router {
  const router = Router({ mergeParams: true });
  router.use(requireAuth(env));
  router.get("/", requirePermission(PERMISSIONS["users:view"]), userController.list);
  router.patch("/:id", requirePermission(PERMISSIONS["users:manage"]), userController.update);
  return router;
}
