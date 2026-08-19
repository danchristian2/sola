import type { NextFunction, Request, Response } from "express";
import type { Env } from "../../config/env.js";
import { AuthenticationError } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { UserModel } from "../../modules/users/user.model.js";
import { USER_STATUSES } from "../constants/roles.js";
import { permissionsForRole } from "../rbac/index.js";

export function requireAuth(env: Env) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
      if (!token) {
        throw new AuthenticationError("Authentication required");
      }

      const payload = verifyAccessToken(env, token);
      const user = await UserModel.findById(payload.sub);
      if (!user || user.status !== USER_STATUSES.ACTIVE) {
        throw new AuthenticationError("Session is no longer valid");
      }

      req.authUser = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId ? user.schoolId.toString() : null,
        status: user.status,
        permissions: permissionsForRole(user.role)
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}
