import type { NextFunction, Request, Response } from "express";
import type { Permission } from "../constants/permissions.js";
import { AuthorizationError } from "../errors/AppError.js";
import { hasPermission } from "../rbac/index.js";

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user || !hasPermission(user.role, permission)) {
      return next(new AuthorizationError());
    }
    next();
  };
}
