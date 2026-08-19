import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";
import { createInvitationController } from "./invitation.controller.js";

export function invitationRoutes(env: Env): Router {
  const router = Router({ mergeParams: true });
  const controller = createInvitationController(env);
  router.use(requireAuth(env));
  router.get("/", requirePermission(PERMISSIONS["users:view"]), controller.list);
  router.post("/", requirePermission(PERMISSIONS["users:manage"]), controller.create);
  router.post("/:id/revoke", requirePermission(PERMISSIONS["users:manage"]), controller.revoke);
  return router;
}

export function publicInvitationRoutes(env: Env): Router {
  const router = Router();
  const controller = createInvitationController(env);
  router.post("/accept-invitation", controller.accept);
  return router;
}
