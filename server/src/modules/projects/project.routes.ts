import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";
import { projectController } from "./project.controller.js";

export function projectRoutes(env: Env): Router {
  const router = Router();
  router.use(requireAuth(env));

  router.post("/", requirePermission(PERMISSIONS["project:create"]), projectController.create);
  router.get("/", requirePermission(PERMISSIONS["project:view"]), projectController.list);
  router.get("/portfolio", requirePermission(PERMISSIONS["impact:view"]), projectController.portfolio);
  router.get("/by-request/:requestId", requirePermission(PERMISSIONS["project:view"]), projectController.byRequest);
  router.get("/:id", requirePermission(PERMISSIONS["project:view"]), projectController.get);
  router.post("/:id/team", requirePermission(PERMISSIONS["project:update"]), projectController.addMember);
  router.post("/:id/tasks", requirePermission(PERMISSIONS["project:update"]), projectController.addTask);
  router.patch("/:id/tasks/:taskId", requirePermission(PERMISSIONS["project:view"]), projectController.updateTask);
  router.post("/:id/evidence", requirePermission(PERMISSIONS["evidence:upload"]), projectController.evidence);
  router.post("/:id/feedback", requirePermission(PERMISSIONS["project:view"]), projectController.feedback);
  router.post("/:id/impact", requirePermission(PERMISSIONS["impact:create"]), projectController.impact);
  router.post("/:id/advance", requirePermission(PERMISSIONS["project:update"]), projectController.advance);

  return router;
}
