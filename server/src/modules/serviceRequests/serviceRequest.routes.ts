import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";
import { requirePermission } from "../../common/middleware/requirePermission.js";
import { PERMISSIONS } from "../../common/constants/permissions.js";
import { serviceRequestController } from "./serviceRequest.controller.js";

export function serviceRequestRoutes(env: Env): Router {
  const router = Router();
  router.use(requireAuth(env));

  router.post("/", requirePermission(PERMISSIONS["service_request:create"]), serviceRequestController.create);
  router.get("/", requirePermission(PERMISSIONS["service_request:view"]), serviceRequestController.list);
  router.get("/:id", requirePermission(PERMISSIONS["service_request:view"]), serviceRequestController.get);
  router.patch("/:id", requirePermission(PERMISSIONS["service_request:create"]), serviceRequestController.update);
  router.post("/:id/submit", requirePermission(PERMISSIONS["service_request:create"]), serviceRequestController.submit);
  router.post("/:id/review", requirePermission(PERMISSIONS["service_request:review"]), serviceRequestController.startReview);
  router.post("/:id/accept", requirePermission(PERMISSIONS["service_request:review"]), serviceRequestController.accept);
  router.post("/:id/reject", requirePermission(PERMISSIONS["service_request:review"]), serviceRequestController.reject);
  router.post(
    "/:id/needs-information",
    requirePermission(PERMISSIONS["service_request:review"]),
    serviceRequestController.needsInformation
  );
  router.post("/:id/assign", requirePermission(PERMISSIONS["project:assign"]), serviceRequestController.assign);
  router.post("/:id/assign-teacher", requirePermission(PERMISSIONS["project:assign"]), serviceRequestController.assignTeacher);

  return router;
}
