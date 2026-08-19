import type { CookieOptions, Response } from "express";
import type { Env } from "../../config/env.js";

export function cookieOptions(env: Env): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export function setAuthCookie(res: Response, env: Env, token: string): void {
  res.cookie(env.COOKIE_NAME, token, cookieOptions(env));
}

export function clearAuthCookie(res: Response, env: Env): void {
  res.clearCookie(env.COOKIE_NAME, cookieOptions(env));
}
