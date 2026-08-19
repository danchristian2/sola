import { api } from "./client";
import type { AuthUser } from "../../types";

export function registerAccount(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return api<{ user: AuthUser }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function login(input: { email: string; password: string }) {
  return api<{ user: AuthUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function enterDemo(email: string) {
  return api<{ user: AuthUser }>("/api/v1/auth/demo", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function logout() {
  return api<null>("/api/v1/auth/logout", { method: "POST" });
}

export function getMe() {
  return api<{ user: AuthUser }>("/api/v1/auth/me");
}
