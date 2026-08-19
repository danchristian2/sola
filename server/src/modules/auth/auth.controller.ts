import type { Request, Response } from "express";
import type { Env } from "../../config/env.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { clearAuthCookie, setAuthCookie } from "../../common/utils/cookies.js";
import { AuthService } from "./auth.service.js";
import {
  demoSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from "./auth.schema.js";

export function createAuthController(env: Env) {
  const authService = new AuthService(env);

  return {
    register: asyncHandler(async (req: Request, res: Response) => {
      const input = registerSchema.parse(req.body);
      const { user, token } = await authService.register(input);
      setAuthCookie(res, env, token);
      return sendCreated(res, { user }, "Account created");
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
      const input = loginSchema.parse(req.body);
      const { user, token } = await authService.login(input);
      setAuthCookie(res, env, token);
      return sendSuccess(res, { user }, "Logged in");
    }),

    demo: asyncHandler(async (req: Request, res: Response) => {
      const input = demoSchema.parse(req.body);
      const { user, token } = await authService.enterDemo(input);
      setAuthCookie(res, env, token);
      return sendSuccess(res, { user }, "Demo persona selected");
    }),

    logout: asyncHandler(async (_req: Request, res: Response) => {
      clearAuthCookie(res, env);
      return sendSuccess(res, null, "Logged out");
    }),

    me: asyncHandler(async (req: Request, res: Response) => {
      const user = await authService.me(req.authUser!.id);
      return sendSuccess(res, { user });
    }),

    forgotPassword: asyncHandler(async (req: Request, res: Response) => {
      const { email } = forgotPasswordSchema.parse(req.body);
      const token = await authService.forgotPassword(email);
      const payload =
        env.NODE_ENV === "test" && token ? { resetToken: token } : {};
      return sendSuccess(
        res,
        payload,
        "If that email exists, a reset link will be sent"
      );
    }),

    resetPassword: asyncHandler(async (req: Request, res: Response) => {
      const { token, password } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, password);
      return sendSuccess(res, null, "Password updated");
    })
  };
}
