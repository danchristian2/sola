import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";
import { createPartnershipController } from "./partnership.controller.js";

export function partnershipRoutes(env: Env): Router {
  const router = Router();
  const controller = createPartnershipController(env);

  router.post("/", controller.apply);
  router.get("/", requireAuth(env), requirePermission(PERMISSIONS["partnership:review"]), controller.list);
  router.post(
    "/:id/approve",
    requireAuth(env),
    requirePermission(PERMISSIONS["partnership:review"]),
    controller.approve
  );
  router.post(
    "/:id/reject",
    requireAuth(env),
    requirePermission(PERMISSIONS["partnership:review"]),
    controller.reject
  );

  return router;
}
