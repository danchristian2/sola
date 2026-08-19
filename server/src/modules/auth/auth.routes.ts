import { Router } from "express";
import type { Env } from "../../config/env.js";
import { createAuthController } from "./auth.controller.js";
import { requireAuth } from "../../common/middleware/requireAuth.js";

export function authRoutes(env: Env): Router {
  const router = Router();
  const controller = createAuthController(env);

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.post("/demo", controller.demo);
  router.post("/logout", controller.logout);
  router.get("/me", requireAuth(env), controller.me);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);

  return router;
}
