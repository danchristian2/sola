import jwt, { type SignOptions } from "jsonwebtoken";
import type { Env } from "../../config/env.js";
import { AuthenticationError } from "../errors/AppError.js";
import type { JwtPayload } from "../../modules/auth/auth.types.js";

export function signAccessToken(env: Env, payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(env: Env, token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded.sub || !decoded.role) {
      throw new AuthenticationError("Invalid token");
    }
    return decoded;
  } catch {
    throw new AuthenticationError("Invalid or expired session");
  }
}
